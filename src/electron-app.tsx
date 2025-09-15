'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import DocumentViewer from '@/components/DocumentViewer'
import FileList from '@/components/FileList'
import { ThemeToggle } from '@/components/ThemeToggle'
import AboutModal from '@/components/AboutModal'
import SettingsModal from '@/components/SettingsModal'
import { FileText, FolderOpen, Folder, Info, Settings } from 'lucide-react'

interface FileData {
  content: string
  fileName: string
  filePath: string
}

interface FileInfo {
  name: string
  fileName: string
  fullPath: string
  relativePath: string
  directory: string
}

interface DirectoryData {
  files: FileInfo[]
  rootPath: string
}

declare global {
  interface Window {
    electronAPI?: {
      readFile: (filePath: string) => Promise<FileData>
      openFileDialog: () => Promise<FileData | null>
      openDirectoryDialog: () => Promise<DirectoryData | null>
      scanDirectory: (dirPath: string) => Promise<DirectoryData>
      openExternal: (url: string) => Promise<void>
      isElectron: boolean
      platform: string
    }
  }
}

export default function ElectronApp() {
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [directoryData, setDirectoryData] = useState<DirectoryData | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDirectoryMode, setIsDirectoryMode] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [fontSize, setFontSize] = useState(16)

  // Load font size from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('docs-font-size')
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize, 10))
    }
  }, [])

  // Save font size to localStorage when changed
  useEffect(() => {
    localStorage.setItem('docs-font-size', fontSize.toString())
  }, [fontSize])

  // 处理文件拖拽事件
  useEffect(() => {
    const handleFileDrop = async (event: CustomEvent) => {
      console.log('React: file-dropped event received', event.detail)
      const { filePath } = event.detail
      await loadFile(filePath)
    }

    const handleFileContent = (event: CustomEvent) => {
      console.log('React: file-content-loaded event received', {
        fileName: event.detail.fileName,
        contentLength: event.detail.content ? event.detail.content.length : 0
      })
      
      const fileData = event.detail
      // 直接设置文件数据，无需通过 IPC
      setFileData({
        content: fileData.content,
        fileName: fileData.fileName,
        filePath: fileData.originalName // 使用原始文件名作为显示路径
      })
      setIsDirectoryMode(false)
      console.log('React: file data set successfully')
    }

    const handleDirectoryDrop = async (event: CustomEvent) => {
      console.log('React: directory-dropped event received', event.detail)
      // 目录拖拽时，显示目录选择对话框
      const directoryName = event.detail.directoryName
      const userConfirmed = confirm(`检测到文件夹"${directoryName}"拖拽。\n\n由于安全限制，需要您在对话框中选择要加载的文件夹。\n\n点击确定选择文件夹，或取消。`)
      
      if (userConfirmed) {
        await handleOpenDirectory()
      }
    }

    const handleDirectoryContent = (event: CustomEvent) => {
      console.log('React: directory-content-loaded event received', event.detail)
      const { files, rootPath } = event.detail
      
      if (files && files.length > 0) {
        setFiles(files)
        setRootPath(rootPath)
        setCurrentFile(files[0].fullPath)
        setIsDirectoryMode(true)
        loadFile(files[0].fullPath)
        console.log('React: directory content loaded successfully')
      } else {
        console.log('React: no markdown files found in dragged directory')
        alert('该文件夹中没有找到 Markdown 文件')
      }
    }

    window.addEventListener('file-dropped', handleFileDrop as EventListener)
    window.addEventListener('file-content-loaded', handleFileContent as EventListener)
    window.addEventListener('directory-dropped', handleDirectoryDrop as EventListener)
    window.addEventListener('directory-content-loaded', handleDirectoryContent as EventListener)
    console.log('React: event listeners added')
    
    return () => {
      window.removeEventListener('file-dropped', handleFileDrop as EventListener)
      window.removeEventListener('file-content-loaded', handleFileContent as EventListener)
      window.removeEventListener('directory-dropped', handleDirectoryDrop as EventListener)
      window.removeEventListener('directory-content-loaded', handleDirectoryContent as EventListener)
      console.log('React: event listeners removed')
    }
  }, [])

  // 处理拖拽样式 - 仅监听样式变化，不处理文件
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      console.log('React: dragenter for styling')
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragOver(true)
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      console.log('React: dragleave for styling')
      // 检查是否真的离开了窗口区域
      if (!e.relatedTarget || !document.body.contains(e.relatedTarget as Node)) {
        setIsDragOver(false)
      }
    }

    const handleDrop = (e: DragEvent) => {
      console.log('React: drop for styling cleanup')
      setIsDragOver(false)
    }

    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('drop', handleDrop)
    }
  }, [])

  const loadFile = async (filePath: string) => {
    console.log('React: loadFile called with:', filePath)
    if (!window.electronAPI) {
      console.error('React: electronAPI not available')
      return
    }

    setLoading(true)
    try {
      console.log('React: calling electronAPI.readFile with:', filePath)
      const data = await window.electronAPI.readFile(filePath)
      console.log('React: file loaded successfully:', data.fileName)
      setFileData(data)
    } catch (error) {
      console.error('React: Failed to load file:', error)
      alert('文件加载失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenFile = async () => {
    if (!window.electronAPI) return

    setLoading(true)
    try {
      const data = await window.electronAPI.openFileDialog()
      if (data) {
        setFileData(data)
        setIsDirectoryMode(false)
        setDirectoryData(null)
      }
    } catch (error) {
      console.error('Failed to open file:', error)
      alert('文件打开失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDirectory = async () => {
    if (!window.electronAPI) return

    setLoading(true)
    try {
      const data = await window.electronAPI.openDirectoryDialog()
      if (data && data.files.length > 0) {
        setDirectoryData(data)
        setIsDirectoryMode(true)
        // 自动选择第一个文件
        const firstFile = data.files[0]
        await loadFileFromDirectory(firstFile)
      } else if (data && data.files.length === 0) {
        alert('该文件夹中没有找到 Markdown 文件')
      }
    } catch (error) {
      console.error('React: Failed to open directory:', error)
      alert('文件夹打开失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const loadFileFromDirectory = async (fileInfo: FileInfo) => {
    if (!window.electronAPI) return

    setLoading(true)
    try {
      console.log('React: loading file from directory:', fileInfo.fullPath)
      const data = await window.electronAPI.readFile(fileInfo.fullPath)
      setFileData(data)
    } catch (error) {
      console.error('React: Failed to load file from directory:', error)
      alert('文件加载失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!window.electronAPI?.isElectron) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">HyperRead</h2>
            <p className="text-muted-foreground mb-4">
              此应用需要在 Electron 环境中运行
            </p>
            <Button onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* macOS 风格的标题栏区域 */}
      <header className="macos-toolbar drag-region sticky top-0 z-50">
        <div className="flex items-center h-14 relative py-2">
          {/* 左侧为交通灯按钮预留空间 (约78px) */}
          <div className="w-30 flex-shrink-0"></div>
          
          {/* 灵活空间 */}
          <div className="flex-1"></div>
          
          {/* 右侧标题区域 */}
          {fileData && (
            <div className="flex items-center justify-end min-w-0 mr-4">
              <div className="flex items-center gap-3 min-w-0">
                {isDirectoryMode && directoryData && (
                  <p className="text-xs text-muted-foreground truncate macos-text" title={directoryData.rootPath}>
                    📁 {directoryData.rootPath.split('/').pop() || directoryData.rootPath}
                  </p>
                )}
                <p className="text-sm font-medium text-foreground truncate macos-text-title" title={fileData.fileName}>
                  {fileData.fileName}
                </p>
              </div>
            </div>
          )}
          
          {/* 右侧所有按钮 */}
          <div className="flex items-center gap-1 mr-4 no-drag">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFile}
              disabled={loading}
              className="h-7 px-2 macos-button"
              title="打开文件"
            >
              <FileText className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenDirectory}
              disabled={loading}
              className="h-7 px-2 macos-button"
              title="打开文件夹"
            >
              <Folder className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-4 bg-border mx-1"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="h-7 w-7 p-0 macos-button"
              title="设置"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAbout(true)}
              className="h-7 w-7 p-0 macos-button"
              title="关于"
            >
              <Info className="h-3.5 w-3.5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="relative">
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p>正在加载文件...</p>
            </div>
          </div>
        )}

        {isDirectoryMode && directoryData ? (
          <div className="flex h-[calc(100vh-56px)]">
            {/* 文件列表侧边栏 */}
            <FileList
              files={directoryData.files}
              rootPath={directoryData.rootPath}
              currentFile={fileData?.filePath}
              onFileSelect={loadFileFromDirectory}
            />
            {/* 主内容区域 */}
            <div className="flex-1 overflow-hidden bg-background">
              {fileData ? (
                <div className="h-full">
                  <div className="h-full overflow-y-auto content-scroll">
                    <div className="max-w-4xl mx-auto">
                      <DocumentViewer
                        content={fileData.content}
                        className="px-4 py-6"
                        fontSize={fontSize}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Card className="max-w-md border-dashed">
                    <CardContent className="p-6 text-center">
                      <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/60" />
                      <h3 className="text-sm font-medium mb-2 text-foreground">选择文件</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        从左侧文件列表中选择一个 Markdown 文件来开始阅读
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        ) : fileData ? (
          <div className="h-[calc(100vh-56px)] overflow-y-auto content-scroll">
            <DocumentViewer
              content={fileData.content}
              className="container mx-auto px-4 py-8 max-w-4xl"
              fontSize={fontSize}
            />
          </div>
        ) : (
          <div className="container mx-auto px-4 py-12 h-[calc(100vh-56px)] flex items-center justify-center">
            <Card className={`max-w-lg w-full transition-all duration-300 macos-scale-in ${
              isDragOver 
                ? 'macos-drop-zone shadow-lg scale-105' 
                : 'border-dashed border-2 border-muted-foreground/30 hover:border-muted-foreground/50 hover:shadow-md'
            }`}>
              <CardContent className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-30 h-30 rounded-xl mb-4 transition-all duration-300 ${
                  isDragOver 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted/30 text-muted-foreground'
                }`}>
                  <img 
                    src="./logo.png" 
                    alt="HyperRead Logo"
                    className="w-30 h-30 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = isDragOver 
                        ? '<div class="h-8 w-8 text-2xl">📁</div>' 
                        : '<div class="h-8 w-8 text-2xl">📄</div>'
                    }}
                  />
                </div>
                <h2 className="text-lg font-semibold mb-2 text-foreground">
                  {isDragOver ? '释放以打开' : 'HyperRead — Read smarter. Read faster.'}
                </h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {isDragOver 
                    ? '释放文件或文件夹以开始阅读' 
                    : '支持 .md 和 .markdown 文件，以及包含 Markdown 文件的文件夹'
                  }
                </p>
                {!isDragOver && (
                  <div className="space-y-4">
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleOpenFile}  className="min-w-24 macos-button">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="macos-text">选择文件</span>
                      </Button>
                      <Button onClick={handleOpenDirectory} variant="outline" className="min-w-24 macos-button">
                        <Folder className="h-4 w-4 mr-2" />
                        <span className="macos-text">选择文件夹</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-xs px-2">或</span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      直接拖拽文件或文件夹到此窗口
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 拖拽覆盖层 */}
        {isDragOver && (
          <div className="fixed inset-0 bg-primary/10 backdrop-blur-lg flex items-center justify-center z-40 pointer-events-none macos-fade-in">
            <div className="text-center glass-effect p-8 rounded-2xl">
              <FolderOpen className="h-24 w-24 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold text-primary macos-text-title">释放文件</h3>
              <p className="text-sm text-primary/70 mt-2 macos-text">支持 Markdown 文件和文件夹</p>
            </div>
          </div>
        )}
      </main>

      {/* About Modal */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
      />
    </div>
  )
}