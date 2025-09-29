'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, AlertTriangle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { ShortcutConfig } from '@/contexts/ShortcutContext'

interface ShortcutConflictDialogProps {
  isOpen: boolean
  onClose: () => void
  onOverride: () => void
  onCancel: () => void
  currentShortcut?: ShortcutConfig
  conflictingShortcut?: ShortcutConfig
  newKeys: string[]
}

// 格式化按键名称
function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    'cmd': 'Cmd',
    'ctrl': 'Ctrl',
    'alt': 'Alt',
    'shift': 'Shift',
    ' ': 'Space',
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
    'escape': 'Esc',
    'backspace': '⌫',
    'delete': '⌦',
    'enter': '↵',
    'tab': '⇥'
  }
  return keyMap[key.toLowerCase()] || key.toUpperCase()
}

export default function ShortcutConflictDialog({
  isOpen,
  onClose,
  onOverride,
  onCancel,
  currentShortcut,
  conflictingShortcut,
  newKeys
}: ShortcutConflictDialogProps) {
  const { t } = useTranslation()

  if (!isOpen || !conflictingShortcut) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const displayNewKeys = newKeys.map(formatKey).join(' + ')
  const displayConflictKeys = conflictingShortcut.keys.map(formatKey).join(' + ')

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[70] macos-fade-in p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-[500px] max-w-[90vw] glass-effect border border-border/30 shadow-2xl macos-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/20 bg-orange-50 dark:bg-orange-950/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              {t('shortcuts.conflictTitle')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Conflict Message */}
          <p className="text-sm text-muted-foreground">
            {t('shortcuts.conflictMessage')}
          </p>

          {/* New Shortcut */}
          {currentShortcut && (
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t('shortcuts.currentShortcut')}
                  </p>
                  <p className="font-medium mb-2">
                    {t(currentShortcut.description)}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border/30">
                    <span className="text-xs text-muted-foreground">New:</span>
                    <span className="font-mono font-semibold text-primary">
                      {displayNewKeys}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conflicting Shortcut */}
          <div className="p-4 rounded-lg border border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">
                  {t('shortcuts.conflictingShortcut')}
                </p>
                <p className="font-medium mb-2">
                  {t(conflictingShortcut.description)}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border/30">
                  <span className="text-xs text-muted-foreground">Current:</span>
                  <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                    {displayConflictKeys}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resolution Options */}
          <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-sm font-medium mb-3">{t('shortcuts.conflictResolution')}</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p>
                  <span className="font-medium text-foreground">{t('shortcuts.override')}:</span>{' '}
                  Assign the new key combination and remove it from the conflicting shortcut
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                <p>
                  <span className="font-medium text-foreground">{t('shortcuts.cancel')}:</span>{' '}
                  Keep the existing configuration and choose a different key combination
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-border/20 bg-muted/10">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex-1 h-9 macos-button"
          >
            {t('shortcuts.cancel')}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onOverride}
            className="flex-1 h-9 macos-button bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
          >
            {t('shortcuts.override')}
          </Button>
        </div>
      </Card>
    </div>
  )
}