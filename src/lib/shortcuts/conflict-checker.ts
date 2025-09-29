/**
 * ConflictChecker - Detect and resolve keyboard shortcut conflicts
 *
 * This module handles:
 * - Detecting when shortcuts use the same key combination
 * - Comparing key combinations for equality
 * - Priority-based conflict resolution
 * - Suggesting alternative key combinations
 */

import type {
  KeyCombination,
  SimpleKey,
  ModifierCombo,
  DoublePress,
  KeySequence,
  ShortcutConfig,
  ConflictInfo,
  Resolution,
  ConflictResolution,
  Modifier,
} from './types';

/**
 * ConflictChecker class for managing shortcut conflicts
 */
export class ConflictChecker {
  /**
   * Check if a key combination conflicts with existing shortcuts
   */
  checkConflicts(
    newKeys: KeyCombination,
    existingShortcuts: ShortcutConfig[],
    excludeActionId?: string
  ): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];

    for (const shortcut of existingShortcuts) {
      // Skip the action being updated
      if (excludeActionId && shortcut.id === excludeActionId) {
        continue;
      }

      // Skip disabled shortcuts
      if (!shortcut.enabled) {
        continue;
      }

      // Check if key combinations match
      if (this.areKeysEqual(newKeys, shortcut.keys)) {
        conflicts.push({
          actionId: shortcut.id,
          actionName: shortcut.name,
          keys: shortcut.keys,
          priority: shortcut.priority,
        });
      }
    }

    return conflicts;
  }

  /**
   * Check if two key combinations are equal
   */
  areKeysEqual(keys1: KeyCombination, keys2: KeyCombination): boolean {
    // Different types cannot be equal
    if (keys1.type !== keys2.type) {
      return false;
    }

    switch (keys1.type) {
      case 'simple':
        return this.compareSimpleKeys(keys1, keys2 as SimpleKey);
      case 'combo':
        return this.compareModifierCombos(keys1, keys2 as ModifierCombo);
      case 'double':
        return this.compareDoublePresses(keys1, keys2 as DoublePress);
      case 'sequence':
        return this.compareKeySequences(keys1, keys2 as KeySequence);
      default:
        return false;
    }
  }

  /**
   * Compare simple keys
   */
  private compareSimpleKeys(key1: SimpleKey, key2: SimpleKey): boolean {
    return this.normalizeKey(key1.key) === this.normalizeKey(key2.key);
  }

  /**
   * Compare modifier combinations
   */
  private compareModifierCombos(
    combo1: ModifierCombo,
    combo2: ModifierCombo
  ): boolean {
    // Check if main keys match
    if (this.normalizeKey(combo1.key) !== this.normalizeKey(combo2.key)) {
      return false;
    }

    // Check if modifiers match (order doesn't matter)
    if (combo1.modifiers.length !== combo2.modifiers.length) {
      return false;
    }

    const mods1 = new Set(combo1.modifiers);
    const mods2 = new Set(combo2.modifiers);

    for (const mod of mods1) {
      if (!mods2.has(mod)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Compare double presses
   */
  private compareDoublePresses(
    press1: DoublePress,
    press2: DoublePress
  ): boolean {
    return this.normalizeKey(press1.key) === this.normalizeKey(press2.key);
  }

  /**
   * Compare key sequences
   */
  private compareKeySequences(
    seq1: KeySequence,
    seq2: KeySequence
  ): boolean {
    if (seq1.keys.length !== seq2.keys.length) {
      return false;
    }

    for (let i = 0; i < seq1.keys.length; i++) {
      if (!this.areKeysEqual(seq1.keys[i], seq2.keys[i])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Resolve conflicts automatically based on priority
   */
  resolveConflicts(
    conflicts: ConflictInfo[],
    newPriority: number
  ): Resolution[] {
    return conflicts.map((conflict) => {
      let resolution: ConflictResolution;

      if (conflict.priority > newPriority) {
        // Existing shortcut has higher priority
        resolution = 'disable_new';
      } else if (conflict.priority < newPriority) {
        // New shortcut has higher priority
        resolution = 'disable_conflict';
      } else {
        // Equal priority - suggest alternative
        resolution = 'suggest_alternative';
      }

      return {
        conflictActionId: conflict.actionId,
        resolution,
        suggestion: resolution === 'suggest_alternative'
          ? this.suggestAlternative(conflict.keys)
          : undefined,
      };
    });
  }

  /**
   * Suggest an alternative key combination
   */
  suggestAlternative(keys: KeyCombination): KeyCombination | undefined {
    // For simple keys, try adding Ctrl modifier
    if (keys.type === 'simple') {
      return {
        type: 'combo',
        modifiers: ['Ctrl'],
        key: keys.key,
      };
    }

    // For combos, try adding another modifier
    if (keys.type === 'combo') {
      const currentModifiers = new Set(keys.modifiers);
      const possibleModifiers: Modifier[] = ['Ctrl', 'Alt', 'Shift', 'Meta'];

      // Find a modifier not currently used
      for (const mod of possibleModifiers) {
        if (!currentModifiers.has(mod)) {
          return {
            type: 'combo',
            modifiers: [...keys.modifiers, mod],
            key: keys.key,
          };
        }
      }
    }

    // For double press and sequences, no simple alternative
    return undefined;
  }

  /**
   * Get alternative key suggestions (multiple options)
   */
  getAlternativeSuggestions(
    keys: KeyCombination,
    existingShortcuts: ShortcutConfig[],
    count = 3
  ): KeyCombination[] {
    const suggestions: KeyCombination[] = [];
    const usedKeys = new Set(
      existingShortcuts.map((s) => this.stringifyKeys(s.keys))
    );

    if (keys.type === 'simple') {
      // Try different modifier combinations
      const modifierCombos: Modifier[][] = [
        ['Ctrl'],
        ['Alt'],
        ['Shift'],
        ['Ctrl', 'Shift'],
        ['Ctrl', 'Alt'],
        ['Alt', 'Shift'],
      ];

      for (const modifiers of modifierCombos) {
        const suggestion: ModifierCombo = {
          type: 'combo',
          modifiers,
          key: keys.key,
        };

        if (!usedKeys.has(this.stringifyKeys(suggestion))) {
          suggestions.push(suggestion);
          if (suggestions.length >= count) break;
        }
      }
    } else if (keys.type === 'combo') {
      // Try adding/changing modifiers
      const currentMods = new Set(keys.modifiers);
      const allMods: Modifier[] = ['Ctrl', 'Alt', 'Shift', 'Meta'];

      for (const mod of allMods) {
        if (!currentMods.has(mod)) {
          const suggestion: ModifierCombo = {
            type: 'combo',
            modifiers: [...keys.modifiers, mod],
            key: keys.key,
          };

          if (!usedKeys.has(this.stringifyKeys(suggestion))) {
            suggestions.push(suggestion);
            if (suggestions.length >= count) break;
          }
        }
      }
    }

    return suggestions;
  }

  /**
   * Convert key combination to string for comparison
   */
  stringifyKeys(keys: KeyCombination): string {
    switch (keys.type) {
      case 'simple':
        return this.normalizeKey(keys.key);
      case 'combo': {
        const modifiers = keys.modifiers.sort().join('+');
        const key = this.normalizeKey(keys.key);
        return `${modifiers}+${key}`;
      }
      case 'double':
        return `${this.normalizeKey(keys.key)} ${this.normalizeKey(keys.key)}`;
      case 'sequence':
        return keys.keys.map((k) => this.stringifyKeys(k)).join(' ');
      default:
        return '';
    }
  }

  /**
   * Parse a string representation back to KeyCombination
   */
  parseKeys(keyString: string): KeyCombination | null {
    // Check for double press (e.g., "shift shift")
    const doublePressMatch = keyString.match(/^(\w+)\s+\1$/i);
    if (doublePressMatch) {
      return {
        type: 'double',
        key: doublePressMatch[1],
        maxInterval: 500,
      };
    }

    // Check for key sequence (multiple parts separated by space)
    if (keyString.includes(' ')) {
      const parts = keyString.split(' ');
      const keys: (SimpleKey | ModifierCombo)[] = [];

      for (const part of parts) {
        const parsed = this.parseSingleKey(part);
        if (!parsed) return null;
        keys.push(parsed);
      }

      return {
        type: 'sequence',
        keys,
        maxInterval: 1000,
      };
    }

    // Single key or combo
    return this.parseSingleKey(keyString);
  }

  /**
   * Parse a single key or combination
   */
  private parseSingleKey(keyString: string): SimpleKey | ModifierCombo | null {
    if (!keyString) return null;

    // Split by + for combinations
    const parts = keyString.split('+').map((p) => p.trim());

    if (parts.length === 1) {
      // Simple key
      return {
        type: 'simple',
        key: parts[0],
      };
    }

    // Modifier combo
    const modifiers: Modifier[] = [];
    let mainKey = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const normalized = part.toLowerCase();

      if (
        normalized === 'ctrl' ||
        normalized === 'alt' ||
        normalized === 'shift' ||
        normalized === 'meta' ||
        normalized === 'cmd'
      ) {
        const mod =
          normalized === 'cmd' ? 'Meta' : (part as Modifier);
        modifiers.push(mod);
      } else if (i === parts.length - 1) {
        mainKey = part;
      } else {
        return null; // Invalid format
      }
    }

    if (!mainKey) return null;

    return {
      type: 'combo',
      modifiers,
      key: mainKey,
    };
  }

  /**
   * Normalize key name for comparison
   */
  private normalizeKey(key: string): string {
    const normalized = key.toLowerCase().trim();

    // Handle common variations
    const keyMap: Record<string, string> = {
      control: 'ctrl',
      command: 'meta',
      cmd: 'meta',
      ' ': 'space',
      arrowup: 'up',
      arrowdown: 'down',
      arrowleft: 'left',
      arrowright: 'right',
      esc: 'escape',
      del: 'delete',
    };

    return keyMap[normalized] ?? normalized;
  }

  /**
   * Validate a key combination
   */
  validateKeys(keys: KeyCombination): { valid: boolean; error?: string } {
    switch (keys.type) {
      case 'simple':
        if (!keys.key || keys.key.trim() === '') {
          return { valid: false, error: 'Key cannot be empty' };
        }
        break;

      case 'combo':
        if (!keys.key || keys.key.trim() === '') {
          return { valid: false, error: 'Main key cannot be empty' };
        }
        if (keys.modifiers.length === 0) {
          return {
            valid: false,
            error: 'At least one modifier is required for combinations',
          };
        }
        break;

      case 'double':
        if (!keys.key || keys.key.trim() === '') {
          return { valid: false, error: 'Key cannot be empty' };
        }
        if (keys.maxInterval && keys.maxInterval < 100) {
          return {
            valid: false,
            error: 'Double press interval must be at least 100ms',
          };
        }
        break;

      case 'sequence':
        if (!keys.keys || keys.keys.length < 2) {
          return {
            valid: false,
            error: 'Sequence must have at least 2 keys',
          };
        }
        break;
    }

    return { valid: true };
  }
}