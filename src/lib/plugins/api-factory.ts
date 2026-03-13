import type {
  PluginAPI, PluginEvent, CommandDef, StatusBarItem, StatusBarHandle,
  ToolbarButton, ToolbarHandle, SidebarPanelDef, SidebarHandle,
  SettingsPanelDef, SettingsHandle,
  ViewTypeDef, ViewTypeHandle, FileData,
  RegisteredStatusBarItem, RegisteredToolbarButton, RegisteredViewType, RegisteredCommand,
  RegisteredSidebarPanel, RegisteredSettingsPanel
} from './types'
import { pluginEventBus } from './event-bus'

export interface PluginUIRegistry {
  statusBarItems: Map<string, RegisteredStatusBarItem>
  toolbarButtons: Map<string, RegisteredToolbarButton>
  sidebarPanels: Map<string, RegisteredSidebarPanel>
  settingsPanels: Map<string, RegisteredSettingsPanel>
  viewTypes: Map<string, RegisteredViewType>
  commands: Map<string, RegisteredCommand>
  onUpdate: () => void
}

export function createPluginAPI(
  pluginId: string,
  registry: PluginUIRegistry,
  getActiveDocument: () => FileData | null,
  initialSettings?: Record<string, unknown>,
): PluginAPI & { _cleanup(): void } {
  const pluginHandlers: Array<(data?: unknown) => void> = []
  const pluginSettings: Record<string, unknown> = initialSettings ? { ...initialSettings } : {}

  return {
    on(event: PluginEvent, handler: (data?: unknown) => void) {
      pluginHandlers.push(handler)
      pluginEventBus.on(event, handler)
    },

    off(event: PluginEvent, handler: (data?: unknown) => void) {
      pluginEventBus.off(event, handler)
      const idx = pluginHandlers.indexOf(handler)
      if (idx !== -1) pluginHandlers.splice(idx, 1)
    },

    addCommand(cmd: CommandDef) {
      registry.commands.set(`${pluginId}:${cmd.id}`, { ...cmd, pluginId })
      registry.onUpdate()
    },

    removeCommand(id: string) {
      registry.commands.delete(`${pluginId}:${id}`)
      registry.onUpdate()
    },

    addStatusBarItem(item: StatusBarItem): StatusBarHandle {
      const key = `${pluginId}:${item.id}`
      const registered: RegisteredStatusBarItem = { ...item, pluginId }
      registry.statusBarItems.set(key, registered)
      registry.onUpdate()

      return {
        update(text: string) {
          const existing = registry.statusBarItems.get(key)
          if (existing) {
            existing.text = text
            registry.onUpdate()
          }
        },
        remove() {
          registry.statusBarItems.delete(key)
          registry.onUpdate()
        }
      }
    },

    addToolbarButton(btn: ToolbarButton): ToolbarHandle {
      const key = `${pluginId}:${btn.id}`
      registry.toolbarButtons.set(key, { ...btn, pluginId })
      registry.onUpdate()
      return {
        remove() {
          registry.toolbarButtons.delete(key)
          registry.onUpdate()
        }
      }
    },

    registerSidebarPanel(panel: SidebarPanelDef): SidebarHandle {
      registry.sidebarPanels.set(panel.id, { ...panel, pluginId })
      registry.onUpdate()
      return {
        remove() {
          registry.sidebarPanels.delete(panel.id)
          registry.onUpdate()
        }
      }
    },

    registerSettingsPanel(panel: SettingsPanelDef): SettingsHandle {
      registry.settingsPanels.set(panel.id, { ...panel, pluginId })
      registry.onUpdate()
      return {
        remove() {
          registry.settingsPanels.delete(panel.id)
          registry.onUpdate()
        }
      }
    },

    registerViewType(view: ViewTypeDef): ViewTypeHandle {
      for (const ext of view.extensions) {
        registry.viewTypes.set(ext.toLowerCase(), { ...view, pluginId })
      }
      registry.onUpdate()
      return {
        remove() {
          view.extensions.forEach(ext => registry.viewTypes.delete(ext.toLowerCase()))
          registry.onUpdate()
        }
      }
    },

    getSetting<T>(key: string): T | undefined {
      return pluginSettings[key] as T | undefined
    },

    setSetting<T>(key: string, value: T) {
      pluginSettings[key] = value
      window.electronAPI?.pluginAPI?.saveSettings(pluginId, pluginSettings).catch(console.error)
    },

    async loadData(): Promise<Record<string, unknown>> {
      try {
        const result = await window.electronAPI?.pluginAPI?.loadData(pluginId)
        return result ?? {}
      } catch {
        return {}
      }
    },

    async saveData(data: Record<string, unknown>): Promise<void> {
      try {
        await window.electronAPI?.pluginAPI?.saveData(pluginId, data)
      } catch (e) {
        console.error(`[Plugin:${pluginId}] saveData failed:`, e)
      }
    },

    getActiveDocument(): FileData | null {
      return getActiveDocument()
    },

    async readFile(filePath: string): Promise<FileData> {
      const result = await window.electronAPI?.pluginAPI?.readFile(pluginId, filePath)
      if (!result) throw new Error('electronAPI not available')
      return result as FileData
    },

    log(...args: unknown[]) {
      console.log(`[Plugin:${pluginId}]`, ...args)
    },

    _cleanup() {
      pluginEventBus.removeAllForPlugin(pluginHandlers)
    }
  }
}
