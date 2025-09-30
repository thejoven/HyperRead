'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { ShortcutConfig } from '@/contexts/ShortcutContext'

interface ShortcutRecorderProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (keys: string[]) => void
  currentShortcut?: ShortcutConfig
  conflictingShortcut?: ShortcutConfig | null
}

// 格式化按键名称
function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    'Meta': 'Cmd',
    'Control': 'Ctrl',
    'Alt': 'Alt',
    'Shift': 'Shift',
    ' ': 'Space',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Escape': 'Esc',
    'Backspace': '⌫',
    'Delete': '⌦',
    'Enter': '↵',
    'Tab': '⇥'
  }
  return keyMap[key] || key.toUpperCase()
}

// 标准化按键组合
function normalizeKeys(keys: string[]): string[] {
  const order = ['cmd', 'ctrl', 'alt', 'shift']
  const modifiers: string[] = []
  const regularKeys: string[] = []

  keys.forEach(key => {
    const lowerKey = key.toLowerCase()
    if (order.includes(lowerKey)) {
      modifiers.push(lowerKey)
    } else {
      regularKeys.push(lowerKey)
    }
  })

  // 按标准顺序排序修饰键
  modifiers.sort((a, b) => order.indexOf(a) - order.indexOf(b))

  return [...modifiers, ...regularKeys]
}

export default function ShortcutRecorder({
  isOpen,
  onClose,
  onConfirm,
  currentShortcut,
  conflictingShortcut
}: ShortcutRecorderProps) {
  const { t } = useTranslation()
  const [recordedKeys, setRecordedKeys] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)

  // 双击检测状态
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null)
  const [lastPressTime, setLastPressTime] = useState<number>(0)

  // 重置录制状态
  const resetRecording = useCallback(() => {
    setRecordedKeys([])
    setIsRecording(false)
    setLastPressedKey(null)
    setLastPressTime(0)
  }, [])

  // 处理按键事件
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // ESC 键关闭录制
      if (e.key === 'Escape') {
        onClose()
        return
      }

      const currentTime = Date.now()
      const timeDiff = currentTime - lastPressTime

      // 检测双击（同一个键在500ms内按两次）
      if (['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) {
        if (lastPressedKey === e.key && timeDiff < 500) {
          // 双击检测成功
          setIsRecording(true)
          const keyName = e.key.toLowerCase()
          setRecordedKeys([keyName, keyName])
          setLastPressedKey(null)
          setLastPressTime(0)
          return
        } else {
          // 记录第一次按下
          setLastPressedKey(e.key)
          setLastPressTime(currentTime)
          setIsRecording(true)
          return
        }
      }

      // 重置双击检测
      setLastPressedKey(null)
      setLastPressTime(0)
      setIsRecording(true)

      const keys: string[] = []

      // 检测平台并使用对应的修饰键
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

      if (isMac) {
        if (e.metaKey) keys.push('cmd')
      } else {
        if (e.ctrlKey) keys.push('ctrl')
      }

      if (e.altKey) keys.push('alt')
      if (e.shiftKey) keys.push('shift')

      // 添加主键
      keys.push(e.key.toLowerCase())

      setRecordedKeys(normalizeKeys(keys))
    }

    const handleKeyUp = () => {
      // 键抬起时停止录制动画
      setIsRecording(false)
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isOpen, onClose, lastPressedKey, lastPressTime])

  // 关闭时重置状态
  useEffect(() => {
    if (!isOpen) {
      resetRecording()
    }
  }, [isOpen, resetRecording])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (recordedKeys.length > 0) {
      // 检测是否为双击（两个相同的键）
      const isDoublePress = recordedKeys.length === 2 && recordedKeys[0] === recordedKeys[1]

      if (isDoublePress) {
        // 双击保存为一个字符串，用空格分隔
        onConfirm([`${recordedKeys[0]} ${recordedKeys[1]}`])
      } else {
        // 组合键保存为一个字符串，用+分隔
        onConfirm([recordedKeys.join('+')])
      }
      resetRecording()
    }
  }

  const handleCancel = () => {
    onClose()
    resetRecording()
  }

  // 显示按键组合
  // 检测是否为双击（两个相同的键）
  const isDoublePress = recordedKeys.length === 2 && recordedKeys[0] === recordedKeys[1]
  const displayKeys = recordedKeys.length > 0
    ? (isDoublePress
        ? recordedKeys.map(formatKey).join(' ')  // 双击用空格分隔
        : recordedKeys.map(formatKey).join(' + '))  // 组合键用+分隔
    : t('shortcuts.pressKeys')

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[60] macos-fade-in p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-[450px] max-w-[90vw] glass-effect border border-border/30 shadow-2xl macos-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <div>
            <h3 className="text-lg font-semibold">{t('shortcuts.recording')}</h3>
            {currentShortcut && (
              <p className="text-sm text-muted-foreground mt-1">
                {t(currentShortcut.description)}
              </p>
            )}
          </div>
          <button
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recording Area */}
        <div className="p-6 space-y-4">
          <div
            className={`
              relative p-8 rounded-lg border-2 border-dashed
              transition-all duration-200
              ${isRecording
                ? 'border-primary bg-primary/5 scale-105'
                : 'border-muted-foreground/30 bg-muted/20'
              }
            `}
          >
            <div className="text-center">
              <div className={`
                text-2xl font-mono font-semibold mb-2
                ${recordedKeys.length > 0 ? 'text-foreground' : 'text-muted-foreground'}
              `}>
                {displayKeys}
              </div>
              {recordedKeys.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('shortcuts.pressKeys')}
                </p>
              )}
            </div>

            {/* Recording Pulse Animation */}
            {isRecording && (
              <div className="absolute inset-0 rounded-lg">
                <div className="absolute inset-0 rounded-lg bg-primary/10 animate-pulse" />
              </div>
            )}
          </div>

          {/* Current Keys */}
          {currentShortcut && currentShortcut.keys.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted/20 rounded-lg">
              <span>{t('shortcuts.currentShortcut')}:</span>
              <span className="font-mono">
                {currentShortcut.keys.map(formatKey).join(' + ')}
              </span>
            </div>
          )}

          {/* Conflict Warning */}
          {conflictingShortcut && (
            <div className="flex items-start gap-2 text-xs text-orange-600 dark:text-orange-400 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{t('shortcuts.conflictDetected')}</p>
                <p className="mt-1 text-muted-foreground">
                  {t(conflictingShortcut.description)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-border/20 bg-muted/10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex-1 h-9 macos-button"
          >
            {t('shortcuts.cancel')}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleConfirm}
            disabled={recordedKeys.length === 0}
            className="flex-1 h-9 macos-button"
          >
            {t('shortcuts.confirm')}
          </Button>
        </div>
      </Card>
    </div>
  )
}