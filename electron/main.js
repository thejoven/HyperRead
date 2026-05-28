const { app, BrowserWindow, ipcMain, dialog, net, protocol, session } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
const { execFile } = require('child_process')
const { pathToFileURL } = require('url')

let mainWindow
const domdWindowDocIds = new Map()
const domdDocuments = new Map()
const domdWindowsByPath = new Map()
const markdownEditorWindowTitle = 'Hyperread - MDedit'

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'domd',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true
    }
  }
])

// 窗口状态管理
const windowStateKeeper = {
  data: {
    width: 1000,
    height: 700,
    x: undefined,
    y: undefined,
    isMaximized: false
  },

  // 获取状态文件路径
  getStatePath() {
    const userDataPath = app.getPath('userData')
    return path.join(userDataPath, 'window-state.json')
  },

  // 加载窗口状态
  load() {
    try {
      const statePath = this.getStatePath()
      if (fs.existsSync(statePath)) {
        const data = JSON.parse(fs.readFileSync(statePath, 'utf8'))
        this.data = { ...this.data, ...data }
        console.log('Window state loaded:', this.data)
      }
    } catch (error) {
      console.error('Failed to load window state:', error)
    }
  },

  // 保存窗口状态
  save(window) {
    try {
      if (window.isDestroyed()) return

      const bounds = window.getBounds()
      const isMaximized = window.isMaximized()

      this.data = {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        isMaximized
      }

      const statePath = this.getStatePath()
      fs.writeFileSync(statePath, JSON.stringify(this.data, null, 2))
      console.log('Window state saved:', this.data)
    } catch (error) {
      console.error('Failed to save window state:', error)
    }
  },

  // 获取窗口选项
  getWindowOptions() {
    return {
      width: this.data.width,
      height: this.data.height,
      x: this.data.x,
      y: this.data.y
    }
  }
}

// 防抖工具函数
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

const SCANNABLE_DOCUMENT_EXTENSIONS = new Set(['.md', '.markdown', '.pdf', '.epub', '.html', '.htm'])
const OPENABLE_DOCUMENT_EXTENSIONS = new Set([...SCANNABLE_DOCUMENT_EXTENSIONS, '.txt'])
const DOCUMENT_DEFAULT_APP_BUNDLE_ID = 'com.thejoven.hyperread'
const DEFAULT_DOCUMENT_APP_ASSOCIATIONS = [
  { extension: 'md', label: 'Markdown' },
  { extension: 'markdown', label: 'Markdown' },
  { extension: 'pdf', label: 'PDF' }
]

function execFilePromise(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, options, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr
        reject(error)
        return
      }

      resolve({ stdout, stderr })
    })
  })
}

function getMacAppBundlePath() {
  if (process.platform !== 'darwin') return null

  const match = process.execPath.match(/^(.+?\.app)(?:\/|$)/)
  return match?.[1] ?? null
}

function createDefaultDocumentAppScript(shouldSetDefault) {
  return `
ObjC.import('CoreServices')

const bundleId = ${JSON.stringify(DOCUMENT_DEFAULT_APP_BUNDLE_ID)}
const shouldSetDefault = ${JSON.stringify(shouldSetDefault)}
const fileTypes = ${JSON.stringify(DEFAULT_DOCUMENT_APP_ASSOCIATIONS)}

function unwrapCoreFoundationString(ref) {
  if (!ref) return ''

  const value = ObjC.unwrap(ObjC.castRefToObject(ref))
  return value ? String(value) : ''
}

const results = fileTypes.map((fileType) => {
  const utiRef = $.UTTypeCreatePreferredIdentifierForTag(
    $.kUTTagClassFilenameExtension,
    $(fileType.extension),
    null
  )
  const uti = unwrapCoreFoundationString(utiRef)

  if (!uti) {
    return {
      extension: fileType.extension,
      label: fileType.label,
      isDefault: false,
      error: 'Unable to resolve file type'
    }
  }

  let status = 0
  if (shouldSetDefault) {
    status = Number($.LSSetDefaultRoleHandlerForContentType($(uti), $.kLSRolesAll, $(bundleId)))
  }

  const handlerRef = $.LSCopyDefaultRoleHandlerForContentType($(uti), $.kLSRolesAll)
  const currentHandler = unwrapCoreFoundationString(handlerRef)

  return {
    extension: fileType.extension,
    label: fileType.label,
    uti,
    currentHandler,
    status,
    isDefault: currentHandler === bundleId
  }
})

JSON.stringify(results)
`
}

function buildDefaultDocumentAppStatus(associations, extra = {}) {
  const isDefault = associations.length > 0 && associations.every(item => item.isDefault)

  return {
    supported: process.platform === 'darwin',
    isPackaged: app.isPackaged,
    bundleId: DOCUMENT_DEFAULT_APP_BUNDLE_ID,
    appBundlePath: getMacAppBundlePath(),
    associations,
    isDefault,
    success: isDefault,
    ...extra
  }
}

async function queryDefaultDocumentAppStatus(shouldSetDefault = false) {
  if (process.platform !== 'darwin') {
    return buildDefaultDocumentAppStatus(
      DEFAULT_DOCUMENT_APP_ASSOCIATIONS.map(item => ({ ...item, isDefault: false })),
      { success: false, error: 'Default document app settings are only supported on macOS.' }
    )
  }

  const { stdout } = await execFilePromise(
    '/usr/bin/osascript',
    ['-l', 'JavaScript', '-e', createDefaultDocumentAppScript(shouldSetDefault)],
    { timeout: 10000, maxBuffer: 1024 * 1024 }
  )

  const associations = JSON.parse(stdout.trim() || '[]')
  const failed = associations.filter(item => !item.isDefault)

  return buildDefaultDocumentAppStatus(associations, {
    success: failed.length === 0,
    error: failed.length > 0 && shouldSetDefault
      ? 'Some file types could not be assigned to HyperRead.'
      : undefined
  })
}

