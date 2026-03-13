'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import type { PluginRecord } from '@/lib/plugins/types'
import { usePlugins } from '@/contexts/PluginContext'

interface PluginSettingsRendererProps {
  plugin: PluginRecord
  onUninstalled: () => void
}

export default function PluginSettingsRenderer({ plugin, onUninstalled }: PluginSettingsRendererProps) {
  const { isEnabled, enablePlugin, disablePlugin, settingsPanels } = usePlugins()
  const [toggling, setToggling] = useState(false)
  const [uninstalling, setUninstalling] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const settingsContainerRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | void>(undefined)

  const enabled = isEnabled(plugin.manifest.id)
  const busy = toggling || plugin.state === 'LOADING' || plugin.state === 'UNLOADING'

  // Find settings panels for this plugin
  const pluginSettingsPanels = settingsPanels.filter(p => p.pluginId === plugin.manifest.id)
  const hasSettings = pluginSettingsPanels.length > 0

  // Render the first settings panel into the container when showSettings becomes true
  useEffect(() => {
    if (!showSettings || !settingsContainerRef.current || pluginSettingsPanels.length === 0) return

    const panel = pluginSettingsPanels[0]
    const container = settingsContainerRef.current
    container.innerHTML = ''

    const cleanup = panel.render(container)
    cleanupRef.current = cleanup

    return () => {
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current()
        cleanupRef.current = undefined
      }
      if (container) container.innerHTML = ''
    }
  }, [showSettings, pluginSettingsPanels.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup when settings panel is removed (plugin disabled)
  useEffect(() => {
    if (showSettings && pluginSettingsPanels.length === 0) {
      setShowSettings(false)
    }
  }, [pluginSettingsPanels.length, showSettings])

  const handleToggle = async () => {
    setToggling(true)
    try {
      if (enabled) {
        await disablePlugin(plugin.manifest.id)
      } else {
        await enablePlugin(plugin.manifest.id)
      }
    } finally {
      setToggling(false)
    }
  }

  const handleUninstall = async () => {
    if (!confirm(`确定要卸载插件 "${plugin.manifest.name}" 吗？`)) return
    setUninstalling(true)
    try {
      if (enabled) await disablePlugin(plugin.manifest.id)
      await window.electronAPI?.pluginAPI?.uninstall(plugin.manifest.id)
      onUninstalled()
    } catch (e) {
      console.error('Uninstall failed:', e)
    } finally {
      setUninstalling(false)
    }
  }

  const stateColor: Record<string, string> = {
    ACTIVE: 'text-green-500',
    ERRORED: 'text-red-500',
    LOADING: 'text-yellow-500',
    UNLOADING: 'text-yellow-500',
    DISABLED: 'text-muted-foreground',
    DISCOVERED: 'text-muted-foreground',
  }

  return (
    <div className="rounded-lg border border-border/30 bg-muted/10 overflow-hidden">
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{plugin.manifest.name}</span>
              <span className="text-xs text-muted-foreground">v{plugin.manifest.version}</span>
              <span className={`text-xs ${stateColor[plugin.state] ?? 'text-muted-foreground'}`}>
                {plugin.state.toLowerCase()}
              </span>
            </div>
            {plugin.manifest.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{plugin.manifest.description}</p>
            )}
            {plugin.manifest.author && (
              <p className="text-xs text-muted-foreground">by {plugin.manifest.author}</p>
            )}
            {plugin.error && (
              <p className="text-xs text-red-500 mt-1 break-all">{plugin.error}</p>
            )}
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            {hasSettings && enabled && (
              <Button
                variant={showSettings ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowSettings(v => !v)}
                className="h-7 px-3 text-xs"
              >
                设置
              </Button>
            )}
            <Button
              variant={enabled ? 'outline' : 'default'}
              size="sm"
              onClick={handleToggle}
              disabled={busy || uninstalling}
              className="h-7 px-3 text-xs"
            >
              {toggling ? '处理中...' : enabled ? '禁用' : '启用'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUninstall}
              disabled={busy || uninstalling}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-red-500"
            >
              {uninstalling ? '...' : '卸载'}
            </Button>
          </div>
        </div>
      </div>

      {/* Settings panel container */}
      {showSettings && hasSettings && (
        <div className="border-t border-border/20 px-3 py-3">
          <div ref={settingsContainerRef} />
        </div>
      )}
    </div>
  )
}
