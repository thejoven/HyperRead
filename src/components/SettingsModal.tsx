'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Minus, Plus, BookOpen, Languages, Check } from 'lucide-react'
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
    }
  ]

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

  // 渲染分类内容
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'reading':
        return renderReadingSettings()
      case 'language':
        return renderLanguageSettings()
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