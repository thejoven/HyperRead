'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Minus, Plus } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  fontSize: number
  onFontSizeChange: (size: number) => void
}

export default function SettingsModal({ isOpen, onClose, fontSize, onFontSizeChange }: SettingsModalProps) {
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

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 macos-fade-in p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-[400px] max-w-[90vw] glass-effect border border-border/30 shadow-2xl macos-scale-in">
        <CardHeader className="pb-4 relative">
          <CardTitle className="text-lg font-semibold macos-text-title">设置</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 h-7 w-7 p-0 hover:bg-muted/60 rounded-full transition-colors"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="pt-0 pb-6">
          <div className="space-y-6">
            {/* 字体大小设置 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold macos-text-title text-foreground">阅读设置</h3>
              
              <div className="bg-muted/20 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">字体大小</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFontSizeDecrease}
                      disabled={fontSize <= 12}
                      className="h-8 w-8 p-0 macos-button"
                      title="减小字体"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-mono bg-muted/60 px-3 py-1 rounded-md min-w-[3rem] text-center">
                      {fontSize}px
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFontSizeIncrease}
                      disabled={fontSize >= 24}
                      className="h-8 w-8 p-0 macos-button"
                      title="增大字体"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {/* 字体大小预览 */}
                <div className="p-3 bg-background/60 rounded-lg border border-border/30">
                  <p className="text-muted-foreground text-xs mb-2">预览效果：</p>
                  <p style={{ fontSize: `${fontSize}px` }} className="macos-text">
                    这是一段示例文本，用于预览当前字体大小的效果。
                  </p>
                </div>
                
                {/* 重置按钮 */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFontSizeReset}
                    className="macos-button"
                  >
                    重置为默认 (16px)
                  </Button>
                </div>
              </div>
            </div>

            {/* 其他设置可以在这里添加 */}
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground/60 macos-text">
                更多设置功能即将推出
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}