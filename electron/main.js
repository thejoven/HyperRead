const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 600,
    minHeight: 400,
    resizable: true,
    icon: path.join(__dirname, '../logo/logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      // 性能优化配置
      experimentalFeatures: true,
      backgroundThrottling: false,
      offscreen: false,
      spellcheck: false,
      // 内存优化
      additionalArguments: [
        '--no-sandbox',
        '--disable-web-security',
        '--disable-dev-shm-usage',
        '--disable-gpu-sandbox',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-component-extensions-with-background-pages',
      ]
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    center: true,
    title: 'HyperRead',
    backgroundColor: '#ffffff',
    vibrancy: 'content',
    visualEffectState: 'active',
    trafficLightPosition: { x: 20, y: 22 }
  })

  // 始终加载静态文件，不依赖开发服务器
  const isDev = process.env.NODE_ENV === 'development'
  
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 处理文件拖拽 - 使用 Electron 原生事件
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    
    if (parsedUrl.protocol === 'file:') {
      // 可能是拖拽的文件
      event.preventDefault()
    }
  })

  // 使用主进程拦截拖拽事件来获取真实路径
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('file://')) {
      event.preventDefault()
      const filePath = decodeURIComponent(url.replace('file://', ''))
      console.log('Main: intercepted file drag:', filePath)
      
      // 检查是否是目录
      try {
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
          console.log('Main: directory detected via URL:', filePath)
          const files = scanDirectory(filePath)
          mainWindow.webContents.executeJavaScript(`
            if (window.electronAPI?.handleDirectoryContent) {
              window.electronAPI.handleDirectoryContent({
                files: ${JSON.stringify(files)},
                rootPath: ${JSON.stringify(filePath)}
              })
            }
          `)
        } else if (filePath.endsWith('.md') || filePath.endsWith('.markdown')) {
          console.log('Main: markdown file detected via URL:', filePath)
          const content = fs.readFileSync(filePath, 'utf-8')
          const fileName = path.basename(filePath, path.extname(filePath))
          mainWindow.webContents.executeJavaScript(`
            if (window.electronAPI?.handleFileContent) {
              window.electronAPI.handleFileContent({
                content: ${JSON.stringify(content)},
                fileName: ${JSON.stringify(fileName)},
                originalName: ${JSON.stringify(path.basename(filePath))},
                isDirectory: false
              })
            }
          `)
        }
      } catch (error) {
        console.log('Main: error processing dragged path:', error.message)
      }
    }
  })

  // 使用改进的文件拖拽处理，支持 webkitGetAsEntry API
  // DISABLED: Using React-based drag-drop implementation instead of external script
  // mainWindow.webContents.on('dom-ready', () => {
  //   // 加载并启用增强的拖拽功能
  //   // 注入增强的拖拽处理代码
  //   const fs = require('fs')
  //   const enhancedDragDropPath = path.join(__dirname, 'enhanced-drag-drop.js')
  //   
  //   fs.readFile(enhancedDragDropPath, 'utf8', (err, data) => {
  //     if (err) {
  //       console.error('Failed to load enhanced drag drop script:', err)
  //       return
  //     }
  //     
  //     // 注入增强的拖拽代码并立即执行
  //     mainWindow.webContents.executeJavaScript(`
  //       ${data}
  //       setupEnhancedDragDrop();
  //     `).catch(error => {
  //       console.error('Failed to inject enhanced drag drop:', error)
  //     })
  //   })
    
    // 备用的简单拖拽处理（如果增强版本失败）
    // DISABLED: Using React-based drag-drop implementation instead of fallback handlers
    // setTimeout(() => {
    //   mainWindow.webContents.executeJavaScript(`
    //     // 检查增强版本是否已加载
    //     if (typeof window.setupEnhancedDragDrop === 'undefined') {
    //       console.log('Enhanced drag drop not available, setting up fallback handlers')
    //       
    //       const body = document.body || document.documentElement
    //   
    //   body.addEventListener('dragover', (e) => {
    //     console.log('dragover event')
    //     e.preventDefault()
    //     e.stopPropagation()
    //     e.dataTransfer.dropEffect = 'copy'
    //   }, true)
    //   
    //   body.addEventListener('dragenter', (e) => {
    //     console.log('dragenter event')
    //     e.preventDefault()
    //     e.stopPropagation()
    //   }, true)
    //   
    //   body.addEventListener('drop', (e) => {
    //     console.log('drop event triggered with', e.dataTransfer.files.length, 'files')
    //     e.preventDefault()
    //     e.stopPropagation()
    //     
    //     const files = [...e.dataTransfer.files]
    //     console.log('Files:', files.map(f => ({
    //       name: f.name, 
    //       type: f.type, 
    //       size: f.size, 
    //       path: f.path,
    //       webkitRelativePath: f.webkitRelativePath
    //     })))
    //     
    //     // 在 Electron 中检测文件夹 - 通过主进程处理
    //     // 尝试从 webkitRelativePath 或其他属性获取路径
    //     const fileData = files.map(file => ({
    //       name: file.name,
    //       type: file.type,
    //       size: file.size,
    //       path: file.path || '',
    //       webkitRelativePath: file.webkitRelativePath || '',
    //       // 尝试更多属性
    //       fullPath: file.fullPath || '',
    //       relativePath: file.relativePath || ''
    //     }))
    //     
    //     console.log('Enhanced file data:', fileData)
    //     
    //     console.log('Sending files to main process for classification:', fileData)
    //     
    //     // 发送到主进程进行分类
    //     if (window.electronAPI?.classifyFiles) {
    //       window.electronAPI.classifyFiles(fileData).then(result => {
    //         console.log('File classification result:', result)
    //         const { directories, markdownFiles } = result
    //         
    //         if (directories.length > 0) {
    //           // 处理目录拖拽 - 提示用户选择文件夹，因为无法直接获取拖拽文件夹的路径
    //           console.log('Directory detected:', directories[0].name)
    //           if (window.electronAPI?.handleDirectoryDrop) {
    //             console.log('Calling handleDirectoryDrop')
    //             window.electronAPI.handleDirectoryDrop(directories[0].name)
    //           } else {
    //             console.error('electronAPI.handleDirectoryDrop not available')
    //             alert('检测到文件夹拖拽。由于安全限制，请点击"打开文件夹"按钮选择要加载的文件夹。')
    //           }
    //         } else if (markdownFiles.length > 0) {
    //           // 处理单个 Markdown 文件
    //           const file = files.find(f => markdownFiles.some(mf => mf.name === f.name))
    //           console.log('Found markdown file:', file.name)
    //           
    //           // 使用 FileReader API 读取文件内容
    //           const reader = new FileReader()
    //           
    //           reader.onload = (event) => {
    //             const content = event.target.result
    //             console.log('File content read successfully, length:', content.length)
    //             
    //             if (window.electronAPI?.handleFileContent) {
    //               console.log('Calling handleFileContent')
    //               window.electronAPI.handleFileContent({
    //                 content: content,
    //                 fileName: file.name.replace(/\\.md$/, '').replace(/\\.markdown$/, ''),
    //                 originalName: file.name,
    //                 isDirectory: false
    //               })
    //             } else {
    //               console.error('electronAPI.handleFileContent not available')
    //             }
    //           }
    //           
    //           reader.onerror = (error) => {
    //             console.error('Error reading file:', error)
    //             alert('读取文件失败: ' + error.message)
    //           }
    //           
    //           console.log('Starting to read file as text')
    //           reader.readAsText(file)
    //         } else {
    //           console.log('No markdown files or directories found')
    //           alert('请拖拽 Markdown 文件（.md）或包含 Markdown 文件的文件夹')
    //         }
    //       }).catch(error => {
    //         console.error('Failed to classify files:', error)
    //         alert('文件分类失败: ' + error.message)
    //       })
    //     } else {
    //       console.error('electronAPI.classifyFiles not available')
    //       alert('无法处理拖拽的文件')
    //     }
    //   }, true)
    //   
    //       console.log('Fallback drag and drop handlers set up')
    //     } else {
    //       console.log('Enhanced drag drop already available, skipping fallback')
    //     }
    //   `).catch(error => {
    //     console.error('Failed to set up fallback drag drop:', error)
    //   })
    // }, 1000) // 延迟1秒确保增强版本有时间加载
    // })
}

