/**
 * Key Validator
 *
 * Validates key combinations for correctness and safety.
 * Prevents registration of system shortcuts and invalid combinations.
 */

import type { KeyCombination, ValidationResult, Platform } from './types'
import { getPlatform, normalizeKey } from './key-normalizer'

/**
 * System shortcuts that should not be overridden
 * Organized by platform
 */
const BLOCKED_SHORTCUTS: Record<Platform, Set<string>> = {
  darwin: new Set([
    'Meta+Q',      // Quit application
    'Meta+W',      // Close window
    'Meta+M',      // Minimize window
    'Meta+H',      // Hide application
    'Meta+Tab',    // Switch applications
    'Ctrl+Meta+F', // Fullscreen
    'Meta+Space',  // Spotlight
    'Ctrl+ArrowUp', // Mission Control
    'Ctrl+ArrowDown', // App Exposé
  ]),
  win32: new Set([
    'Ctrl+Alt+Delete', // Task manager / Security screen
    'Alt+F4',          // Close window
    'Alt+Tab',         // Switch windows
    'Win+D',           // Show desktop
    'Win+L',           // Lock computer
    'Win+Tab',         // Task view
  ]),
  linux: new Set([
    'Ctrl+Alt+Delete', // System monitor
    'Alt+F4',          // Close window
    'Alt+Tab',         // Switch windows
    'Super+L',         // Lock screen
  ]),
}

/**
 * Keys that cannot be used alone (must have modifiers)
 */
const REQUIRE_MODIFIERS = new Set([
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
])

/**
 * Keys that can be used alone
 */
const STANDALONE_KEYS = new Set([
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'Escape', 'Enter', 'Tab', 'Space', 'Backspace', 'Delete',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'PageUp', 'PageDown', 'Home', 'End',
  'Insert', 'PrintScreen', 'Pause',
])

/**
 * Valid modifier keys
 */
const VALID_MODIFIERS = new Set(['Ctrl', 'Alt', 'Shift', 'Meta'])

/**
 * Validate a simple key press
 */
function validateSimpleKey(keys: { key: string }): ValidationResult {
  const normalizedKey = normalizeKey(keys.key)

  // Check if key requires modifiers
  if (REQUIRE_MODIFIERS.has(normalizedKey)) {
    return {
      valid: false,
      error: `Key "${normalizedKey}" must be used with modifier keys (Ctrl, Alt, Shift, or Meta)`,
    }
  }

  // Check if it's a valid standalone key
  if (!STANDALONE_KEYS.has(normalizedKey) && normalizedKey.length > 1) {
    return {
      valid: false,
      error: `"${normalizedKey}" is not a valid standalone key`,
    }
  }

  return { valid: true }
}

/**
 * Validate a modifier combination
 */
function validateModifierCombo(keys: {
  modifiers: string[]
  key: string
}): ValidationResult {
  const { modifiers, key } = keys

  // Check if modifiers are valid
  for (const modifier of modifiers) {
    if (!VALID_MODIFIERS.has(modifier)) {
      return {
        valid: false,
        error: `"${modifier}" is not a valid modifier key`,
      }
    }
  }

  // Check if at least one modifier is present
  if (modifiers.length === 0) {
    return {
      valid: false,
      error: 'At least one modifier key is required',
    }
  }

  // Normalize and validate main key
  const normalizedKey = normalizeKey(key)
  if (!normalizedKey) {
    return {
      valid: false,
      error: 'Main key is required',
    }
  }

  // Check for system shortcut conflicts
  const platform = getPlatform()
  const shortcutString = [...modifiers, normalizedKey].join('+')
  
  if (BLOCKED_SHORTCUTS[platform].has(shortcutString)) {
    return {
      valid: false,
      error: `"${shortcutString}" is a system shortcut and cannot be overridden`,
    }
  }

  // Warning for unusual combinations
  if (modifiers.length > 3) {
    return {
      valid: true,
      warning: 'Using more than 3 modifiers may be difficult to press',
    }
  }

  return { valid: true }
}

/**
 * Validate a double press
 */
