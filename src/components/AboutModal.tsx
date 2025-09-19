'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Github, ExternalLink, Copy, Check } from 'lucide-react'
import { useT } from '@/lib/i18n'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const t = useT()
  // 复制状态
  const [copiedGithub, setCopiedGithub] = useState(false)
  const [copiedX, setCopiedX] = useState(false)

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // 防止背景滚动
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleGithubClick = async () => {
    const url = 'https://github.com/thejoven/hyperread'
    
    try {
      await navigator.clipboard.writeText(url)
      setCopiedGithub(true)
      setTimeout(() => setCopiedGithub(false), 2000)
    } catch (error) {
      console.error('Failed to copy GitHub URL:', error)
      // 备用方法
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedGithub(true)
      setTimeout(() => setCopiedGithub(false), 2000)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleXClick = async () => {
    const url = 'https://x.com/thejoven_com'
    
    try {
      await navigator.clipboard.writeText(url)
      setCopiedX(true)
      setTimeout(() => setCopiedX(false), 2000)
    } catch (error) {
      console.error('Failed to copy X URL:', error)
      // 备用方法
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedX(true)
      setTimeout(() => setCopiedX(false), 2000)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 macos-fade-in p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-[600px] max-w-[95vw] glass-effect border border-border/30 shadow-2xl macos-scale-in">
        <CardHeader className="pb-4 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 h-7 w-7 p-0 hover:bg-muted/60 rounded-full transition-colors"
            title={t('ui.buttons.close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="pt-0 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左侧：应用信息 */}
            <div className="space-y-4">
              {/* 应用图标和名称 */}
              <div className="text-center md:text-left space-y-3">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto md:mx-0 shadow-lg overflow-hidden">
                  <img 
                    src="./logo.png" 
                    alt="HyperRead Logo"
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      // 如果图片加载失败，显示默认emoji
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = '<span class="text-3xl">📚</span>'
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold macos-text-title">HyperRead</h2>
                  <p className="text-sm text-muted-foreground macos-text mt-1">
                    {t('app.subtitle')}
                  </p>
                </div>
              </div>

              {/* 版本信息 */}
              <div className="bg-muted/20 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold macos-text-title text-foreground">{t('about.appInfo')}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('about.version')}</span>
                    <span className="text-sm font-mono bg-muted/60 px-2 py-1 rounded-md">v1.2.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('about.platform')}</span>
                    <span className="text-sm font-mono bg-muted/60 px-2 py-1 rounded-md">
                      {window.electronAPI?.platform === 'darwin' ? 'macOS' : window.electronAPI?.platform || 'Web'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：功能特性 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold macos-text-title text-foreground mb-3">{t('about.features')}</h3>
                <div className="space-y-2">
                  {[
                    t('about.featureList.dragDrop'),
                    t('about.featureList.fileTree'),
                    t('about.featureList.charts'),
                    t('about.featureList.themes'),
                    t('about.featureList.multiLang'),
                    t('about.featureList.macOS')
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground macos-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GitHub 链接和版权 */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">GitHub:</div>
                  <Button
                    onClick={handleGithubClick}
                    className="w-full macos-button bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary hover:text-primary justify-between"
                    variant="outline"
                  >
                    <div className="flex items-center">
                      <Github className="w-4 h-4 mr-2" />
                      <span className="macos-text font-medium text-sm">github.com/thejoven/hyperread</span>
                    </div>
                    {copiedGithub ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-70" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">X (Twitter):</div>
                  <Button
                    onClick={handleXClick}
                    className="w-full macos-button bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary hover:text-primary justify-between"
                    variant="outline"
                  >
                    <div className="flex items-center">
                      <X className="w-4 h-4 mr-2" />
                      <span className="macos-text font-medium text-sm">x.com/thejoven_com</span>
                    </div>
                    {copiedX ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-70" />
                    )}
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground/60 macos-text">
                    © 2025 theJoven. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}