async function registerMacAppBundleForLaunchServices() {
  const appBundlePath = getMacAppBundlePath()

  if (!appBundlePath || !fs.existsSync(appBundlePath)) {
    throw new Error('无法找到 HyperRead.app，请先安装正式版应用。')
  }

  await execFilePromise(
    '/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister',
    ['-f', appBundlePath],
    { timeout: 10000, maxBuffer: 1024 * 1024 }
  )
}

async function setDefaultDocumentAppStatus() {
  if (process.platform !== 'darwin') {
    return queryDefaultDocumentAppStatus(false)
  }

  if (!app.isPackaged) {
    const status = await queryDefaultDocumentAppStatus(false)
    return {
      ...status,
      success: false,
      error: '请先安装打包后的 HyperRead.app，开发模式不会修改默认打开方式。'
    }
  }

  await registerMacAppBundleForLaunchServices()
  return queryDefaultDocumentAppStatus(true)
}

function getFileTypeFromExtension(ext) {
  if (ext === '.pdf') return 'pdf'
  if (ext === '.epub') return 'epub'
  if (ext === '.html' || ext === '.htm') return 'html'
  if (ext === '.md' || ext === '.markdown') return 'markdown'
  return 'text'
}

function cleanMarkdownTitle(rawTitle) {
  return rawTitle
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractMarkdownTitle(content) {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/)
  let startIndex = 0

  if (lines[0]?.trim() === '---') {
    let frontmatterTitle

    for (let index = 1; index < lines.length; index++) {
      const line = lines[index].trim()

      if (/^(---|\.\.\.)\s*$/.test(line)) {
        startIndex = index + 1
        if (frontmatterTitle) return frontmatterTitle
        break
      }

      const titleMatch = line.match(/^title:\s*(.+?)\s*$/i)
      if (titleMatch) {
        const cleaned = cleanMarkdownTitle(titleMatch[1])
        if (cleaned) frontmatterTitle = cleaned
      }
    }

    if (frontmatterTitle) return frontmatterTitle
  }

  let inFence = false
  let fenceMarker = ''

  for (let index = startIndex; index < lines.length; index++) {
    const line = lines[index]
    const fenceMatch = line.trimStart().match(/^(`{3,}|~{3,})/)

    if (fenceMatch) {
      const marker = fenceMatch[1][0]
      if (!inFence) {
        inFence = true
        fenceMarker = marker
      } else if (marker === fenceMarker) {
        inFence = false
        fenceMarker = ''
      }
      continue
    }

    if (inFence) continue

    const atxHeading = line.match(/^\s{0,3}#\s+(.+?)\s*#*\s*$/)
    if (atxHeading) {
      const cleaned = cleanMarkdownTitle(atxHeading[1])
      if (cleaned) return cleaned
    }

    const setextTitle = line.trim()
    const setextUnderline = lines[index + 1]?.match(/^\s{0,3}=+\s*$/)
    if (setextTitle && setextUnderline) {
      const cleaned = cleanMarkdownTitle(setextTitle)
      if (cleaned) return cleaned
    }
  }

  return undefined
}

async function readMarkdownTitle(filePath) {
  const maxBytes = 64 * 1024
  let fileHandle

  try {
    fileHandle = await fs.promises.open(filePath, 'r')
    const buffer = Buffer.alloc(maxBytes)
    const { bytesRead } = await fileHandle.read(buffer, 0, maxBytes, 0)
    return extractMarkdownTitle(buffer.subarray(0, bytesRead).toString('utf8'))
  } catch (error) {
    console.warn('Main: failed to extract markdown title:', filePath, error.message)
    return undefined
  } finally {
    if (fileHandle) {
      await fileHandle.close()
    }
  }
}

function isScannableDocumentPath(filePath) {
  return SCANNABLE_DOCUMENT_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

function isOpenableDocumentPath(filePath) {
  return OPENABLE_DOCUMENT_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

function isMarkdownDocumentPath(filePath) {
  return ['.md', '.markdown'].includes(path.extname(filePath).toLowerCase())
}

function getDomdOutDirCandidates() {
  const candidates = [
    path.join(__dirname, '../vendor/domd/out')
  ]

  if (process.resourcesPath) {
    candidates.unshift(path.join(process.resourcesPath, 'domd'))
    candidates.push(path.join(process.resourcesPath, 'app.asar', 'vendor/domd/out'))
    candidates.push(path.join(process.resourcesPath, 'app.asar.unpacked', 'vendor/domd/out'))
  }

  return [...new Set(candidates)]
}

function getDomdOutDir() {
  for (const candidate of getDomdOutDirCandidates()) {
    try {
      if (fs.existsSync(path.join(candidate, 'editor.html'))) {
        return candidate
      }
    } catch {}
  }

  return getDomdOutDirCandidates()[0]
}

function getDomdEditorPathname(pathname) {
  if (pathname === '/' || pathname === '/editor' || pathname === '/editor/') {
    return '/editor.html'
  }
  if (pathname.endsWith('/')) {
    return `${pathname}index.html`
  }
  return pathname
}

function createDomdNotFoundResponse() {
  return new Response('Not found', { status: 404 })
}

function registerDomdProtocol() {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: domd: file: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ')

  session.defaultSession.webRequest.onHeadersReceived({ urls: ['domd://local/*'] }, (details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    })
  })

  protocol.handle('domd', async (request) => {
    const url = new URL(request.url)
    if (url.hostname !== 'local') {
      return createDomdNotFoundResponse()
    }

    const domdOutDir = path.resolve(getDomdOutDir())
    const pathname = getDomdEditorPathname(decodeURIComponent(url.pathname))
    const filePath = path.resolve(domdOutDir, `.${pathname}`)

    if (!filePath.startsWith(domdOutDir + path.sep) && filePath !== domdOutDir) {
      return createDomdNotFoundResponse()
    }

    try {
      await fs.promises.access(filePath)
      return net.fetch(pathToFileURL(filePath).toString())
    } catch {
      return createDomdNotFoundResponse()
    }
  })
}

function getDomdDocumentForSender(sender) {
  const docId = domdWindowDocIds.get(sender.id)
  if (!docId) throw new Error('Unknown DOMD editor window')
  const document = domdDocuments.get(docId)
  if (!document) throw new Error('DOMD document is no longer available')
  return { docId, document }
}

function getImageMimeType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.gif':
      return 'image/gif'
    case '.bmp':
      return 'image/bmp'
    case '.webp':
      return 'image/webp'
    case '.svg':
      return 'image/svg+xml'
    case '.avif':
      return 'image/avif'
    case '.png':
    default:
      return 'image/png'
  }
}

async function readMarkdownFileForDomd(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Invalid file path')
  }
  if (!isMarkdownDocumentPath(filePath)) {
    throw new Error('DOMD editor only supports Markdown files')
  }

  const stat = await fs.promises.stat(filePath)
  if (!stat.isFile()) {
    throw new Error('Markdown path is not a file')
  }

  return fs.promises.readFile(filePath, 'utf-8')
}

async function openDomdEditorWindow(filePath) {
  const absolutePath = path.resolve(filePath)
  const existingWindow = domdWindowsByPath.get(absolutePath)
  if (existingWindow && !existingWindow.isDestroyed()) {
    existingWindow.focus()
    return
  }

  await fs.promises.access(path.join(getDomdOutDir(), 'editor.html')).catch(() => {
    throw new Error('DOMD editor assets are missing. Run `npm run build:domd` first.')
  })

  const content = await readMarkdownFileForDomd(absolutePath)
  const docId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const fileName = path.basename(absolutePath)

  domdDocuments.set(docId, {
    filePath: absolutePath,
    fileName,
    content,
    dirty: false
  })

  const editorWindow = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 640,
    minHeight: 480,
    title: markdownEditorWindowTitle,
    icon: path.join(__dirname, '../logo/logo.png'),
    backgroundColor: '#ffffff',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'domd-preload.js'),
      spellcheck: true
    }
  })

  const webContentsId = editorWindow.webContents.id
  domdWindowDocIds.set(webContentsId, docId)
  domdWindowsByPath.set(absolutePath, editorWindow)

  const keepMarkdownEditorWindowTitle = (event) => {
    event.preventDefault()
    editorWindow.setTitle(markdownEditorWindowTitle)
  }

  editorWindow.on('page-title-updated', keepMarkdownEditorWindowTitle)
  editorWindow.webContents.on('page-title-updated', keepMarkdownEditorWindowTitle)

  editorWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  editorWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (!targetUrl.startsWith('domd://local/')) {
      event.preventDefault()
    }
  })

  editorWindow.once('ready-to-show', () => {
    editorWindow.setTitle(markdownEditorWindowTitle)
    editorWindow.show()
  })

  let closeConfirmed = false
  let closePromptOpen = false
  editorWindow.on('close', (event) => {
    if (closeConfirmed) return

    const document = domdDocuments.get(docId)
    if (!document?.dirty) return

    event.preventDefault()
    if (closePromptOpen) return
    closePromptOpen = true
    dialog.showMessageBox(editorWindow, {
      type: 'warning',
      title: '关闭 Markdown 编辑器',
      message: '文档有未保存的修改',
      detail: `${fileName} 的修改尚未保存。关闭后这些修改会丢失。`,
      buttons: ['继续编辑', '放弃修改并关闭'],
      defaultId: 0,
      cancelId: 0,
      noLink: true
    }).then(({ response }) => {
      if (response !== 1 || editorWindow.isDestroyed()) return
      closeConfirmed = true
      editorWindow.destroy()
    }).catch(() => {}).finally(() => {
      closePromptOpen = false
    })
  })

  editorWindow.on('closed', () => {
    domdWindowDocIds.delete(webContentsId)
    domdDocuments.delete(docId)
    const currentWindow = domdWindowsByPath.get(absolutePath)
    if (currentWindow === editorWindow) {
      domdWindowsByPath.delete(absolutePath)
    }
  })

  await editorWindow.loadURL('domd://local/editor')
  editorWindow.setTitle(markdownEditorWindowTitle)
}

function createWindow() {
  // 加载窗口状态
  windowStateKeeper.load()
  const windowOptions = windowStateKeeper.getWindowOptions()

  mainWindow = new BrowserWindow({
    ...windowOptions,
    minWidth: 600,
    minHeight: 400,
    resizable: true,
    icon: path.join(__dirname, '../logo/logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: true,
      spellcheck: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    center: true,
    title: 'HyperRead',
    backgroundColor: '#ffffff',
    vibrancy: 'content',
    visualEffectState: 'active',
    trafficLightPosition: { x: 20, y: 20 }
  })

  // 始终加载静态文件，不依赖开发服务器
  const isDev = process.env.NODE_ENV === 'development'

  // 修复打包后的路径问题
  let indexPath
  if (isDev) {
    // 开发环境：从项目根目录的dist文件夹加载
    indexPath = path.join(__dirname, '../dist/index.html')
  } else {
    // 生产环境：从app.asar包内加载（app.asar被解包到应用目录）
    // 在ASAR包中，__dirname指向app.asar内的electron目录
    // 需要查找dist目录
    indexPath = path.join(__dirname, '../dist/index.html')

    // 如果文件不存在，尝试其他可能的路径
    if (!require('fs').existsSync(indexPath)) {
      // 尝试从resources目录
      indexPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'index.html')

      if (!require('fs').existsSync(indexPath)) {
        // 尝试从app目录
        indexPath = path.join(process.resourcesPath, 'app', 'dist', 'index.html')

        if (!require('fs').existsSync(indexPath)) {
          // 最后尝试当前目录
          indexPath = path.join(__dirname, 'dist', 'index.html')
        }
      }
    }
  }

  console.log('Loading index.html from:', indexPath)
  mainWindow.loadFile(indexPath)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.once('ready-to-show', () => {
    // 恢复最大化状态
    if (windowStateKeeper.data.isMaximized) {
      mainWindow.maximize()
    }
    mainWindow.show()
  })

  // 广播全屏状态变化到渲染进程
  const sendFullScreen = (isFull) => {
    try {
      mainWindow?.webContents?.send('fullscreen-changed', isFull)
    } catch {}
  }
  mainWindow.on('enter-full-screen', () => sendFullScreen(true))
  mainWindow.on('leave-full-screen', () => sendFullScreen(false))

  // 监听窗口状态变化并保存（resize/move 使用防抖）
  const saveWindowState = () => windowStateKeeper.save(mainWindow)
  const debouncedSaveWindowState = debounce(saveWindowState, 300)

  mainWindow.on('resize', debouncedSaveWindowState)
  mainWindow.on('move', debouncedSaveWindowState)
  mainWindow.on('maximize', saveWindowState)
  mainWindow.on('unmaximize', saveWindowState)

  // 窗口关闭时保存状态
  mainWindow.on('close', () => {
    windowStateKeeper.save(mainWindow)
  })

  // 处理文件拖拽和导航拦截（合并的 will-navigate 监听器）
  mainWindow.webContents.on('will-navigate', async (event, url) => {
    if (url.startsWith('file://')) {
      event.preventDefault()
      const filePath = decodeURIComponent(url.replace('file://', ''))
      console.log('Main: intercepted file drag:', filePath)

      try {
        const stat = await fs.promises.stat(filePath)
        if (stat.isDirectory()) {
          console.log('Main: directory detected via URL:', filePath)
          const files = await scanDirectory(filePath)
          mainWindow.webContents.executeJavaScript(`
            if (window.electronAPI?.handleDirectoryContent) {
              window.electronAPI.handleDirectoryContent({
                files: ${JSON.stringify(files)},
                rootPath: ${JSON.stringify(filePath)}
              })
            }
          `)
        } else if (isOpenableDocumentPath(filePath)) {
          console.log('Main: document file detected via URL:', filePath)
          const ext = path.extname(filePath).toLowerCase()
          const fileType = getFileTypeFromExtension(ext)
          const fileName = path.basename(filePath, ext)
          let content = filePath
          if (fileType === 'epub') {
            const epubData = await fs.promises.readFile(filePath)
            content = epubData.toString('base64')
          } else if (fileType !== 'pdf') {
            content = await fs.promises.readFile(filePath, 'utf-8')
          }
          mainWindow.webContents.executeJavaScript(`
            if (window.electronAPI?.handleFileContent) {
              window.electronAPI.handleFileContent({
                content: ${JSON.stringify(content)},
                fileName: ${JSON.stringify(fileName)},
                originalName: ${JSON.stringify(path.basename(filePath))},
                filePath: ${JSON.stringify(filePath)},
                fileType: ${JSON.stringify(fileType)},
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
}

// 递归扫描目录中的支持文档文件
async function scanDirectory(dirPath) {
  const documentFiles = []

  async function scanRecursive(currentPath) {
    try {
      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name)

        if (entry.isDirectory()) {
          // 跳过隐藏文件夹和 node_modules
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await scanRecursive(fullPath)
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          if (SCANNABLE_DOCUMENT_EXTENSIONS.has(ext)) {
            const relativePath = path.relative(dirPath, fullPath)
            const fileType = getFileTypeFromExtension(ext)
            const documentTitle = fileType === 'markdown'
              ? await readMarkdownTitle(fullPath)
              : undefined

            documentFiles.push({
              name: path.basename(entry.name, path.extname(entry.name)),
              fileName: entry.name,
              fullPath: fullPath,
              relativePath: relativePath,
              directory: path.dirname(relativePath) || '.',
              fileType: fileType,
              ...(documentTitle ? { documentTitle } : {})
            })
          }
        }
      }
    } catch (error) {
      console.error('Error scanning directory:', currentPath, error)
    }
  }

  await scanRecursive(dirPath)
  return documentFiles.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

// IPC 处理程序
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    console.log('Main: read-file called with:', filePath)
    if (!filePath || typeof filePath !== 'string') {
      throw new Error(`无效的文件路径: ${filePath}`)
    }

    const ext = path.extname(filePath).toLowerCase()
    const fileName = path.basename(filePath, ext)
    const fileType = getFileTypeFromExtension(ext)

    // 处理PDF文件 - 直接返回文件路径，不转换为 base64
    if (fileType === 'pdf') {
      console.log('Main: PDF file path returned:', fileName)
      return {
        content: filePath, // 直接返回文件路径
        fileName,
        filePath,
        fileType: 'pdf'
      }
    }

    // 处理EPUB文件 - 读取文件并返回base64数据
    if (fileType === 'epub') {
      console.log('Main: Reading EPUB file:', filePath)
      const epubData = await fs.promises.readFile(filePath)
      const base64Data = epubData.toString('base64')
      console.log('Main: EPUB file read successfully, size:', epubData.length, 'bytes')
      return {
        content: base64Data, // 返回base64数据
        fileName,
        filePath,
        fileType: 'epub'
      }
    }

    // 处理Markdown和文本文件
    const content = await fs.promises.readFile(filePath, 'utf-8')
    console.log('Main: file read successfully:', fileName)
    return {
      content,
      fileName,
      filePath,
      fileType
    }
  } catch (error) {
    console.error('Main: read-file error:', error)
    throw new Error(`读取文件失败: ${error.message}`)
  }
})

// 扫描目录中的支持文档文件
ipcMain.handle('scan-directory', async (event, dirPath) => {
  try {
    console.log('Main: scan-directory called with:', dirPath)
    if (!dirPath || typeof dirPath !== 'string') {
      throw new Error(`无效的目录路径: ${dirPath}`)
    }

    const stat = await fs.promises.stat(dirPath)
    if (!stat.isDirectory()) {
      throw new Error('提供的路径不是目录')
    }

    const files = await scanDirectory(dirPath)
    console.log(`Main: found ${files.length} supported document files`)
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
      { name: 'Documents', extensions: ['md', 'markdown', 'pdf', 'epub', 'html', 'htm'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
      { name: 'PDF Files', extensions: ['pdf'] },
      { name: 'EPUB Files', extensions: ['epub'] },
      { name: 'HTML Files', extensions: ['html', 'htm'] }
    ]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0]
    const ext = path.extname(filePath).toLowerCase()
    const fileName = path.basename(filePath, ext)
    const fileType = getFileTypeFromExtension(ext)

    // 处理PDF文件 - 直接返回文件路径
    if (fileType === 'pdf') {
      return {
        content: filePath, // 直接返回文件路径
        fileName,
        filePath,
        fileType: 'pdf'
      }
    }

    // 处理EPUB文件 - 读取文件并返回base64数据
    if (fileType === 'epub') {
      const epubData = await fs.promises.readFile(filePath)
      const base64Data = epubData.toString('base64')
      console.log('Main: EPUB file read from dialog, size:', epubData.length, 'bytes')
      return {
        content: base64Data, // 返回base64数据
        fileName,
        filePath,
        fileType: 'epub'
      }
    }

    // 处理Markdown、HTML和文本文件
    const content = await fs.promises.readFile(filePath, 'utf-8')
    return {
      content,
      fileName,
      filePath,
      fileType
    }
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
    const files = await scanDirectory(dirPath)
    return { files, rootPath: dirPath }
  }

  return null
})

// 查询当前窗口是否全屏
ipcMain.handle('get-fullscreen', async () => {
  try {
    return !!mainWindow && mainWindow.isFullScreen()
  } catch {
    return false
  }
})

ipcMain.handle('open-markdown-editor', async (event, filePath) => {
  if (!mainWindow || event.sender.id !== mainWindow.webContents.id) {
    throw new Error('Markdown editor can only be opened from the main window')
  }

  await openDomdEditorWindow(filePath)
})

ipcMain.handle('domd:get-initial-document', async (event) => {
  const { docId, document } = getDomdDocumentForSender(event.sender)
  const content = await readMarkdownFileForDomd(document.filePath)
  document.content = content

  return {
    docId,
    filePath: document.filePath,
    fileName: document.fileName,
    content
  }
})

ipcMain.handle('domd:get-document-base-dir', async (event) => {
  const { document } = getDomdDocumentForSender(event.sender)
  return path.dirname(document.filePath)
})

ipcMain.handle('domd:read-image', async (event, imagePath) => {
  getDomdDocumentForSender(event.sender)
  if (!imagePath || typeof imagePath !== 'string') {
    throw new Error('Invalid image path')
  }

  const ext = path.extname(imagePath).toLowerCase()
  const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.avif'])
  if (!imageExtensions.has(ext)) {
    throw new Error(`Unsupported image format: ${ext}`)
  }

  const imageData = await fs.promises.readFile(imagePath)
  return `data:${getImageMimeType(imagePath)};base64,${imageData.toString('base64')}`
})

ipcMain.on('domd:set-dirty', (event, dirty) => {
  try {
    const { document } = getDomdDocumentForSender(event.sender)
    document.dirty = Boolean(dirty)
  } catch {}
})

ipcMain.handle('domd:save-document', async (event, content) => {
  const { document } = getDomdDocumentForSender(event.sender)
  if (typeof content !== 'string') {
    throw new Error('Invalid document content')
  }
  if (!isMarkdownDocumentPath(document.filePath)) {
    throw new Error('DOMD editor only saves Markdown files')
  }

  await fs.promises.writeFile(document.filePath, content, 'utf-8')
  document.content = content
  document.dirty = false

  const ext = path.extname(document.filePath)
  const payload = {
    content,
    fileName: path.basename(document.filePath, ext),
    originalName: path.basename(document.filePath),
    filePath: document.filePath,
    fileType: 'markdown'
  }

  try {
    mainWindow?.webContents?.send('markdown-editor:saved', payload)
  } catch {}

  return {
    ok: true,
    filePath: document.filePath,
    content
  }
})

// 查询 macOS 默认文档打开方式
ipcMain.handle('get-default-document-app-status', async () => {
  try {
    return await queryDefaultDocumentAppStatus(false)
  } catch (error) {
    console.error('Main: get-default-document-app-status error:', error)
    return buildDefaultDocumentAppStatus(
      DEFAULT_DOCUMENT_APP_ASSOCIATIONS.map(item => ({ ...item, isDefault: false })),
      {
        success: false,
        error: error.message || '无法读取默认打开方式。'
      }
    )
  }
})

// 将 HyperRead 设置为 Markdown 与 PDF 的默认打开方式
ipcMain.handle('set-default-document-app', async () => {
  try {
    return await setDefaultDocumentAppStatus()
  } catch (error) {
    console.error('Main: set-default-document-app error:', error)
    return buildDefaultDocumentAppStatus(
      DEFAULT_DOCUMENT_APP_ASSOCIATIONS.map(item => ({ ...item, isDefault: false })),
      {
        success: false,
        error: error.message || '设置默认打开方式失败。'
      }
    )
  }
})

// 分类拖拽的文件
ipcMain.handle('classify-files', async (event, fileData) => {
  try {
    console.log('Main: classify-files called with:', fileData)

    const directories = []
    const markdownFiles = []

    for (const file of fileData) {
      console.log('Main: processing file:', file)

      if (isOpenableDocumentPath(file.name)) {
        markdownFiles.push(file)
        console.log('Main: found supported document file:', file.name)
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
            const stat = await fs.promises.stat(dirPath)
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

    console.log('Main: classification result - directories:', directories.length, 'document files:', markdownFiles.length)
    return { directories, markdownFiles }
  } catch (error) {
    console.error('Main: classify-files error:', error)
    throw new Error(`文件分类失败: ${error.message}`)
  }
})

// 打开外部链接
ipcMain.handle('open-external', async (event, url) => {
  try {
    console.log('Main: open-external called with URL:', url)
    const { shell } = require('electron')
    await shell.openExternal(url)
    console.log('Main: external URL opened successfully:', url)
    return true
  } catch (error) {
    console.error('Main: open-external error:', error)
    throw new Error(`打开外部链接失败: ${error.message}`)
  }
})

// 读取图片文件并返回base64数据
ipcMain.handle('read-image', async (event, imagePath, markdownFilePath) => {
  try {
    console.log('Main: read-image called with:', { imagePath, markdownFilePath })

    let resolvedPath = imagePath

    // 如果是相对路径，需要基于当前Markdown文件的路径来解析
    if (!path.isAbsolute(imagePath)) {
      if (markdownFilePath) {
        const markdownDir = path.dirname(markdownFilePath)
        resolvedPath = path.resolve(markdownDir, imagePath)
      } else {
        // 如果没有提供markdown文件路径，尝试使用当前工作目录
        resolvedPath = path.resolve(process.cwd(), imagePath)
      }
    }

    console.log('Main: resolved image path:', resolvedPath)

    // 检查文件是否存在
    try {
      await fs.promises.access(resolvedPath)
    } catch {
      throw new Error(`图片文件不存在: ${resolvedPath}`)
    }

    // 检查是否为图片文件
    const ext = path.extname(resolvedPath).toLowerCase()
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg']
    if (!imageExtensions.includes(ext)) {
      throw new Error(`不支持的图片格式: ${ext}`)
    }

    // 读取图片文件
    const imageData = await fs.promises.readFile(resolvedPath)
    const base64Data = imageData.toString('base64')

    // 确定MIME类型
    let mimeType = 'image/png' // 默认
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg'
        break
      case '.gif':
        mimeType = 'image/gif'
        break
      case '.bmp':
        mimeType = 'image/bmp'
        break
      case '.webp':
        mimeType = 'image/webp'
        break
      case '.svg':
        mimeType = 'image/svg+xml'
        break
      case '.png':
      default:
        mimeType = 'image/png'
        break
    }

    console.log('Main: image loaded successfully:', {
      path: resolvedPath,
      size: imageData.length,
      mimeType
    })

    return {
      success: true,
      dataUrl: `data:${mimeType};base64,${base64Data}`,
      mimeType,
      size: imageData.length,
      path: resolvedPath
    }
  } catch (error) {
    console.error('Main: read-image error:', error)
    return {
      success: false,
      error: error.message,
      path: imagePath
    }
  }
})

// 存储启动时的文件参数
let startupFile = null

// 检查命令行参数中的文件
function getFileFromArgs(argv) {
  // 过滤掉electron本身的参数，查找文件路径
  const args = argv.slice(1) // 跳过第一个参数（electron可执行文件路径）
  for (const arg of args) {
    if (arg && !arg.startsWith('-') && isOpenableDocumentPath(arg)) {
      if (fs.existsSync(arg)) {
        return arg
      }
    }
  }
  return null
}

// 发送文件到渲染进程
async function openFileInRenderer(filePath) {
  if (mainWindow && filePath) {
    console.log('Opening file via association:', filePath)
    try {
      const ext = path.extname(filePath).toLowerCase()
      const fileName = path.basename(filePath, ext)
      const originalName = path.basename(filePath)

      let content
      let fileType

      // 处理PDF文件 - 直接传递文件路径
      if (ext === '.pdf') {
        content = filePath // 直接传递路径
        fileType = 'pdf'
      } else if (ext === '.epub') {
        // 处理EPUB文件 - 直接传递文件路径，由前端加载
        content = filePath
        fileType = 'epub'
        console.log('Main: EPUB file path sent for association:', filePath)
      } else {
        content = await fs.promises.readFile(filePath, 'utf8')
        fileType = getFileTypeFromExtension(ext)
      }

      mainWindow.webContents.executeJavaScript(`
        if (window.electronAPI?.setFileData) {
          window.electronAPI.setFileData({
            content: ${JSON.stringify(content)},
            fileName: ${JSON.stringify(fileName)},
            originalName: ${JSON.stringify(originalName)},
            filePath: ${JSON.stringify(filePath)},
            fileType: ${JSON.stringify(fileType)}
          })
        }
      `)
    } catch (error) {
      console.error('Failed to read file:', error)
    }
  }
}

// 检查启动参数
startupFile = getFileFromArgs(process.argv)

app.whenReady().then(() => {
  registerDomdProtocol()
  createWindow()

  // 如果启动时有文件参数，等待窗口加载完成后打开
  if (startupFile) {
    mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        openFileInRenderer(startupFile)
      }, 500) // 给渲染进程一些时间来初始化
    })
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// macOS: 处理文件关联打开
app.on('open-file', (event, filePath) => {
  event.preventDefault()
  console.log('macOS open-file event:', filePath)

  if (mainWindow) {
    // 窗口已存在，直接打开文件
    openFileInRenderer(filePath)
  } else {
    // 窗口还未创建，保存文件路径等待创建完成
    startupFile = filePath
  }
})

// Windows/Linux: 处理second-instance（防止多实例，并处理文件打开）
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当用户尝试运行第二个实例时，聚焦现有窗口并处理新的文件参数
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()

      // 检查新实例的命令行参数
      const newFile = getFileFromArgs(commandLine)
      if (newFile) {
        openFileInRenderer(newFile)
      }
    }
  })
}

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 处理协议 (可选，用于打开 .md 文件)
if (process.platform === 'win32') {
  // 在打包环境中，process.argv[1] 可能为 undefined，需要处理这种情况
  const appPath = process.argv[1] || process.execPath
  if (appPath) {
    app.setAsDefaultProtocolClient('hyperread', process.execPath, [path.resolve(appPath)])
  } else {
    // 如果无法获取路径，则不设置协议客户端
    console.warn('Could not determine app path for protocol registration')
  }
} else {
  app.setAsDefaultProtocolClient('hyperread')
}

