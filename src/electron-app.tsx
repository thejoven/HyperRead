'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import FileList from '@/components/FileList'
import SettingsModal from '@/components/SettingsModal'
import ConsistentAiSidebar from '@/components/ConsistentAiSidebar'
import { Toaster } from '@/components/ui/sonner'
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { toast } from "sonner"
import { useShortcuts } from '@/contexts/ShortcutContext'

// Hooks
import { useTabs } from '@/hooks/use-tabs'
import { useSettings } from '@/hooks/use-settings'
import { useFullscreen } from '@/hooks/use-fullscreen'
import { useDirectory } from '@/hooks/use-directory'
import { useDragDrop } from '@/hooks/use-drag-drop'
import { useFileNavigation } from '@/hooks/use-file-navigation'

// Components
import AppToolbar from '@/components/layout/AppToolbar'
import DragOverlay from '@/components/layout/DragOverlay'
import DocumentContent from '@/components/viewers/DocumentContent'
import type { SearchOptions } from '@/components/viewers/DocumentContent'
import WelcomeScreen from '@/components/screens/WelcomeScreen'
import RefreshHintModal from '@/components/screens/RefreshHintModal'

// Types
import type { FileData } from '@/types/file'
import type { FileInfo, DirectoryData } from '@/types/directory'
import '@/types/electron' // Import for global declaration

