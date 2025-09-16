const { contextBridge, ipcRenderer, shell } = require('electron')

// Debug: Check what's available in the imports
console.log('Preload: Imports check:')
console.log('contextBridge:', typeof contextBridge)
console.log('ipcRenderer:', typeof ipcRenderer)
console.log('shell:', typeof shell)
console.log('shell.openExternal:', typeof shell?.openExternal)

contextBridge.exposeInMainWorld('electronAPI', {
  // 读取文件
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // 打开文件对话框
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  
  // 打开文件夹对话框
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  
  // 扫描目录
  scanDirectory: (dirPath) => ipcRenderer.invoke('scan-directory', dirPath),
  
  // 分类拖拽的文件
  classifyFiles: (fileData) => ipcRenderer.invoke('classify-files', fileData),
  
  // 打开外部链接 - 使用 IPC 调用主进程
  openExternal: (url) => {
    console.log('Preload: openExternal called with URL:', url)
    return ipcRenderer.invoke('open-external', url)
  },
  
  // 处理文件拖拽（从主进程调用）
  handleFileDrop: (filePath) => {
    console.log('Preload: handleFileDrop called with:', filePath, typeof filePath)
    
    if (!filePath || typeof filePath !== 'string') {
      console.error('Preload: Invalid file path received:', filePath)
      return
    }
    
    // 触发自定义事件通知 React 应用
    const event = new CustomEvent('file-dropped', { 
      detail: { filePath } 
    })
    window.dispatchEvent(event)
    console.log('Preload: file-dropped event dispatched with path:', filePath)
  },

  // 处理文件内容（用于拖拽）
  handleFileContent: (fileData) => {
    console.log('Preload: handleFileContent called with:', {
      fileName: fileData.fileName,
      contentLength: fileData.content ? fileData.content.length : 0,
      isDirectory: fileData.isDirectory
    })
    
    if (!fileData || !fileData.content) {
      console.error('Preload: Invalid file data received:', fileData)
      return
    }
    
    // 触发自定义事件通知 React 应用
    const event = new CustomEvent('file-content-loaded', { 
      detail: fileData
    })
    window.dispatchEvent(event)
    console.log('Preload: file-content-loaded event dispatched')
  },

  // 处理目录拖拽
  handleDirectoryDrop: (directoryName) => {
    console.log('Preload: handleDirectoryDrop called with:', directoryName)
    
    // 触发自定义事件通知 React 应用需要打开目录对话框
    const event = new CustomEvent('directory-dropped', { 
      detail: { directoryName }
    })
    window.dispatchEvent(event)
    console.log('Preload: directory-dropped event dispatched')
  },

  // 处理目录内容（用于拖拽）
  handleDirectoryContent: (directoryData) => {
    console.log('Preload: handleDirectoryContent called with:', {
      rootPath: directoryData.rootPath,
      fileCount: directoryData.files ? directoryData.files.length : 0
    })
    
    if (!directoryData || !directoryData.files) {
      console.error('Preload: Invalid directory data received:', directoryData)
      return
    }
    
    // 触发自定义事件通知 React 应用
    const event = new CustomEvent('directory-content-loaded', { 
      detail: directoryData
    })
    window.dispatchEvent(event)
    console.log('Preload: directory-content-loaded event dispatched')
  },

  // 处理多个文件内容缓存（用于增强拖拽）
  handleMultipleFileContents: (contentData) => {
    console.log('Preload: handleMultipleFileContents called with:', {
      totalFiles: contentData.totalFiles,
      fileNames: Object.keys(contentData.fileContents || {})
    })
    
    if (!contentData || !contentData.fileContents) {
      console.error('Preload: Invalid content data received:', contentData)
      return
    }
    
    // First dispatch a test event to verify React is listening
    const testEvent = new CustomEvent('test-event', { 
      detail: { message: 'Test event from preload', timestamp: Date.now() }
    })
    window.dispatchEvent(testEvent)
    console.log('Preload: test-event dispatched')
    
    // 触发自定义事件通知 React 应用
    const event = new CustomEvent('multiple-file-contents-loaded', { 
      detail: contentData
    })
    window.dispatchEvent(event)
    console.log('Preload: multiple-file-contents-loaded event dispatched')
  },
  
  // 检查是否在 Electron 环境中
  isElectron: true,
  
  // 获取平台信息
  platform: process.platform
})