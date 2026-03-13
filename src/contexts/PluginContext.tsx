'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { PluginManager } from '@/lib/plugins/manager'
import type { PluginRecord, RegisteredStatusBarItem, RegisteredToolbarButton, RegisteredSidebarPanel, RegisteredSettingsPanel, RegisteredViewType, RegisteredCommand } from '@/lib/plugins/types'
import type { FileData } from '@/types/file'

interface PluginContextValue {
  manager: PluginManager | null
  plugins: PluginRecord[]
  statusBarItems: RegisteredStatusBarItem[]
  toolbarButtons: RegisteredToolbarButton[]
  sidebarPanels: RegisteredSidebarPanel[]
  settingsPanels: RegisteredSettingsPanel[]
  commands: RegisteredCommand[]
  getViewType: (ext: string) => RegisteredViewType | undefined
  enablePlugin: (id: string) => Promise<void>
  disablePlugin: (id: string) => Promise<void>
  isEnabled: (id: string) => boolean
  emitDocumentOpen: (file: FileData) => void
  emitDocumentClose: () => void
  emitTabActivate: (file: FileData) => void
  emitThemeChange: (theme: string) => void
}

const PluginContext = createContext<PluginContextValue>({
  manager: null,
  plugins: [],
  statusBarItems: [],
  toolbarButtons: [],
  sidebarPanels: [],
  settingsPanels: [],
  commands: [],
  getViewType: () => undefined,
  enablePlugin: async () => {},
  disablePlugin: async () => {},
  isEnabled: () => false,
  emitDocumentOpen: () => {},
  emitDocumentClose: () => {},
  emitTabActivate: () => {},
  emitThemeChange: () => {},
})

export function usePlugins(): PluginContextValue {
  return useContext(PluginContext)
}

interface PluginProviderProps {
  children: React.ReactNode
  getActiveDocument: () => FileData | null
}

export function PluginProvider({ children, getActiveDocument }: PluginProviderProps) {
  const [, forceUpdate] = useState(0)
  const managerRef = useRef<PluginManager | null>(null)

  const triggerUpdate = useCallback(() => {
    forceUpdate(n => n + 1)
  }, [])

  useEffect(() => {
    const manager = new PluginManager(triggerUpdate, getActiveDocument)
    managerRef.current = manager
    manager.initialize().catch(console.error)
    return () => {
      // Disable all active plugins on unmount
      manager.getInstalledPlugins()
        .filter(p => p.state === 'ACTIVE')
        .forEach(p => manager.disablePlugin(p.manifest.id).catch(console.error))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const manager = managerRef.current

  const value: PluginContextValue = {
    manager,
    plugins: manager?.getInstalledPlugins() ?? [],
    statusBarItems: manager?.getStatusBarItems() ?? [],
    toolbarButtons: manager?.getToolbarButtons() ?? [],
    sidebarPanels: manager?.getSidebarPanels() ?? [],
    settingsPanels: manager?.getSettingsPanels() ?? [],
    commands: manager?.getCommands() ?? [],
    getViewType: (ext) => manager?.getViewType(ext),
    enablePlugin: async (id) => { await manager?.enablePlugin(id) },
    disablePlugin: async (id) => { await manager?.disablePlugin(id) },
    isEnabled: (id) => manager?.isEnabled(id) ?? false,
    emitDocumentOpen: (file) => manager?.emitEvent('document:open', file),
    emitDocumentClose: () => manager?.emitEvent('document:close'),
    emitTabActivate: (file) => manager?.emitEvent('tab:activate', file),
    emitThemeChange: (theme) => manager?.emitEvent('theme:change', theme),
  }

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  )
}