function validateDoublePress(keys: {
  key: string
  maxInterval: number
}): ValidationResult {
  const { key, maxInterval } = keys

  // Validate the key
  const normalizedKey = normalizeKey(key)
  if (!normalizedKey) {
    return {
      valid: false,
      error: 'Key is required for double press',
    }
  }

  // Check interval
  if (maxInterval < 100) {
    return {
      valid: false,
      error: 'Double press interval must be at least 100ms',
    }
  }

  if (maxInterval > 2000) {
    return {
      valid: true,
      warning: 'Double press interval over 2000ms may feel too slow',
    }
  }

  // Only certain keys work well with double press
  const goodDoubleKeys = new Set([
    'Shift', 'Ctrl', 'Alt', 'Meta',
    'Escape', 'Space',
  ])

  if (!goodDoubleKeys.has(normalizedKey)) {
    return {
      valid: true,
      warning: `Double press works best with modifier keys or Escape/Space`,
    }
  }

  return { valid: true }
}

/**
 * Validate a key sequence
 */
function validateKeySequence(keys: {
  keys: Array<{ type: string; key?: string; modifiers?: string[] }>
  maxInterval: number
}): ValidationResult {
  const { keys: sequence, maxInterval } = keys

  // Check if sequence has at least 2 keys
  if (sequence.length < 2) {
    return {
      valid: false,
      error: 'Key sequence must have at least 2 keys',
    }
  }

  // Check if sequence is too long
  if (sequence.length > 4) {
    return {
      valid: true,
      warning: 'Sequences longer than 4 keys may be hard to remember',
    }
  }

  // Validate interval
  if (maxInterval < 500) {
    return {
      valid: false,
      error: 'Sequence interval must be at least 500ms',
    }
  }

  if (maxInterval > 3000) {
    return {
      valid: true,
      warning: 'Sequence interval over 3000ms may feel too slow',
    }
  }

  // Validate each key in sequence
  for (let i = 0; i < sequence.length; i++) {
    const item = sequence[i]
    
    if (item.type === 'simple') {
      const result = validateSimpleKey({ key: item.key || '' })
      if (!result.valid) {
        return {
          valid: false,
          error: `Sequence key ${i + 1}: ${result.error}`,
        }
      }
    } else if (item.type === 'combo') {
      const result = validateModifierCombo({
        modifiers: item.modifiers || [],
        key: item.key || '',
      })
      if (!result.valid) {
        return {
          valid: false,
          error: `Sequence key ${i + 1}: ${result.error}`,
        }
      }
    }
  }

  return { valid: true }
}

/**
 * Validate a key combination
 *
 * @param keys - Key combination to validate
 * @returns Validation result with error/warning messages
 */
export function validateKeyCombination(keys: KeyCombination): ValidationResult {
  switch (keys.type) {
    case 'simple':
      return validateSimpleKey(keys)

    case 'combo':
      return validateModifierCombo(keys)

    case 'double':
      return validateDoublePress(keys)

    case 'sequence':
      return validateKeySequence(keys)

    default:
      return {
        valid: false,
        error: 'Unknown key combination type',
      }
  }
}

/**
 * Check if a key combination is a system shortcut
 *
 * @param keys - Key combination to check
 * @param platform - Platform to check against
 * @returns True if it's a system shortcut
 */
export function isSystemShortcut(
  keys: KeyCombination,
  platform: Platform = getPlatform()
): boolean {
  if (keys.type !== 'combo') {
    return false
  }

  const shortcutString = [...keys.modifiers, keys.key].join('+')
  return BLOCKED_SHORTCUTS[platform].has(shortcutString)
}

/**
 * Check if a key is a printable character
 *
 * @param key - Key to check
 * @returns True if printable
 */
export function isPrintableKey(key: string): boolean {
  return key.length === 1 || key === 'Space'
}

/**
 * Get list of blocked system shortcuts for current platform
 *
 * @param platform - Platform to get shortcuts for
 * @returns Array of blocked shortcut strings
 */
export function getBlockedShortcuts(platform: Platform = getPlatform()): string[] {
  return Array.from(BLOCKED_SHORTCUTS[platform])
}

/**
 * Suggest alternative key combination if validation fails
 *
 * @param keys - Original key combination
 * @returns Suggested alternative or null
 */
export function suggestAlternative(keys: KeyCombination): KeyCombination | null {
  if (keys.type === 'simple' && REQUIRE_MODIFIERS.has(normalizeKey(keys.key))) {
    // Suggest adding Ctrl modifier
    return {
      type: 'combo',
      modifiers: ['Ctrl'],
      key: keys.key,
    }
  }

  // For system shortcuts, try adding Shift
  if (keys.type === 'combo' && isSystemShortcut(keys)) {
    return {
      type: 'combo',
      modifiers: [...keys.modifiers, 'Shift'],
      key: keys.key,
    }
  }

  return null
}
