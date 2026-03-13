'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Minus, Plus, BookOpen, Languages, Check, Keyboard, ChevronRight, ChevronDown, Settings2, Info, Github, Copy, Check as CheckIcon, X as XIcon, Puzzle, HelpCircle } from 'lucide-react'
import packageJson from '../../package.json'
import { useTranslation } from '@/lib/i18n'
import { toast } from "sonner"
import ShortcutSettings from './ShortcutSettings'
import HelpDialog from './HelpDialog'
import PluginSettingsRenderer from './PluginSettingsRenderer'
import { usePlugins } from '@/contexts/PluginContext'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  contentWidth: 'narrow' | 'medium' | 'wide' | 'full'
  onContentWidthChange: (width: 'narrow' | 'medium' | 'wide' | 'full') => void
  primaryColor: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink'
  onPrimaryColorChange: (color: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink') => void
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

export default function SettingsModal({ isOpen, onClose, fontSize, onFontSizeChange, contentWidth, onContentWidthChange, primaryColor, onPrimaryColorChange }: SettingsModalProps) {
  const { t, currentLanguage, languages, changeLanguage } = useTranslation()
  const { plugins, manager } = usePlugins()
  const [activeCategory, setActiveCategory] = useState('reading')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['general']))
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false)

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

  // 渲染关于软件内容（迁移自 AboutModal）
  const renderAboutSettings = () => {
    const version = packageJson.version
    const platform = (window as any).electronAPI?.platform === 'darwin' ? 'macOS' : (window as any).electronAPI?.platform || 'Web'

    const copyToClipboard = async (text: string, onDone: () => void) => {
      try {
        await navigator.clipboard.writeText(text)
        onDone()
        setTimeout(onDone, 1500)
      } catch {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        onDone()
        setTimeout(onDone, 1500)
      }
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="text-center md:text-left space-y-3">
            <div className="w-20 h-20 flex items-center justify-center mx-auto md:mx-0">
              <img src="./logo.png" alt="HyperRead Logo" className="w-20 h-20 object-contain"
                onError={(e) => { const t=e.target as HTMLImageElement; t.style.display='none'; t.parentElement!.innerHTML='<span class="text-3xl">📚</span>' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold macos-text-title">HyperRead</h2>
              <p className="text-sm text-muted-foreground macos-text mt-1">{t('app.subtitle')}</p>
            </div>
          </div>

          <div className="bg-muted/20 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold macos-text-title text-foreground">{t('about.appInfo')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('about.version')}</span>
                <span className="text-sm font-mono bg-muted/60 px-2 py-1 rounded-md">v{version}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('about.platform')}</span>
                <span className="text-sm font-mono bg-muted/60 px-2 py-1 rounded-md">{platform}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold macos-text-title text-foreground mb-3">{t('about.features')}</h3>
            <div className="space-y-2">
              {[ t('about.featureList.dragDrop'), t('about.featureList.fileTree'), t('about.featureList.charts'), t('about.featureList.themes'), t('about.featureList.multiLang'), t('about.featureList.macOS')].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground macos-text">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">GitHub:</div>
              <Button onClick={() => copyToClipboard('https://github.com/thejoven/hyperread', () => setAboutCopiedGithub(v=>!v))} className="w-full macos-button bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary hover:text-primary justify-between" variant="outline">
                <div className="flex items-center">
                  <Github className="w-4 h-4 mr-2" />
                  <span className="macos-text font-medium text-sm">github.com/thejoven/hyperread</span>
                </div>
                {aboutCopiedGithub ? (<CheckIcon className="w-3.5 h-3.5 text-green-500" />) : (<Copy className="w-3.5 h-3.5 opacity-70" />)}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">X (Twitter):</div>
              <Button onClick={() => copyToClipboard('https://x.com/thejoven_com', () => setAboutCopiedX(v=>!v))} className="w-full macos-button bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary hover:text-primary justify-between" variant="outline">
                <div className="flex items-center">
                  <XIcon className="w-4 h-4 mr-2" />
                  <span className="macos-text font-medium text-sm">x.com/thejoven_com</span>
                </div>
                {aboutCopiedX ? (<CheckIcon className="w-3.5 h-3.5 text-green-500" />) : (<Copy className="w-3.5 h-3.5 opacity-70" />)}
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground/60 macos-text">© 2025 theJoven. All rights reserved.</p>
            </div>
          </div>
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
