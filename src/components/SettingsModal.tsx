'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Minus, Plus, BookOpen, Languages, Check, Bot, Key, Globe, Cpu } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  fontSize: number
  onFontSizeChange: (size: number) => void
}

// 设置类别定义
interface SettingsCategory {
  id: string
  label: string
  icon: React.ReactNode
}

export default function SettingsModal({ isOpen, onClose, fontSize, onFontSizeChange }: SettingsModalProps) {
  const { t, currentLanguage, languages, changeLanguage } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('reading')

  // AI 配置状态
  const [aiConfig, setAiConfig] = useState({
    provider: 'openai',
    apiKey: '',
    apiUrl: '',
    model: '',
    isConfigured: false
  })
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle')

  // 动态设置分类，使用多语言
  const settingsCategories: SettingsCategory[] = [
    {
      id: 'reading',
      label: t('settings.categories.reading'),
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'language',
      label: t('settings.categories.language'),
      icon: <Languages className="w-4 h-4" />
    },
    {
      id: 'ai',
      label: t('settings.categories.ai'),
      icon: <Bot className="w-4 h-4" />
    }
  ]

  // 加载 AI 配置
  useEffect(() => {
    const savedAiConfig = localStorage.getItem('ai-config')
    if (savedAiConfig) {
      try {
        const config = JSON.parse(savedAiConfig)
        setAiConfig(prev => ({
          ...prev,
          ...config,
          isConfigured: !!(config.apiKey && config.model)
        }))
      } catch (error) {
        console.error('Failed to load AI config:', error)
      }
    }
  }, [])

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

  // AI 配置处理函数
  const saveAiConfig = () => {
    try {
      localStorage.setItem('ai-config', JSON.stringify(aiConfig))
      setAiConfig(prev => ({
        ...prev,
        isConfigured: !!(aiConfig.apiKey && aiConfig.model)
      }))
      alert(t('common.success'))
    } catch (error) {
      console.error('Failed to save AI config:', error)
      alert(t('common.error'))
    }
  }

  const testConnection = async () => {
    if (!aiConfig.apiKey || !aiConfig.model) {
      alert('请先填写 API Key 和模型名称')
      return
    }

    setConnectionStatus('testing')

    try {
      // 动态导入 AI 服务
      const { createAiService } = await import('@/lib/ai-service')
      const aiService = createAiService({
        ...aiConfig,
        isConfigured: true
      })

      const success = await aiService.testConnection()
      setConnectionStatus(success ? 'success' : 'failed')

      setTimeout(() => setConnectionStatus('idle'), 3000)
    } catch (error) {
      console.error('Connection test failed:', error)
      setConnectionStatus('failed')
      setTimeout(() => setConnectionStatus('idle'), 3000)
    }
  }

  // 渲染 AI 设置内容
  const renderAiSettings = () => {
    return (
      <div className="space-y-4">
        {/* AI 服务商选择 */}
        <div className="py-2 px-3 bg-muted/20 rounded-lg">
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground">{t('settings.ai.provider')}</label>
            <p className="text-xs text-muted-foreground">{t('settings.ai.description')}</p>
          </div>
          <div className="space-y-2">
            {[
              { value: 'openai', label: t('settings.ai.providerOptions.openai') },
              { value: 'anthropic', label: t('settings.ai.providerOptions.anthropic') },
              { value: 'custom', label: t('settings.ai.providerOptions.custom') }
            ].map((provider) => (
              <Button
                key={provider.value}
                variant={aiConfig.provider === provider.value ? "default" : "outline"}
                size="sm"
                onClick={() => setAiConfig(prev => ({ ...prev, provider: provider.value }))}
                className="w-full justify-start h-8 macos-button"
              >
                {provider.label}
                {aiConfig.provider === provider.value && (
                  <Check className="h-3 w-3 ml-auto" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* API 配置 */}
        <div className="space-y-3">
          {/* API Key */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Key className="w-3 h-3" />
              {t('settings.ai.apiKey')}
            </label>
            <Input
              type="password"
              placeholder={t('settings.ai.apiKeyPlaceholder')}
              value={aiConfig.apiKey}
              onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              className="h-8"
            />
          </div>

          {/* API URL */}
          {(aiConfig.provider === 'custom' || aiConfig.provider === 'anthropic') && (
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Globe className="w-3 h-3" />
                {t('settings.ai.apiUrl')}
              </label>
              <Input
                type="url"
                placeholder={aiConfig.provider === 'anthropic' ? 'https://api.anthropic.com' : t('settings.ai.apiUrlPlaceholder')}
                value={aiConfig.apiUrl}
                onChange={(e) => setAiConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
                className="h-8"
              />
            </div>
          )}

          {/* 模型选择 */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Cpu className="w-3 h-3" />
              {t('settings.ai.model')}
            </label>
            <Input
              placeholder={
                aiConfig.provider === 'openai' ? 'gpt-4-turbo-preview' :
                aiConfig.provider === 'anthropic' ? 'claude-3-sonnet-20240229' :
                t('settings.ai.modelPlaceholder')
              }
              value={aiConfig.model}
              onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
              className="h-8"
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={connectionStatus === 'testing' || !aiConfig.apiKey || !aiConfig.model}
            className="flex-1 h-8 macos-button"
          >
            {connectionStatus === 'testing' ? t('settings.ai.status.testing') : t('settings.ai.testConnection')}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={saveAiConfig}
            className="flex-1 h-8 macos-button"
          >
            {t('settings.ai.saveConfig')}
          </Button>
        </div>

        {/* 状态指示 */}
        {connectionStatus !== 'idle' && (
          <div className={`text-xs text-center p-2 rounded ${
            connectionStatus === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            connectionStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
            {t(`settings.ai.status.${connectionStatus}`)}
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
      case 'ai':
        return renderAiSettings()
      default:
        return renderReadingSettings()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 macos-fade-in p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-[500px] max-w-[90vw] h-auto glass-effect border border-border/30 shadow-2xl macos-scale-in overflow-hidden">
        {/* 主体内容区 - 单列布局 */}
        <div className="flex">
          {/* 左侧导航栏 - 灰色背景，缩小宽度 */}
          <div className="w-32 bg-muted/30 border-r border-border/20 flex-shrink-0">
            <div className="p-2">
              <nav className="space-y-1">
                {settingsCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`
                      w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors
                      ${activeCategory === category.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    {category.icon}
                    <span className="text-xs font-medium">{category.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* 右侧内容区 - 白色背景 */}
          <div className="flex-1 bg-background">
            <div className="p-4">
              {renderCategoryContent()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}