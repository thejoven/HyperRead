// Development-mode plugin hot reloader
// Uses polling since fs.watch is not available in renderer process

import type { PluginManager } from './manager'

const POLL_INTERVAL_MS = 1500

interface PluginFileInfo {
  pluginId: string
  lastSeen: number
}

export class PluginDevWatcher {
  private timer: ReturnType<typeof setInterval> | null = null
  private knownFiles = new Map<string, PluginFileInfo>()
  private manager: PluginManager

  constructor(manager: PluginManager) {
    this.manager = manager
  }

  start(): void {
    if (this.timer) return
    console.log('[PluginDevWatcher] Started polling for plugin changes')
    this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private async poll(): Promise<void> {
    const plugins = this.manager.getInstalledPlugins()
    for (const plugin of plugins) {
      if (plugin.state !== 'ACTIVE') continue
      try {
        const info = await window.electronAPI?.pluginAPI?.readFile(plugin.manifest.id, plugin.manifest.main)
        if (!info) continue
        // Use content length as a simple change heuristic (real hash would be better)
        const key = plugin.manifest.id
        const currentSize = info.content.length
        const prev = this.knownFiles.get(key)
        if (prev && prev.lastSeen !== currentSize) {
          console.log(`[PluginDevWatcher] Change detected in ${plugin.manifest.id}, hot-reloading`)
          await this.manager.disablePlugin(plugin.manifest.id)
          await this.manager.enablePlugin(plugin.manifest.id)
        }
        this.knownFiles.set(key, { pluginId: plugin.manifest.id, lastSeen: currentSize })
      } catch {
        // Ignore errors during polling
      }
    }
  }
}
