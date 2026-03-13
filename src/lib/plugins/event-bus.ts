import type { PluginEvent } from './types'

type Handler = (data?: unknown) => void

export class PluginEventBus {
  private listeners = new Map<PluginEvent, Set<Handler>>()

  on(event: PluginEvent, handler: Handler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
  }

  off(event: PluginEvent, handler: Handler): void {
    this.listeners.get(event)?.delete(handler)
  }

  emit(event: PluginEvent, data?: unknown): void {
    this.listeners.get(event)?.forEach(handler => {
      try {
        handler(data)
      } catch (e) {
        console.error(`[PluginEventBus] Error in handler for ${event}:`, e)
      }
    })
  }

  removeAllForPlugin(handlers: Handler[]): void {
    for (const [, handlerSet] of this.listeners) {
      handlers.forEach(h => handlerSet.delete(h))
    }
  }

  clear(): void {
    this.listeners.clear()
  }
}

export const pluginEventBus = new PluginEventBus()
