/**
 * KeyDetector - Keyboard event detection and handling
 *
 * This module handles:
 * - Listening to keyboard events (keydown, keyup)
 * - Detecting single keys, key combinations, and double-press
 * - Tracking pressed keys state
 * - Throttling for performance
 * - Ignoring events in input fields
 */

import type {
  KeyCombination,
  SimpleKey,
  ModifierCombo,
  DoublePress,
  KeySequence,
  Modifier,
  PressedKeysState,
  ShortcutHandler,
} from './types';

/**
 * Configuration options for KeyDetector
 */
export interface KeyDetectorOptions {
  /** Maximum interval for double press detection (ms) */
  doublePressInterval?: number;
  /** Maximum interval for key sequence detection (ms) */
  keySequenceInterval?: number;
  /** Throttle interval for performance (ms) */
  throttleInterval?: number;
}

/**
 * Registered shortcut with its handler
 */
interface RegisteredShortcut {
  keys: KeyCombination;
  handler: ShortcutHandler;
  id: string;
}

/**
 * KeyDetector class for detecting keyboard shortcuts
 */
export class KeyDetector {
  private isEnabled = false;
  private pressedKeys: PressedKeysState = {
    keys: new Set(),
    modifiers: new Set(),
    lastKeyTime: 0,
    lastKey: '',
  };

  private doublePressInterval: number;
  private keySequenceInterval: number;
  private throttleInterval: number;
  private lastThrottleTime = 0;

  private registeredShortcuts: Map<string, RegisteredShortcut> = new Map();
  private sequenceBuffer: string[] = [];
  private sequenceTimer: NodeJS.Timeout | null = null;

  /**
   * Create a new KeyDetector instance
   */
  constructor(options: KeyDetectorOptions = {}) {
    this.doublePressInterval = options.doublePressInterval ?? 500;
    this.keySequenceInterval = options.keySequenceInterval ?? 1000;
    this.throttleInterval = options.throttleInterval ?? 16; // ~60 FPS
  }

  /**
   * Start listening to keyboard events
   */
  start(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;
    window.addEventListener('keydown', this.handleKeyDown, true);
    window.addEventListener('keyup', this.handleKeyUp, true);
  }

  /**
   * Stop listening to keyboard events
   */
  stop(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    window.removeEventListener('keydown', this.handleKeyDown, true);
    window.removeEventListener('keyup', this.handleKeyUp, true);
    this.cleanup();
  }

  /**
   * Register a shortcut with its handler
   */
  register(id: string, keys: KeyCombination, handler: ShortcutHandler): void {
    this.registeredShortcuts.set(id, { keys, handler, id });
  }

  /**
   * Unregister a shortcut
   */
  unregister(id: string): void {
    this.registeredShortcuts.delete(id);
  }

  /**
   * Clear all registered shortcuts
   */
  clearAll(): void {
    this.registeredShortcuts.clear();
    this.cleanup();
  }

  /**
   * Handle keydown event
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    // Ignore if disabled
    if (!this.isEnabled) return;

    // Throttle for performance
    const now = Date.now();
    if (now - this.lastThrottleTime < this.throttleInterval) {
      return;
    }
    this.lastThrottleTime = now;

    // Ignore events in input elements (except for Escape)
    if (event.key !== 'Escape' && this.isInputElement(event.target)) {
      return;
    }

    // Normalize the key
    const key = this.normalizeKey(event.key);

    // Update pressed keys state
    this.pressedKeys.keys.add(key);

    // Track modifiers
    if (event.ctrlKey || event.metaKey) {
      this.pressedKeys.modifiers.add(this.getModifierKey(event));
    }
    if (event.altKey) this.pressedKeys.modifiers.add('Alt');
    if (event.shiftKey) this.pressedKeys.modifiers.add('Shift');

    // Check for matches
    this.checkShortcuts(event);

    // Update timing for double press detection
    this.pressedKeys.lastKeyTime = now;
    this.pressedKeys.lastKey = key;
  };

  /**
   * Handle keyup event
   */
  private handleKeyUp = (event: KeyboardEvent): void => {
    if (!this.isEnabled) return;

    const key = this.normalizeKey(event.key);
    this.pressedKeys.keys.delete(key);

    // Update modifiers
    if (!event.ctrlKey && !event.metaKey) {
      this.pressedKeys.modifiers.delete('Ctrl');
      this.pressedKeys.modifiers.delete('Meta');
    }
    if (!event.altKey) this.pressedKeys.modifiers.delete('Alt');
    if (!event.shiftKey) this.pressedKeys.modifiers.delete('Shift');
  };