export default function ElectronApp() {
  const t = useT()
  const { shortcuts } = useShortcuts()

  // === Custom Hooks ===
  const settings = useSettings()
  const isFullScreen = useFullscreen()
  const directory = useDirectory()
  const tabs = useTabs()

  // === Local State ===
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    useRegex: false,
    wholeWord: false
  })

  // === File Navigation Hook ===
  const { handleFileNavigation } = useFileNavigation({
    setLoading,
    setFileData,
    openTabWithData: tabs.openTabWithData
  })

  // === Drag Drop Hook ===
  const { isDragOver } = useDragDrop({
    onSingleFileDrop: (data) => {
      tabs.openTabWithData(data)
      setFileData(data)
      directory.setIsDirectoryMode(false)
      directory.setIsEnhancedDragMode(false)
    },
    onDirectoryDrop: (dirData, fileContentsCache, directoryEntries, directoryNames, allFiles, firstFileData) => {
      tabs.setCacheBulk(fileContentsCache)
      directory.setDirectoryData(dirData)
      directory.setActualRootPath(null)
      directory.setDraggedDirectoryEntries(directoryEntries)
      directory.setDraggedDirectoryNames(directoryNames)
      directory.setLastDraggedFiles(allFiles)
      directory.setShowRefreshHint(false)
      directory.setIsDirectoryMode(true)
      directory.setIsEnhancedDragMode(true)

      if (firstFileData) {
        tabs.openTabWithData(firstFileData)
        setFileData(firstFileData)
      }
    }
  })

  // === Tab Handlers ===
  const handleActivateTab = useCallback(async (filePath: string) => {
    await tabs.activateTab(filePath)
    const tab = tabs.openTabs.find(t => t.filePath === filePath)
    const cached = tabs.cache.get(filePath)
    if (cached && tab) {
      setFileData({ content: cached, fileName: tab.fileName, filePath, fileType: tab.fileType })
    } else if (window.electronAPI?.readFile) {
      const data = await window.electronAPI.readFile(filePath)
      setFileData(data)
    }
  }, [tabs])

  const handleCloseTab = useCallback((path: string) => {
    tabs.closeTab(path, async (fp) => {
      const tab = tabs.openTabs.find(t => t.filePath === fp)
      const cached = tabs.cache.get(fp)
      if (cached && tab) {
        setFileData({ content: cached, fileName: tab.fileName, filePath: fp, fileType: tab.fileType })
      } else if (window.electronAPI?.readFile) {
        const data = await window.electronAPI.readFile(fp)
        setFileData(data)
      }
    })
  }, [tabs])

  // === File/Directory Handlers ===
  const loadFile = useCallback(async (filePath: string) => {
    if (!window.electronAPI) return
    setLoading(true)
    try {
      const data = await window.electronAPI.readFile(filePath)
      tabs.openTabWithData(data)
      setFileData(data)
    } catch (error) {
      console.error('Failed to load file:', error)
      toast.error('文件加载失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [tabs])

  const handleOpenFile = useCallback(async () => {
    if (!window.electronAPI) return
    setLoading(true)
    try {
      const data = await window.electronAPI.openFileDialog()
      if (data) {
        tabs.openTabWithData(data)
        setFileData(data)
        directory.setIsDirectoryMode(false)
        directory.setDirectoryData(null)
      }
    } catch (error) {
      console.error('Failed to open file:', error)
      toast.error('文件打开失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [tabs, directory])

  const handleOpenDirectory = useCallback(async () => {
    if (!window.electronAPI) return
    setLoading(true)
    try {
      const data = await window.electronAPI.openDirectoryDialog()
      if (data && data.files.length > 0) {
        directory.setDirectoryData(data)
        directory.setActualRootPath(data.rootPath)
        directory.setDraggedDirectoryEntries([])
        directory.setDraggedDirectoryNames([])
        directory.setLastDraggedFiles([])
        directory.setShowRefreshHint(false)
        directory.setIsEnhancedDragMode(false)
        directory.setIsDirectoryMode(true)
        // Auto select first file
        const firstFile = data.files[0]
        await loadFileFromDirectory(firstFile)
      } else if (data && data.files.length === 0) {
        toast.error('该文件夹中没有找到 Markdown 文件')
      }
    } catch (error) {
      console.error('Failed to open directory:', error)
      toast.error('文件夹打开失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [directory])

  const loadFileFromDirectory = useCallback(async (fileInfo: FileInfo) => {
    await directory.loadFileFromDirectory(
      fileInfo,
      tabs.cache,
      setFileData,
      tabs.openTabWithData,
      setLoading
    )
  }, [directory, tabs])

  const handleRefresh = useCallback(async () => {
    await directory.handleRefresh(tabs.cache, tabs.setCacheBulk)
  }, [directory, tabs])

  // === Search Shortcuts ===
  useEffect(() => {
    const searchOpenShortcut = shortcuts.find(s => s.id === 'search-open')
    if (!searchOpenShortcut || !searchOpenShortcut.enabled) return

    const keys = searchOpenShortcut.keys[0]
    const isDoubleShift = keys === 'shift shift'

    if (isDoubleShift) {
      let shiftPressCount = 0
      let shiftTimer: NodeJS.Timeout | null = null

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Shift') {
          shiftPressCount++
          if (shiftPressCount === 1) {
            shiftTimer = setTimeout(() => { shiftPressCount = 0 }, 500)
          } else if (shiftPressCount === 2) {
            e.preventDefault()
            if (fileData && fileData.content) setShowSearch(true)
            shiftPressCount = 0
            if (shiftTimer) clearTimeout(shiftTimer)
          }
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        if (shiftTimer) clearTimeout(shiftTimer)
      }
    } else {
      const handleKeyDown = (e: KeyboardEvent) => {
        const pressedKey = e.key.toLowerCase()
        const hasCtrl = e.ctrlKey || e.metaKey
        const hasShift = e.shiftKey
        const hasAlt = e.altKey

        let combination = ''
        if (hasCtrl) combination += 'ctrl+'
        if (hasShift) combination += 'shift+'
        if (hasAlt) combination += 'alt+'
        combination += pressedKey

        if (combination === keys) {
          e.preventDefault()
          if (fileData && fileData.content) setShowSearch(true)
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [fileData, shortcuts])

  // === Sidebar Toggle Shortcut ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const hasCmd = e.metaKey || e.ctrlKey
      const key = e.key
      if (hasCmd && (key === '.' || key === 'b' || key === 'B')) {
        e.preventDefault()
        settings.toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [settings])

  // === Navigate to Line ===
  const handleNavigateToLine = useCallback((lineNumber: number) => {
    const contentElement = document.querySelector('.content-scroll') || document.querySelector('.markdown-content')
    if (!contentElement || !fileData) return
    const lines = fileData.content.split('\n')
    if (lineNumber < 1 || lineNumber > lines.length) return
    const percentage = (lineNumber - 1) / lines.length
    const scrollTop = contentElement.scrollHeight * percentage
    contentElement.scrollTo({ top: scrollTop, behavior: 'smooth' })
  }, [fileData])

  // === Non-Electron Check ===
  if (!window.electronAPI?.isElectron) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">HyperRead</h2>
            <p className="text-muted-foreground mb-4">此应用需要在 Electron 环境中运行</p>
            <Button onClick={() => window.location.reload()}>刷新页面</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // === Render ===
  return (
    <div className="h-screen w-screen bg-background overflow-hidden flex flex-col">
      {/* Toolbar */}
      <AppToolbar
        isFullScreen={isFullScreen}
        isSidebarCollapsed={settings.isSidebarCollapsed}
        onToggleSidebar={settings.toggleSidebar}
        openTabs={tabs.openTabs}
        activeTab={tabs.activeTab}
        onActivateTab={handleActivateTab}
        onCloseTab={handleCloseTab}
        onOpenFile={handleOpenFile}
        onOpenDirectory={handleOpenDirectory}
        showAiAssistant={showAiAssistant}
        onToggleAiAssistant={() => setShowAiAssistant(!showAiAssistant)}
        onOpenSettings={() => setShowSettings(true)}
        loading={loading}
      />

      {/* Main Content */}
      <main
        className="flex-1 relative transition-all duration-300 ease-in-out overflow-hidden flex flex-col"
        style={{ marginRight: showAiAssistant ? `${settings.aiSidebarWidth}px` : '0px' }}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p>{t('file.operations.loading')}</p>
            </div>
          </div>
        )}

        {/* Directory Mode */}
        {directory.isDirectoryMode && directory.directoryData ? (
          <div className="flex flex-1 relative overflow-hidden">
            {/* File List Sidebar */}
            <div
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{
                width: settings.isSidebarCollapsed ? '0px' : `${settings.sidebarWidth}px`,
                minWidth: settings.isSidebarCollapsed ? '0px' : `${settings.sidebarWidth}px`
              }}
            >
              <FileList
                files={directory.directoryData.files}
                rootPath={directory.directoryData.rootPath}
                currentFile={fileData?.filePath}
                onFileSelect={loadFileFromDirectory}
                isCollapsed={settings.isSidebarCollapsed}
                onRefresh={handleRefresh}
                isRefreshing={directory.isRefreshing}
                width={settings.sidebarWidth}
                onWidthChange={settings.setSidebarWidth}
              />
            </div>

            {/* Sidebar Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={settings.toggleSidebar}
              className="absolute top-1/2 transform -translate-y-1/2 z-20 h-12 w-5 p-0 bg-background hover:bg-background border border-border transition-all duration-300 ease-in-out opacity-50 hover:opacity-100 rounded-md"
              style={{ left: settings.isSidebarCollapsed ? '8px' : `${settings.sidebarWidth - 12}px` }}
              title={settings.isSidebarCollapsed ? t('ui.buttons.expandSidebar') : t('ui.buttons.collapseSidebar')}
            >
              <div className="flex flex-col items-center justify-center h-full">
                {settings.isSidebarCollapsed ? (
                  <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
                ) : (
                  <ChevronLeft className="h-2.5 w-2.5 text-muted-foreground" />
                )}
              </div>
            </Button>

            {/* Document Content Area */}
            <div className="flex-1 overflow-hidden bg-background relative">
              {fileData ? (
                <DocumentContent
                  fileData={fileData}
                  fontSize={settings.fontSize}
                  contentWidth={settings.contentWidth}
                  maxWidthClass={settings.getMaxWidthClass()}
                  showSearch={showSearch}
                  searchQuery={searchQuery}
                  searchOptions={searchOptions}
                  onCloseSearch={() => setShowSearch(false)}
                  onSearchChange={(query, options) => {
                    setSearchQuery(query)
                    setSearchOptions(options)
                  }}
                  onFileNavigation={handleFileNavigation}
                  onNavigateToLine={handleNavigateToLine}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Card className="max-w-md border-dashed">
                    <CardContent className="p-6 text-center">
                      <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/60" />
                      <h3 className="text-sm font-medium mb-2 text-foreground">{t('ui.messages.selectFile')}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {settings.isSidebarCollapsed
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
          // Single File Mode
          <div className="flex-1 relative overflow-hidden">
            <DocumentContent
              fileData={fileData}
              fontSize={settings.fontSize}
              contentWidth={settings.contentWidth}
              maxWidthClass={settings.getMaxWidthClass()}
              showSearch={showSearch}
              searchQuery={searchQuery}
              searchOptions={searchOptions}
              onCloseSearch={() => setShowSearch(false)}
              onSearchChange={(query, options) => {
                setSearchQuery(query)
                setSearchOptions(options)
              }}
              onFileNavigation={handleFileNavigation}
              onNavigateToLine={handleNavigateToLine}
            />
          </div>
        ) : (
          // Welcome Screen
          <WelcomeScreen
            isDragOver={isDragOver}
            onOpenFile={handleOpenFile}
            onOpenDirectory={handleOpenDirectory}
          />
        )}

        {/* Drag Overlay */}
        <DragOverlay visible={isDragOver} />
      </main>

      {/* Refresh Hint Modal */}
      <RefreshHintModal
        visible={directory.showRefreshHint}
        directoryNames={directory.draggedDirectoryNames}
        onClose={() => directory.setShowRefreshHint(false)}
        onOpenDirectory={handleOpenDirectory}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={settings.fontSize}
        onFontSizeChange={settings.setFontSize}
        contentWidth={settings.contentWidth}
        onContentWidthChange={settings.setContentWidth}
        primaryColor={settings.primaryColor}
        onPrimaryColorChange={settings.setPrimaryColor}
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
        width={settings.aiSidebarWidth}
        onWidthChange={settings.setAiSidebarWidth}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}
