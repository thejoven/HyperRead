/**
 * KeyboardShortcutManager - Main API for keyboard shortcut management
 *
 * This module coordinates all shortcut subsystems:
 * - KeyDetector for event handling
 * - ConflictChecker for conflict detection
 * - StorageManager for persistence
 * - Provides high-level API for registering and managing shortcuts
 */

import { KeyDetector } from './detector';
import { ConflictChecker } from './conflict-checker';
import type {
  KeyCombination,
  ShortcutAction,
  ShortcutConfig,
  ConflictInfo,
  Resolution,
  StoredShortcutConfig,
  DEFAULT_PREFERENCES,
  CONFIG_VERSION,
  STORAGE_KEY,
} from './types';

/**
 * Manager configuration options
 */
export interface ManagerOptions {
  /** Enable shortcuts on initialization */
  enableOnInit?: boolean;
  /** Double press interval (ms) */
  doublePressInterval?: number;
  /** Key sequence interval (ms) */
  keySequenceInterval?: number;
  /** Throttle interval (ms) */
  throttleInterval?: number;
  /** Storage key for localStorage */
  storageKey?: string;
}

/**
 * Main keyboard shortcut manager
 */
export class KeyboardShortcutManager {
  private detector: KeyDetector;
  private conflictChecker: ConflictChecker;
  private shortcuts: Map<string, ShortcutConfig> = new Map();
  private handlers: Map<string, () => void | Promise<void>> = new Map();
  private storageKey: string;
  private isEnabled = false;

  /**
   * Create a new KeyboardShortcutManager
   */
  constructor(options: ManagerOptions = {}) {
    this.storageKey = options.storageKey ?? 'hyperread-keyboard-shortcuts';

    this.detector = new KeyDetector({
      doublePressInterval: options.doublePressInterval,
      keySequenceInterval: options.keySequenceInterval,
      throttleInterval: options.throttleInterval,
    });

    this.conflictChecker = new ConflictChecker();

    // Load saved configuration
    this.loadConfiguration();

    // Enable if requested
    if (options.enableOnInit !== false) {
      this.enable();
    }
  }

  /**
   * Register a new shortcut
   */
  register(action: ShortcutAction): boolean {
    // Validate the shortcut
    const validation = this.conflictChecker.validateKeys(action.defaultKeys);
    if (!validation.valid) {
      console.error(`Invalid shortcut for ${action.id}:`, validation.error);
      return false;
    }

    // Check for conflicts
    const conflicts = this.conflictChecker.checkConflicts(
      action.defaultKeys,
      Array.from(this.shortcuts.values()),
      action.id
    );

    if (conflicts.length > 0) {
      console.warn(
        `Shortcut conflict detected for ${action.id}:`,
        conflicts
      );
      // For now, we'll allow registration but log the warning
      // In a full implementation, you might want to handle this differently
    }

    // Create config from action
    const config: ShortcutConfig = {
      id: action.id,
      name: action.name,
      description: action.description,
      category: action.category,
      keys: action.defaultKeys,
      defaultKeys: action.defaultKeys,
      enabled: action.enabled,
      customized: false,
      priority: action.priority,
      scope: action.scope,
      customizable: action.customizable,
    };

    // Store the configuration
    this.shortcuts.set(action.id, config);

    // Store the handler
    this.handlers.set(action.id, action.handler);

    // Register with detector if enabled
    if (config.enabled && this.isEnabled) {
      this.detector.register(action.id, config.keys, action.handler);
    }

    return true;
  }

  /**
   * Unregister a shortcut
   */
  unregister(actionId: string): void {
    this.shortcuts.delete(actionId);
    this.handlers.delete(actionId);
    this.detector.unregister(actionId);
  }

  /**
   * Update a shortcut's key combination
   */
  updateShortcut(
    actionId: string,
    newKeys: KeyCombination
  ): { success: boolean; conflicts?: ConflictInfo[] } {
    const shortcut = this.shortcuts.get(actionId);
    if (!shortcut) {
      return { success: false };
    }

    // Validate new keys
    const validation = this.conflictChecker.validateKeys(newKeys);
    if (!validation.valid) {
      console.error(`Invalid keys for ${actionId}:`, validation.error);
      return { success: false };
    }

    // Check for conflicts
    const conflicts = this.conflictChecker.checkConflicts(
      newKeys,
      Array.from(this.shortcuts.values()),
      actionId
    );

    if (conflicts.length > 0) {
      // Return conflicts for user to resolve
      return { success: false, conflicts };
    }

    // Update the shortcut
    shortcut.keys = newKeys;
    shortcut.customized = !this.conflictChecker.areKeysEqual(
      newKeys,
      shortcut.defaultKeys
    );

    // Re-register with detector
    const handler = this.handlers.get(actionId);
    if (handler && shortcut.enabled && this.isEnabled) {
      this.detector.unregister(actionId);
      this.detector.register(actionId, newKeys, handler);
    }

    // Save configuration
    this.saveConfiguration();

    return { success: true };
  }

