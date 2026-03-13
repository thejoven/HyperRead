import type { FileData } from '@/types/file'
export type { FileData }

export type PluginEvent = 'document:open' | 'document:close' | 'tab:activate' | 'tab:close' | 'theme:change' | 'app:ready'

export interface PluginManifest {
  id: string
  name: string
  version: string
  minAppVersion?: string
  apiVersion: number
  author?: string
  description?: string
  main: string
  styles?: string
  permissions?: string[]
  settings?: PluginSettingDef[]
}

export interface PluginSettingDef {
  id: string
  type: 'string' | 'number' | 'boolean' | 'select'
  title: string
  description?: string
  options?: string[]
  default?: unknown
}

export interface StatusBarItem {
  id: string
  text: string
  tooltip?: string
  onClick?: () => void
}

export interface StatusBarHandle {
  update(text: string): void
  remove(): void
}

export interface ToolbarButton {
  id: string
  icon: string
  tooltip?: string
  onClick: () => void
}

export interface ToolbarHandle {
  remove(): void
}

export interface SidebarPanelDef {
  id: string
  title: string
  icon?: string  // emoji or single char
  /** Called when the panel becomes visible. Return a cleanup fn or void. */
  render: (container: HTMLElement) => (() => void) | void
}

export interface SidebarHandle {
  remove(): void
}

export interface RegisteredSidebarPanel extends SidebarPanelDef {
  pluginId: string
}

export interface ViewTypeDef {
  extensions: string[]
  render: (fileData: FileData, container: HTMLElement) => void | (() => void)
}

export interface ViewTypeHandle {
  remove(): void
}

export interface CommandDef {
  id: string
  name: string
  shortcut?: string
  callback: () => void
}

export interface PluginAPI {
  on(event: PluginEvent, handler: (data?: unknown) => void): void
  off(event: PluginEvent, handler: (data?: unknown) => void): void
  addCommand(cmd: CommandDef): void
  removeCommand(id: string): void
  addStatusBarItem(item: StatusBarItem): StatusBarHandle
  addToolbarButton(btn: ToolbarButton): ToolbarHandle
  registerSidebarPanel(panel: SidebarPanelDef): SidebarHandle
  registerViewType(view: ViewTypeDef): ViewTypeHandle
  getSetting<T>(key: string): T | undefined
  setSetting<T>(key: string, value: T): void
  loadData(): Promise<Record<string, unknown>>
  saveData(data: Record<string, unknown>): Promise<void>
  getActiveDocument(): FileData | null
  readFile(path: string): Promise<FileData>
  log(...args: unknown[]): void
}

export interface HyperReadPlugin {
  onload(api: PluginAPI): void | Promise<void>
  onunload(): void | Promise<void>
}

export type PluginState = 'DISCOVERED' | 'LOADING' | 'ACTIVE' | 'UNLOADING' | 'DISABLED' | 'ERRORED'

export interface PluginRecord {
  manifest: PluginManifest
  state: PluginState
  instance?: HyperReadPlugin
  error?: string
  styleElement?: HTMLStyleElement
}

export interface RegisteredStatusBarItem extends StatusBarItem {
  pluginId: string
}

export interface RegisteredToolbarButton extends ToolbarButton {
  pluginId: string
}

export interface RegisteredViewType extends ViewTypeDef {
  pluginId: string
}

export interface RegisteredCommand extends CommandDef {
  pluginId: string
}
