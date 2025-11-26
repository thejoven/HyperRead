/**
 * Type definitions for the keyboard shortcuts system
 *
 * This module provides comprehensive types for managing keyboard shortcuts
 * including key combinations, actions, configurations, and storage.
 */

/**
 * Modifier keys supported across platforms
 */
export type Modifier = 'Ctrl' | 'Alt' | 'Shift' | 'Meta'

/**
 * Simple key press (single key without modifiers)
 * Example: "a", "F1", "Escape"
 */
export interface SimpleKey {
  type: 'simple'
  key: string
}

/**
 * Modifier combination (modifiers + main key)
 * Example: Ctrl+S, Shift+Alt+T
 */
export interface ModifierCombo {
  type: 'combo'
  modifiers: Modifier[]
  key: string
}

/**
 * Double press detection (press same key twice quickly)
 * Example: Shift Shift (double tap)
 */
export interface DoublePress {
  type: 'double'
  key: string
  maxInterval: number  // Maximum time between presses in milliseconds
}

/**
 * Key sequence (multiple keys pressed in order)
 * Example: "g g", "Ctrl+K Ctrl+B"
 */
export interface KeySequence {
  type: 'sequence'
  keys: (SimpleKey | ModifierCombo)[]
  maxInterval: number  // Maximum time between sequence keys
}

/**
 * Union type for all supported key combination types
 */
export type KeyCombination = SimpleKey | ModifierCombo | DoublePress | KeySequence

/**
 * Shortcut categories for organization
 */
export type ShortcutCategory =
  | 'navigation'      // File and folder navigation
  | 'editing'         // Content editing operations
  | 'view'           // View controls (zoom, theme, etc.)
  | 'search'         // Search functionality
  | 'window'         // Window management
  | 'system'         // System operations (settings, about, quit)
  | 'ai'             // AI assistant features
  | 'reading'        // Reading mode (EPUB/PDF page navigation)

/**
 * Scope where a shortcut is active
 */
export type ShortcutScope = 'global' | 'editor' | 'sidebar' | 'modal'

/**
 * Complete shortcut action definition
 */
export interface ShortcutAction {
  /** Unique identifier (e.g., "search.open") */
  id: string

  /** Display name (e.g., "Open Search") */
  name: string

  /** Detailed description */
  description: string

  /** Category for organization */
  category: ShortcutCategory

  /** Default key combination */
  defaultKeys: KeyCombination

  /** Handler function to execute */
  handler: () => void | Promise<void>

  /** Whether this shortcut is enabled */
  enabled: boolean

  /** Priority for conflict resolution (1-10, higher = more important) */
  priority: number

  /** Scope where this shortcut is active */
  scope?: ShortcutScope

  /** Whether this can be customized by users */
  customizable?: boolean
}

/**
 * Shortcut configuration for a single action
 */
export interface ShortcutConfig {
  /** Action ID */
  id: string

  /** Display name */
  name: string

  /** Description */
  description: string

  /** Category */
  category: ShortcutCategory

  /** Current key combination */
  keys: KeyCombination

  /** Default key combination */
  defaultKeys: KeyCombination

  /** Whether enabled */
  enabled: boolean

  /** Whether this has been customized by user */
  customized: boolean

  /** Priority */
  priority: number

  /** Scope */
  scope?: ShortcutScope

  /** Whether customizable */
  customizable?: boolean
}

/**
 * Stored shortcut configuration (persisted to localStorage)
 */
export interface StoredShortcutConfig {
  /** Configuration version for migration */
  version: string

  /** Last modified timestamp (ISO format) */
  lastModified: string

  /** Shortcut configurations by action ID */
  shortcuts: {
    [actionId: string]: {
      keys: KeyCombination
      enabled: boolean
      customized: boolean
    }
  }

  /** User preferences */
  preferences: {
    /** Enable global shortcuts (when app loses focus) */
    enableGlobal: boolean

    /** Enable double press detection */
    enableDoublePress: boolean

    /** Double press interval in milliseconds */
    doublePressInterval: number

    /** Key sequence interval in milliseconds */
    keySequenceInterval: number
  }
}

/**
 * Conflict information when key combinations overlap
 */
export interface ConflictInfo {
  /** Action ID of conflicting shortcut */
  actionId: string

  /** Action name */
  actionName: string

  /** Conflicting key combination */
  keys: KeyCombination

  /** Priority of conflicting action */
  priority: number
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolution =
  | 'disable_conflict'  // Disable the conflicting shortcut
  | 'disable_new'       // Disable the new shortcut
  | 'keep_both'         // Keep both (may cause issues)
  | 'suggest_alternative' // Suggest alternative keys

/**
 * Resolution suggestion for conflicts
 */
export interface Resolution {
  /** Conflicting action ID */
  conflictActionId: string

  /** Chosen resolution */
  resolution: ConflictResolution

  /** Suggested alternative keys (if applicable) */
  suggestion?: KeyCombination
}

/**
 * Platform types
 */
export type Platform = 'darwin' | 'win32' | 'linux'

/**
 * Key display format mapping
 */
export interface KeyDisplayMap {
  [key: string]: string
}

/**
 * Validation result for key combinations
 */
export interface ValidationResult {
  /** Whether the key combination is valid */
  valid: boolean

  /** Error message if invalid */
  error?: string

  /** Warning message (valid but not recommended) */
  warning?: string
}

/**
 * Search options for full-text search
 */
export interface SearchOptions {
  /** Case sensitive search */
  caseSensitive?: boolean

  /** Use regular expressions */
  useRegex?: boolean

  /** Match whole words only */
  wholeWord?: boolean
}

/**
 * Search result item
 */
export interface SearchResult {
  /** Line number (1-indexed) */
  lineNumber: number

  /** Line content */
  lineContent: string

  /** Match start index in line */
  matchIndex: number

  /** Match length */
  matchLength: number

  /** Context lines */
  context: {
    before: string
    after: string
  }
}

/**
 * Export/import configuration format
 */
export interface ExportConfig {
  /** Export timestamp */
  exportedAt: string

  /** App version */
  appVersion: string

  /** Configuration data */
  config: StoredShortcutConfig
}

/**
 * Default configuration constants
 */
export const DEFAULT_PREFERENCES = {
  enableGlobal: false,
  enableDoublePress: true,
  doublePressInterval: 500,
  keySequenceInterval: 1000,
} as const

/**
 * Configuration version (for migration)
 */
export const CONFIG_VERSION = '1.0.0'

/**
 * Storage key for localStorage
 */
export const STORAGE_KEY = 'hyperread-keyboard-shortcuts'

/**
 * Internal pressed keys state (used by KeyDetector)
 */
export interface PressedKeysState {
  keys: Set<string>
  modifiers: Set<Modifier>
  lastKeyTime: number
  lastKey: string
}

/**
 * Handler function for shortcuts
 */
export type ShortcutHandler = (event?: KeyboardEvent) => void | Promise<void>
