'use client'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import DocumentTabs from '@/components/DocumentTabs'
import { FileText, Folder, Settings, MessageSquare, PanelLeft } from 'lucide-react'
import { useT } from '@/lib/i18n'
import type { TabInfo } from '@/hooks/use-tabs'

interface AppToolbarProps {
  isFullScreen: boolean
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
  openTabs: TabInfo[]
  activeTab: string | null
  onActivateTab: (path: string) => void
  onCloseTab: (path: string) => void
  onOpenFile: () => void
  onOpenDirectory: () => void
  showAiAssistant: boolean
  onToggleAiAssistant: () => void
  onOpenSettings: () => void
  loading: boolean
  isDirectoryMode: boolean // Show sidebar toggle only in directory mode
}

export default function AppToolbar({
  isFullScreen,
  isSidebarCollapsed,
  onToggleSidebar,
  openTabs,
  activeTab,
  onActivateTab,
  onCloseTab,
  onOpenFile,
  onOpenDirectory,
  showAiAssistant,
  onToggleAiAssistant,
  onOpenSettings,
  loading,
  isDirectoryMode
}: AppToolbarProps) {
  const t = useT()

  return (
    <header className="macos-toolbar drag-region flex-shrink-0 sticky top-0 z-50">
      <div className="flex items-center h-14 relative py-2">
        {/* Left padding for traffic light buttons (macOS non-fullscreen) */}
        {window.electronAPI?.platform === 'darwin' && !isFullScreen ? (
          <div className="w-20 flex-shrink-0" />
        ) : (
          <div className="w-2 flex-shrink-0" />
        )}

        {/* Sidebar toggle button - only show in directory mode */}
        {isDirectoryMode && (
          <div className="no-drag">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className={`h-7 w-7 p-0 macos-button ml-2 ${isSidebarCollapsed ? 'bg-primary/10 text-primary' : ''}`}
              title={isSidebarCollapsed ? t('ui.buttons.expandSidebar') : t('ui.buttons.collapseSidebar')}
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Tabs area */}
        <div className="w-2 flex-shrink-0"></div>
        <div className="flex-1 overflow-hidden no-drag">
          <DocumentTabs
            tabs={openTabs}
            activeTab={activeTab}
            onActivate={onActivateTab}
            onClose={onCloseTab}
          />
        </div>
        <div className="w-2 flex-shrink-0"></div>

        {/* Right side buttons */}
        <div className="flex items-center gap-1 mr-4 no-drag">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenFile}
            disabled={loading}
            className="h-7 px-2 macos-button"
            title={t('ui.buttons.openFile')}
          >
            <FileText className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenDirectory}
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
            onClick={onToggleAiAssistant}
            className={`h-7 w-7 p-0 macos-button ${showAiAssistant ? 'bg-primary/10 text-primary' : ''}`}
            title="AI 助手"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="h-7 w-7 p-0 macos-button"
            title={t('ui.buttons.settings')}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
