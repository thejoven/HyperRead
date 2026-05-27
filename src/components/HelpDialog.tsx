'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  X,
  FileText,
  FolderOpen,
  Search,
  Keyboard,
  Bot,
  BookOpen,
  FileType,
  Zap,
  PanelLeft,
  PanelRight,
  Settings2,
  Palette,
  Puzzle,
  Clock3,
  Files,
  RotateCcw,
  Sparkles,
  Highlighter,
  ListTree,
  ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n'

interface HelpDialogProps {
  isOpen: boolean
  onClose: () => void
}

type SectionId =
  | 'getting-started'
  | 'file-management'
  | 'reading'
  | 'search'
  | 'plugins'
  | 'ai-assistant'
  | 'shortcuts'

interface GuideSection {
  id: SectionId
  label: string
  summary: string
  icon: LucideIcon
}

interface GuideCard {
  title: string
  description: string
  icon: LucideIcon
  accent: string
  tags?: string[]
}

interface ShortcutItem {
  keys: string[]
  desc: string
}

const cardAccents = [
  'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20',
  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
  'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
  'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/20',
  'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
  'bg-zinc-500/10 text-zinc-700 dark:text-zinc-200 border-zinc-500/20'
]

function Keycap({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border/60 bg-background/90 px-1.5 font-mono text-[11px] font-semibold text-foreground shadow-sm">
      {children}
    </kbd>
  )
}