// ============================================================
// Plugin System IPC Handlers
// ============================================================

function getPluginsDir() {
  return path.join(os.homedir(), '.hyperread', 'plugins')
}

function getBundledPluginsDirCandidates() {
  const candidates = [
    path.join(__dirname, 'bundled-plugins')
  ]

  if (process.resourcesPath) {
    candidates.unshift(path.join(process.resourcesPath, 'bundled-plugins'))
    candidates.push(path.join(process.resourcesPath, 'app.asar', 'electron/bundled-plugins'))
    candidates.push(path.join(process.resourcesPath, 'app.asar.unpacked', 'electron/bundled-plugins'))
  }

  return [...new Set(candidates)]
}

function getPluginDataDir() {
  return path.join(os.homedir(), '.hyperread', 'plugin-data')
}

async function readPluginManifest(pluginDir, bundled = false) {
  const raw = await fs.promises.readFile(path.join(pluginDir, 'manifest.json'), 'utf-8')
  return { ...JSON.parse(raw), bundled }
}

async function listPluginManifests(pluginDir, bundled = false) {
  try {
    if (bundled) {
      await fs.promises.access(pluginDir)
    } else {
      await fs.promises.mkdir(pluginDir, { recursive: true })
    }
    const entries = await fs.promises.readdir(pluginDir, { withFileTypes: true })
    const manifests = []
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      try {
        manifests.push(await readPluginManifest(path.join(pluginDir, entry.name), bundled))
      } catch {}
    }
    return manifests
  } catch (e) {
    if (bundled && e?.code === 'ENOENT') {
      return []
    }
    console.error('Failed to list plugin manifests:', pluginDir, e)
    return []
  }
}

