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
      // Enhanced drag-drop functions
      handleFileContent: (data: { content: string; fileName: string; originalName: string; isDirectory: boolean }) => void
      handleDirectoryContent: (data: { files: FileInfo[]; rootPath: string }) => void
      handleDirectoryDrop: (directoryName: string) => void
      handleMultipleFileContents: (data: { fileContents: Record<string, string>; totalFiles: number }) => void
      classifyFiles: (fileData: any[]) => Promise<{ directories: any[]; markdownFiles: any[] }>
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
  // Cache for enhanced drag-drop file contents
  const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map())
  // Track if we're in enhanced drag-drop mode (files pre-loaded in memory)
  const [isEnhancedDragMode, setIsEnhancedDragMode] = useState(false)

  // Load font size from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('docs-font-size')
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize, 10))
    }
  }, [])

  // Debug: Check electronAPI availability on mount
  useEffect(() => {
    console.log('React: Component mounted, checking electronAPI...')
    console.log('electronAPI available:', !!window.electronAPI)
    if (window.electronAPI) {
      console.log('electronAPI methods:', Object.keys(window.electronAPI))
      console.log('openExternal available:', typeof window.electronAPI.openExternal)
    } else {
      console.log('electronAPI not found on window object')
    }
  }, [])

  // Save font size to localStorage when changed
  useEffect(() => {
    localStorage.setItem('docs-font-size', fontSize.toString())
  }, [fontSize])

  // 处理文件拖拽事件
  useEffect(() => {
    // Add a test to check if React is receiving ANY events from preload
    const testEventHandler = (event: CustomEvent) => {
      console.log('React: TEST EVENT RECEIVED:', event.type, event.detail)
    }
    window.addEventListener('test-event', testEventHandler as EventListener)

    const handleFileDrop = async (event: CustomEvent) => {
      console.log('React: file-dropped event received', event.detail)
      const { filePath } = event.detail
      await loadFile(filePath)
    }

    const handleFileContent = (event: CustomEvent) => {
      console.log('React: file-content-loaded event received', {
        fileName: event.detail.fileName,
        contentLength: event.detail.content ? event.detail.content.length : 0,
        isDirectory: event.detail.isDirectory
      })
      
      const fileData = event.detail
      
      // Cache the file content for enhanced drag-drop mode
      if (fileData.isDirectory) {
        // For directory mode, cache the content
        const filePath = fileData.originalName
        setFileContentCache(prev => {
          const newCache = new Map(prev)
          newCache.set(filePath, fileData.content)
          return newCache
        })
      }
      
      // Set current file data
      setFileData({
        content: fileData.content,
        fileName: fileData.fileName,
        filePath: fileData.originalName // 使用原始文件名作为显示路径
      })
      
      // Only set directory mode to false for single file drops
      if (!fileData.isDirectory) {
        setIsDirectoryMode(false)
        setIsEnhancedDragMode(false)
      }
      
      console.log('React: file data set successfully')
    }

    const handleDirectoryDrop = async (event: CustomEvent) => {
      console.log('React: directory-dropped event received (DISABLED - enhanced drag-drop should handle this)', event.detail)
      // Disable this fallback since enhanced drag-drop should handle everything
      console.warn('React: Using fallback directory handler - enhanced drag-drop may not be working properly')
      return // Exit early without showing dialog
      
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
      
      console.log('React: received files:', files?.length || 0, files?.map(f => f.fileName) || [])
      console.log('React: current directoryData state before update:', directoryData)
      console.log('React: current isDirectoryMode state before update:', isDirectoryMode)
      
      if (files && files.length > 0) {
        // Create directory data structure compatible with existing code
        const directoryData: DirectoryData = {
          files: files,
          rootPath: rootPath
        }
        console.log('React: setting directory data with', files.length, 'files:', directoryData)
        setDirectoryData(directoryData)
        setIsDirectoryMode(true)
        setIsEnhancedDragMode(true) // Mark as enhanced drag mode
        console.log('React: directory content loaded successfully')
        
        // Force a state check after a brief delay to see if state actually updated
        setTimeout(() => {
          console.log('React: directoryData state after update:', directoryData)
          console.log('React: isDirectoryMode state after update:', isDirectoryMode)
        }, 100)
      } else {
        console.log('React: no markdown files found in dragged directory')
        alert('该文件夹中没有找到 Markdown 文件')
      }
    }

    const handleMultipleFileContents = (event: CustomEvent) => {
      console.log('React: multiple-file-contents-loaded event received', {
        totalFiles: event.detail.totalFiles,
        fileNames: Object.keys(event.detail.fileContents)
      })
      
      const { fileContents, totalFiles } = event.detail
      
      // Update the file content cache with all the file contents
      setFileContentCache(new Map(Object.entries(fileContents)))
      console.log(`React: cached ${totalFiles} file contents for enhanced drag mode`)
    }

    window.addEventListener('file-dropped', handleFileDrop as EventListener)
    window.addEventListener('file-content-loaded', handleFileContent as EventListener)
    window.addEventListener('directory-dropped', handleDirectoryDrop as EventListener)
    window.addEventListener('directory-content-loaded', handleDirectoryContent as EventListener)
    window.addEventListener('multiple-file-contents-loaded', handleMultipleFileContents as EventListener)
    console.log('React: event listeners added')
    
    return () => {
      window.removeEventListener('file-dropped', handleFileDrop as EventListener)
      window.removeEventListener('file-content-loaded', handleFileContent as EventListener)
      window.removeEventListener('directory-dropped', handleDirectoryDrop as EventListener)
      window.removeEventListener('directory-content-loaded', handleDirectoryContent as EventListener)
      window.removeEventListener('multiple-file-contents-loaded', handleMultipleFileContents as EventListener)
      console.log('React: event listeners removed')
    }
  }, [])

  // 处理拖拽样式 - 仅监听样式变化，不处理文件
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      console.log('React: dragenter for styling', e.dataTransfer?.types)
      if (e.dataTransfer?.types.includes('Files')) {
        console.log('React: Files detected, setting isDragOver to true')
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

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer!.dropEffect = 'copy'
    }

    const handleDrop = async (e: DragEvent) => {
      console.log('React: drop event triggered - processing with webkitGetAsEntry')
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      
      try {
        const items = [...(e.dataTransfer?.items || [])]
        console.log(`React: Processing ${items.length} dropped items`)
        
        const allFiles: Array<{file: File, fullPath: string, name: string}> = []
        const directories: string[] = []
        
        // Process each item using webkitGetAsEntry API
        for (const item of items) {
          if (item.kind === 'file') {
            const entry = (item as any).webkitGetAsEntry()
            
            if (entry) {
              if (entry.isDirectory) {
                console.log('React: Processing directory:', entry.name)
                directories.push(entry.name)
                const dirFiles = await processDirectoryEntry(entry)
                allFiles.push(...dirFiles)
                console.log(`React: Found ${dirFiles.length} markdown files in directory: ${entry.name}`)
              } else if (entry.isFile && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
                const file = await new Promise<File>((resolve, reject) => {
                  entry.file(resolve, reject)
                })
                allFiles.push({
                  file: file,
                  fullPath: entry.fullPath,
                  name: entry.name
                })
              }
            }
          }
        }
        
        console.log(`React: Found ${allFiles.length} markdown files in ${directories.length} directories`)
        console.log('React: Raw file data:', allFiles.map(f => ({ 
          name: f.name, 
          fullPath: f.fullPath,
          file: f.file ? f.file.name : 'no file'
        })))
        
        if (allFiles.length === 0) {
          alert('未找到 Markdown 文件。请拖拽 .md 或 .markdown 文件，或包含这些文件的文件夹。')
          return
        }
        
        // Process the files based on whether it's a single file or directory
        if (allFiles.length === 1 && directories.length === 0) {
          // Single file
          const fileData = allFiles[0]
          const content = await readFileContent(fileData.file)
          setFileData({
            content: content,
            fileName: fileData.name.replace(/\.md$/, '').replace(/\.markdown$/, ''),
            filePath: fileData.name
          })
          setIsDirectoryMode(false)
          setIsEnhancedDragMode(false)
        } else {
          // Multiple files or directory mode
          console.log('React: Setting up directory mode with enhanced caching')
          
          // Create file infos
          const fileInfos = allFiles.map(fileData => {
            const relativePath = fileData.fullPath.replace(/^\//, '')
            const directory = relativePath.includes('/') ? 
              relativePath.substring(0, relativePath.lastIndexOf('/')) : '.'
              
            return {
              name: fileData.name.replace(/\.md$/, '').replace(/\.markdown$/, ''),
              fileName: fileData.name,
              fullPath: fileData.fullPath,
              relativePath: relativePath,
              directory: directory
            }
          })
          
          console.log('React: Processed fileInfos:', fileInfos.map(f => ({
            name: f.name,
            fileName: f.fileName,
            fullPath: f.fullPath,
            relativePath: f.relativePath,
            directory: f.directory
          })))
          
          // Cache all file contents
          const fileContentsCache = new Map<string, string>()
          for (const fileData of allFiles) {
            try {
              const content = await readFileContent(fileData.file)
              fileContentsCache.set(fileData.name, content)
              console.log(`React: Cached content for file: ${fileData.name}`)
            } catch (error) {
              console.error(`React: Failed to read content for ${fileData.name}:`, error)
            }
          }
          
          // Set states
          const rootPath = directories.length > 0 ? 
            `Dropped ${directories.length} folder(s)` : 
            'Dropped files'
          
          setFileContentCache(fileContentsCache)
          setDirectoryData({ files: fileInfos, rootPath })
          setIsDirectoryMode(true)
          setIsEnhancedDragMode(true)
          
          // Load first file content
          if (allFiles.length > 0) {
            const firstFile = allFiles[0]
            const content = fileContentsCache.get(firstFile.name)
            if (content) {
              setFileData({
                content: content,
                fileName: firstFile.name.replace(/\.md$/, '').replace(/\.markdown$/, ''),
                filePath: firstFile.name
              })
            }
          }
          
          console.log('React: Directory mode setup complete')
        }
        
      } catch (error) {
        console.error('React: Error processing dropped files:', error)
        alert('处理拖拽文件时出错: ' + (error as Error).message)
      }
    }
    
    // Helper function to process directory entries recursively
    const processDirectoryEntry = async (directoryEntry: any): Promise<Array<{file: File, fullPath: string, name: string}>> => {
      const files: Array<{file: File, fullPath: string, name: string}> = []
      const reader = directoryEntry.createReader()
      
      return new Promise((resolve, reject) => {
        const readEntries = () => {
          reader.readEntries(async (entries: any[]) => {
            if (entries.length === 0) {
              resolve(files)
              return
            }
            
            for (const entry of entries) {
              if (entry.isFile && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
                try {
                  const file = await new Promise<File>((resolve, reject) => {
                    entry.file(resolve, reject)
                  })
                  files.push({
                    file: file,
                    fullPath: entry.fullPath,
                    name: entry.name
                  })
                } catch (error) {
                  console.warn('React: Failed to read file entry:', entry.fullPath, error)
                }
              } else if (entry.isDirectory && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                try {
                  const subFiles = await processDirectoryEntry(entry)
                  files.push(...subFiles)
                } catch (error) {
                  console.warn('React: Failed to read directory entry:', entry.fullPath, error)
                }
              }
            }
            
            readEntries() // Continue reading remaining entries
          }, reject)
        }
        
        readEntries()
      })
    }
    
    // Helper function to read file content
    const readFileContent = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target?.result as string)
        reader.onerror = reject
        reader.readAsText(file)
      })
    }

    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
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
      
      // Check if we're in enhanced drag mode and have cached content
      if (isEnhancedDragMode && fileContentCache.has(fileInfo.fileName)) {
        console.log('React: using cached content for enhanced drag mode:', fileInfo.fileName)
        const cachedContent = fileContentCache.get(fileInfo.fileName)!
        setFileData({
          content: cachedContent,
          fileName: fileInfo.name,
          filePath: fileInfo.fileName
        })
      } else {
        // Fallback to IPC file reading
        console.log('React: reading file via IPC:', fileInfo.fullPath)
        const data = await window.electronAPI.readFile(fileInfo.fullPath)
        setFileData(data)
      }
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

  // Debug render state
  console.log('React RENDER: isDirectoryMode =', isDirectoryMode)
  console.log('React RENDER: directoryData =', directoryData)
  console.log('React RENDER: directoryData?.files?.length =', directoryData?.files?.length)

  // Expose React state update functions to window for direct access by enhanced drag-drop script
  useEffect(() => {
    const directAccessHandlers = {
      handleDirectoryContentDirect: (data: { files: FileInfo[]; rootPath: string }) => {
        console.log('React: handleDirectoryContentDirect called directly with:', data)
        if (data.files && data.files.length > 0) {
          const directoryData: DirectoryData = {
            files: data.files,
            rootPath: data.rootPath
          }
          console.log('React: setting directory data directly:', directoryData)
          setDirectoryData(directoryData)
          setIsDirectoryMode(true)
          setIsEnhancedDragMode(true)
        }
      },
      handleMultipleFileContentsDirect: (data: { fileContents: Record<string, string>; totalFiles: number }) => {
        console.log('React: handleMultipleFileContentsDirect called directly with:', data.totalFiles, 'files')
        setFileContentCache(new Map(Object.entries(data.fileContents)))
      },
      handleFileContentDirect: (data: { content: string; fileName: string; originalName: string; isDirectory: boolean }) => {
        console.log('React: handleFileContentDirect called directly with:', data.fileName)
        setFileData({
          content: data.content,
          fileName: data.fileName,
          filePath: data.originalName
        })
      }
    }

    // Expose to window for enhanced drag-drop script
    ;(window as any).reactDirectHandlers = directAccessHandlers
    console.log('React: Direct access handlers exposed to window')

    return () => {
      delete (window as any).reactDirectHandlers
    }
  }, [])

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
                  <h2 className="text-lg font-semibold mb-2 text-foreground">
                    HyperRead
                  </h2>
                </div>
                <h2 className="text-lg font-semibold mb-2 text-foreground">
                  {isDragOver ? '释放以打开' : 'Read smarter. Read faster.'}
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