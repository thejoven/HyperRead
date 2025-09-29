/**
 * useKeyboardShortcut - React hook for easy shortcut registration
 *
 * This hook provides a convenient way to register keyboard shortcuts
 * in React components with automatic cleanup on unmount.
 */

import { useEffect, useRef, useContext } from 'react';
import type { KeyCombination } from '../shortcuts/types';
import { ShortcutManagerContext } from '../../contexts/ShortcutManagerContext';

/**
 * Options for the useKeyboardShortcut hook
 */
export interface UseKeyboardShortcutOptions {
  /** Whether the shortcut is enabled */
  enabled?: boolean;
  /** Description of what the shortcut does */
  description?: string;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  /** Custom action ID (auto-generated if not provided) */
  actionId?: string;
}

/**
 * Hook for registering keyboard shortcuts
 *
 * @example
 * ```tsx
 * useKeyboardShortcut(
 *   { type: 'combo', modifiers: ['Ctrl'], key: 's' },
 *   () => console.log('Save!'),
 *   { enabled: true, description: 'Save document' }
 * );
 * ```
 */
export function useKeyboardShortcut(
  keys: KeyCombination,
  handler: () => void | Promise<void>,
  options: UseKeyboardShortcutOptions = {}
): void {
  const { manager } = useContext(ShortcutManagerContext);
  const handlerRef = useRef(handler);
  const actionIdRef = useRef(
    options.actionId ?? `hook-shortcut-${Math.random().toString(36).slice(2)}`
  );

  // Keep handler ref up to date
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!manager) {
      console.warn('ShortcutManagerContext not found. Make sure ShortcutManagerProvider is in the component tree.');
      return;
    }

    const enabled = options.enabled !== false;
    if (!enabled) return;

    const actionId = actionIdRef.current;

    // Register the shortcut
    const registered = manager.register({
      id: actionId,
      name: options.description ?? 'Custom shortcut',
      description: options.description ?? '',
      category: 'system',
      defaultKeys: keys,
      handler: () => handlerRef.current(),
      enabled: true,
      priority: 5, // Medium priority for hook shortcuts
      customizable: false,
    });

    if (!registered) {
      console.warn(`Failed to register shortcut: ${actionId}`);
    }

    // Cleanup on unmount
    return () => {
      manager.unregister(actionId);
    };
  }, [manager, keys, options.enabled, options.description]);
}

/**
 * Hook for registering multiple shortcuts at once
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   save: {
 *     keys: { type: 'combo', modifiers: ['Ctrl'], key: 's' },
 *     handler: () => console.log('Save'),
 *   },
 *   open: {
 *     keys: { type: 'combo', modifiers: ['Ctrl'], key: 'o' },
 *     handler: () => console.log('Open'),
 *   },
 * });
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: Record<
    string,
    {
      keys: KeyCombination;
      handler: () => void | Promise<void>;
      enabled?: boolean;
      description?: string;
    }
  >
): void {
  const { manager } = useContext(ShortcutManagerContext);
  const handlersRef = useRef(shortcuts);

  // Keep handlers ref up to date
  useEffect(() => {
    handlersRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!manager) {
      console.warn('ShortcutManagerContext not found. Make sure ShortcutManagerProvider is in the component tree.');
      return;
    }

    const actionIds: string[] = [];

    // Register all shortcuts
    for (const [id, shortcut] of Object.entries(shortcuts)) {
      const enabled = shortcut.enabled !== false;
      if (!enabled) continue;

      const actionId = `hook-shortcuts-${id}`;
      actionIds.push(actionId);

      manager.register({
        id: actionId,
        name: shortcut.description ?? id,
        description: shortcut.description ?? '',
        category: 'system',
        defaultKeys: shortcut.keys,
        handler: () => handlersRef.current[id]?.handler(),
        enabled: true,
        priority: 5,
        customizable: false,
      });
    }

    // Cleanup on unmount
    return () => {
      for (const actionId of actionIds) {
        manager.unregister(actionId);
      }
    };
  }, [manager]); // Intentionally only depend on manager
}

/**
 * Hook to check if a specific shortcut is registered
 */
export function useIsShortcutRegistered(actionId: string): boolean {
  const { manager } = useContext(ShortcutManagerContext);

  if (!manager) return false;

  const shortcut = manager.getShortcut(actionId);
  return shortcut !== undefined;
}

/**
 * Hook to get all registered shortcuts
 */
export function useAllShortcuts() {
  const { manager } = useContext(ShortcutManagerContext);

  if (!manager) return [];

  return manager.getAllShortcuts();
}

/**
 * Hook to enable/disable the entire shortcut system
 */
export function useShortcutSystem() {
  const { manager } = useContext(ShortcutManagerContext);

  return {
    enable: () => manager?.enable(),
    disable: () => manager?.disable(),
    isEnabled: () => manager?.isSystemEnabled() ?? false,
  };
}