// 递归扫描目录中的 Markdown 文件
function scanDirectory(dirPath) {
  const markdownFiles = []
  
  function scanRecursive(currentPath) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name)
        
        if (entry.isDirectory()) {
          // 跳过隐藏文件夹和 node_modules
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            scanRecursive(fullPath)
          }
        } else if (entry.isFile()) {
          // 检查是否是 Markdown 文件
          if (entry.name.endsWith('.md') || entry.name.endsWith('.markdown')) {
            const relativePath = path.relative(dirPath, fullPath)
            markdownFiles.push({
              name: path.basename(entry.name, path.extname(entry.name)),
              fileName: entry.name,
              fullPath: fullPath,
              relativePath: relativePath,
              directory: path.dirname(relativePath) || '.'
            })
          }
        }
      }
    } catch (error) {
      console.error('Error scanning directory:', currentPath, error)
    }
  }
  
  scanRecursive(dirPath)
  return markdownFiles.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

// IPC 处理程序
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    console.log('Main: read-file called with:', filePath)
    if (!filePath || typeof filePath !== 'string') {
      throw new Error(`无效的文件路径: ${filePath}`)
    }
    const content = fs.readFileSync(filePath, 'utf-8')
    const fileName = path.basename(filePath, '.md')
    console.log('Main: file read successfully:', fileName)
    return { content, fileName, filePath }
  } catch (error) {
    console.error('Main: read-file error:', error)
    throw new Error(`读取文件失败: ${error.message}`)
  }
})

