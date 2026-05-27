'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Minus,
  Plus,
  BookOpen,
  Languages,
  Check,
  Keyboard,
  ChevronRight,
  ChevronDown,
  Settings2,
  Info,
  Github,
  Copy,
  Puzzle,
  HelpCircle,
  FileText,
  FolderTree,
  BarChart2,
  Palette,
  Globe2,
  Apple,
  Sparkles,
  AtSign
} from 'lucide-react'
import packageJson from '../../package.json'
import { useTranslation } from '@/lib/i18n'
import { toast } from "sonner"
import ShortcutSettings from './ShortcutSettings'
import HelpDialog from './HelpDialog'
import PluginSettingsRenderer from './PluginSettingsRenderer'
import { usePlugins } from '@/contexts/PluginContext'
import type { DefaultDocumentAppAssociation, DefaultDocumentAppStatus } from '@/types/electron'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  contentWidth: 'narrow' | 'medium' | 'wide' | 'full'
  onContentWidthChange: (width: 'narrow' | 'medium' | 'wide' | 'full') => void
  primaryColor: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink'
  onPrimaryColorChange: (color: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink') => void
  showDocumentTitle: boolean
  onShowDocumentTitleChange: (show: boolean) => void
}

// 设置类别定义
interface SettingsCategory {
  id: string
  label: string
  icon: React.ReactNode
  children?: SettingsSubCategory[]
}

interface SettingsSubCategory {
  id: string
  label: string
  icon: React.ReactNode
}

const DEFAULT_APP_COPY = {
  zh: {
    category: '默认应用',
    title: '默认打开方式',
    description: '将 HyperRead 设为 Markdown 与 PDF 文档的默认应用。',
    setButton: '设为默认',
    settingButton: '设置中...',
    alreadyDefault: '已是默认',
    refresh: '刷新状态',
    unsupported: '此操作仅支持 macOS。',
    devMode: '开发模式仅可查看状态；请安装打包后的 HyperRead.app 后再设置默认打开方式。',
    unavailable: '当前环境不支持默认打开方式设置。',
    loadFailed: '读取默认打开方式失败。',
    success: '已将 HyperRead 设为默认打开方式',
    failed: '设置默认打开方式失败',
    statusDefault: 'HyperRead',
    statusOther: '当前：{handler}',
    statusUnknown: '未设置'
  },
  en: {
    category: 'Default App',
    title: 'Default Open With',
    description: 'Set HyperRead as the default app for Markdown and PDF documents.',
    setButton: 'Set as Default',
    settingButton: 'Setting...',
    alreadyDefault: 'Already Default',
    refresh: 'Refresh Status',
    unsupported: 'This action is only available on macOS.',
    devMode: 'Development mode can only inspect status. Install the packaged HyperRead.app before setting defaults.',
    unavailable: 'Default document app settings are unavailable in this environment.',
    loadFailed: 'Failed to read default document app status.',
    success: 'HyperRead is now the default document app',
    failed: 'Failed to set default document app',
    statusDefault: 'HyperRead',
    statusOther: 'Current: {handler}',
    statusUnknown: 'Not set'
  }
}

