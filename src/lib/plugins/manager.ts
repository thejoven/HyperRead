import type {
  PluginManifest, PluginRecord, PluginState,
  RegisteredStatusBarItem, RegisteredToolbarButton, RegisteredViewType, RegisteredCommand,
  RegisteredSidebarPanel, FileData, PluginEvent
} from './types'
import type { PluginUIRegistry } from './api-factory'
import { createPluginAPI } from './api-factory'
import { discoverPlugins, loadPlugin, injectPluginStyles, removePluginStyles } from './loader'
import { pluginEventBus } from './event-bus'

export class PluginManager {
  private plugins = new Map<string, PluginRecord>()
  private enabledPlugins = new Set<string>()
  private uiRegistry: PluginUIRegistry
  private getActiveDocument: () => FileData | null
  private onUpdate: () => void

  constructor(
    onUIUpdate: () => void,
    getActiveDocument: () => FileData | null
  ) {
    this.getActiveDocument = getActiveDocument
    this.onUpdate = onUIUpdate
    this.uiRegistry = {
      statusBarItems: new Map(),
      toolbarButtons: new Map(),
      sidebarPanels: new Map(),
      viewTypes: new Map(),
      commands: new Map(),
      onUpdate: onUIUpdate
    }
  }

  async initialize(): Promise<void> {
    const manifests = await discoverPlugins()
    for (const manifest of manifests) {
      this.plugins.set(manifest.id, { manifest, state: 'DISCOVERED' })
    }

    const enabledIds = await this.loadEnabledPlugins()
    for (const id of enabledIds) {
      if (this.plugins.has(id)) {
        await this.enablePlugin(id)
      }
    }

    pluginEventBus.emit('app:ready')
    this.onUpdate()
  }

  async enablePlugin(pluginId: string): Promise<void> {
    const record = this.plugins.get(pluginId)
    if (!record) return
    if (record.state === 'ACTIVE') return

    this.setPluginState(pluginId, 'LOADING')
    try {
      const instance = await loadPlugin(record.manifest)
      const styleElement = await injectPluginStyles(record.manifest)
      const api = createPluginAPI(pluginId, this.uiRegistry, this.getActiveDocument)
      await instance.onload(api)

      this.plugins.set(pluginId, { ...record, state: 'ACTIVE', instance, styleElement })
      this.enabledPlugins.add(pluginId)
      await this.saveEnabledPlugins()
      this.onUpdate()
    } catch (e) {
      console.error(`[PluginManager] Failed to load plugin ${pluginId}:`, e)
      this.setPluginState(pluginId, 'ERRORED', String(e))
    }
  }

  async disablePlugin(pluginId: string): Promise<void> {
    const record = this.plugins.get(pluginId)
    if (!record || record.state !== 'ACTIVE') return

    this.setPluginState(pluginId, 'UNLOADING')
    try {
      await record.instance?.onunload()
    } catch (e) {
      console.error(`[PluginManager] Error in onunload for ${pluginId}:`, e)
    }

    // Clean up event listeners via a temporary API instance
    const tempApi = createPluginAPI(pluginId, this.uiRegistry, this.getActiveDocument)
    tempApi._cleanup()

    this.removePluginUIContributions(pluginId)
    removePluginStyles(record.styleElement)

    this.plugins.set(pluginId, { ...record, state: 'DISABLED', instance: undefined, styleElement: undefined })
    this.enabledPlugins.delete(pluginId)
    await this.saveEnabledPlugins()
    this.onUpdate()
  }

  private removePluginUIContributions(pluginId: string): void {
    for (const key of [...this.uiRegistry.statusBarItems.keys()]) {
      if (key.startsWith(`${pluginId}:`)) this.uiRegistry.statusBarItems.delete(key)
    }
    for (const key of [...this.uiRegistry.toolbarButtons.keys()]) {
      if (key.startsWith(`${pluginId}:`)) this.uiRegistry.toolbarButtons.delete(key)
    }
    for (const [id, panel] of [...this.uiRegistry.sidebarPanels.entries()]) {
      if (panel.pluginId === pluginId) this.uiRegistry.sidebarPanels.delete(id)
    }
    for (const [ext, vt] of [...this.uiRegistry.viewTypes.entries()]) {
      if (vt.pluginId === pluginId) this.uiRegistry.viewTypes.delete(ext)
    }
    for (const key of [...this.uiRegistry.commands.keys()]) {
      if (key.startsWith(`${pluginId}:`)) this.uiRegistry.commands.delete(key)
    }
  }

  getInstalledPlugins(): PluginRecord[] {
    return Array.from(this.plugins.values())
  }

  isEnabled(pluginId: string): boolean {
    return this.enabledPlugins.has(pluginId)
  }

  getStatusBarItems(): RegisteredStatusBarItem[] {
    return Array.from(this.uiRegistry.statusBarItems.values())
  }

  getToolbarButtons(): RegisteredToolbarButton[] {
    return Array.from(this.uiRegistry.toolbarButtons.values())
  }

  getSidebarPanels(): RegisteredSidebarPanel[] {
    return Array.from(this.uiRegistry.sidebarPanels.values())
  }

  getViewType(extension: string): RegisteredViewType | undefined {
    return this.uiRegistry.viewTypes.get(extension.toLowerCase())
  }

  getCommands(): RegisteredCommand[] {
    return Array.from(this.uiRegistry.commands.values())
  }

  emitEvent(event: PluginEvent, data?: unknown): void {
    pluginEventBus.emit(event, data)
  }

  private setPluginState(id: string, state: PluginState, error?: string): void {
    const record = this.plugins.get(id)
    if (record) {
      this.plugins.set(id, { ...record, state, error })
      this.onUpdate()
    }
  }

  private async loadEnabledPlugins(): Promise<string[]> {
    try {
      const data = await window.electronAPI?.pluginAPI?.loadData('__hyperread_core__')
      return (data?.enabledPlugins as string[]) ?? []
    } catch {
      return []
    }
  }

  private async saveEnabledPlugins(): Promise<void> {
    try {
      await window.electronAPI?.pluginAPI?.saveData('__hyperread_core__', {
        enabledPlugins: Array.from(this.enabledPlugins)
      })
    } catch (e) {
      console.error('[PluginManager] Failed to save enabled plugins:', e)
    }
  }
}