// 扫描目录中的 Markdown 文件
ipcMain.handle('scan-directory', async (event, dirPath) => {
  try {
    console.log('Main: scan-directory called with:', dirPath)
    if (!dirPath || typeof dirPath !== 'string') {
      throw new Error(`无效的目录路径: ${dirPath}`)
    }
    
    const stat = fs.statSync(dirPath)
    if (!stat.isDirectory()) {
      throw new Error('提供的路径不是目录')
    }
    
    const files = scanDirectory(dirPath)
    console.log(`Main: found ${files.length} markdown files`)
    return { files, rootPath: dirPath }
  } catch (error) {
    console.error('Main: scan-directory error:', error)
    throw new Error(`扫描目录失败: ${error.message}`)
  }
})

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0]
    const content = fs.readFileSync(filePath, 'utf-8')
    const fileName = path.basename(filePath, '.md')
    return { content, fileName, filePath }
  }
  
  return null
})

// 打开文件夹对话框
ipcMain.handle('open-directory-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    const dirPath = result.filePaths[0]
    const files = scanDirectory(dirPath)
    return { files, rootPath: dirPath }
  }
  
  return null
})

// 分类拖拽的文件
ipcMain.handle('classify-files', async (event, fileData) => {
  try {
    console.log('Main: classify-files called with:', fileData)
    
    const directories = []
    const markdownFiles = []
    
    for (const file of fileData) {
      console.log('Main: processing file:', file)
      
      if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
        markdownFiles.push(file)
        console.log('Main: found markdown file:', file.name)
      } else if (file.type === '' && !file.name.includes('.')) {
        // 尝试构建可能的路径
        let possiblePath = file.path || file.fullPath
        
        // 如果没有路径但有 webkitRelativePath，尝试构建完整路径
        if (!possiblePath && file.webkitRelativePath) {
          // webkitRelativePath 通常包含相对于选择根目录的路径
          console.log('Main: trying to use webkitRelativePath:', file.webkitRelativePath)
          possiblePath = file.webkitRelativePath
        }
        
        if (possiblePath) {
          try {
            // 移除文件名获取目录路径
            const dirPath = possiblePath.includes('/') 
              ? possiblePath.substring(0, possiblePath.lastIndexOf('/'))
              : possiblePath
            
            console.log('Main: trying directory path:', dirPath)
            const stat = fs.statSync(dirPath)
            if (stat.isDirectory()) {
              directories.push({...file, path: dirPath})
              console.log('Main: confirmed directory:', dirPath)
            }
          } catch (error) {
            console.log('Main: path check failed, assuming directory by name:', file.name)
            directories.push(file)
          }
        } else {
          // 如果 type 为空且没有扩展名，很可能是文件夹
          directories.push(file)
          console.log('Main: assuming directory based on type and name:', file.name)
        }
      }
    }
    
    console.log('Main: classification result - directories:', directories.length, 'markdown files:', markdownFiles.length)
    return { directories, markdownFiles }
  } catch (error) {
    console.error('Main: classify-files error:', error)
    throw new Error(`文件分类失败: ${error.message}`)
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 处理协议 (可选，用于打开 .md 文件)
if (process.platform === 'win32') {
  app.setAsDefaultProtocolClient('hyperread', process.execPath, [path.resolve(process.argv[1])])
} else {
  app.setAsDefaultProtocolClient('hyperread')
}