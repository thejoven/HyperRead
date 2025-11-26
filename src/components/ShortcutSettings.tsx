'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, RotateCcw, Download, Upload, Edit2, Power, PowerOff } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { useShortcuts, ShortcutConfig, ShortcutCategory } from '@/contexts/ShortcutContext'
import ShortcutRecorder from './ShortcutRecorder'
import ShortcutConflictDialog from './ShortcutConflictDialog'
import { toast } from 'sonner'

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

export default function ShortcutSettings() {
  const { t } = useTranslation()
  const {
    shortcuts,
    updateShortcut,
    toggleShortcut,
    resetShortcut,
    resetAllShortcuts,
    checkConflict,
    exportConfig,
    importConfig
  } = useShortcuts()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategory | 'all'>('all')
  const [editingShortcut, setEditingShortcut] = useState<ShortcutConfig | null>(null)
  const [isRecorderOpen, setIsRecorderOpen] = useState(false)
  const [pendingKeys, setPendingKeys] = useState<string[]>([])
  const [conflictShortcut, setConflictShortcut] = useState<ShortcutConfig | null>(null)
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false)

  // 所有分类
  const categories: Array<{ id: ShortcutCategory | 'all', label: string }> = [
    { id: 'all', label: t('common.all') },
    { id: 'general', label: t('shortcuts.categories.general') },
    { id: 'navigation', label: t('shortcuts.categories.navigation') },
    { id: 'editor', label: t('shortcuts.categories.editor') },
    { id: 'search', label: t('shortcuts.categories.search') },
    { id: 'view', label: t('shortcuts.categories.view') },
    { id: 'reading', label: t('shortcuts.categories.reading') }
  ]

  // 过滤和搜索快捷键
  const filteredShortcuts = useMemo(() => {
    let filtered = shortcuts

    // 按分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory)
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s => {
        const description = t(s.description).toLowerCase()
        const keysStr = s.keys.join(' ').toLowerCase()
        return description.includes(query) || keysStr.includes(query)
      })
    }

    return filtered
  }, [shortcuts, selectedCategory, searchQuery, t])

  // 按分类分组
  const groupedShortcuts = useMemo(() => {
    const groups: Record<ShortcutCategory, ShortcutConfig[]> = {
      general: [],
      navigation: [],
      editor: [],
      search: [],
      view: [],
      reading: []
    }

    filteredShortcuts.forEach(shortcut => {
      groups[shortcut.category].push(shortcut)
    })

    return groups
  }, [filteredShortcuts])

  // 开始编辑快捷键
  const handleEdit = (shortcut: ShortcutConfig) => {
    setEditingShortcut(shortcut)
    setIsRecorderOpen(true)
  }

  // 确认新按键
  const handleRecorderConfirm = (keys: string[]) => {
    if (!editingShortcut) return

    // 检查冲突
    const conflict = checkConflict(keys, editingShortcut.id)

    if (conflict) {
      // 显示冲突对话框
      setPendingKeys(keys)
      setConflictShortcut(conflict)
      setIsConflictDialogOpen(true)
      setIsRecorderOpen(false)
    } else {
      // 没有冲突，直接更新
      updateShortcut(editingShortcut.id, keys)
      setIsRecorderOpen(false)
      setEditingShortcut(null)
      toast.success(t('common.success'))
    }
  }

  // 覆盖冲突的快捷键
  const handleOverride = () => {
    if (!editingShortcut || !conflictShortcut) return

    // 禁用冲突的快捷键
    toggleShortcut(conflictShortcut.id, false)

    // 更新当前快捷键
    updateShortcut(editingShortcut.id, pendingKeys)

    // 关闭对话框
    setIsConflictDialogOpen(false)
    setEditingShortcut(null)
    setConflictShortcut(null)
    setPendingKeys([])

    toast.success(t('common.success'))
  }

  // 取消冲突对话框
  const handleConflictCancel = () => {
    setIsConflictDialogOpen(false)
    setConflictShortcut(null)
    setPendingKeys([])
    // 重新打开录制器
    setIsRecorderOpen(true)
  }

  // 重置单个快捷键
  const handleReset = (shortcut: ShortcutConfig) => {
    resetShortcut(shortcut.id)
    toast.success(t('shortcuts.messages.resetSuccess'))
  }

  // 重置所有快捷键
  const handleResetAll = () => {
    toast.error(t('shortcuts.messages.resetAllConfirm'), {
      action: {
        label: t('common.confirm'),
        onClick: () => {
          resetAllShortcuts()
          toast.success(t('shortcuts.messages.resetSuccess'))
        }
      },
      cancel: {
        label: t('common.cancel'),
        onClick: () => {}
      }
    })
  }

  // 导出配置
  const handleExport = () => {
    const config = exportConfig()
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shortcuts-config-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('shortcuts.messages.exportSuccess'))
  }

  // 导入配置
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const config = event.target?.result as string
        if (importConfig(config)) {
          toast.success(t('shortcuts.messages.importSuccess'))
        } else {
          toast.error(t('shortcuts.messages.importFailed'))
        }
      } catch (error) {
        toast.error(t('shortcuts.messages.importFailed'))
      }
    }
    reader.readAsText(file)
    e.target.value = '' // 清空input
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="space-y-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('shortcuts.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            className="flex-1 h-8 macos-button"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            {t('shortcuts.resetAll')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex-1 h-8 macos-button"
          >
            <Download className="w-3 h-3 mr-1" />
            {t('shortcuts.export')}
          </Button>
          <label className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 macos-button"
              asChild
            >
              <span>
                <Upload className="w-3 h-3 mr-1" />
                {t('shortcuts.import')}
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 p-1 bg-muted/20 rounded-lg overflow-x-auto">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap
              ${selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Shortcuts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {selectedCategory === 'all' ? (
          // 显示所有分类
          Object.entries(groupedShortcuts).map(([category, shortcuts]) => {
            if (shortcuts.length === 0) return null
            return (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  {t(`shortcuts.categories.${category as ShortcutCategory}`)}
                </h4>
                {shortcuts.map(shortcut => (
                  <ShortcutItem
                    key={shortcut.id}
                    shortcut={shortcut}
                    onEdit={handleEdit}
                    onReset={handleReset}
                    onToggle={toggleShortcut}
                    t={t}
                  />
                ))}
              </div>
            )
          })
        ) : (
          // 只显示选中的分类
          filteredShortcuts.map(shortcut => (
            <ShortcutItem
              key={shortcut.id}
              shortcut={shortcut}
              onEdit={handleEdit}
              onReset={handleReset}
              onToggle={toggleShortcut}
              t={t}
            />
          ))
        )}

        {filteredShortcuts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? t('search.noResults') : t('shortcuts.messages.noShortcuts')}
            </p>
          </div>
        )}
      </div>

      {/* Shortcut Recorder Modal */}
      <ShortcutRecorder
        isOpen={isRecorderOpen}
        onClose={() => {
          setIsRecorderOpen(false)
          setEditingShortcut(null)
        }}
        onConfirm={handleRecorderConfirm}
        currentShortcut={editingShortcut || undefined}
        conflictingShortcut={conflictShortcut}
      />

      {/* Conflict Dialog */}
      <ShortcutConflictDialog
        isOpen={isConflictDialogOpen}
        onClose={() => {
          setIsConflictDialogOpen(false)
          setEditingShortcut(null)
          setConflictShortcut(null)
          setPendingKeys([])
        }}
        onOverride={handleOverride}
        onCancel={handleConflictCancel}
        currentShortcut={editingShortcut || undefined}
        conflictingShortcut={conflictShortcut || undefined}
        newKeys={pendingKeys}
      />
    </div>
  )
}

