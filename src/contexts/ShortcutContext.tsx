'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

// 快捷键类别
export type ShortcutCategory = 'search' | 'view' | 'general' | 'navigation' | 'editor' | 'reading'

// 单个快捷键配置
export interface ShortcutConfig {
  id: string
  category: ShortcutCategory
  description: string
  defaultKeys: string[]
  keys: string[]
  enabled: boolean
  action?: () => void
}

// 快捷键上下文类型
export interface ShortcutContextType {
  shortcuts: ShortcutConfig[]
  updateShortcut: (id: string, keys: string[]) => void
  toggleShortcut: (id: string, enabled: boolean) => void
  resetShortcut: (id: string) => void
  resetAllShortcuts: () => void
  checkConflict: (keys: string[], excludeId?: string) => ShortcutConfig | null
  exportConfig: () => string
  importConfig: (config: string) => boolean
  getShortcutsByCategory: (category: ShortcutCategory) => ShortcutConfig[]
}

// 默认快捷键配置
const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  // Search shortcuts
  {
    id: 'search-open',
    category: 'search',
    description: 'shortcuts.actions.searchOpen',
    defaultKeys: ['shift shift'],
    keys: ['shift shift'],
    enabled: true
  },
  {
    id: 'search-close',
    category: 'search',
    description: 'shortcuts.actions.searchClose',
    defaultKeys: ['escape'],
    keys: ['escape'],
    enabled: true
  },
  {
    id: 'search-next',
    category: 'search',
    description: 'shortcuts.actions.searchNext',
    defaultKeys: ['enter', 'f3'],
    keys: ['enter', 'f3'],
    enabled: true
  },
  {
    id: 'search-prev',
    category: 'search',
    description: 'shortcuts.actions.searchPrev',
    defaultKeys: ['shift+enter', 'shift+f3'],
    keys: ['shift+enter', 'shift+f3'],
    enabled: true
  },
  // View shortcuts
  {
    id: 'view-toggle-sidebar',
    category: 'view',
    description: 'shortcuts.actions.toggleSidebar',
    defaultKeys: ['cmd+b', 'ctrl+b'],
    keys: ['cmd+b', 'ctrl+b'],
    enabled: true
  },
  {
    id: 'view-toggle-sidebar-alt',
    category: 'view',
    description: 'shortcuts.actions.toggleSidebar',
    defaultKeys: ['cmd+.', 'ctrl+.'],
    keys: ['cmd+.', 'ctrl+.'],
    enabled: true
  },
  // Reading shortcuts (EPUB/PDF)
  {
    id: 'reading-prev-page',
    category: 'reading',
    description: 'shortcuts.actions.prevPage',
    defaultKeys: ['arrowleft', 'pageup'],
    keys: ['arrowleft', 'pageup'],
    enabled: true
  },
  {
    id: 'reading-next-page',
    category: 'reading',
    description: 'shortcuts.actions.nextPage',
    defaultKeys: ['arrowright', 'pagedown'],
    keys: ['arrowright', 'pagedown'],
    enabled: true
  },
  {
    id: 'reading-prev-page-vim',
    category: 'reading',
    description: 'shortcuts.actions.prevPageK',
    defaultKeys: ['k'],
    keys: ['k'],
    enabled: true
  },
  {
    id: 'reading-next-page-vim',
    category: 'reading',
    description: 'shortcuts.actions.nextPageJ',
    defaultKeys: ['j'],
    keys: ['j'],
    enabled: true
  },
  {
    id: 'reading-next-page-space',
    category: 'reading',
    description: 'shortcuts.actions.nextPageSpace',
    defaultKeys: ['space'],
    keys: ['space'],
    enabled: true
  },
  {
    id: 'reading-prev-page-space',
    category: 'reading',
    description: 'shortcuts.actions.prevPageSpace',
    defaultKeys: ['shift+space'],
    keys: ['shift+space'],
    enabled: true
  },
  {
    id: 'reading-first-page',
    category: 'reading',
    description: 'shortcuts.actions.firstPage',
    defaultKeys: ['home'],
    keys: ['home'],
    enabled: true
  },
  {
    id: 'reading-last-page',
    category: 'reading',
    description: 'shortcuts.actions.lastPage',
    defaultKeys: ['end'],
    keys: ['end'],
    enabled: true
  }
]

const STORAGE_KEY = 'shortcut-config'

// 创建上下文
const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined)

