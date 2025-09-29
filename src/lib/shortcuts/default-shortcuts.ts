/**
 * Default Shortcuts Configuration
 *
 * Defines all default keyboard shortcuts for the application.
 * Shortcuts are organized by category and support platform-specific defaults.
 */

import type { KeyCombination, ShortcutCategory, Modifier } from './types'
import { getPlatform, getPrimaryModifier } from './key-normalizer'

/**
 * Default shortcut definition
 */
export interface DefaultShortcut {
  id: string
  name: string
  description: string
  category: ShortcutCategory
  defaultKeys: KeyCombination
  priority: number
  customizable?: boolean
}

/**
 * Get the primary modifier for current platform
 */
const primaryMod = (): Modifier => getPrimaryModifier() as Modifier

/**
 * Search shortcuts
 */
const searchShortcuts: DefaultShortcut[] = [
  {
    id: 'search.open',
    name: 'Open Search',
    description: 'Open full-text search panel',
    category: 'search',
    defaultKeys: {
      type: 'double',
      key: 'Shift',
      maxInterval: 500,
    },
    priority: 10,
    customizable: true,
  },
  {
    id: 'search.close',
    name: 'Close Search',
    description: 'Close search panel',
    category: 'search',
    defaultKeys: {
      type: 'simple',
      key: 'Escape',
    },
    priority: 10,
    customizable: false,
  },
  {
    id: 'search.next',
    name: 'Next Result',
    description: 'Jump to next search result',
    category: 'search',
    defaultKeys: {
      type: 'simple',
      key: 'Enter',
    },
    priority: 8,
    customizable: true,
  },
  {
    id: 'search.previous',
    name: 'Previous Result',
    description: 'Jump to previous search result',
    category: 'search',
    defaultKeys: {
      type: 'combo',
      modifiers: ['Shift'],
      key: 'Enter',
    },
    priority: 8,
    customizable: true,
  },
  {
    id: 'search.nextAlt',
    name: 'Next Result (Alt)',
    description: 'Alternative shortcut to jump to next result',
    category: 'search',
    defaultKeys: {
      type: 'simple',
      key: 'F3',
    },
    priority: 8,
    customizable: true,
  },
  {
    id: 'search.previousAlt',
    name: 'Previous Result (Alt)',
    description: 'Alternative shortcut to jump to previous result',
    category: 'search',
    defaultKeys: {
      type: 'combo',
      modifiers: ['Shift'],
      key: 'F3',
    },
    priority: 8,
    customizable: true,
  },
]

/**
 * Navigation shortcuts
 */
const navigationShortcuts: DefaultShortcut[] = [
  {
    id: 'navigation.openFile',
    name: 'Open File',
    description: 'Open file dialog',
    category: 'navigation',
    defaultKeys: {
      type: 'combo',
      modifiers: [primaryMod()],
      key: 'O',
    },
    priority: 9,
    customizable: true,
  },
  {
    id: 'navigation.openDirectory',
    name: 'Open Directory',
    description: 'Open directory dialog',
    category: 'navigation',
    defaultKeys: {
      type: 'combo',
      modifiers: [primaryMod(), 'Shift'],
      key: 'O',
    },
    priority: 9,
    customizable: true,
  },
  {
    id: 'navigation.refresh',
    name: 'Refresh File List',
    description: 'Refresh current directory',
    category: 'navigation',
    defaultKeys: {
      type: 'simple',
      key: 'F5',
    },
    priority: 7,
    customizable: true,
  },
  {
    id: 'navigation.refreshAlt',
    name: 'Refresh File List (Alt)',
    description: 'Alternative shortcut to refresh directory',
    category: 'navigation',
    defaultKeys: {
      type: 'combo',
      modifiers: [primaryMod()],
      key: 'R',
    },
    priority: 7,
    customizable: true,
  },
]

/**
 * View shortcuts
 */
const viewShortcuts: DefaultShortcut[] = [
  {
    id: 'view.zoomIn',
    name: 'Zoom In',
    description: 'Increase font size',
    category: 'view',
    defaultKeys: {
      type: 'combo',
      modifiers: [primaryMod()],
      key: '=',
    },
    priority: 6,
    customizable: true,
  },
  {
    id: 'view.zoomOut',
    name: 'Zoom Out',
    description: 'Decrease font size',
    category: 'view',
    defaultKeys: {
      type: 'combo',
      modifiers: [primaryMod()],
      key: '-',
    },
    priority: 6,
    customizable: true,
  },
  {
    id: 'view.resetZoom',
    name: 'Reset Zoom',
    description: 'Reset font size to default',
    category: 'view',
    defaultKeys: {
      type: 'combo',
      modifiers: [primaryMod()],
      key: '0',
    },
    priority: 6,
    customizable: true,
  },
  {
    id: 'view.toggleSidebar',
    name: 'Toggle Sidebar',
    description: 'Show/hide file list sidebar',
    category: 'view',
    defaultKeys: {
      type: 'combo',
      modifiers: [primaryMod()],
      key: 'B',
    },
    priority: 7,
    customizable: true,
  },
  {
    id: 'view.toggleTheme',
    name: 'Toggle Theme',
    description: 'Switch between light and dark theme',
    category: 'view',
    defaultKeys: {
      type: 'combo',
      modifiers: [primaryMod(), 'Shift'],
      key: 'T',
    },
    priority: 5,
    customizable: true,
  },
]

