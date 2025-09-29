/**
 * Keyboard Shortcuts System
 *
 * Central export point for the keyboard shortcuts infrastructure.
 * Import shortcuts functionality from here.
 *
 * @example
 * ```typescript
 * import { validateKeyCombination, normalizeKey, DEFAULT_SHORTCUTS } from '@/lib/shortcuts'
 * ```
 */

// Core classes
export { KeyDetector } from './detector';
export type { KeyDetectorOptions } from './detector';
export { ConflictChecker } from './conflict-checker';
export { KeyboardShortcutManager } from './manager';
export type { ManagerOptions } from './manager';

// Types
export type {
  Modifier,
  SimpleKey,
  ModifierCombo,
  DoublePress,
  KeySequence,
  KeyCombination,
  ShortcutCategory,
  ShortcutScope,
  ShortcutAction,
  ShortcutConfig,
  StoredShortcutConfig,
  ConflictInfo,
  ConflictResolution,
  Resolution,
  Platform,
  KeyDisplayMap,
  ValidationResult,
  SearchOptions,
  SearchResult,
  ExportConfig,
} from './types'

export {
  DEFAULT_PREFERENCES,
  CONFIG_VERSION,
  STORAGE_KEY,
} from './types'

// Key Normalizer
export {
  getPlatform,
  isMac,
  normalizeKey,
  getModifierSymbol,
  getKeyDisplay,
  keysToDisplayString,
  parseDisplayString,
  normalizeModifierForPlatform,
  isModifierKey,
  getPrimaryModifier,
  convertKeysForPlatform,
} from './key-normalizer'

// Key Validator
export {
  validateKeyCombination,
  isSystemShortcut,
  isPrintableKey,
  getBlockedShortcuts,
  suggestAlternative,
} from './key-validator'

// Storage Manager
export {
  loadConfig,
  saveConfig,
  createDefaultConfig,
  updateShortcut,
  resetShortcut,
  resetAllShortcuts,
  updatePreferences,
  exportConfig,
  importConfig,
  exportToFile,
  importFromFile,
  clearConfig,
  hasConfig,
  getConfigSize,
  mergeConfigs,
} from './storage'

// Default Shortcuts
export type { DefaultShortcut } from './default-shortcuts'
export {
  DEFAULT_SHORTCUTS,
  getShortcutsByCategory,
  getShortcutById,
  getCategories,
  getCustomizableShortcuts,
  getSystemShortcuts,
  getPlatformShortcut,
  getAllPlatformShortcuts,
} from './default-shortcuts'
