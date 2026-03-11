const { contextBridge, ipcRenderer, shell } = require('electron')

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

  // 读取图片文件
  readImage: (imagePath, markdownFilePath) => ipcRenderer.invoke('read-image', imagePath, markdownFilePath),

  // 打开外部链接 - 使用 IPC 调用主进程
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // 处理文件拖拽（从主进程调用）
  handleFileDrop: (filePath) => {
    if (!filePath || typeof filePath !== 'string') {
      return
    }

    // 触发自定义事件通知 React 应用
    const event = new CustomEvent('file-dropped', {
      detail: { filePath }
    })
    window.dispatchEvent(event)
  },

  // 处理文件内容（用于拖拽）
  handleFileContent: (fileData) => {
    if (!fileData || !fileData.content) {
      return
    }

    // 触发自定义事件通知 React 应用
    const event = new CustomEvent('file-content-loaded', {
      detail: fileData
    })
    window.dispatchEvent(event)
  },

  // 处理目录拖拽
  handleDirectoryDrop: (directoryName) => {
    // 触发自定义事件通知 React 应用需要打开目录对话框
    const event = new CustomEvent('directory-dropped', {
      detail: { directoryName }
    })
    window.dispatchEvent(event)
  },

  // 处理目录内容（用于拖拽）
  handleDirectoryContent: (directoryData) => {
    if (!directoryData || !directoryData.files) {
      return
    }

    // 触发自定义事件通知 React 应用
    const event = new CustomEvent('directory-content-loaded', {
      detail: directoryData
    })
    window.dispatchEvent(event)
  },

  // 处理多个文件内容缓存（用于增强拖拽）
  handleMultipleFileContents: (contentData) => {
    if (!contentData || !contentData.fileContents) {
      return
    }

    // 触发自定义事件通知 React 应用
    const event = new CustomEvent('multiple-file-contents-loaded', {
      detail: contentData
    })
    window.dispatchEvent(event)
  },

  // 处理文件关联打开（从main进程调用）
  setFileData: (fileData) => {
    if (!fileData || !fileData.content) {
      return
    }

    // 触发自定义事件通知 React 应用
    const event = new CustomEvent('file-association-opened', {
      detail: fileData
    })
    window.dispatchEvent(event)
  },

  // 检查是否在 Electron 环境中
  isElectron: true,

  // 获取平台信息
  platform: process.platform,
  // 查询全屏状态
  getFullScreen: () => ipcRenderer.invoke('get-fullscreen')
})

// IPC 监听器：接收主进程通过 webContents.send() 发送的消息
// 用于替代 main.js 中的 executeJavaScript() 调用

// 监听文件关联打开事件（替代 openFileInRenderer 中的 executeJavaScript）
ipcRenderer.on('file-opened', (_event, fileData) => {
  try {
    const ev = new CustomEvent('file-association-opened', { detail: fileData })
    window.dispatchEvent(ev)
  } catch {}
})

// 监听目录扫描结果事件（替代 will-navigate 中的 executeJavaScript）
ipcRenderer.on('directory-scanned', (_event, directoryData) => {
  try {
    const ev = new CustomEvent('directory-content-loaded', { detail: directoryData })
    window.dispatchEvent(ev)
  } catch {}
})

// 监听全屏状态变化
ipcRenderer.on('fullscreen-changed', (_event, isFull) => {
  try {
    const ev = new CustomEvent('fullscreen-changed', { detail: { isFull } })
    window.dispatchEvent(ev)
  } catch {}
})