/**
 * System shortcuts
 */
const systemShortcuts: DefaultShortcut[] = [
  {
    id: 'system.settings',
    name: 'Open Settings',
    description: 'Open settings panel',
    category: 'system',
    defaultKeys: {
      type: 'combo',
      modifiers: [primaryMod()],
      key: ',',
    },
    priority: 8,
    customizable: true,
  },
  {
    id: 'system.about',
    name: 'About',
    description: 'Show about information',
    category: 'system',
    defaultKeys: {
      type: 'simple',
      key: 'F1',
    },
    priority: 5,
    customizable: true,
  },
  {
    id: 'system.quit',
    name: 'Quit Application',
    description: 'Exit the application',
    category: 'system',
    defaultKeys: {
      type: 'combo',
      modifiers: [primaryMod()],
      key: 'Q',
    },
    priority: 10,
    customizable: false,
  },
]

/**
 * AI Assistant shortcuts
 */
const aiShortcuts: DefaultShortcut[] = [
  {
    id: 'ai.toggle',
    name: 'Toggle AI Assistant',
    description: 'Show/hide AI assistant sidebar',
    category: 'ai',
    defaultKeys: {
      type: 'combo',
      modifiers: [primaryMod(), 'Shift'],
      key: 'A',
    },
    priority: 7,
    customizable: true,
  },
]

/**
 * Window shortcuts
 */
const windowShortcuts: DefaultShortcut[] = [
  {
    id: 'window.fullscreen',
    name: 'Toggle Fullscreen',
    description: 'Enter or exit fullscreen mode',
    category: 'window',
    defaultKeys: getPlatform() === 'darwin'
      ? {
          type: 'combo',
          modifiers: ['Ctrl', 'Meta'],
          key: 'F',
        }
      : {
          type: 'simple',
          key: 'F11',
        },
    priority: 6,
    customizable: true,
  },
]

/**
 * All default shortcuts combined
 */
export const DEFAULT_SHORTCUTS: DefaultShortcut[] = [
  ...searchShortcuts,
  ...navigationShortcuts,
  ...viewShortcuts,
  ...systemShortcuts,
  ...aiShortcuts,
  ...windowShortcuts,
]

/**
 * Get default shortcuts by category
 *
 * @param category - Category to filter by
 * @returns Array of shortcuts in that category
 */
export function getShortcutsByCategory(
  category: ShortcutCategory
): DefaultShortcut[] {
  return DEFAULT_SHORTCUTS.filter((s) => s.category === category)
}

/**
 * Get default shortcut by ID
 *
 * @param id - Shortcut ID
 * @returns Shortcut definition or undefined
 */
export function getShortcutById(id: string): DefaultShortcut | undefined {
  return DEFAULT_SHORTCUTS.find((s) => s.id === id)
}

/**
 * Get all shortcut categories with counts
 *
 * @returns Array of categories with shortcut counts
 */
export function getCategories(): Array<{
  category: ShortcutCategory
  count: number
  shortcuts: DefaultShortcut[]
}> {
  const categories: ShortcutCategory[] = [
    'search',
    'navigation',
    'view',
    'system',
    'ai',
    'window',
  ]

  return categories.map((category) => ({
    category,
    count: getShortcutsByCategory(category).length,
    shortcuts: getShortcutsByCategory(category),
  }))
}

/**
 * Get customizable shortcuts
 *
 * @returns Array of shortcuts that can be customized
 */
export function getCustomizableShortcuts(): DefaultShortcut[] {
  return DEFAULT_SHORTCUTS.filter((s) => s.customizable !== false)
}

/**
 * Get non-customizable shortcuts
 *
 * @returns Array of shortcuts that cannot be customized
 */
export function getSystemShortcuts(): DefaultShortcut[] {
  return DEFAULT_SHORTCUTS.filter((s) => s.customizable === false)
}

/**
 * Platform-specific shortcut adjustments
 * Automatically converts Ctrl to Meta on macOS
 *
 * @param shortcut - Original shortcut
 * @returns Platform-adjusted shortcut
 */
export function getPlatformShortcut(
  shortcut: DefaultShortcut
): DefaultShortcut {
  if (shortcut.defaultKeys.type !== 'combo') {
    return shortcut
  }

  const platform = getPlatform()
  if (platform !== 'darwin') {
    return shortcut
  }

  // On macOS, convert Ctrl to Meta for main shortcuts
  const modifiers = shortcut.defaultKeys.modifiers.map((m) =>
    m === 'Ctrl' ? 'Meta' : m
  )

  return {
    ...shortcut,
    defaultKeys: {
      ...shortcut.defaultKeys,
      modifiers,
    },
  }
}

/**
 * Get all shortcuts with platform-specific adjustments
 *
 * @returns Array of platform-adjusted shortcuts
 */
export function getAllPlatformShortcuts(): DefaultShortcut[] {
  return DEFAULT_SHORTCUTS.map(getPlatformShortcut)
}