  /**
   * Enable a shortcut
   */
  enableShortcut(actionId: string): void {
    const shortcut = this.shortcuts.get(actionId);
    const handler = this.handlers.get(actionId);

    if (!shortcut || !handler) return;

    shortcut.enabled = true;

    if (this.isEnabled) {
      this.detector.register(actionId, shortcut.keys, handler);
    }

    this.saveConfiguration();
  }

  /**
   * Disable a shortcut
   */
  disableShortcut(actionId: string): void {
    const shortcut = this.shortcuts.get(actionId);
    if (!shortcut) return;

    shortcut.enabled = false;
    this.detector.unregister(actionId);

    this.saveConfiguration();
  }

  /**
   * Reset a shortcut to default
   */
  resetShortcut(actionId: string): void {
    const shortcut = this.shortcuts.get(actionId);
    if (!shortcut) return;

    shortcut.keys = shortcut.defaultKeys;
    shortcut.customized = false;

    // Re-register with detector
    const handler = this.handlers.get(actionId);
    if (handler && shortcut.enabled && this.isEnabled) {
      this.detector.unregister(actionId);
      this.detector.register(actionId, shortcut.keys, handler);
    }

    this.saveConfiguration();
  }

  /**
   * Reset all shortcuts to defaults
   */
  resetAllShortcuts(): void {
    for (const [actionId] of this.shortcuts) {
      this.resetShortcut(actionId);
    }
  }

  /**
   * Get all shortcuts configuration
   */
  getAllShortcuts(): ShortcutConfig[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get a specific shortcut
   */
  getShortcut(actionId: string): ShortcutConfig | undefined {
    return this.shortcuts.get(actionId);
  }

  /**
   * Check for conflicts
   */
  detectConflicts(keys: KeyCombination, excludeActionId?: string): ConflictInfo[] {
    return this.conflictChecker.checkConflicts(
      keys,
      Array.from(this.shortcuts.values()),
      excludeActionId
    );
  }

  /**
   * Enable the shortcut system
   */
  enable(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;

    // Register all enabled shortcuts
    for (const [actionId, shortcut] of this.shortcuts) {
      if (shortcut.enabled) {
        const handler = this.handlers.get(actionId);
        if (handler) {
          this.detector.register(actionId, shortcut.keys, handler);
        }
      }
    }

    this.detector.start();
  }

  /**
   * Disable the shortcut system
   */
  disable(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    this.detector.stop();
  }

  /**
   * Check if the system is enabled
   */
  isSystemEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfiguration(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const config: StoredShortcutConfig = JSON.parse(stored);

      // Apply stored configurations to registered shortcuts
      for (const [actionId, storedShortcut] of Object.entries(
        config.shortcuts
      )) {
        const shortcut = this.shortcuts.get(actionId);
        if (shortcut) {
          shortcut.keys = storedShortcut.keys;
          shortcut.enabled = storedShortcut.enabled;
          shortcut.customized = storedShortcut.customized;
        }
      }
    } catch (error) {
      console.error('Failed to load shortcut configuration:', error);
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfiguration(): void {
    try {
      const shortcuts: StoredShortcutConfig['shortcuts'] = {};

      for (const [actionId, shortcut] of this.shortcuts) {
        shortcuts[actionId] = {
          keys: shortcut.keys,
          enabled: shortcut.enabled,
          customized: shortcut.customized,
        };
      }

      const config: StoredShortcutConfig = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        shortcuts,
        preferences: {
          enableGlobal: false,
          enableDoublePress: true,
          doublePressInterval: 500,
          keySequenceInterval: 1000,
        },
      };

      localStorage.setItem(this.storageKey, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save shortcut configuration:', error);
    }
  }

  /**
   * Export configuration
   */
  exportConfiguration(): string {
    const config: StoredShortcutConfig = {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      shortcuts: {},
      preferences: {
        enableGlobal: false,
        enableDoublePress: true,
        doublePressInterval: 500,
        keySequenceInterval: 1000,
      },
    };

    for (const [actionId, shortcut] of this.shortcuts) {
      config.shortcuts[actionId] = {
        keys: shortcut.keys,
        enabled: shortcut.enabled,
        customized: shortcut.customized,
      };
    }

    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration
   */
  importConfiguration(configJson: string): boolean {
    try {
      const config: StoredShortcutConfig = JSON.parse(configJson);

      // Validate version
      if (config.version !== '1.0.0') {
        console.warn('Configuration version mismatch');
      }

      // Apply configuration
      for (const [actionId, storedShortcut] of Object.entries(
        config.shortcuts
      )) {
        const shortcut = this.shortcuts.get(actionId);
        if (shortcut) {
          shortcut.keys = storedShortcut.keys;
          shortcut.enabled = storedShortcut.enabled;
          shortcut.customized = storedShortcut.customized;

          // Re-register if enabled
          const handler = this.handlers.get(actionId);
          if (handler && shortcut.enabled && this.isEnabled) {
            this.detector.unregister(actionId);
            this.detector.register(actionId, shortcut.keys, handler);
          }
        }
      }

      this.saveConfiguration();
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.disable();
    this.detector.clearAll();
    this.shortcuts.clear();
    this.handlers.clear();
  }
}