'use client'

import { useState } from 'react'
import { X, FileText, FolderOpen, Search, Keyboard, Bot, BookOpen, FileType, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n'

interface HelpDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('getting-started')

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const sections = [
    { id: 'getting-started', label: t('help.sections.gettingStarted'), icon: <Zap className="w-4 h-4" /> },
    { id: 'file-management', label: t('help.sections.fileManagement'), icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'reading', label: t('help.sections.reading'), icon: <BookOpen className="w-4 h-4" /> },
    { id: 'search', label: t('help.sections.search'), icon: <Search className="w-4 h-4" /> },
    { id: 'ai-assistant', label: t('help.sections.aiAssistant'), icon: <Bot className="w-4 h-4" /> },
    { id: 'shortcuts', label: t('help.sections.shortcuts'), icon: <Keyboard className="w-4 h-4" /> }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1.5">{t('help.gettingStarted.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('help.gettingStarted.description')}</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary/10 text-primary rounded-md flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">{t('help.gettingStarted.step1.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('help.gettingStarted.step1.description')}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary/10 text-primary rounded-md flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">{t('help.gettingStarted.step2.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('help.gettingStarted.step2.description')}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary/10 text-primary rounded-md flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">{t('help.gettingStarted.step3.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('help.gettingStarted.step3.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'file-management':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1.5">{t('help.fileManagement.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('help.fileManagement.description')}</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-muted/60 rounded-md flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-foreground/70" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">{t('help.fileManagement.dragDrop.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('help.fileManagement.dragDrop.description')}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-muted/60 rounded-md flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-4 h-4 text-foreground/70" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">{t('help.fileManagement.folderMode.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('help.fileManagement.folderMode.description')}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-muted/60 rounded-md flex items-center justify-center flex-shrink-0">
                    <FileType className="w-4 h-4 text-foreground/70" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">{t('help.fileManagement.supportedFormats.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('help.fileManagement.supportedFormats.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'reading':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1.5">{t('help.reading.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('help.reading.description')}</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <h4 className="text-sm font-medium mb-1">{t('help.reading.fontSize.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('help.reading.fontSize.description')}</p>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <h4 className="text-sm font-medium mb-1">{t('help.reading.contentWidth.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('help.reading.contentWidth.description')}</p>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <h4 className="text-sm font-medium mb-1">{t('help.reading.sidebar.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('help.reading.sidebar.description')}</p>
              </div>
            </div>
          </div>
        )

      case 'search':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1.5">{t('help.search.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('help.search.description')}</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <h4 className="text-sm font-medium mb-1">{t('help.search.inDocument.title')}</h4>
                <p className="text-sm text-muted-foreground mb-2.5">{t('help.search.inDocument.description')}</p>
                <kbd className="inline-flex items-center gap-1 px-2 py-0.5 bg-background/80 border border-border/60 rounded text-xs font-mono">
                  <span className="text-muted-foreground">⌘/Ctrl</span>
                  <span className="text-muted-foreground">+</span>
                  <span>F</span>
                </kbd>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <h4 className="text-sm font-medium mb-1">{t('help.search.inSidebar.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('help.search.inSidebar.description')}</p>
              </div>
            </div>
          </div>
        )

      case 'ai-assistant':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1.5">{t('help.aiAssistant.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('help.aiAssistant.description')}</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <h4 className="text-sm font-medium mb-1">{t('help.aiAssistant.setup.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('help.aiAssistant.setup.description')}</p>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <h4 className="text-sm font-medium mb-1">{t('help.aiAssistant.usage.title')}</h4>
                <p className="text-sm text-muted-foreground mb-2.5">{t('help.aiAssistant.usage.description')}</p>
                <kbd className="inline-flex items-center gap-1 px-2 py-0.5 bg-background/80 border border-border/60 rounded text-xs font-mono">
                  <span className="text-muted-foreground">⌘/Ctrl</span>
                  <span className="text-muted-foreground">+</span>
                  <span>K</span>
                </kbd>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                <h4 className="text-sm font-medium mb-1">{t('help.aiAssistant.roles.title')}</h4>
                <p className="text-sm text-muted-foreground">{t('help.aiAssistant.roles.description')}</p>
              </div>
            </div>
          </div>
        )

      case 'shortcuts':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1.5">{t('help.shortcuts.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('help.shortcuts.description')}</p>
            </div>

            {/* General Shortcuts */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-foreground/80">{t('help.shortcuts.general') || '通用快捷键'}</h4>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: ['⌘/Ctrl', 'O'], desc: t('help.shortcuts.list.openFile') },
                  { key: ['⌘/Ctrl', 'F'], desc: t('help.shortcuts.list.search') },
                  { key: ['⌘/Ctrl', 'K'], desc: t('help.shortcuts.list.aiAssistant') },
                  { key: ['⌘/Ctrl', ','], desc: t('help.shortcuts.list.settings') },
                  { key: ['⌘/Ctrl', 'B'], desc: t('help.shortcuts.list.toggleSidebar') },
                  { key: ['⌘/Ctrl', '+'], desc: t('help.shortcuts.list.increaseFontSize') },
                  { key: ['⌘/Ctrl', '-'], desc: t('help.shortcuts.list.decreaseFontSize') },
                  { key: ['⌘/Ctrl', '0'], desc: t('help.shortcuts.list.resetFontSize') }
                ].map((shortcut, index) => (
                  <div key={index} className="p-2.5 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                    <div className="flex items-center gap-1 mb-1.5">
                      {shortcut.key.map((k, i) => (
                        <span key={i} className="inline-flex items-center">
                          <kbd className="inline-flex items-center px-1.5 py-0.5 bg-background/80 border border-border/60 rounded text-xs font-mono">
                            {k}
                          </kbd>
                          {i < shortcut.key.length - 1 && <span className="mx-0.5 text-muted-foreground text-xs">+</span>}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{shortcut.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* EPUB Reading Shortcuts */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-foreground/80">{t('help.shortcuts.epubReading') || 'EPUB 阅读快捷键'}</h4>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: ['←'], desc: t('help.shortcuts.list.prevPage') || '上一页' },
                  { key: ['→'], desc: t('help.shortcuts.list.nextPage') || '下一页' },
                  { key: ['K'], desc: t('help.shortcuts.list.prevPageVim') || '上一页 (Vim)' },
                  { key: ['J'], desc: t('help.shortcuts.list.nextPageVim') || '下一页 (Vim)' },
                  { key: ['Space'], desc: t('help.shortcuts.list.nextPageSpace') || '下一页' },
                  { key: ['Shift', 'Space'], desc: t('help.shortcuts.list.prevPageSpace') || '上一页' },
                  { key: ['Home'], desc: t('help.shortcuts.list.firstPage') || '跳到首页' },
                  { key: ['End'], desc: t('help.shortcuts.list.lastPage') || '跳到末页' }
                ].map((shortcut, index) => (
                  <div key={index} className="p-2.5 bg-muted/30 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                    <div className="flex items-center gap-1 mb-1.5">
                      {shortcut.key.map((k, i) => (
                        <span key={i} className="inline-flex items-center">
                          <kbd className="inline-flex items-center px-1.5 py-0.5 bg-background/80 border border-border/60 rounded text-xs font-mono">
                            {k}
                          </kbd>
                          {i < shortcut.key.length - 1 && <span className="mx-0.5 text-muted-foreground text-xs">+</span>}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{shortcut.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[60] macos-fade-in p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-[860px] h-[640px] glass-effect border border-border/30 shadow-2xl macos-scale-in overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/20 bg-muted/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary/10 rounded-md flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold !m-0 !p-0 leading-none">{t('help.title')}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 rounded-md hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 主体内容区 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧导航 */}
          <div className="w-52 bg-muted/20 border-r border-border/20 flex-shrink-0 overflow-y-auto">
            <div className="p-3">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all
                      ${activeSection === section.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-muted/40 text-foreground border border-transparent'
                      }
                    `}
                  >
                    <div className={activeSection === section.id ? 'text-primary' : 'text-muted-foreground'}>
                      {section.icon}
                    </div>
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* 右侧内容区 */}
          <div className="flex-1 bg-background overflow-y-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