async function listBundledPluginManifests() {
  const manifestsById = new Map()
  for (const pluginDir of getBundledPluginsDirCandidates()) {
    const manifests = await listPluginManifests(pluginDir, true)
    for (const manifest of manifests) {
      if (!manifestsById.has(manifest.id)) {
        manifestsById.set(manifest.id, manifest)
      }
    }
  }
  return Array.from(manifestsById.values())
}

async function resolvePluginDir(pluginId) {
  if (!pluginId || typeof pluginId !== 'string' || pluginId.includes('/') || pluginId.includes('\\') || pluginId.includes('..')) {
    throw new Error('Invalid plugin id')
  }

  for (const bundledPluginsDir of getBundledPluginsDirCandidates()) {
    const bundledPluginDir = path.resolve(bundledPluginsDir, pluginId)
    try {
      await fs.promises.access(path.join(bundledPluginDir, 'manifest.json'))
      return { pluginDir: bundledPluginDir, bundled: true }
    } catch {}
  }

  const pluginsDir = getPluginsDir()
  const pluginDir = path.resolve(pluginsDir, pluginId)
  if (!pluginDir.startsWith(path.resolve(pluginsDir) + path.sep)) {
    throw new Error('Invalid plugin id')
  }
  return { pluginDir, bundled: false }
}