interface ShortcutProviderProps {
  children: ReactNode
}

export function ShortcutProvider({ children }: ShortcutProviderProps) {
  const [shortcuts, setShortcuts] = useState<ShortcutConfig[]>(DEFAULT_SHORTCUTS)

  // 从 localStorage 加载配置
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as ShortcutConfig[]
        // 合并保存的配置与默认配置，确保新增的快捷键也能显示
        const merged = DEFAULT_SHORTCUTS.map(defaultShortcut => {
          const savedShortcut = parsed.find(s => s.id === defaultShortcut.id)
          return savedShortcut ? { ...defaultShortcut, ...savedShortcut } : defaultShortcut
        })
        setShortcuts(merged)
      }
    } catch (error) {
      console.error('Failed to load shortcut config:', error)
    }
  }, [])

  // 保存到 localStorage
  const saveShortcuts = useCallback((newShortcuts: ShortcutConfig[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newShortcuts))
      setShortcuts(newShortcuts)
    } catch (error) {
      console.error('Failed to save shortcut config:', error)
    }
  }, [])

  // 更新快捷键
  const updateShortcut = useCallback((id: string, keys: string[]) => {
    setShortcuts(prev => {
      const updated = prev.map(shortcut =>
        shortcut.id === id ? { ...shortcut, keys } : shortcut
      )
      saveShortcuts(updated)
      return updated
    })
  }, [saveShortcuts])

  // 切换快捷键启用状态
  const toggleShortcut = useCallback((id: string, enabled: boolean) => {
    setShortcuts(prev => {
      const updated = prev.map(shortcut =>
        shortcut.id === id ? { ...shortcut, enabled } : shortcut
      )
      saveShortcuts(updated)
      return updated
    })
  }, [saveShortcuts])

  // 重置单个快捷键
  const resetShortcut = useCallback((id: string) => {
    setShortcuts(prev => {
      const updated = prev.map(shortcut => {
        if (shortcut.id === id) {
          return { ...shortcut, keys: shortcut.defaultKeys, enabled: true }
        }
        return shortcut
      })
      saveShortcuts(updated)
      return updated
    })
  }, [saveShortcuts])

  // 重置所有快捷键
  const resetAllShortcuts = useCallback(() => {
    const reset = DEFAULT_SHORTCUTS.map(s => ({ ...s }))
    saveShortcuts(reset)
  }, [saveShortcuts])

  // 检查快捷键冲突
  const checkConflict = useCallback((keys: string[], excludeId?: string): ShortcutConfig | null => {
    const keyStr = keys.join(',')
    for (const shortcut of shortcuts) {
      if (shortcut.id === excludeId || !shortcut.enabled) continue
      if (shortcut.keys.join(',') === keyStr) {
        return shortcut
      }
    }
    return null
  }, [shortcuts])

  // 导出配置
  const exportConfig = useCallback((): string => {
    return JSON.stringify(shortcuts, null, 2)
  }, [shortcuts])

  // 导入配置
  const importConfig = useCallback((config: string): boolean => {
    try {
      const parsed = JSON.parse(config) as ShortcutConfig[]
      // 验证配置格式
      if (!Array.isArray(parsed)) return false

      // 验证每个快捷键配置
      const isValid = parsed.every(s =>
        s.id && s.category && s.description && Array.isArray(s.keys) &&
        Array.isArray(s.defaultKeys) && typeof s.enabled === 'boolean'
      )

      if (!isValid) return false

      saveShortcuts(parsed)
      return true
    } catch (error) {
      console.error('Failed to import config:', error)
      return false
    }
  }, [saveShortcuts])

  // 按类别获取快捷键
  const getShortcutsByCategory = useCallback((category: ShortcutCategory): ShortcutConfig[] => {
    return shortcuts.filter(s => s.category === category)
  }, [shortcuts])

  const contextValue: ShortcutContextType = {
    shortcuts,
    updateShortcut,
    toggleShortcut,
    resetShortcut,
    resetAllShortcuts,
    checkConflict,
    exportConfig,
    importConfig,
    getShortcutsByCategory
  }

  return (
    <ShortcutContext.Provider value={contextValue}>
      {children}
    </ShortcutContext.Provider>
  )
}

// 自定义 Hook
export function useShortcuts() {
  const context = useContext(ShortcutContext)
  if (context === undefined) {
    throw new Error('useShortcuts must be used within a ShortcutProvider')
  }
  return context
}