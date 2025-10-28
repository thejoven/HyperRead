'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import DocumentViewer from '@/components/DocumentViewer'
import FileList from '@/components/FileList'
import { ThemeToggle } from '@/components/ThemeToggle'
import AboutModal from '@/components/AboutModal'
import SettingsModal from '@/components/SettingsModal'
import ConsistentAiSidebar from '@/components/ConsistentAiSidebar'
import SearchPanel from '@/components/SearchPanel'
import { Toaster } from '@/components/ui/sonner'
import { FileText, FolderOpen, Folder, Info, Settings, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { toast } from "sonner"
import { useShortcuts } from '@/contexts/ShortcutContext'

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
      readImage: (imagePath: string, markdownFilePath?: string) => Promise<{
        success: boolean
        dataUrl?: string
        mimeType?: string
        size?: number
        path?: string
        error?: string
      }>
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
  const t = useT()
  const { shortcuts } = useShortcuts()
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [directoryData, setDirectoryData] = useState<DirectoryData | null>(null)
  const [actualRootPath, setActualRootPath] = useState<string | null>(null)
  const [draggedDirectoryEntries, setDraggedDirectoryEntries] = useState<FileSystemDirectoryEntry[]>([])
  const [lastDraggedFiles, setLastDraggedFiles] = useState<Array<{file: File, fullPath: string, name: string}>>([]) // 备份最后拖拽的文件
  const [draggedDirectoryNames, setDraggedDirectoryNames] = useState<string[]>([]) // 保存拖拽的目录名称
  const [showRefreshHint, setShowRefreshHint] = useState(false) // 显示重新拖拽提示
  const [isDragOver, setIsDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDirectoryMode, setIsDirectoryMode] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [contentWidth, setContentWidth] = useState<'narrow' | 'medium' | 'wide' | 'full'>('medium')
  const [primaryColor, setPrimaryColor] = useState<'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink'>('cyan')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOptions, setSearchOptions] = useState({ caseSensitive: false, useRegex: false, wholeWord: false })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false) // Default to expanded
  const [isRefreshing, setIsRefreshing] = useState(false) // Track refresh state
  // Cache for enhanced drag-drop file contents
  const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map())

  // 路径解析函数 - 将相对路径转换为绝对路径
  const resolvePath = (targetPath: string, currentPath?: string): string => {
    if (!currentPath) return targetPath

    // 如果已经是绝对路径，直接返回
    if (targetPath.startsWith('/') || targetPath.includes(':\\')) {
      return targetPath
    }

    // 检查 currentPath 是否为绝对路径
    const isCurrentPathAbsolute = currentPath.startsWith('/') || currentPath.includes(':\\')

    if (!isCurrentPathAbsolute) {
      // 如果当前路径不是绝对路径（比如只是文件名），无法进行相对路径解析
      // 在这种情况下，返回目标路径本身，让调用者处理
      console.warn('Cannot resolve relative path: currentPath is not absolute:', {
        currentPath,
        targetPath
      })
      return targetPath
    }

    // 获取当前文件的目录
    const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'))

    // 处理相对路径
    if (targetPath.startsWith('./')) {
      // 移除 ./ 前缀并拼接到当前目录
      const relativePath = targetPath.substring(2)
      return `${currentDir}/${relativePath}`
    } else if (targetPath.startsWith('../')) {
      // 处理 ../ 路径
      const parts = currentDir.split('/')
      let target = targetPath

      // 处理多级 ../
      while (target.startsWith('../')) {
        target = target.substring(3)
        if (parts.length > 0) {
          parts.pop()
        }
      }

      // 如果还有剩余路径，拼接到处理后的目录
      if (target) {
        return `${parts.join('/')}/${target}`
      } else {
        return parts.join('/')
      }
    } else {
      // 同目录文件
      return `${currentDir}/${targetPath}`
    }
  }

  // 文件跳转处理函数
  const handleFileNavigation = async (targetPath: string, currentPath?: string) => {
    try {
      setLoading(true)

      // 解析目标文件路径
      const resolvedPath = resolvePath(targetPath, currentPath)

      console.log('File navigation details:', {
        targetPath,
        currentPath,
        resolvedPath,
        currentDir: currentPath ? currentPath.substring(0, currentPath.lastIndexOf('/')) : 'undefined'
      })

      // 读取目标文件
      if (window.electronAPI?.readFile) {
        const newFileData = await window.electronAPI.readFile(resolvedPath)

        if (newFileData) {
          setFileData(newFileData)
          console.log('Successfully navigated to:', resolvedPath)
        } else {
          console.error('Failed to read file:', resolvedPath)

          // 检查是否是路径解析问题
          const isCurrentPathAbsolute = currentPath && (currentPath.startsWith('/') || currentPath.includes(':\\'))
          if (!isCurrentPathAbsolute) {
            toast.error(`无法跳转到文件: ${targetPath}\n\n原因: 当前文件路径不是绝对路径，无法进行相对路径解析。\n\n请通过文件对话框重新打开此文件以启用内部链接功能。`)
          } else {
            toast.error(`无法打开文件: ${resolvedPath}`)
          }
        }
      } else {
        console.error('electronAPI.readFile not available')
        toast.error('文件读取功能不可用')
      }
    } catch (error) {
      console.error('File navigation error:', error)
      toast.error(`文件跳转失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }
  // Track if we're in enhanced drag-drop mode (files pre-loaded in memory)
  const [isEnhancedDragMode, setIsEnhancedDragMode] = useState(false)

  // Load font size from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('docs-font-size')
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize, 10))
    }

    // Load content width from localStorage
    const savedContentWidth = localStorage.getItem('docs-content-width')
    if (savedContentWidth) {
      setContentWidth(savedContentWidth as 'narrow' | 'medium' | 'wide' | 'full')
    }

    // Load primary color from localStorage
    const savedPrimaryColor = localStorage.getItem('docs-primary-color')
    if (savedPrimaryColor) {
      setPrimaryColor(savedPrimaryColor as 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink')
    }

    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('docs-sidebar-collapsed')
    if (savedSidebarState) {
      setIsSidebarCollapsed(JSON.parse(savedSidebarState))
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

  // Save content width to localStorage when changed
  useEffect(() => {
    localStorage.setItem('docs-content-width', contentWidth)
  }, [contentWidth])

  // Save primary color to localStorage and apply to CSS when changed
  useEffect(() => {
    localStorage.setItem('docs-primary-color', primaryColor)
    applyPrimaryColor(primaryColor)
  }, [primaryColor])

  // Save sidebar state to localStorage when changed
  useEffect(() => {
    localStorage.setItem('docs-sidebar-collapsed', JSON.stringify(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  // Handle keyboard shortcuts for search
  useEffect(() => {
    // Get search-open shortcut configuration
    const searchOpenShortcut = shortcuts.find(s => s.id === 'search-open')
    if (!searchOpenShortcut || !searchOpenShortcut.enabled) return

    // Parse the shortcut keys
    const keys = searchOpenShortcut.keys[0] // Use first key combination
    const isDoubleShift = keys === 'shift shift'

    if (isDoubleShift) {
      let shiftPressCount = 0
      let shiftTimer: NodeJS.Timeout | null = null

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Shift') {
          shiftPressCount++

          if (shiftPressCount === 1) {
            // Start timer to reset count
            shiftTimer = setTimeout(() => {
              shiftPressCount = 0
            }, 500) // Reset after 500ms
          } else if (shiftPressCount === 2) {
            // Shift pressed twice quickly
            e.preventDefault()
            if (fileData && fileData.content) {
              setShowSearch(true)
            }
            shiftPressCount = 0
            if (shiftTimer) {
              clearTimeout(shiftTimer)
            }
          }
        }
      }

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Shift') {
          // Keep the count, don't reset on keyup
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
        if (shiftTimer) {
          clearTimeout(shiftTimer)
        }
      }
    } else {
      // Handle other key combinations
      const handleKeyDown = (e: KeyboardEvent) => {
        const pressedKey = e.key.toLowerCase()
        const hasCtrl = e.ctrlKey || e.metaKey
        const hasShift = e.shiftKey
        const hasAlt = e.altKey

        // Build pressed combination
        let combination = ''
        if (hasCtrl) combination += 'ctrl+'
        if (hasShift) combination += 'shift+'
        if (hasAlt) combination += 'alt+'
        combination += pressedKey

        if (combination === keys) {
          e.preventDefault()
          if (fileData && fileData.content) {
            setShowSearch(true)
          }
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [fileData, shortcuts])

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Get max width class based on content width setting
  const getMaxWidthClass = () => {
    switch (contentWidth) {
      case 'narrow':
        return 'max-w-2xl'  // 672px
      case 'medium':
        return 'max-w-4xl'  // 896px
      case 'wide':
        return 'max-w-6xl'  // 1152px
      case 'full':
        return 'max-w-none' // No max width
      default:
        return 'max-w-4xl'
    }
  }

  // Apply primary color to CSS variables
  const applyPrimaryColor = (color: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink') => {
    const root = document.documentElement

    // Color definitions with light and dark mode variants
    const colorMap = {
      cyan: {
        light: {
          primary: '183 70% 45%',
          secondary: '183 15% 96%',
          muted: '183 10% 96%',
          accent: '183 60% 92%',
          accentForeground: '183 70% 25%',
          border: '183 15% 89%',
          input: '183 10% 89%',
          ring: '183 70% 45%'
        },
        dark: {
          primary: '183 70% 50%',
          secondary: '183 8% 15%',
          muted: '183 8% 15%',
          accent: '183 30% 20%',
          accentForeground: '183 70% 70%',
          border: '183 15% 20%',
          input: '183 10% 20%',
          ring: '183 70% 50%'
        }
      },
      blue: {
        light: {
          primary: '217 91% 60%',
          secondary: '217 15% 96%',
          muted: '217 10% 96%',
          accent: '217 60% 92%',
          accentForeground: '217 91% 30%',
          border: '217 15% 89%',
          input: '217 10% 89%',
          ring: '217 91% 60%'
        },
        dark: {
          primary: '217 91% 65%',
          secondary: '217 8% 15%',
          muted: '217 8% 15%',
          accent: '217 30% 20%',
          accentForeground: '217 91% 75%',
          border: '217 15% 20%',
          input: '217 10% 20%',
          ring: '217 91% 65%'
        }
      },
      purple: {
        light: {
          primary: '262 83% 58%',
          secondary: '262 15% 96%',
          muted: '262 10% 96%',
          accent: '262 60% 92%',
          accentForeground: '262 83% 30%',
          border: '262 15% 89%',
          input: '262 10% 89%',
          ring: '262 83% 58%'
        },
        dark: {
          primary: '262 83% 63%',
          secondary: '262 8% 15%',
          muted: '262 8% 15%',
          accent: '262 30% 20%',
          accentForeground: '262 83% 73%',
          border: '262 15% 20%',
          input: '262 10% 20%',
          ring: '262 83% 63%'
        }
      },
      green: {
        light: {
          primary: '142 76% 36%',
          secondary: '142 15% 96%',
          muted: '142 10% 96%',
          accent: '142 60% 92%',
          accentForeground: '142 76% 20%',
          border: '142 15% 89%',
          input: '142 10% 89%',
          ring: '142 76% 36%'
        },
        dark: {
          primary: '142 76% 45%',
          secondary: '142 8% 15%',
          muted: '142 8% 15%',
          accent: '142 30% 20%',
          accentForeground: '142 76% 60%',
          border: '142 15% 20%',
          input: '142 10% 20%',
          ring: '142 76% 45%'
        }
      },
      orange: {
        light: {
          primary: '24 94% 50%',
          secondary: '24 15% 96%',
          muted: '24 10% 96%',
          accent: '24 60% 92%',
          accentForeground: '24 94% 25%',
          border: '24 15% 89%',
          input: '24 10% 89%',
          ring: '24 94% 50%'
        },
        dark: {
          primary: '24 94% 55%',
          secondary: '24 8% 15%',
          muted: '24 8% 15%',
          accent: '24 30% 20%',
          accentForeground: '24 94% 70%',
          border: '24 15% 20%',
          input: '24 10% 20%',
          ring: '24 94% 55%'
        }
      },
      pink: {
        light: {
          primary: '330 81% 60%',
          secondary: '330 15% 96%',
          muted: '330 10% 96%',
          accent: '330 60% 92%',
          accentForeground: '330 81% 30%',
          border: '330 15% 89%',
          input: '330 10% 89%',
          ring: '330 81% 60%'
        },
        dark: {
          primary: '330 81% 65%',
          secondary: '330 8% 15%',
          muted: '330 8% 15%',
          accent: '330 30% 20%',
          accentForeground: '330 81% 75%',
          border: '330 15% 20%',
          input: '330 10% 20%',
          ring: '330 81% 65%'
        }
      }
    }

    const isDark = root.classList.contains('dark')
    const colors = isDark ? colorMap[color].dark : colorMap[color].light

    // Apply colors to CSS variables
    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--secondary', colors.secondary)
    root.style.setProperty('--muted', colors.muted)
    root.style.setProperty('--accent', colors.accent)
    root.style.setProperty('--accent-foreground', colors.accentForeground)
    root.style.setProperty('--border', colors.border)
    root.style.setProperty('--input', colors.input)
    root.style.setProperty('--ring', colors.ring)
  }

  // Handle keyboard shortcut for toggling sidebar (Command+. or Command+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const hasCmd = e.metaKey || e.ctrlKey
      const key = e.key

      // Command+. or Command+B to toggle sidebar
      if (hasCmd && (key === '.' || key === 'b' || key === 'B')) {
        e.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSidebarCollapsed])

  // Navigate to a specific line in the document
  const handleNavigateToLine = (lineNumber: number) => {
    // Find all paragraph elements in the document viewer
    const contentElement = document.querySelector('.content-scroll') || document.querySelector('.markdown-content')
    if (!contentElement) return

    // Get all text nodes and count lines to find the target
    const lines = fileData?.content.split('\n') || []
    if (lineNumber < 1 || lineNumber > lines.length) return

    // Scroll to approximate position based on line number
    const percentage = (lineNumber - 1) / lines.length
    const scrollTop = contentElement.scrollHeight * percentage

    contentElement.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    })
  }

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
      toast.error(`检测到文件夹"${directoryName}"拖拽。\n\n由于安全限制，需要您在对话框中选择要加载的文件夹。`, {
        action: {
          label: '选择文件夹',
          onClick: async () => {
            await handleOpenDirectory()
          }
        },
        cancel: {
          label: '取消',
          onClick: () => {}
        }
      })
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
        toast.error('该文件夹中没有找到 Markdown 文件')
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

    // 处理文件关联打开
    const handleFileAssociationOpened = (event: CustomEvent) => {
      console.log('React: file-association-opened event received', {
        fileName: event.detail.fileName,
        originalName: event.detail.originalName,
        contentLength: event.detail.content ? event.detail.content.length : 0
      })

      const fileData = event.detail

      // 设置文件数据，退出目录模式
      setFileData({
        content: fileData.content,
        fileName: fileData.fileName,
        filePath: fileData.originalName
      })
      setIsDirectoryMode(false)
      setIsEnhancedDragMode(false)

      console.log('React: file opened via file association')
    }

    window.addEventListener('file-dropped', handleFileDrop as EventListener)
    window.addEventListener('file-content-loaded', handleFileContent as EventListener)
    window.addEventListener('directory-dropped', handleDirectoryDrop as EventListener)
    window.addEventListener('directory-content-loaded', handleDirectoryContent as EventListener)
    window.addEventListener('multiple-file-contents-loaded', handleMultipleFileContents as EventListener)
    window.addEventListener('file-association-opened', handleFileAssociationOpened as EventListener)
    console.log('React: event listeners added')
    
    return () => {
      window.removeEventListener('file-dropped', handleFileDrop as EventListener)
      window.removeEventListener('file-content-loaded', handleFileContent as EventListener)
      window.removeEventListener('directory-dropped', handleDirectoryDrop as EventListener)
      window.removeEventListener('directory-content-loaded', handleDirectoryContent as EventListener)
      window.removeEventListener('multiple-file-contents-loaded', handleMultipleFileContents as EventListener)
      window.removeEventListener('file-association-opened', handleFileAssociationOpened as EventListener)
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
        const directoryEntries: FileSystemDirectoryEntry[] = []
        
        // Process each item using webkitGetAsEntry API
        for (const item of items) {
          if (item.kind === 'file') {
            const entry = (item as any).webkitGetAsEntry()
            
            if (entry) {
              if (entry.isDirectory) {
                console.log('React: Processing directory:', entry.name)
                directories.push(entry.name)
                directoryEntries.push(entry) // 保存目录条目以支持刷新
                const dirFiles = await processDirectoryEntry(entry, 0, false) // 初始拖拽，不强制刷新
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
          toast.error('未找到 Markdown 文件。请拖拽 .md 或 .markdown 文件，或包含这些文件的文件夹。')
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
            filePath: fileData.fullPath
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
              fileContentsCache.set(fileData.fullPath, content)
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
          setActualRootPath(null) // No actual path for drag-drop mode
          setDraggedDirectoryEntries(directoryEntries) // 保存目录条目以支持刷新
          setDraggedDirectoryNames(directories) // 保存目录名称
          setLastDraggedFiles(allFiles) // 保存文件备份
          setShowRefreshHint(false) // 关闭重新拖拽提示
          setIsDirectoryMode(true)
          setIsEnhancedDragMode(true)
          
          // Load first file content
          if (allFiles.length > 0) {
            const firstFile = allFiles[0]
            const content = fileContentsCache.get(firstFile.fullPath)
            if (content) {
              setFileData({
                content: content,
                fileName: firstFile.name.replace(/\.md$/, '').replace(/\.markdown$/, ''),
                filePath: firstFile.fullPath
              })
            }
          }
          
          console.log('React: Directory mode setup complete')
        }
        
      } catch (error) {
        console.error('React: Error processing dropped files:', error)
        toast.error('处理拖拽文件时出错: ' + (error as Error).message)
      }
    }
    
    // Helper function to process directory entries recursively - 自动选择版本
    const processDirectoryEntry = async (directoryEntry: any, depth = 0, forceRefresh = false): Promise<Array<{file: File, fullPath: string, name: string}>> => {
      // 如果启用强制刷新，使用增强版本
      if (forceRefresh) {
        return processDirectoryEntryWithForceRefresh(directoryEntry, depth, forceRefresh)
      }

      // 否则使用原始版本
      const indent = '  '.repeat(depth)
      console.log(`${indent}🔄 React: Processing directory "${directoryEntry.name}" at depth ${depth}`)

      const files: Array<{file: File, fullPath: string, name: string}> = []
      let reader = directoryEntry.createReader()

      return new Promise((resolve, reject) => {
        let allEntries: any[] = []

        const readAllEntries = () => {
          reader.readEntries(async (entries: any[]) => {
            if (entries.length === 0) {
              console.log(`${indent}📂 React: Total entries found in "${directoryEntry.name}": ${allEntries.length}`)

              try {
                for (const entry of allEntries) {
                  if (entry.isFile && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
                    try {
                      console.log(`${indent}📄 React: Reading file: ${entry.name}`)
                      const file = await new Promise<File>((resolve, reject) => {
                        entry.file((f: File) => {
                          console.log(`${indent}✅ React: File object created for ${entry.name}, lastModified: ${new Date(f.lastModified).toLocaleString()}`)
                          resolve(f)
                        }, reject)
                      })

                      files.push({ file: file, fullPath: entry.fullPath, name: entry.name })
                    } catch (error) {
                      console.warn(`${indent}❌ React: Failed to read file:`, entry.name, error)
                    }
                  } else if (entry.isDirectory && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    try {
                      const subFiles = await processDirectoryEntry(entry, depth + 1, forceRefresh)
                      files.push(...subFiles)
                      console.log(`${indent}📋 React: Got ${subFiles.length} files from subdirectory "${entry.name}"`)
                    } catch (error) {
                      console.warn(`${indent}❌ React: Failed to read subdirectory:`, entry.name, error)
                    }
                  }
                }

                console.log(`${indent}🎯 React: Finished processing directory "${directoryEntry.name}", found ${files.length} markdown files`)
                resolve(files)
              } catch (error) {
                reject(error)
              }
              return
            }

            // 累积所有entries
            allEntries.push(...entries)
            console.log(`${indent}🔍 React: Reading entries batch: ${entries.length}, total so far: ${allEntries.length}`)

            // 继续读取下一批
            readAllEntries()
          }, (error: any) => {
            console.error(`${indent}❌ React: Error reading entries:`, error)
            reject(error)
          })
        }

        readAllEntries()
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
      toast.error('文件加载失败: ' + (error as Error).message)
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
      toast.error('文件打开失败: ' + (error as Error).message)
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
        setActualRootPath(data.rootPath) // Store actual path for refresh
        setDraggedDirectoryEntries([]) // Clear dragged directories
        setDraggedDirectoryNames([]) // Clear directory names
        setLastDraggedFiles([]) // Clear backup files
        setShowRefreshHint(false) // Close refresh hint
        setIsEnhancedDragMode(false) // Exit enhanced drag mode
        setIsDirectoryMode(true)
        // 自动选择第一个文件
        const firstFile = data.files[0]
        await loadFileFromDirectory(firstFile)
      } else if (data && data.files.length === 0) {
        toast.error('该文件夹中没有找到 Markdown 文件')
      }
    } catch (error) {
      console.error('React: Failed to open directory:', error)
      toast.error('文件夹打开失败: ' + (error as Error).message)
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
      if (isEnhancedDragMode && fileContentCache.has(fileInfo.fullPath)) {
        console.log('React: using cached content for enhanced drag mode:', fileInfo.fullPath)
        const cachedContent = fileContentCache.get(fileInfo.fullPath)!
        setFileData({
          content: cachedContent,
          fileName: fileInfo.name,
          filePath: fileInfo.fullPath
        })
      } else {
        // Fallback to IPC file reading
        console.log('React: reading file via IPC:', fileInfo.fullPath)
        const data = await window.electronAPI.readFile(fileInfo.fullPath)
        // Ensure filePath is set to the full path to avoid same-name file conflicts
        setFileData({
          ...data,
          filePath: fileInfo.fullPath
        })
      }
    } catch (error) {
      console.error('React: Failed to load file from directory:', error)
      toast.error(t('ui.messages.fileLoadFailed') + ': ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // 验证目录条目是否仍然有效
  const validateDirectoryEntry = async (entry: FileSystemDirectoryEntry): Promise<boolean> => {
    try {
      const reader = entry.createReader()
      await new Promise<void>((resolve, reject) => {
        reader.readEntries((entries) => {
          console.log(`🔍 React: Directory entry "${entry.name}" is valid, found ${entries.length} entries`)
          resolve()
        }, reject)
      })
      return true
    } catch (error) {
      console.warn(`❌ React: Directory entry "${entry.name}" is invalid:`, error)
      return false
    }
  }

  // 创建全新的File对象以避免缓存问题
  const createFreshFileObject = async (entry: FileSystemFileEntry): Promise<File> => {
    return new Promise((resolve, reject) => {
      entry.file((file) => {
        // 创建新的File对象，强制重新读取
        const freshFile = new File([file], file.name, {
          type: file.type,
          lastModified: Date.now() // 使用当前时间戳强制刷新
        })
        console.log(`✨ React: Created fresh file object for "${file.name}" with timestamp ${freshFile.lastModified}`)
        resolve(freshFile)
      }, reject)
    })
  }

  // 增强的目录处理函数，支持多重验证和强制刷新
  const processDirectoryEntryWithForceRefresh = async (
    directoryEntry: FileSystemDirectoryEntry,
    depth = 0,
    forceRefresh = false,
    maxRetries = 3
  ): Promise<Array<{file: File, fullPath: string, name: string}>> => {
    const indent = '  '.repeat(depth)
    console.log(`${indent}🔄 React: ${forceRefresh ? 'FORCE REFRESHING' : 'Processing'} directory "${directoryEntry.name}" at depth ${depth}`)

    if (forceRefresh) {
      const isValid = await validateDirectoryEntry(directoryEntry)
      if (!isValid) {
        throw new Error(`Directory entry "${directoryEntry.name}" is no longer valid`)
      }
    }

    const files: Array<{file: File, fullPath: string, name: string}> = []
    let retryCount = 0

    while (retryCount <= maxRetries) {
      try {
        // 每次重试都创建新的reader
        const reader = directoryEntry.createReader()
        const allEntries: any[] = []

        await new Promise<void>((resolve, reject) => {
          const readAllEntries = () => {
            reader.readEntries(async (entries: any[]) => {
              if (entries.length === 0) {
                console.log(`${indent}📂 React: Total entries found in "${directoryEntry.name}": ${allEntries.length} (attempt ${retryCount + 1})`)

                // 处理所有entries
                for (const entry of allEntries) {
                  if (entry.isFile && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
                    try {
                      console.log(`${indent}📄 React: Processing file: ${entry.name} (${forceRefresh ? 'FORCE REFRESH' : 'normal'}, attempt ${retryCount + 1})`)

                      // 根据模式选择文件处理方式
                      const file = forceRefresh ?
                        await createFreshFileObject(entry) :
                        await new Promise<File>((resolve, reject) => {
                          entry.file(resolve, reject)
                        })

                      // 验证文件是否可读
                      const testRead = await file.text()
                      console.log(`${indent}✅ React: File "${entry.name}" is readable, size: ${testRead.length} chars, lastModified: ${new Date(file.lastModified).toLocaleString()}`)

                      files.push({ file, fullPath: entry.fullPath, name: entry.name })
                    } catch (error) {
                      console.warn(`${indent}❌ React: Failed to process file:`, entry.name, error)
                    }
                  } else if (entry.isDirectory && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    try {
                      const subFiles = await processDirectoryEntryWithForceRefresh(entry, depth + 1, forceRefresh, maxRetries)
                      files.push(...subFiles)
                      console.log(`${indent}📋 React: Got ${subFiles.length} files from subdirectory "${entry.name}"`)
                    } catch (error) {
                      console.warn(`${indent}❌ React: Failed to process subdirectory:`, entry.name, error)
                    }
                  }
                }

                console.log(`${indent}🎯 React: Finished processing directory "${directoryEntry.name}", found ${files.length} markdown files (attempt ${retryCount + 1})`)
                resolve()
                return
              }

              allEntries.push(...entries)
              console.log(`${indent}🔍 React: Reading entries batch: ${entries.length}, total so far: ${allEntries.length} (attempt ${retryCount + 1})`)
              readAllEntries()
            }, reject)
          }
          readAllEntries()
        })

        // 成功读取，退出重试循环
        break

      } catch (error) {
        retryCount++
        console.error(`${indent}❌ React: Error reading directory (attempt ${retryCount}/${maxRetries + 1}):`, error)

        if (retryCount > maxRetries) {
          throw error
        }

        // 等待一小段时间后重试
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount))
        console.log(`${indent}🔄 React: Retrying directory read for "${directoryEntry.name}"...`)
      }
    }

    return files
  }

  // 重新扫描拖拽的目录 - 增强版本
  const refreshDraggedDirectories = async (): Promise<void> => {
    if (draggedDirectoryEntries.length === 0 && lastDraggedFiles.length === 0) {
      console.log('React: No dragged directories or files to refresh')
      return
    }

    console.log('🔄 React: Starting ENHANCED FORCE REFRESH of directory tree...')
    console.log('🔄 React: Refreshing dragged directories:', draggedDirectoryEntries.length)
    console.log('🔄 React: Using multi-strategy approach with validation and retries')
    console.log('🔄 React: Will attempt to detect all file system changes')

    const allFiles: Array<{file: File, fullPath: string, name: string}> = []
    const fileContentsCache = new Map<string, string>()
    let refreshSuccess = false
    const failedEntries: string[] = []

    // 策略1: 验证并强制刷新所有目录条目
    if (draggedDirectoryEntries.length > 0) {
      console.log('🔄 React: Strategy 1 - Validating and force refreshing directory entries')

      for (const entry of draggedDirectoryEntries) {
        try {
          console.log('React: Attempting enhanced refresh for directory:', entry.name)
          console.log('React: Directory entry details:', {
            name: entry.name,
            fullPath: entry.fullPath,
            isDirectory: entry.isDirectory
          })

          // 使用增强的处理函数
          const dirFiles = await processDirectoryEntryWithForceRefresh(entry, 0, true, 3)
          console.log(`✅ React: Successfully refreshed directory "${entry.name}", found ${dirFiles.length} files`)

          allFiles.push(...dirFiles)
          refreshSuccess = true

          // 重新读取文件内容
          for (const fileItem of dirFiles) {
            try {
              console.log('React: Reading fresh content for file:', fileItem.name)
              const content = await fileItem.file.text()
              fileContentsCache.set(fileItem.fullPath, content)
              console.log(`✅ React: Successfully cached fresh content for ${fileItem.name}, length: ${content.length}`)
            } catch (error) {
              console.warn('React: Failed to read file content during refresh:', fileItem.name, error)
            }
          }
        } catch (error) {
          console.error('❌ React: Enhanced refresh failed for directory:', entry.name, error)
          failedEntries.push(entry.name)
        }
      }
    }

    // 策略2: 如果主要策略失败，尝试备份文件验证
    if (!refreshSuccess && lastDraggedFiles.length > 0) {
      console.log('🔄 React: Strategy 2 - Validating backup files')
      console.log('React: Primary refresh failed, attempting backup file validation')

      const validBackupFiles: Array<{file: File, fullPath: string, name: string}> = []

      for (const fileItem of lastDraggedFiles) {
        try {
          // 尝试重新读取文件内容以验证有效性
          const content = await fileItem.file.text()
          fileContentsCache.set(fileItem.fullPath, content)
          validBackupFiles.push(fileItem)
          console.log(`✅ React: Backup file "${fileItem.name}" is still valid, length: ${content.length}`)
        } catch (error) {
          console.warn('❌ React: Backup file is no longer valid:', fileItem.name, error)
        }
      }

      if (validBackupFiles.length > 0) {
        allFiles.push(...validBackupFiles)
        console.log(`⚠️ React: Using ${validBackupFiles.length} valid backup files (may not reflect recent changes)`)
      }
    }

    // 如果所有策略都失败，抛出详细错误
    if (allFiles.length === 0) {
      const errorMessage = failedEntries.length > 0 ?
        `无法刷新拖拽的文件夹。失败的目录: ${failedEntries.join(', ')}。文件系统可能已发生重大变化。` :
        '无法访问任何拖拽的文件，请重新拖拽文件夹。'

      console.error('❌ React: All refresh strategies failed')
      throw new Error(errorMessage)
    }

    // 构建文件信息
    const fileInfos: FileInfo[] = allFiles.map(({ file, fullPath, name }) => {
      const relativePath = fullPath.startsWith('/') ? fullPath.substring(1) : fullPath
      const directory = relativePath.includes('/') ?
        relativePath.substring(0, relativePath.lastIndexOf('/')) : '.'

      return {
        name: name.replace(/\.md$/, '').replace(/\.markdown$/, ''),
        fileName: name,
        fullPath: fullPath,
        relativePath: relativePath,
        directory: directory
      }
    })

    console.log(`🎯 React: Enhanced refresh complete! Found ${fileInfos.length} markdown files total`)
    console.log('🎯 React: Refreshed files:', fileInfos.map(f => ({ name: f.name, fileName: f.fileName, relativePath: f.relativePath })))
    console.log(`🎯 React: Success rate: ${refreshSuccess ? '100%' : 'Partial (using backup)'}`)

    // 更新状态
    const rootPath = draggedDirectoryEntries.length > 0 ?
      `Dropped ${draggedDirectoryEntries.length} folder(s)` :
      'Dropped files'

    console.log('React: Setting directory data with rootPath:', rootPath)

    // 更新backup文件列表为最新的
    if (refreshSuccess) {
      setLastDraggedFiles(allFiles)
      console.log('✅ React: Updated backup files list with latest successful scan')
    }

    setFileContentCache(fileContentsCache)
    setDirectoryData({ files: fileInfos, rootPath })

    // 检查当前选中的文件是否还存在
    let currentFileExists = false
    if (fileData && fileData.filePath) {
      currentFileExists = fileInfos.some(f => f.fileName === fileData.filePath)
      console.log('React: Current file exists after refresh:', currentFileExists, 'Current file:', fileData.filePath)
    }

    // 如果当前文件不存在或没有选中文件，加载第一个文件
    if ((!currentFileExists || !fileData) && allFiles.length > 0) {
      const firstFile = allFiles[0]
      const content = fileContentsCache.get(firstFile.fullPath)
      if (content) {
        console.log('React: Loading first file after refresh:', firstFile.name)
        setFileData({
          content: content,
          fileName: firstFile.name.replace(/\.md$/, '').replace(/\.markdown$/, ''),
          filePath: firstFile.fullPath
        })
      }
    }
  }

  const handleRefresh = async () => {
    if (!window.electronAPI || isRefreshing) return

    // In enhanced drag mode, attempt to refresh but warn user about limitations
    if (isEnhancedDragMode) {
      setIsRefreshing(true)
      try {
        await refreshDraggedDirectories()
        console.log('React: Dragged directories refreshed successfully')
      } catch (error) {
        console.error('React: Failed to refresh dragged directories:', error)

        // 如果强制刷新仍然失败，说明Entry确实失效了
        console.error('React: Force refresh failed, FileSystemDirectoryEntry may be completely invalid')
        setShowRefreshHint(true)
      } finally {
        setIsRefreshing(false)
      }
      return
    }

    // Check if we have an actual path to refresh
    const pathToRefresh = actualRootPath || directoryData?.rootPath
    if (!pathToRefresh) {
      console.log('React: No path available for refresh')
      return
    }

    setIsRefreshing(true)
    try {
      console.log('React: refreshing directory:', pathToRefresh)
      const data = await window.electronAPI.scanDirectory(pathToRefresh)
      if (data && data.files.length > 0) {
        setDirectoryData(data)
        // Update actual root path if we got new data
        setActualRootPath(data.rootPath)
        // Clear enhanced drag mode cache as directory has been rescanned
        if (isEnhancedDragMode) {
          setFileContentCache(new Map())
          setIsEnhancedDragMode(false)
          console.log('React: cleared enhanced drag mode cache after refresh')
        }
        console.log('React: directory refreshed successfully with', data.files.length, 'files')
      } else {
        console.log('React: no files found after refresh')
      }
    } catch (error) {
      console.error('React: Failed to refresh directory:', error)
      toast.error(t('ui.messages.directoryLoadFailed') + ': ' + (error as Error).message)
    } finally {
      setIsRefreshing(false)
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
  console.log('React RENDER: actualRootPath =', actualRootPath)
  console.log('React RENDER: will show refresh button =', !!actualRootPath)

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
    <div className="h-screen w-screen bg-background overflow-hidden flex flex-col">
      {/* macOS 风格的标题栏区域 */}
      <header className="macos-toolbar drag-region flex-shrink-0 sticky top-0 z-50">
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
              title={t('ui.buttons.openFile')}
            >
              <FileText className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenDirectory}
              disabled={loading}
              className="h-7 px-2 macos-button"
              title={t('ui.buttons.openFolder')}
            >
              <Folder className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-4 bg-border mx-1"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className={`h-7 w-7 p-0 macos-button ${showAiAssistant ? 'bg-primary/10 text-primary' : ''}`}
              title="AI 助手"
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="h-7 w-7 p-0 macos-button"
              title={t('ui.buttons.settings')}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAbout(true)}
              className="h-7 w-7 p-0 macos-button"
              title={t('ui.buttons.about')}
            >
              <Info className="h-3.5 w-3.5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className={`flex-1 relative transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${showAiAssistant ? 'mr-72' : ''}`}>
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p>{t('file.operations.loading')}</p>
            </div>
          </div>
        )}

        {isDirectoryMode && directoryData ? (
          <div className="flex flex-1 relative overflow-hidden">
            {/* 文件列表侧边栏 - 带动画的收起/展开 */}
            <div className={`transition-all duration-300 ease-in-out ${
              isSidebarCollapsed
                ? 'w-0 min-w-0 overflow-hidden'
                : 'w-72 min-w-72'
            }`}>
              <FileList
                files={directoryData.files}
                rootPath={directoryData.rootPath}
                currentFile={fileData?.filePath}
                onFileSelect={loadFileFromDirectory}
                isCollapsed={isSidebarCollapsed}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            </div>

            {/* Vertical Toggle Button - positioned to be always visible */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className={`absolute top-1/2 transform -translate-y-1/2 z-20 h-12 w-5 p-0 bg-background hover:bg-background border border-border transition-all duration-300 ease-in-out opacity-50 hover:opacity-100 rounded-md ${
                isSidebarCollapsed ? 'left-2' : 'left-[276px]'
              }`}
              title={isSidebarCollapsed ? t('ui.buttons.expandSidebar') : t('ui.buttons.collapseSidebar')}
            >
              <div className="flex flex-col items-center justify-center h-full">
                {isSidebarCollapsed ? (
                  <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
                ) : (
                  <ChevronLeft className="h-2.5 w-2.5 text-muted-foreground" />
                )}
              </div>
            </Button>

            {/* 主内容区域 */}
            <div className="flex-1 overflow-hidden bg-background relative">
              {fileData ? (
                <div className="h-full">
                  {/* Search Panel - positioned above content */}
                  {showSearch && (
                    <div className="absolute top-0 left-0 right-0 z-50 p-4">
                      <div className={`${getMaxWidthClass()} mx-auto`}>
                        <SearchPanel
                          isOpen={showSearch}
                          onClose={() => setShowSearch(false)}
                          content={fileData.content}
                          onNavigateToLine={handleNavigateToLine}
                          onSearchQueryChange={(query, options) => {
                            setSearchQuery(query)
                            setSearchOptions(options)
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="h-full overflow-y-auto content-scroll">
                    <div className={`${getMaxWidthClass()} mx-auto`}>
                      <DocumentViewer
                        content={fileData.content}
                        className="px-4 py-6"
                        fontSize={fontSize}
                        filePath={fileData.filePath}
                        onFileNavigation={handleFileNavigation}
                        searchQuery={showSearch ? searchQuery : undefined}
                        searchOptions={showSearch ? searchOptions : undefined}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Card className="max-w-md border-dashed">
                    <CardContent className="p-6 text-center">
                      <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/60" />
                      <h3 className="text-sm font-medium mb-2 text-foreground">{t('ui.messages.selectFile')}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {isSidebarCollapsed
                          ? t('ui.messages.selectFromListCollapsed')
                          : t('ui.messages.selectFromList')
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        ) : fileData ? (
          <div className="flex-1 relative overflow-hidden">
            {/* Search Panel - positioned above content */}
            {showSearch && (
              <div className="absolute top-0 left-0 right-0 z-50 p-4">
                <div className={`${getMaxWidthClass()} mx-auto`}>
                  <SearchPanel
                    isOpen={showSearch}
                    onClose={() => setShowSearch(false)}
                    content={fileData.content}
                    onNavigateToLine={handleNavigateToLine}
                    onSearchQueryChange={(query, options) => {
                      setSearchQuery(query)
                      setSearchOptions(options)
                    }}
                  />
                </div>
              </div>
            )}
            <div className="h-full overflow-y-auto content-scroll">
              <DocumentViewer
                content={fileData.content}
                className={`container mx-auto px-4 py-8 ${getMaxWidthClass()}`}
                fontSize={fontSize}
                filePath={fileData.filePath}
                onFileNavigation={handleFileNavigation}
                searchQuery={showSearch ? searchQuery : undefined}
                searchOptions={showSearch ? searchOptions : undefined}
              />
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
            <Card className={`max-w-lg w-full transition-all duration-300 macos-scale-in ${
              isDragOver 
                ? 'macos-drop-zone shadow-lg scale-105' 
                : 'border-dashed border-2 border-muted-foreground/30 hover:border-muted-foreground/50 hover:shadow-md'
            }`}>
              <CardContent className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-30 h-30 rounded-xl transition-all duration-300 ${
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
                <div className="text-4xl font-bold mb-3 text-foreground">
                  HyperRead
                </div>
                <div className="text-xl font-semibold mb-2 text-foreground/80">
                  {isDragOver ? t('ui.messages.releaseToOpen') : t('ui.messages.readSmarter')}
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {isDragOver
                    ? t('ui.messages.releaseToOpen')
                    : t('ui.messages.dragDropSupport')
                  }
                </p>
                {!isDragOver && (
                  <div className="space-y-4">
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleOpenFile}  className="min-w-24 macos-button">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="macos-text">{t('ui.buttons.openFile')}</span>
                      </Button>
                      <Button onClick={handleOpenDirectory} variant="outline" className="min-w-24 macos-button">
                        <Folder className="h-4 w-4 mr-2" />
                        <span className="macos-text">{t('ui.buttons.openFolder')}</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-xs px-2">or</span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('ui.messages.dragDropHint')}
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

      {/* 重新拖拽提示覆盖层 */}
      {showRefreshHint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 m-4 max-w-md w-full glass-effect">
            <h3 className="text-lg font-semibold mb-4 text-center">
              需要重新加载文件
            </h3>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                文件系统发生了变化，需要重新拖拽文件夹来获取最新的文件列表。
              </p>

              {draggedDirectoryNames.length > 0 && (
                <div className="bg-muted p-3 rounded text-center">
                  <p className="text-xs text-muted-foreground mb-2">原拖拽的文件夹：</p>
                  <p className="font-mono text-sm">{draggedDirectoryNames.join(', ')}</p>
                </div>
              )}

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-background/50">
                <div className="text-2xl mb-2">📁</div>
                <p className="text-sm font-medium mb-1">重新拖拽文件夹到此处</p>
                <p className="text-xs text-muted-foreground">或使用"打开文件夹"按钮</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRefreshHint(false)}
                  className="flex-1"
                >
                  稍后处理
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={openDirectoryDialog}
                  className="flex-1"
                >
                  打开文件夹
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        contentWidth={contentWidth}
        onContentWidthChange={setContentWidth}
        primaryColor={primaryColor}
        onPrimaryColorChange={setPrimaryColor}
      />

      {/* AI Assistant Sidebar */}
      <ConsistentAiSidebar
        isOpen={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
        currentDocument={fileData ? {
          fileName: fileData.fileName,
          content: fileData.content,
          filePath: fileData.filePath
        } : undefined}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}