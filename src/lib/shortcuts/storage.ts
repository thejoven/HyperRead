/**
 * Storage Manager
 *
 * Handles persistence of keyboard shortcut configurations to localStorage.
 * Supports save/load, export/import, and migration between versions.
 */

import type {
  StoredShortcutConfig,
  ShortcutConfig,
  KeyCombination,
  ExportConfig,
} from './types'
import { CONFIG_VERSION, DEFAULT_PREFERENCES, STORAGE_KEY } from './types'

/**
 * Load shortcut configuration from localStorage
 *
 * @returns Stored configuration or null if not found
 */
export function loadConfig(): StoredShortcutConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return null
    }

    const config = JSON.parse(stored) as StoredShortcutConfig

    // Validate basic structure
    if (!config.version || !config.shortcuts) {
      console.warn('Invalid shortcut configuration structure')
      return null
    }

    // Check if migration is needed
    if (config.version !== CONFIG_VERSION) {
      console.log(`Migrating shortcuts from v${config.version} to v${CONFIG_VERSION}`)
      return migrateConfig(config)
    }

    return config
  } catch (error) {
    console.error('Failed to load shortcut configuration:', error)
    return null
  }
}

/**
 * Save shortcut configuration to localStorage
 *
 * @param config - Configuration to save
 * @returns True if save was successful
 */
export function saveConfig(config: StoredShortcutConfig): boolean {
  try {
    // Update last modified timestamp
    config.lastModified = new Date().toISOString()

    const json = JSON.stringify(config, null, 2)
    localStorage.setItem(STORAGE_KEY, json)
    
    console.log('Shortcut configuration saved successfully')
    return true
  } catch (error) {
    console.error('Failed to save shortcut configuration:', error)
    return false
  }
}

/**
 * Create a new empty configuration
 *
 * @returns New configuration with defaults
 */
export function createDefaultConfig(): StoredShortcutConfig {
  return {
    version: CONFIG_VERSION,
    lastModified: new Date().toISOString(),
    shortcuts: {},
    preferences: { ...DEFAULT_PREFERENCES },
  }
}

/**
 * Update a single shortcut in configuration
 *
 * @param actionId - Action ID to update
 * @param keys - New key combination
 * @param enabled - Whether shortcut is enabled
 * @returns Updated configuration or null on error
 */
export function updateShortcut(
  actionId: string,
  keys: KeyCombination,
  enabled: boolean = true
): StoredShortcutConfig | null {
  try {
    let config = loadConfig()
    if (!config) {
      config = createDefaultConfig()
    }

    config.shortcuts[actionId] = {
      keys,
      enabled,
      customized: true,
    }

    if (saveConfig(config)) {
      return config
    }

    return null
  } catch (error) {
    console.error('Failed to update shortcut:', error)
    return null
  }
}

/**
 * Remove a shortcut customization (revert to default)
 *
 * @param actionId - Action ID to reset
 * @returns Updated configuration or null on error
 */
export function resetShortcut(actionId: string): StoredShortcutConfig | null {
  try {
    const config = loadConfig()
    if (!config) {
      return null
    }

    delete config.shortcuts[actionId]

    if (saveConfig(config)) {
      return config
    }

    return null
  } catch (error) {
    console.error('Failed to reset shortcut:', error)
    return null
  }
}

/**
 * Reset all shortcuts to defaults
 *
 * @returns New default configuration
 */
export function resetAllShortcuts(): StoredShortcutConfig {
  const config = createDefaultConfig()
  saveConfig(config)
  return config
}

/**
 * Update preferences
 *
 * @param preferences - New preferences
 * @returns Updated configuration or null on error
 */
export function updatePreferences(
  preferences: Partial<StoredShortcutConfig['preferences']>
): StoredShortcutConfig | null {
  try {
    let config = loadConfig()
    if (!config) {
      config = createDefaultConfig()
    }

    config.preferences = {
      ...config.preferences,
      ...preferences,
    }

    if (saveConfig(config)) {
      return config
    }

    return null
  } catch (error) {
    console.error('Failed to update preferences:', error)
    return null
  }
}

/**
 * Export configuration to JSON string
 *
 * @param appVersion - Current app version
 * @returns JSON string of exported configuration
 */
export function exportConfig(appVersion: string = '2.0.0'): string {
  const config = loadConfig() || createDefaultConfig()

  const exportData: ExportConfig = {
    exportedAt: new Date().toISOString(),
    appVersion,
    config,
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Import configuration from JSON string
 *
 * @param json - JSON string to import
 * @returns True if import was successful
 */
export function importConfig(json: string): boolean {
  try {
    const exportData = JSON.parse(json) as ExportConfig

    // Validate structure
    if (!exportData.config || !exportData.config.version) {
      throw new Error('Invalid configuration format')
    }

    // Migrate if needed
    let config = exportData.config
    if (config.version !== CONFIG_VERSION) {
      config = migrateConfig(config) || config
    }

    // Save imported configuration
    return saveConfig(config)
  } catch (error) {
    console.error('Failed to import configuration:', error)
    return false
  }
}

/**
 * Export configuration as downloadable file
 *
 * @param appVersion - Current app version
 * @param filename - Filename for export
 */
export function exportToFile(
  appVersion: string = '2.0.0',
  filename: string = 'hyperread-shortcuts.json'
): void {
  const json = exportConfig(appVersion)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}

/**
 * Import configuration from file
 *
 * @param file - File to import
 * @returns Promise that resolves to true if successful
 */
export function importFromFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const json = e.target?.result as string
        const success = importConfig(json)
        resolve(success)
      } catch (error) {
        console.error('Failed to read import file:', error)
        resolve(false)
      }
    }

    reader.onerror = () => {
      console.error('Failed to read file')
      resolve(false)
    }

    reader.readAsText(file)
  })
}

/**
 * Migrate configuration from older version to current version
 *
 * @param oldConfig - Old configuration
 * @returns Migrated configuration or null if migration fails
 */
function migrateConfig(
  oldConfig: StoredShortcutConfig
): StoredShortcutConfig | null {
  try {
    // Currently only supporting version 1.0.0
    // Future versions would add migration logic here

    const newConfig: StoredShortcutConfig = {
      version: CONFIG_VERSION,
      lastModified: new Date().toISOString(),
      shortcuts: { ...oldConfig.shortcuts },
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...oldConfig.preferences,
      },
    }

    console.log('Configuration migrated successfully')
    return newConfig
  } catch (error) {
    console.error('Failed to migrate configuration:', error)
    return null
  }
}

/**
 * Clear all stored configuration (use with caution)
 */
export function clearConfig(): void {
  localStorage.removeItem(STORAGE_KEY)
  console.log('Shortcut configuration cleared')
}

/**
 * Check if configuration exists in storage
 *
 * @returns True if configuration exists
 */
export function hasConfig(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}

/**
 * Get configuration size in bytes
 *
 * @returns Size of stored configuration
 */
export function getConfigSize(): number {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return 0
  }
  return new Blob([stored]).size
}

/**
 * Merge configurations (useful for importing partial configs)
 *
 * @param current - Current configuration
 * @param imported - Imported configuration
 * @returns Merged configuration
 */
export function mergeConfigs(
  current: StoredShortcutConfig,
  imported: StoredShortcutConfig
): StoredShortcutConfig {
  return {
    version: CONFIG_VERSION,
    lastModified: new Date().toISOString(),
    shortcuts: {
      ...current.shortcuts,
      ...imported.shortcuts,
    },
    preferences: {
      ...current.preferences,
      ...imported.preferences,
    },
  }
}
