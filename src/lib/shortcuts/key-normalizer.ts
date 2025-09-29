/**
 * Key Normalizer
 *
 * Provides utilities to normalize key names across platforms and
 * convert keys to display-friendly formats.
 */

import type { Platform, KeyDisplayMap } from './types'

/**
 * Get current platform
 */
export function getPlatform(): Platform {
  if (typeof window === 'undefined') return 'linux'
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  if (userAgent.includes('mac')) return 'darwin'
  if (userAgent.includes('win')) return 'win32'
  return 'linux'
}

/**
 * Check if current platform is macOS
 */
export function isMac(): boolean {
  return getPlatform() === 'darwin'
}

/**
 * Normalize key name to consistent format
 * Handles variations in key names across browsers
 *
 * @param key - Raw key from KeyboardEvent
 * @returns Normalized key name
 */
export function normalizeKey(key: string): string {
  // Map of common variations to normalized names
  const keyMap: Record<string, string> = {
    // Modifier keys
    'Control': 'Ctrl',
    'command': 'Meta',
    'cmd': 'Meta',
    'option': 'Alt',
    'opt': 'Alt',
    
    // Special keys
    ' ': 'Space',
    'Esc': 'Escape',
    'Return': 'Enter',
    'Del': 'Delete',
    
    // Arrow keys (already normalized by browser)
    'ArrowUp': 'ArrowUp',
    'ArrowDown': 'ArrowDown',
    'ArrowLeft': 'ArrowLeft',
    'ArrowRight': 'ArrowRight',
    
    // Function keys (already normalized)
    // Letters should be uppercase
  }

  // Check if we have a direct mapping
  if (keyMap[key]) {
    return keyMap[key]
  }

  // Normalize letter keys to uppercase
  if (key.length === 1) {
    return key.toUpperCase()
  }

  return key
}

/**
 * Get display symbol for a modifier key based on platform
 *
 * @param modifier - Modifier key name
 * @param platform - Target platform
 * @returns Display symbol
 */
export function getModifierSymbol(modifier: string, platform: Platform = getPlatform()): string {
  if (platform === 'darwin') {
    const macSymbols: KeyDisplayMap = {
      'Meta': '⌘',
      'Ctrl': '⌃',
      'Alt': '⌥',
      'Shift': '⇧',
    }
    return macSymbols[modifier] || modifier
  }

  // Windows/Linux use text
  return modifier
}

/**
 * Get display string for a key
 * Converts special keys to symbols or readable names
 *
 * @param key - Key name
 * @param platform - Target platform
 * @returns Display string
 */
export function getKeyDisplay(key: string, platform: Platform = getPlatform()): string {
  const isMacPlatform = platform === 'darwin'

  const displayMap: KeyDisplayMap = {
    // Modifiers
    'Meta': isMacPlatform ? '⌘' : 'Win',
    'Ctrl': isMacPlatform ? '⌃' : 'Ctrl',
    'Alt': isMacPlatform ? '⌥' : 'Alt',
    'Shift': isMacPlatform ? '⇧' : 'Shift',

    // Arrow keys
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',

    // Special keys
    'Enter': isMacPlatform ? '↵' : 'Enter',
    'Backspace': isMacPlatform ? '⌫' : 'Backspace',
    'Delete': isMacPlatform ? '⌦' : 'Del',
    'Escape': 'Esc',
    'Tab': isMacPlatform ? '⇥' : 'Tab',
    'Space': isMacPlatform ? '␣' : 'Space',
    'CapsLock': isMacPlatform ? '⇪' : 'CapsLock',

    // Navigation
    'PageUp': isMacPlatform ? '⇞' : 'PgUp',
    'PageDown': isMacPlatform ? '⇟' : 'PgDn',
    'Home': isMacPlatform ? '↖' : 'Home',
    'End': isMacPlatform ? '↘' : 'End',
  }

  return displayMap[key] || key
}

