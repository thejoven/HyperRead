import type { PluginManifest, HyperReadPlugin } from './types'

export async function discoverPlugins(): Promise<PluginManifest[]> {
  try {
    const result = await window.electronAPI?.pluginAPI?.listInstalled()
    return (result as PluginManifest[]) ?? []
  } catch (e) {
    console.error('[PluginLoader] Failed to discover plugins:', e)
    return []
  }
}

export async function loadPlugin(manifest: PluginManifest): Promise<HyperReadPlugin> {
  const mainContent = await window.electronAPI?.pluginAPI?.readFile(manifest.id, manifest.main)
  if (!mainContent) throw new Error(`Could not read plugin main file for ${manifest.id}`)

  const blob = new Blob([mainContent.content], { type: 'application/javascript' })
  const blobUrl = URL.createObjectURL(blob)

  try {
    const module = await import(/* @vite-ignore */ blobUrl)
    const pluginExport = module.default ?? module

    if (typeof pluginExport?.onload !== 'function') {
      throw new Error(`Plugin ${manifest.id} does not export a valid HyperReadPlugin (missing onload)`)
    }

    return pluginExport as HyperReadPlugin
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

export async function injectPluginStyles(manifest: PluginManifest): Promise<HTMLStyleElement | undefined> {
  if (!manifest.styles) return undefined

  try {
    const cssContent = await window.electronAPI?.pluginAPI?.readFile(manifest.id, manifest.styles)
    if (!cssContent) return undefined

    const style = document.createElement('style')
    style.setAttribute('data-plugin-id', manifest.id)
    style.textContent = cssContent.content
    document.head.appendChild(style)
    return style
  } catch (e) {
    console.warn(`[PluginLoader] Could not inject styles for ${manifest.id}:`, e)
    return undefined
  }
}

export function removePluginStyles(styleElement: HTMLStyleElement | undefined): void {
  if (styleElement?.parentNode) {
    styleElement.parentNode.removeChild(styleElement)
  }
}