// Shortcut Item Component
interface ShortcutItemProps {
  shortcut: ShortcutConfig
  onEdit: (shortcut: ShortcutConfig) => void
  onReset: (shortcut: ShortcutConfig) => void
  onToggle: (id: string, enabled: boolean) => void
  t: (key: string) => string
}

function ShortcutItem({ shortcut, onEdit, onReset, onToggle, t }: ShortcutItemProps) {
  const isModified = JSON.stringify(shortcut.keys) !== JSON.stringify(shortcut.defaultKeys)

  return (
    <div
      className={`
        flex items-center justify-between p-3 rounded-lg border transition-all
        ${shortcut.enabled
          ? 'bg-background border-border/30 hover:border-border/60'
          : 'bg-muted/30 border-border/20 opacity-60'
        }
      `}
    >
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {t(shortcut.description)}
          </p>
          {isModified && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
              Modified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted/60 border border-border/20">
            {shortcut.keys.map((keyCombo, index) => {
              // 检查是否包含空格（双击）或+（组合键）
              const hasSpace = keyCombo.includes(' ')
              const hasPlus = keyCombo.includes('+')

              if (hasSpace) {
                // 双击情况，用空格分隔显示
                const keys = keyCombo.split(' ')
                return (
                  <span key={index} className="text-xs font-mono font-semibold">
                    {keys.map((k, i) => (
                      <span key={i}>
                        {formatKey(k)}
                        {i < keys.length - 1 && ' '}
                      </span>
                    ))}
                    {index < shortcut.keys.length - 1 && <span className="mx-1 text-muted-foreground">/</span>}
                  </span>
                )
              } else if (hasPlus) {
                // 组合键情况，用+分隔显示
                const keys = keyCombo.split('+')
                return (
                  <span key={index} className="text-xs font-mono font-semibold">
                    {keys.map((k, i) => (
                      <span key={i}>
                        {formatKey(k)}
                        {i < keys.length - 1 && <span className="mx-0.5 text-muted-foreground">+</span>}
                      </span>
                    ))}
                    {index < shortcut.keys.length - 1 && <span className="mx-1 text-muted-foreground">/</span>}
                  </span>
                )
              } else {
                // 单个键
                return (
                  <span key={index} className="text-xs font-mono font-semibold">
                    {formatKey(keyCombo)}
                    {index < shortcut.keys.length - 1 && <span className="mx-1 text-muted-foreground">/</span>}
                  </span>
                )
              }
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(shortcut.id, !shortcut.enabled)}
          className="h-7 w-7 p-0 macos-button"
          title={shortcut.enabled ? t('shortcuts.disabled') : t('shortcuts.enabled')}
        >
          {shortcut.enabled ? (
            <Power className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <PowerOff className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(shortcut)}
          disabled={!shortcut.enabled}
          className="h-7 w-7 p-0 macos-button"
          title={t('shortcuts.edit')}
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        {isModified && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReset(shortcut)}
            className="h-7 w-7 p-0 macos-button"
            title={t('shortcuts.reset')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}