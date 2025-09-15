// 增强的拖拽处理功能，使用 webkitGetAsEntry API
// 该脚本在 DOM 加载完成后注入到渲染进程中

function setupEnhancedDragDrop() {
  console.log('Setting up enhanced drag and drop handlers with webkitGetAsEntry')
  
  // 递归读取目录条目
  async function readDirectoryEntry(directoryEntry) {
    const files = []
    const reader = directoryEntry.createReader()
    
    return new Promise((resolve, reject) => {
      const readEntries = () => {
        reader.readEntries(async (entries) => {
          if (entries.length === 0) {
            resolve(files)
            return
          }
          
          for (const entry of entries) {
            if (entry.isFile) {
              // 检查是否是 Markdown 文件
              if (entry.name.endsWith('.md') || entry.name.endsWith('.markdown')) {
                try {
                  const file = await new Promise((resolve, reject) => {
                    entry.file(resolve, reject)
                  })
                  files.push({
                    file: file,
                    fullPath: entry.fullPath,
                    name: entry.name,
                    isDirectory: false
                  })
                } catch (error) {
                  console.warn('Failed to read file entry:', entry.fullPath, error)
                }
              }
            } else if (entry.isDirectory) {
              // 递归读取子目录
              if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                try {
                  const subFiles = await readDirectoryEntry(entry)
                  files.push(...subFiles)
                } catch (error) {
                  console.warn('Failed to read directory entry:', entry.fullPath, error)
                }
              }
            }
          }
          
          readEntries() // 继续读取剩余条目
        }, reject)
      }
      
      readEntries()
    })
  }
  
  // 处理拖拽的条目
  async function processDroppedItems(items) {
    const allFiles = []
    const directories = []
    
    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry()
        
        if (entry) {
          if (entry.isFile) {
            // 单个文件
            if (entry.name.endsWith('.md') || entry.name.endsWith('.markdown')) {
              try {
                const file = await new Promise((resolve, reject) => {
                  entry.file(resolve, reject)
                })
                allFiles.push({
                  file: file,
                  fullPath: entry.fullPath,
                  name: entry.name,
                  isDirectory: false
                })
              } catch (error) {
                console.warn('Failed to read file:', entry.fullPath, error)
              }
            }
          } else if (entry.isDirectory) {
            // 目录
            console.log('Processing directory:', entry.name)
            directories.push(entry.name)
            
            try {
              const dirFiles = await readDirectoryEntry(entry)
              allFiles.push(...dirFiles)
              console.log(`Found ${dirFiles.length} markdown files in directory: ${entry.name}`)
            } catch (error) {
              console.error('Failed to read directory:', entry.fullPath, error)
            }
          }
        }
      }
    }
    
    return { allFiles, directories }
  }
  
  // 读取文件内容
  async function readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target.result)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }
  
  const body = document.body || document.documentElement
  
  // 防止默认拖拽行为
  body.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }, true)
  
  body.addEventListener('dragenter', (e) => {
    e.preventDefault()
    e.stopPropagation()
  }, true)
  
  body.addEventListener('drop', async (e) => {
    console.log('Enhanced drop event triggered')
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation() // 阻止其他监听器处理此事件
    
    const items = [...e.dataTransfer.items]
    console.log(`Processing ${items.length} dropped items`)
    
    // 添加详细的拖拽条目信息
    items.forEach((item, index) => {
      const entry = item.webkitGetAsEntry()
      console.log(`Item ${index}:`, {
        kind: item.kind,
        type: item.type,
        entryName: entry?.name,
        entryFullPath: entry?.fullPath,
        isFile: entry?.isFile,
        isDirectory: entry?.isDirectory
      })
    })
    
    try {
      const { allFiles, directories } = await processDroppedItems(items)
      
      console.log(`Found ${allFiles.length} markdown files in ${directories.length} directories`)
      console.log('All files found:', allFiles.map(f => ({ name: f.name, fullPath: f.fullPath })))
      console.log('Directories found:', directories)
      
      if (allFiles.length === 0) {
        alert('未找到 Markdown 文件。请拖拽 .md 或 .markdown 文件，或包含这些文件的文件夹。')
        return
      }
      
      if (allFiles.length === 1 && directories.length === 0) {
        // 单个文件（非文件夹拖拽）
        const fileData = allFiles[0]
        const content = await readFileContent(fileData.file)
        
        if (window.electronAPI?.handleFileContent) {
          window.electronAPI.handleFileContent({
            content: content,
            fileName: fileData.name.replace(/\.md$/, '').replace(/\.markdown$/, ''),
            originalName: fileData.name,
            isDirectory: false
          })
        }
      } else {
        // 多个文件或目录模式（包括只有一个文件的文件夹）
        console.log('Creating file infos for directory mode...')
        const fileInfos = allFiles.map(fileData => ({
          name: fileData.name.replace(/\.md$/, '').replace(/\.markdown$/, ''),
          fileName: fileData.name,
          fullPath: fileData.fullPath,
          relativePath: fileData.fullPath.replace(/^\//, ''),
          directory: fileData.fullPath.includes('/') ? 
            fileData.fullPath.substring(0, fileData.fullPath.lastIndexOf('/')) : '.'
        }))
        
        console.log('File infos created:', fileInfos)
        
        // 确定根路径
        const rootPath = directories.length > 0 ? 
          `Dropped ${directories.length} folder(s)` : 
          'Dropped files'
        
        console.log('Calling handleDirectoryContent with:', { files: fileInfos.length, rootPath })
        
        // Create a cache object to store all file contents (move to outer scope)
        let fileContentsCache = {}
        
        // 读取并缓存所有文件的内容
        if (allFiles.length > 0) {
          console.log(`Reading content for ${allFiles.length} files`)
          
          // Read all file contents
          for (const fileData of allFiles) {
            try {
              const content = await readFileContent(fileData.file)
              fileContentsCache[fileData.name] = content
              console.log(`Cached content for file: ${fileData.name}`)
            } catch (error) {
              console.error(`Failed to read content for ${fileData.name}:`, error)
            }
          }
        }
        
        // Try direct React handlers first (preferred method)
        if (window.reactDirectHandlers) {
          console.log('Using direct React handlers')
          
          // Cache the file contents directly
          if (allFiles.length > 0) {
            window.reactDirectHandlers.handleMultipleFileContentsDirect({
              fileContents: fileContentsCache,
              totalFiles: allFiles.length
            })
          }
          
          // Set directory content directly
          window.reactDirectHandlers.handleDirectoryContentDirect({
            files: fileInfos,
            rootPath: rootPath
          })
          
          // Load the first file's content as the initial view
          if (allFiles.length > 0) {
            const firstFile = allFiles[0]
            if (fileContentsCache[firstFile.name]) {
              console.log('Loading first file content for display:', firstFile.name)
              window.reactDirectHandlers.handleFileContentDirect({
                content: fileContentsCache[firstFile.name],
                fileName: firstFile.name.replace(/\.md$/, '').replace(/\.markdown$/, ''),
                originalName: firstFile.name,
                isDirectory: true
              })
            }
          }
          
          console.log('Direct React handlers used successfully')
        } else {
          // Fallback to preload API + events (existing method)
          console.log('Using fallback preload API + events')
          
          // Send the file contents cache to the main app FIRST
          if (window.electronAPI?.handleMultipleFileContents) {
            console.log('Calling handleMultipleFileContents with cached content')
            window.electronAPI.handleMultipleFileContents({
              fileContents: fileContentsCache,
              totalFiles: allFiles.length
            })
          } else {
            console.error('window.electronAPI.handleMultipleFileContents not available')
          }
        
          // Then call handleDirectoryContent to display the file tree
          if (window.electronAPI?.handleDirectoryContent) {
            console.log('Calling handleDirectoryContent with file infos:', fileInfos.length)
            window.electronAPI.handleDirectoryContent({
              files: fileInfos,
              rootPath: rootPath
            })
            console.log('handleDirectoryContent called successfully')
          } else {
            console.error('window.electronAPI.handleDirectoryContent not available')
          }
        
          // Load the first file's content as the initial view
          if (allFiles.length > 0) {
            const firstFile = allFiles[0]
            if (fileContentsCache[firstFile.name] && window.electronAPI?.handleFileContent) {
              console.log('Loading first file content for display:', firstFile.name)
              window.electronAPI.handleFileContent({
                content: fileContentsCache[firstFile.name],
                fileName: firstFile.name.replace(/\.md$/, '').replace(/\.markdown$/, ''),
                originalName: firstFile.name,
                isDirectory: true
              })
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error processing dropped items:', error)
      alert('处理拖拽文件时出错: ' + error.message)
    }
  }, true)
  
  console.log('Enhanced drag and drop handlers set up successfully')
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupEnhancedDragDrop }
} else {
  window.setupEnhancedDragDrop = setupEnhancedDragDrop
}