// List installed plugins
ipcMain.handle('plugin:list-installed', async () => {
  const pluginsDir = getPluginsDir()
  const bundledManifests = await listBundledPluginManifests()
  const userManifests = await listPluginManifests(pluginsDir, false)
  const manifestsById = new Map()

  for (const manifest of bundledManifests) {
    manifestsById.set(manifest.id, manifest)
  }
  for (const manifest of userManifests) {
    if (!manifestsById.has(manifest.id)) {
      manifestsById.set(manifest.id, manifest)
    }
  }

  return Array.from(manifestsById.values())
})

// Read a file within a plugin directory (path traversal protected)
ipcMain.handle('plugin:read-file', async (_event, pluginId, fileName) => {
  const { pluginDir } = await resolvePluginDir(pluginId)
  const filePath = path.resolve(pluginDir, fileName)
  if (!filePath.startsWith(pluginDir + path.sep) && filePath !== pluginDir) {
    throw new Error('Path traversal detected')
  }
  const content = await fs.promises.readFile(filePath, 'utf-8')
  return { content, fileName, filePath, fileType: 'text' }
})

// Load plugin persistent data
ipcMain.handle('plugin:load-data', async (_event, pluginId) => {
  const dataDir = getPluginDataDir()
  const dataFile = path.join(dataDir, `${pluginId}.json`)
  try {
    const raw = await fs.promises.readFile(dataFile, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
})

// Save plugin persistent data
ipcMain.handle('plugin:save-data', async (_event, pluginId, data) => {
  const dataDir = getPluginDataDir()
  await fs.promises.mkdir(dataDir, { recursive: true })
  const dataFile = path.join(dataDir, `${pluginId}.json`)
  await fs.promises.writeFile(dataFile, JSON.stringify(data, null, 2))
})

// Load plugin settings
ipcMain.handle('plugin:get-settings', async (_event, pluginId) => {
  const dataDir = getPluginDataDir()
  const settingsFile = path.join(dataDir, `${pluginId}.settings.json`)
  try {
    const raw = await fs.promises.readFile(settingsFile, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
})

// Save plugin settings
ipcMain.handle('plugin:save-settings', async (_event, pluginId, settings) => {
  const dataDir = getPluginDataDir()
  await fs.promises.mkdir(dataDir, { recursive: true })
  const settingsFile = path.join(dataDir, `${pluginId}.settings.json`)
  await fs.promises.writeFile(settingsFile, JSON.stringify(settings, null, 2))
})

// Open file picker for plugin zip files
ipcMain.handle('plugin:open-zip-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择插件文件',
    filters: [{ name: 'HyperRead 插件', extensions: ['zip'] }],
    properties: ['openFile']
  })
  return result.canceled ? null : result.filePaths[0]
})

// Install plugin from zip — extract to ~/.hyperread/plugins/{id}/
ipcMain.handle('plugin:install-zip', async (_event, zipPath) => {
  const pluginsDir = getPluginsDir()
  await fs.promises.mkdir(pluginsDir, { recursive: true })

  const tmpDir = path.join(pluginsDir, `__tmp_${Date.now()}__`)
  await fs.promises.mkdir(tmpDir, { recursive: true })

  try {
    // Cross-platform extraction
    await new Promise((resolve, reject) => {
      const { execFile } = require('child_process')
      if (process.platform === 'win32') {
        execFile('powershell', [
          '-NoProfile', '-Command',
          `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${tmpDir}' -Force`
        ], (err) => err ? reject(err) : resolve())
      } else {
        execFile('unzip', ['-o', zipPath, '-d', tmpDir], (err) => err ? reject(err) : resolve())
      }
    })

    // Locate manifest.json — handle both flat and single-subdir layouts
    let extractedRoot = tmpDir
    const entries = await fs.promises.readdir(tmpDir, { withFileTypes: true })
    if (entries.length === 1 && entries[0].isDirectory()) {
      extractedRoot = path.join(tmpDir, entries[0].name)
    }

    const manifestPath = path.join(extractedRoot, 'manifest.json')
    let manifest
    try {
      manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'))
    } catch {
      throw new Error('插件包中未找到有效的 manifest.json')
    }
    if (!manifest.id || typeof manifest.id !== 'string') {
      throw new Error('manifest.json 中缺少 id 字段')
    }
    if (!manifest.main) {
      throw new Error('manifest.json 中缺少 main 字段')
    }

    // Validate main file exists
    const mainFilePath = path.join(extractedRoot, manifest.main)
    await fs.promises.access(mainFilePath)

    // Move to final destination (replace if exists)
    const targetDir = path.join(pluginsDir, manifest.id)
    await fs.promises.rm(targetDir, { recursive: true, force: true })
    await fs.promises.rename(extractedRoot, targetDir)

    return { success: true, manifest }
  } finally {
    await fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
})

// Uninstall a plugin (remove its directory)
ipcMain.handle('plugin:uninstall', async (_event, pluginId) => {
  const resolved = await resolvePluginDir(pluginId)
  if (resolved.bundled) {
    throw new Error('Bundled plugins cannot be uninstalled')
  }

  const pluginsDir = getPluginsDir()
  const pluginDir = path.resolve(pluginsDir, pluginId)
  // Security check
  if (!pluginDir.startsWith(pluginsDir + path.sep)) throw new Error('Invalid plugin id')
  await fs.promises.rm(pluginDir, { recursive: true, force: true })
})