  /**
   * Check all registered shortcuts for matches
   */
  private checkShortcuts(event: KeyboardEvent): void {
    for (const { keys, handler, id } of this.registeredShortcuts.values()) {
      if (this.matchesKeyCombination(keys, event)) {
        event.preventDefault();
        event.stopPropagation();
        handler(event);
        break; // Only trigger the first match
      }
    }
  }

  /**
   * Check if a key combination matches the current state
   */
  private matchesKeyCombination(
    keys: KeyCombination,
    event: KeyboardEvent
  ): boolean {
    switch (keys.type) {
      case 'simple':
        return this.matchesSimpleKey(keys);
      case 'combo':
        return this.matchesModifierCombo(keys);
      case 'double':
        return this.matchesDoublePress(keys);
      case 'sequence':
        return this.matchesKeySequence(keys);
      default:
        return false;
    }
  }

  /**
   * Match simple key press
   */
  private matchesSimpleKey(keys: SimpleKey): boolean {
    const normalizedKey = this.normalizeKey(keys.key);
    return (
      this.pressedKeys.keys.has(normalizedKey) &&
      this.pressedKeys.modifiers.size === 0
    );
  }

  /**
   * Match modifier combination
   */
  private matchesModifierCombo(keys: ModifierCombo): boolean {
    const normalizedKey = this.normalizeKey(keys.key);

    // Check if the main key is pressed
    if (!this.pressedKeys.keys.has(normalizedKey)) {
      return false;
    }

    // Check if all required modifiers are pressed
    const requiredModifiers = new Set(keys.modifiers);
    if (requiredModifiers.size !== this.pressedKeys.modifiers.size) {
      return false;
    }

    for (const modifier of keys.modifiers) {
      if (!this.pressedKeys.modifiers.has(modifier)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Match double press
   */
  private matchesDoublePress(keys: DoublePress): boolean {
    const now = Date.now();
    const normalizedKey = this.normalizeKey(keys.key);
    const maxInterval = keys.maxInterval ?? this.doublePressInterval;

    // Check if this is the second press of the same key
    const isDoublePress =
      normalizedKey === this.pressedKeys.lastKey &&
      now - this.pressedKeys.lastKeyTime < maxInterval &&
      this.pressedKeys.lastKeyTime > 0;

    return isDoublePress;
  }

  /**
   * Match key sequence (not fully implemented in this version)
   */
  private matchesKeySequence(keys: KeySequence): boolean {
    // Simplified implementation - can be extended later
    return false;
  }

  /**
   * Normalize key name
   */
  private normalizeKey(key: string): string {
    // Convert to lowercase for consistency
    const normalized = key.toLowerCase();

    // Handle special keys
    const keyMap: Record<string, string> = {
      control: 'ctrl',
      command: 'meta',
      cmd: 'meta',
      ' ': 'space',
      arrowup: 'up',
      arrowdown: 'down',
      arrowleft: 'left',
      arrowright: 'right',
    };

    return keyMap[normalized] ?? normalized;
  }

  /**
   * Get the appropriate modifier key based on platform
   */
  private getModifierKey(event: KeyboardEvent): Modifier {
    // On macOS, use Meta (Cmd) instead of Ctrl
    const isMac = navigator.platform.toLowerCase().includes('mac');
    return isMac && event.metaKey ? 'Meta' : 'Ctrl';
  }

  /**
   * Check if the event target is an input element
   */
  private isInputElement(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) {
      return false;
    }

    const tagName = target.tagName.toLowerCase();
    const isEditable = target.isContentEditable;

    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      isEditable
    );
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    this.pressedKeys.keys.clear();
    this.pressedKeys.modifiers.clear();
    this.sequenceBuffer = [];
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
  }

  /**
   * Get current pressed keys state (for debugging)
   */
  getState(): PressedKeysState {
    return {
      keys: new Set(this.pressedKeys.keys),
      modifiers: new Set(this.pressedKeys.modifiers),
      lastKeyTime: this.pressedKeys.lastKeyTime,
      lastKey: this.pressedKeys.lastKey,
    };
  }
}