/**
 * ShortcutManagerContext - Global context for keyboard shortcut management
 *
 * Provides the KeyboardShortcutManager instance to all components
 * in the application tree. This is the new implementation following
 * the keyboard-shortcuts-system-design.md specification.
 */

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { KeyboardShortcutManager, ManagerOptions } from '../lib/shortcuts/manager';
import type { ShortcutConfig } from '../lib/shortcuts/types';

/**
 * Context value type
 */
export interface ShortcutManagerContextValue {
  /** The keyboard shortcut manager instance */
  manager: KeyboardShortcutManager | null;
  /** All registered shortcuts */
  shortcuts: ShortcutConfig[];
  /** Refresh shortcuts list */
  refresh: () => void;
}

/**
 * Shortcut manager context
 */
export const ShortcutManagerContext = createContext<ShortcutManagerContextValue>({
  manager: null,
  shortcuts: [],
  refresh: () => {},
});

/**
 * Provider props
 */
export interface ShortcutManagerProviderProps {
  children: ReactNode;
  options?: ManagerOptions;
}

/**
 * Shortcut manager context provider
 *
 * @example
 * ```tsx
 * <ShortcutManagerProvider>
 *   <App />
 * </ShortcutManagerProvider>
 * ```
 */
export function ShortcutManagerProvider({
  children,
  options,
}: ShortcutManagerProviderProps) {
  const [manager] = useState<KeyboardShortcutManager>(() => {
    return new KeyboardShortcutManager({
      enableOnInit: true,
      doublePressInterval: 500,
      keySequenceInterval: 1000,
      throttleInterval: 16,
      ...options,
    });
  });

  const [shortcuts, setShortcuts] = useState<ShortcutConfig[]>([]);

  // Refresh shortcuts list
  const refresh = () => {
    if (manager) {
      setShortcuts(manager.getAllShortcuts());
    }
  };

  // Initialize shortcuts list
  useEffect(() => {
    refresh();
  }, [manager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, [manager]);

  const value: ShortcutManagerContextValue = {
    manager,
    shortcuts,
    refresh,
  };

  return (
    <ShortcutManagerContext.Provider value={value}>
      {children}
    </ShortcutManagerContext.Provider>
  );
}

/**
 * Hook to access the shortcut manager context
 *
 * @example
 * ```tsx
 * const { manager, shortcuts } = useShortcutManager();
 * ```
 */
export function useShortcutManager() {
  const context = React.useContext(ShortcutManagerContext);

  if (!context.manager) {
    throw new Error(
      'useShortcutManager must be used within ShortcutManagerProvider'
    );
  }

  return context;
}