/**
 * Convert key combination to display string
 *
 * @param modifiers - Array of modifier keys
 * @param key - Main key
 * @param platform - Target platform
 * @returns Display string (e.g., "⌘S" or "Ctrl+S")
 */
export function keysToDisplayString(
  modifiers: string[],
  key: string,
  platform: Platform = getPlatform()
): string {
  const isMacPlatform = platform === 'darwin'
  const separator = isMacPlatform ? '' : '+'

  // Order modifiers consistently: Ctrl, Alt, Shift, Meta
  const orderedModifiers = ['Ctrl', 'Alt', 'Shift', 'Meta'].filter(m => 
    modifiers.includes(m)
  )

  const modifierStrings = orderedModifiers.map(m => getModifierSymbol(m, platform))
  const keyString = getKeyDisplay(key, platform)

  if (isMacPlatform) {
    // macOS style: no separator, modifiers + key
    return [...modifierStrings, keyString].join('')
  } else {
    // Windows/Linux style: plus separator
    return [...modifierStrings, keyString].join('+')
  }
}

/**
 * Parse display string back to modifiers and key
 * Note: This is primarily for internal use
 *
 * @param displayString - Display string to parse
 * @returns Object with modifiers and key
 */
export function parseDisplayString(displayString: string): {
  modifiers: string[]
  key: string
} {
  // Handle both Mac style (⌘S) and Windows style (Ctrl+S)
  const isMacStyle = !displayString.includes('+')

  if (isMacStyle) {
    // Parse Mac style
    const modifiers: string[] = []
    let remainingString = displayString

    // Check for Mac modifier symbols
    const macSymbolToModifier: Record<string, string> = {
      '⌘': 'Meta',
      '⌃': 'Ctrl',
      '⌥': 'Alt',
      '⇧': 'Shift',
    }

    for (const [symbol, modifier] of Object.entries(macSymbolToModifier)) {
      if (remainingString.includes(symbol)) {
        modifiers.push(modifier)
        remainingString = remainingString.replace(symbol, '')
      }
    }

    return {
      modifiers,
      key: remainingString || '',
    }
  } else {
    // Parse Windows/Linux style
    const parts = displayString.split('+')
    const key = parts.pop() || ''
    return {
      modifiers: parts,
      key,
    }
  }
}

/**
 * Normalize modifier key based on platform
 * On Mac, converts Ctrl to Meta for common shortcuts
 *
 * @param modifier - Original modifier
 * @param platform - Target platform
 * @returns Normalized modifier
 */
export function normalizeModifierForPlatform(
  modifier: string,
  platform: Platform = getPlatform()
): string {
  // On Mac, most Ctrl shortcuts should use Meta (Cmd) instead
  if (platform === 'darwin' && modifier === 'Ctrl') {
    return 'Meta'
  }

  return modifier
}

/**
 * Check if a key is a modifier key
 *
 * @param key - Key to check
 * @returns True if key is a modifier
 */
export function isModifierKey(key: string): boolean {
  const modifiers = ['Ctrl', 'Control', 'Alt', 'Shift', 'Meta', 'Command', 'Cmd', 'Option']
  return modifiers.includes(key)
}

/**
 * Get the primary modifier key for the current platform
 * (Cmd on Mac, Ctrl on Windows/Linux)
 *
 * @param platform - Target platform
 * @returns Primary modifier key
 */
export function getPrimaryModifier(platform: Platform = getPlatform()): string {
  return platform === 'darwin' ? 'Meta' : 'Ctrl'
}

/**
 * Convert key combination from one platform format to another
 * Useful for cross-platform default shortcuts
 *
 * @param modifiers - Original modifiers
 * @param key - Original key
 * @param targetPlatform - Target platform
 * @returns Converted modifiers and key
 */
export function convertKeysForPlatform(
  modifiers: string[],
  key: string,
  targetPlatform: Platform
): { modifiers: string[]; key: string } {
  const convertedModifiers = modifiers.map(m => 
    normalizeModifierForPlatform(m, targetPlatform)
  )

  return {
    modifiers: convertedModifiers,
    key,
  }
}