export default function SettingsModal({
  isOpen,
  onClose,
  fontSize,
  onFontSizeChange,
  contentWidth,
  onContentWidthChange,
  primaryColor,
  onPrimaryColorChange,
  showDocumentTitle,
  onShowDocumentTitleChange
}: SettingsModalProps) {
  const { t, currentLanguage, languages, changeLanguage } = useTranslation()
  const { plugins, manager } = usePlugins()
  const defaultAppCopy = currentLanguage === 'zh' ? DEFAULT_APP_COPY.zh : DEFAULT_APP_COPY.en
  const [activeCategory, setActiveCategory] = useState('reading')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['general']))
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false)
  const [defaultAppStatus, setDefaultAppStatus] = useState<DefaultDocumentAppStatus | null>(null)
  const [isDefaultAppBusy, setIsDefaultAppBusy] = useState(false)

  // 关于页复制状态
  const [aboutCopiedGithub, setAboutCopiedGithub] = useState(false)
  const [aboutCopiedX, setAboutCopiedX] = useState(false)

  // 动态设置分类，使用多语言（支持二级分类）
  const settingsCategories: SettingsCategory[] = [
    {
      id: 'general',
      label: t('settings.categories.general'),
      icon: <Settings2 className="w-4 h-4" />,
      children: [
        {
          id: 'reading',
          label: t('settings.categories.reading'),
          icon: <BookOpen className="w-3.5 h-3.5" />
        },
        {
          id: 'language',
          label: t('settings.categories.language'),
          icon: <Languages className="w-3.5 h-3.5" />
        },
        {
          id: 'shortcuts',
          label: t('settings.categories.shortcuts'),
          icon: <Keyboard className="w-3.5 h-3.5" />
        },
        {
          id: 'defaultApps',
          label: defaultAppCopy.category,
          icon: <FileText className="w-3.5 h-3.5" />
        }
      ]
    },
    {
      id: 'plugins',
      label: '插件',
      icon: <Puzzle className="w-4 h-4" />
    },
    // 底部增加"关于软件"入口
    {
      id: 'about',
      label: t('ui.buttons.about'),
      icon: <Info className="w-4 h-4" />
    }
  ]

  // 切换分类展开/收起
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const loadDefaultDocumentAppStatus = useCallback(async () => {
    if (!window.electronAPI?.getDefaultDocumentAppStatus) {
      setDefaultAppStatus({
        supported: false,
        isPackaged: false,
        bundleId: 'com.thejoven.hyperread',
        associations: [],
        isDefault: false,
        success: false,
        error: defaultAppCopy.unavailable
      })
      return
    }

    setIsDefaultAppBusy(true)
    try {
      const status = await window.electronAPI.getDefaultDocumentAppStatus()
      setDefaultAppStatus(status)
    } catch (error) {
      setDefaultAppStatus({
        supported: window.electronAPI?.platform === 'darwin',
        isPackaged: false,
        bundleId: 'com.thejoven.hyperread',
        associations: [],
        isDefault: false,
        success: false,
        error: error instanceof Error ? error.message : defaultAppCopy.loadFailed
      })
    } finally {
      setIsDefaultAppBusy(false)
    }
  }, [defaultAppCopy])

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && activeCategory === 'defaultApps') {
      void loadDefaultDocumentAppStatus()
    }
  }, [activeCategory, isOpen, loadDefaultDocumentAppStatus])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleFontSizeDecrease = () => {
    const newSize = Math.max(12, fontSize - 2)
    onFontSizeChange(newSize)
  }

  const handleFontSizeIncrease = () => {
    const newSize = Math.min(24, fontSize + 2)
    onFontSizeChange(newSize)
  }

  const handleFontSizeReset = () => {
    onFontSizeChange(16)
  }

  // 渲染阅读设置内容
  const renderReadingSettings = () => {
    const widthOptions = [
      { value: 'narrow' as const, label: t('settings.reading.widthNarrow'), description: '672px' },
      { value: 'medium' as const, label: t('settings.reading.widthMedium'), description: '896px' },
      { value: 'wide' as const, label: t('settings.reading.widthWide'), description: '1152px' },
      { value: 'full' as const, label: t('settings.reading.widthFull'), description: t('settings.reading.widthFullDesc') }
    ]

    const colorOptions = [
      { value: 'cyan' as const, label: t('settings.reading.colorCyan'), color: 'hsl(183, 70%, 45%)' },
      { value: 'blue' as const, label: t('settings.reading.colorBlue'), color: 'hsl(217, 91%, 60%)' },
      { value: 'purple' as const, label: t('settings.reading.colorPurple'), color: 'hsl(262, 83%, 58%)' },
      { value: 'green' as const, label: t('settings.reading.colorGreen'), color: 'hsl(142, 76%, 36%)' },
      { value: 'orange' as const, label: t('settings.reading.colorOrange'), color: 'hsl(24, 94%, 50%)' },
      { value: 'pink' as const, label: t('settings.reading.colorPink'), color: 'hsl(330, 81%, 60%)' }
    ]

    return (
      <div className="space-y-2">
        {/* 字体大小设置 - 一行布局 */}
        <div className="flex items-center justify-between py-2 px-3 bg-muted/20 rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground">{t('settings.reading.fontSize')}</label>
            <p className="text-xs text-muted-foreground">{t('settings.reading.fontSizeDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFontSizeDecrease}
              disabled={fontSize <= 12}
              className="h-7 w-7 p-0 macos-button"
              title={t('settings.reading.decrease')}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-mono bg-muted/60 px-2 py-1 rounded-md min-w-[3rem] text-center">
              {fontSize}px
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFontSizeIncrease}
              disabled={fontSize >= 24}
              className="h-7 w-7 p-0 macos-button"
              title={t('settings.reading.increase')}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* 重置按钮 - 单独一行 */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFontSizeReset}
            className="macos-button text-xs h-7"
          >
            {t('settings.reading.resetDefault')} (16px)
          </Button>
        </div>

        {/* 内容宽度设置 */}
        <div className="py-2 px-3 bg-muted/20 rounded-lg">
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground">{t('settings.reading.contentWidth')}</label>
            <p className="text-xs text-muted-foreground">{t('settings.reading.contentWidthDesc')}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {widthOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onContentWidthChange(option.value)}
                className={`px-3 py-2 text-left rounded-lg border transition-all ${
                  contentWidth === option.value
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-muted/30 border-border/30 hover:bg-muted/50'
                }`}
              >
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 侧栏文档标题显示 */}
        <div className="flex items-center justify-between gap-4 py-2 px-3 bg-muted/20 rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground">{t('settings.reading.showDocumentTitle')}</label>
            <p className="text-xs text-muted-foreground">{t('settings.reading.showDocumentTitleDesc')}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showDocumentTitle}
            onClick={() => onShowDocumentTitleChange(!showDocumentTitle)}
            className={`relative h-6 w-11 flex-shrink-0 rounded-full border transition-colors ${
              showDocumentTitle
                ? 'border-primary/40 bg-primary'
                : 'border-border/60 bg-muted/70 hover:bg-muted'
            }`}
            title={t('settings.reading.showDocumentTitle')}
          >
            <span
              className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background shadow-sm transition-transform ${
                showDocumentTitle ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 主配色设置 */}
        <div className="py-2 px-3 bg-muted/20 rounded-lg">
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground">{t('settings.reading.primaryColor')}</label>
            <p className="text-xs text-muted-foreground">{t('settings.reading.primaryColorDesc')}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onPrimaryColorChange(option.value)}
                className={`px-3 py-2 text-left rounded-lg border transition-all flex items-center gap-2 ${
                  primaryColor === option.value
                    ? 'bg-primary/10 border-primary/30 text-primary ring-2 ring-primary/20'
                    : 'bg-muted/30 border-border/30 hover:bg-muted/50'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: option.color }}
                />
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 渲染语言设置内容
  const renderLanguageSettings = () => {
    return (
      <div className="space-y-2">
        {/* 语言选择 */}
        <div className="py-2 px-3 bg-muted/20 rounded-lg">
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground">{t('settings.language.title')}</label>
            <p className="text-xs text-muted-foreground">{t('settings.language.description')}</p>
          </div>
          <div className="space-y-2">
            {languages.map((language) => (
              <Button
                key={language.code}
                variant={currentLanguage === language.code ? "default" : "outline"}
                size="sm"
                onClick={() => changeLanguage(language.code)}
                className="w-full justify-between h-8 macos-button"
              >
                <span className="flex items-center gap-2">
                  <span>{language.nativeName}</span>
                  <span className="text-xs text-muted-foreground">({language.name})</span>
                </span>
                {currentLanguage === language.code && (
                  <Check className="h-3 w-3" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 渲染快捷键设置内容
  const renderShortcutSettings = () => {
    return <ShortcutSettings />
  }

  const handleSetDefaultDocumentApp = async () => {
    if (!window.electronAPI?.setDefaultDocumentApp) {
      toast.error(defaultAppCopy.unavailable)
      return
    }

    setIsDefaultAppBusy(true)
    try {
      const status = await window.electronAPI.setDefaultDocumentApp()
      setDefaultAppStatus(status)

      if (status.success) {
        toast.success(defaultAppCopy.success)
      } else {
        toast.error(status.error || defaultAppCopy.failed)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : defaultAppCopy.failed)
    } finally {
      setIsDefaultAppBusy(false)
    }
  }

  const renderDefaultAppSettings = () => {
    const isMac = window.electronAPI?.platform === 'darwin'
    const fallbackAssociations: DefaultDocumentAppAssociation[] = [
      { extension: 'md', label: 'Markdown', isDefault: false },
      { extension: 'markdown', label: 'Markdown', isDefault: false },
      { extension: 'pdf', label: 'PDF', isDefault: false }
    ]
    const associations: DefaultDocumentAppAssociation[] = defaultAppStatus?.associations?.length
      ? defaultAppStatus.associations
      : fallbackAssociations
    const canSetDefault = isMac && !isDefaultAppBusy && !defaultAppStatus?.isDefault

    return (
      <div className="space-y-3">
        <div className="py-3 px-3 bg-muted/20 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <label className="text-sm font-medium text-foreground">{defaultAppCopy.title}</label>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {defaultAppCopy.description}
              </p>
            </div>
            <Button
              variant={defaultAppStatus?.isDefault ? 'outline' : 'default'}
              size="sm"
              onClick={handleSetDefaultDocumentApp}
              disabled={!canSetDefault}
              className="h-8 flex-shrink-0 gap-1.5 px-3 text-xs"
              title={defaultAppCopy.setButton}
            >
              {defaultAppStatus?.isDefault ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )}
              <span>
                {isDefaultAppBusy
                  ? defaultAppCopy.settingButton
                  : defaultAppStatus?.isDefault
                    ? defaultAppCopy.alreadyDefault
                    : defaultAppCopy.setButton}
              </span>
            </Button>
          </div>

          {!isMac && (
            <p className="mt-3 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              {defaultAppCopy.unsupported}
            </p>
          )}

          {isMac && defaultAppStatus && !defaultAppStatus.isPackaged && (
            <p className="mt-3 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              {defaultAppCopy.devMode}
            </p>
          )}

          {defaultAppStatus?.error && (
            <p className="mt-3 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {defaultAppStatus.error}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {associations.map((item) => (
            <div
              key={item.extension}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-muted/15 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="rounded-md border border-border/40 bg-background px-2 py-1 font-mono text-xs font-semibold">
                  .{item.extension}
                </span>
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
              <div className="flex min-w-0 items-center gap-1.5 text-right">
                {item.isDefault && <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />}
                <span
                  className={`truncate text-xs ${
                    item.isDefault ? 'text-emerald-600 dark:text-emerald-300' : 'text-muted-foreground'
                  }`}
                >
                  {item.isDefault
                    ? defaultAppCopy.statusDefault
                    : item.currentHandler
                      ? defaultAppCopy.statusOther.replace('{handler}', item.currentHandler)
                      : defaultAppCopy.statusUnknown}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDefaultDocumentAppStatus}
            disabled={isDefaultAppBusy}
            className="h-7 px-3 text-xs"
          >
            {defaultAppCopy.refresh}
          </Button>
        </div>
      </div>
    )
  }

  // 渲染关于软件内容（迁移自 AboutModal）
  const renderAboutSettings = () => {
    const version = packageJson.version
    const platform = (window as any).electronAPI?.platform === 'darwin' ? 'macOS' : (window as any).electronAPI?.platform || 'Web'

    const copyToClipboard = async (text: string, setCopied: (copied: boolean) => void) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }

      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }

    const appInfo = [
      { label: t('about.version'), value: `v${version}` },
      { label: t('about.platform'), value: platform }
    ]

    const features = [
      {
        icon: FileText,
        label: t('about.featureList.dragDrop'),
        className: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20'
      },
      {
        icon: FolderTree,
        label: t('about.featureList.fileTree'),
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20'
      },
      {
        icon: BarChart2,
        label: t('about.featureList.charts'),
        className: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20'
      },
      {
        icon: Palette,
        label: t('about.featureList.themes'),
        className: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/20'
      },
      {
        icon: Globe2,
        label: t('about.featureList.multiLang'),
        className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20'
      },
      {
        icon: Apple,
        label: t('about.featureList.macOS'),
        className: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-200 border-zinc-500/20'
      }
    ]

    const links = [
      {
        label: 'GitHub',
        value: 'github.com/thejoven/hyperread',
        url: 'https://github.com/thejoven/hyperread',
        icon: Github,
        copied: aboutCopiedGithub,
        setCopied: setAboutCopiedGithub
      },
      {
        label: 'X',
        value: 'x.com/thejoven_com',
        url: 'https://x.com/thejoven_com',
        icon: AtSign,
        copied: aboutCopiedX,
        setCopied: setAboutCopiedX
      }
    ]

    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-primary/15 via-background to-emerald-500/10 p-4 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[16px] border border-white/40 bg-background/80 shadow-lg shadow-primary/10 ring-1 ring-primary/15">
              <img
                src="./logo.png"
                alt="HyperRead Logo"
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = '<span class="text-xl font-semibold">HR</span>'
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t('about.title')}</span>
              </div>
              <h2 className="macos-text-title text-2xl font-bold leading-tight tracking-normal text-foreground">
                HyperRead
              </h2>
              <p className="macos-text mt-1 max-w-md text-sm leading-5 text-muted-foreground">
                {t('about.description')}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {appInfo.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border/35 bg-background/65 px-3 py-2 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 sm:block">
                  <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                  <span className="font-mono text-sm font-semibold text-foreground sm:mt-0.5 sm:block">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
            {links.map(({ label, value, url, icon: Icon, copied, setCopied }) => (
              <button
                key={label}
                type="button"
                onClick={() => copyToClipboard(url, setCopied)}
                className="rounded-lg border border-border/35 bg-background/65 px-3 py-2 text-left shadow-sm transition-colors hover:bg-background/90"
                aria-label={`${label}: ${value}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
                  </span>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                  )}
                </span>
                <span className="mt-0.5 block truncate text-sm font-semibold text-foreground">{value}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <h3 className="macos-text-title text-sm font-semibold text-foreground">{t('about.features')}</h3>
            <span className="rounded-full border border-border/30 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
              {t('app.subtitle')}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {features.map(({ icon: Icon, label, className }) => (
              <div
                key={label}
                className="flex min-h-[54px] items-start gap-2.5 rounded-lg border border-border/35 bg-muted/15 p-2.5 transition-colors hover:bg-muted/25"
              >
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${className}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="macos-text text-sm leading-5 text-foreground/85">{label}</span>
              </div>
            ))}
          </div>

          <p className="macos-text pt-2 text-center text-xs text-muted-foreground/60">
            © 2025 theJoven. All rights reserved.
          </p>
        </div>
      </div>
    )
  }

  // 渲染插件设置
  const renderPluginsSettings = () => {
    const handleInstall = async () => {
      const zipPath = await window.electronAPI?.pluginAPI?.openZipDialog()
      if (!zipPath) return
      try {
        const result = await window.electronAPI?.pluginAPI?.installZip(zipPath)
        if (result?.success) {
          toast.success(`插件 "${result.manifest.name}" 安装成功`)
          await manager?.initialize()
        }
      } catch (e) {
        toast.error('安装失败：' + (e as Error).message)
      }
    }

    const handleRefresh = async () => {
      await manager?.initialize()
    }

    const handleUninstalled = async () => {
      await manager?.initialize()
    }

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3 py-2 px-3 bg-muted/20 rounded-lg">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">已安装插件</label>
            <p className="text-xs text-muted-foreground">
              支持从 .zip 文件安装，包内须有 manifest.json 和 main.js。
            </p>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <Button
              variant="default"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={handleInstall}
            >
              安装插件
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleRefresh}
            >
              刷新
            </Button>
          </div>
        </div>
        {plugins.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">未安装任何插件</p>
            <p className="text-xs text-muted-foreground mt-1">点击"安装插件"选择 .zip 文件</p>
          </div>
        ) : (
          <div className="space-y-2">
            {plugins.map(plugin => (
              <PluginSettingsRenderer key={plugin.manifest.id} plugin={plugin} onUninstalled={handleUninstalled} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // 渲染分类内容
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'reading':
        return renderReadingSettings()
      case 'language':
        return renderLanguageSettings()
      case 'shortcuts':
        return renderShortcutSettings()
      case 'defaultApps':
        return renderDefaultAppSettings()
      case 'plugins':
        return renderPluginsSettings()
      case 'about':
        return renderAboutSettings()
      default:
        return renderReadingSettings()
    }
  }

  return (
    <>
      <HelpDialog isOpen={isHelpDialogOpen} onClose={() => setIsHelpDialogOpen(false)} />
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 macos-fade-in p-4"
        onClick={handleBackdropClick}
      >
        <Card className="w-[800px] h-[600px] glass-effect border border-border/30 shadow-2xl macos-scale-in overflow-hidden flex flex-col">
          {/* 主体内容区 - 固定高度，横向布局 */}
          <div className="flex flex-1 overflow-hidden">
            {/* 左侧导航栏 - 灰色背景，增加宽度以支持二级分类 */}
            <div className="w-48 bg-muted/30 border-r border-border/20 flex-shrink-0 overflow-y-auto flex flex-col">
            <div className="p-3">
              <nav className="space-y-1">
                {settingsCategories.map((category) => (
                  <div key={category.id}>
                    {/* 一级分类 */}
                    <button
                      onClick={() => {
                        if (category.children && category.children.length > 0) {
                          toggleCategory(category.id)
                        } else {
                          setActiveCategory(category.id)
                        }
                      }}
                      className={`
                        w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors
                        ${!category.children && activeCategory === category.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'hover:bg-muted/50 text-foreground'
                        }
                      `}
                    >
                      {category.icon}
                      <span className="text-sm font-medium flex-1">{category.label}</span>
                      {category.children && category.children.length > 0 && (
                        expandedCategories.has(category.id)
                          ? <ChevronDown className="w-3.5 h-3.5" />
                          : <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* 二级分类 */}
                    {category.children && expandedCategories.has(category.id) && (
                      <div className="ml-2 mt-1 space-y-1">
                        {category.children.map((subCategory) => (
                          <button
                            key={subCategory.id}
                            onClick={() => setActiveCategory(subCategory.id)}
                            className={`
                              w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left transition-colors
                              ${activeCategory === subCategory.id
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                              }
                            `}
                          >
                            {subCategory.icon}
                            <span className="text-xs">{subCategory.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            {/* 左下角帮助按钮 */}
            <div className="mt-auto p-3 border-t border-border/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHelpDialogOpen(true)}
                className="w-full h-9 macos-button justify-start"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">{t('help.buttonText')}</span>
              </Button>
            </div>
          </div>

          {/* 右侧内容区 - 白色背景，可滚动 */}
          <div className="flex-1 bg-background overflow-y-auto">
            <div className="p-6">
              {renderCategoryContent()}
            </div>
          </div>
        </div>
      </Card>
    </div>
    </>
  )
}