function GuideCardItem({ item }: { item: GuideCard }) {
  const Icon = item.icon

  return (
    <div className="group rounded-lg border border-border/35 bg-muted/15 p-3.5 transition-colors hover:bg-muted/25">
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${item.accent}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="macos-text-title text-sm font-semibold leading-5 text-foreground">{item.title}</h4>
          <p className="macos-text mt-1 text-sm leading-5 text-muted-foreground">{item.description}</p>
          {item.tags && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border/30 bg-background/65 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ShortcutTile({ shortcut }: { shortcut: ShortcutItem }) {
  return (
    <div className="rounded-lg border border-border/35 bg-muted/15 p-3 transition-colors hover:bg-muted/25">
      <div className="mb-2 flex flex-wrap items-center gap-1">
        {shortcut.keys.map((key, index) => (
          <span key={`${key}-${index}`} className="inline-flex items-center gap-1">
            <Keycap>{key}</Keycap>
            {index < shortcut.keys.length - 1 && (
              <span className="text-xs font-medium text-muted-foreground">+</span>
            )}
          </span>
        ))}
      </div>
      <p className="text-xs leading-4 text-muted-foreground">{shortcut.desc}</p>
    </div>
  )
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState<SectionId>('getting-started')

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const sections: GuideSection[] = [
    {
      id: 'getting-started',
      label: t('help.sections.gettingStarted'),
      summary: t('help.sectionSummaries.gettingStarted'),
      icon: Zap
    },
    {
      id: 'file-management',
      label: t('help.sections.fileManagement'),
      summary: t('help.sectionSummaries.fileManagement'),
      icon: FolderOpen
    },
    {
      id: 'reading',
      label: t('help.sections.reading'),
      summary: t('help.sectionSummaries.reading'),
      icon: BookOpen
    },
    {
      id: 'search',
      label: t('help.sections.search'),
      summary: t('help.sectionSummaries.search'),
      icon: Search
    },
    {
      id: 'plugins',
      label: t('help.sections.plugins'),
      summary: t('help.sectionSummaries.plugins'),
      icon: Puzzle
    },
    {
      id: 'ai-assistant',
      label: t('help.sections.aiAssistant'),
      summary: t('help.sectionSummaries.aiAssistant'),
      icon: Bot
    },
    {
      id: 'shortcuts',
      label: t('help.sections.shortcuts'),
      summary: t('help.sectionSummaries.shortcuts'),
      icon: Keyboard
    }
  ]

  const active = sections.find((section) => section.id === activeSection) ?? sections[0]

  const highlights = [
    { label: t('help.highlights.formats'), value: 'Markdown / PDF / EPUB / HTML' },
    { label: t('help.highlights.workflow'), value: t('help.highlights.workflowValue') },
    { label: t('help.highlights.customizable'), value: t('help.highlights.customizableValue') }
  ]

  const cardsBySection: Record<Exclude<SectionId, 'shortcuts'>, GuideCard[]> = {
    'getting-started': [
      {
        title: t('help.gettingStarted.step1.title'),
        description: t('help.gettingStarted.step1.description'),
        icon: FileText,
        accent: cardAccents[0],
        tags: ['Cmd/Ctrl + O', t('help.tags.singleFile')]
      },
      {
        title: t('help.gettingStarted.step2.title'),
        description: t('help.gettingStarted.step2.description'),
        icon: FolderOpen,
        accent: cardAccents[1],
        tags: ['Cmd/Ctrl + Shift + O', t('help.tags.folder')]
      },
      {
        title: t('help.gettingStarted.step3.title'),
        description: t('help.gettingStarted.step3.description'),
        icon: Sparkles,
        accent: cardAccents[2],
        tags: [t('help.tags.theme'), t('help.tags.readingWidth')]
      },
      {
        title: t('help.gettingStarted.step4.title'),
        description: t('help.gettingStarted.step4.description'),
        icon: Clock3,
        accent: cardAccents[3],
        tags: [t('help.tags.recent'), t('help.tags.tabs')]
      }
    ],
    'file-management': [
      {
        title: t('help.fileManagement.dragDrop.title'),
        description: t('help.fileManagement.dragDrop.description'),
        icon: Files,
        accent: cardAccents[0],
        tags: [t('help.tags.dragDrop'), t('help.tags.folder')]
      },
      {
        title: t('help.fileManagement.folderMode.title'),
        description: t('help.fileManagement.folderMode.description'),
        icon: ListTree,
        accent: cardAccents[1],
        tags: [t('help.tags.fileTree'), t('help.tags.filter')]
      },
      {
        title: t('help.fileManagement.supportedFormats.title'),
        description: t('help.fileManagement.supportedFormats.description'),
        icon: FileType,
        accent: cardAccents[2],
        tags: ['.md', '.pdf', '.epub', '.html']
      },
      {
        title: t('help.fileManagement.recentAndTabs.title'),
        description: t('help.fileManagement.recentAndTabs.description'),
        icon: Clock3,
        accent: cardAccents[3],
        tags: [t('help.tags.recent'), t('help.tags.tabs')]
      }
    ],
    reading: [
      {
        title: t('help.reading.markdown.title'),
        description: t('help.reading.markdown.description'),
        icon: Highlighter,
        accent: cardAccents[0],
        tags: ['Mermaid', t('help.tags.codeHighlight')]
      },
      {
        title: t('help.reading.fontSize.title'),
        description: t('help.reading.fontSize.description'),
        icon: Settings2,
        accent: cardAccents[1],
        tags: ['12-24px', 'Cmd/Ctrl + +/-']
      },
      {
        title: t('help.reading.contentWidth.title'),
        description: t('help.reading.contentWidth.description'),
        icon: PanelLeft,
        accent: cardAccents[2],
        tags: [t('settings.reading.widthNarrow'), t('settings.reading.widthMedium'), t('settings.reading.widthWide'), t('settings.reading.widthFull')]
      },
      {
        title: t('help.reading.themeAndSidebar.title'),
        description: t('help.reading.themeAndSidebar.description'),
        icon: Palette,
        accent: cardAccents[3],
        tags: ['Cmd/Ctrl + B', 'Cmd/Ctrl + Shift + T']
      },
      {
        title: t('help.reading.epubPdf.title'),
        description: t('help.reading.epubPdf.description'),
        icon: BookOpen,
        accent: cardAccents[4],
        tags: ['EPUB', 'PDF', t('help.tags.progress')]
      }
    ],
    search: [
      {
        title: t('help.search.inDocument.title'),
        description: t('help.search.inDocument.description'),
        icon: Search,
        accent: cardAccents[0],
        tags: [t('help.tags.doubleShift'), 'Enter', 'Shift + Enter']
      },
      {
        title: t('help.search.inSidebar.title'),
        description: t('help.search.inSidebar.description'),
        icon: PanelLeft,
        accent: cardAccents[1],
        tags: [t('help.tags.fileTree'), t('help.tags.filter')]
      },
      {
        title: t('help.search.options.title'),
        description: t('help.search.options.description'),
        icon: Settings2,
        accent: cardAccents[2],
        tags: [t('search.options.caseSensitive'), t('search.options.wholeWord'), t('search.options.regex')]
      },
      {
        title: t('help.search.global.title'),
        description: t('help.search.global.description'),
        icon: RotateCcw,
        accent: cardAccents[3],
        tags: [t('help.tags.index'), t('help.tags.folder')]
      }
    ],
    plugins: [
      {
        title: t('help.plugins.install.title'),
        description: t('help.plugins.install.description'),
        icon: Puzzle,
        accent: cardAccents[0],
        tags: ['.zip', 'manifest.json', 'main.js']
      },
      {
        title: t('help.plugins.manage.title'),
        description: t('help.plugins.manage.description'),
        icon: Settings2,
        accent: cardAccents[1],
        tags: [t('help.tags.enable'), t('help.tags.disable'), t('help.tags.uninstall')]
      },
      {
        title: t('help.plugins.ui.title'),
        description: t('help.plugins.ui.description'),
        icon: PanelRight,
        accent: cardAccents[2],
        tags: [t('help.tags.toolbar'), t('help.tags.sidebar'), t('help.tags.viewer')]
      },
      {
        title: t('help.plugins.safety.title'),
        description: t('help.plugins.safety.description'),
        icon: ShieldCheck,
        accent: cardAccents[3],
        tags: [t('help.tags.localData'), t('help.tags.settings')]
      }
    ],
    'ai-assistant': [
      {
        title: t('help.aiAssistant.setup.title'),
        description: t('help.aiAssistant.setup.description'),
        icon: Bot,
        accent: cardAccents[0],
        tags: [t('help.tags.rightPanel'), t('help.tags.pluginPanel')]
      },
      {
        title: t('help.aiAssistant.usage.title'),
        description: t('help.aiAssistant.usage.description'),
        icon: Sparkles,
        accent: cardAccents[1],
        tags: ['Cmd/Ctrl + Shift + A', t('help.tags.currentDocument')]
      },
      {
        title: t('help.aiAssistant.context.title'),
        description: t('help.aiAssistant.context.description'),
        icon: FileText,
        accent: cardAccents[2],
        tags: [t('help.tags.summary'), t('help.tags.translation'), t('help.tags.extraction')]
      }
    ]
  }

  const shortcutGroups = [
    {
      title: t('help.shortcuts.groups.navigation'),
      items: [
        { keys: ['Cmd/Ctrl', 'O'], desc: t('help.shortcuts.list.openFile') },
        { keys: ['Cmd/Ctrl', 'Shift', 'O'], desc: t('help.shortcuts.list.openFolder') },
        { keys: ['F5'], desc: t('help.shortcuts.list.refresh') },
        { keys: ['Cmd/Ctrl', ','], desc: t('help.shortcuts.list.settings') }
      ]
    },
    {
      title: t('help.shortcuts.groups.viewSearch'),
      items: [
        { keys: ['Shift', 'Shift'], desc: t('help.shortcuts.list.search') },
        { keys: ['Enter'], desc: t('help.shortcuts.list.nextResult') },
        { keys: ['Shift', 'Enter'], desc: t('help.shortcuts.list.prevResult') },
        { keys: ['Cmd/Ctrl', 'B'], desc: t('help.shortcuts.list.toggleSidebar') }
      ]
    },
    {
      title: t('help.shortcuts.groups.reading'),
      items: [
        { keys: ['Cmd/Ctrl', '='], desc: t('help.shortcuts.list.increaseFontSize') },
        { keys: ['Cmd/Ctrl', '-'], desc: t('help.shortcuts.list.decreaseFontSize') },
        { keys: ['Cmd/Ctrl', '0'], desc: t('help.shortcuts.list.resetFontSize') },
        { keys: ['Cmd/Ctrl', 'Shift', 'T'], desc: t('help.shortcuts.list.toggleTheme') }
      ]
    },
    {
      title: t('help.shortcuts.groups.epub'),
      items: [
        { keys: ['Left'], desc: t('help.shortcuts.list.prevPage') },
        { keys: ['Right'], desc: t('help.shortcuts.list.nextPage') },
        { keys: ['Space'], desc: t('help.shortcuts.list.nextPageSpace') },
        { keys: ['Shift', 'Space'], desc: t('help.shortcuts.list.prevPageSpace') },
        { keys: ['Home'], desc: t('help.shortcuts.list.firstPage') },
        { keys: ['End'], desc: t('help.shortcuts.list.lastPage') }
      ]
    }
  ] satisfies Array<{ title: string; items: ShortcutItem[] }>

  const renderContent = () => {
    if (activeSection === 'shortcuts') {
      return (
        <div className="space-y-5">
          {shortcutGroups.map((group) => (
            <section key={group.title}>
              <h4 className="macos-text-title mb-2.5 text-sm font-semibold text-foreground">{group.title}</h4>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((shortcut) => (
                  <ShortcutTile key={`${group.title}-${shortcut.keys.join('-')}`} shortcut={shortcut} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cardsBySection[activeSection].map((item) => (
          <GuideCardItem key={item.title} item={item} />
        ))}
      </div>
    )
  }

  const ActiveIcon = active.icon
  const activeTranslationKey: Record<SectionId, string> = {
    'getting-started': 'gettingStarted',
    'file-management': 'fileManagement',
    reading: 'reading',
    search: 'search',
    plugins: 'plugins',
    'ai-assistant': 'aiAssistant',
    shortcuts: 'shortcuts'
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md macos-fade-in"
      onClick={handleBackdropClick}
    >
      <Card className="flex h-[680px] w-[940px] max-w-[96vw] flex-col overflow-hidden border border-border/30 shadow-2xl glass-effect macos-scale-in">
        <div className="flex items-center justify-between border-b border-border/20 bg-muted/10 px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="macos-text-title text-sm font-semibold leading-none text-foreground">{t('help.title')}</h2>
              <p className="mt-1 truncate text-xs text-muted-foreground">{t('help.subtitle')}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 rounded-md p-0 hover:bg-muted/50"
            title={t('ui.buttons.close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-60 flex-shrink-0 overflow-y-auto border-r border-border/20 bg-muted/20">
            <div className="p-3">
              <div className="mb-3 rounded-lg border border-border/30 bg-background/55 p-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  {t('help.navTitle')}
                </p>
                <p className="macos-text mt-1 text-sm leading-5 text-foreground/80">{t('help.navDescription')}</p>
              </div>

              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  const isActive = activeSection === section.id

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`
                        w-full rounded-lg border px-3 py-2.5 text-left transition-colors
                        ${isActive
                          ? 'border-primary/25 bg-primary/10 text-primary'
                          : 'border-transparent text-foreground hover:bg-muted/45'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">{section.label}</span>
                      </span>
                      <span className={`mt-1 block text-xs leading-4 ${isActive ? 'text-primary/75' : 'text-muted-foreground'}`}>
                        {section.summary}
                      </span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto bg-background content-scroll">
            <div className="space-y-5 p-5">
              <section className="relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-primary/10 via-background to-emerald-500/10 p-5 shadow-sm">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                    <ActiveIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{active.label}</span>
                    </div>
                    <h3 className="macos-text-title text-2xl font-bold leading-tight tracking-normal text-foreground">
                      {t(`help.${activeTranslationKey[activeSection]}.title`)}
                    </h3>
                    <p className="macos-text mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {t(`help.${activeTranslationKey[activeSection]}.description`)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div key={item.label} className="rounded-lg border border-border/35 bg-background/65 px-3 py-2 shadow-sm">
                      <div className="text-xs font-medium text-muted-foreground">{item.label}</div>
                      <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{item.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              {renderContent()}
            </div>
          </main>
        </div>
      </Card>
    </div>
  )
}
