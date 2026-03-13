'use client'

import { useEffect, useRef } from 'react'
import type { RegisteredSidebarPanel } from '@/lib/plugins/types'

interface Props {
  panel: RegisteredSidebarPanel
}

/**
 * Mounts a plugin-registered sidebar panel.
 * The plugin's render(container) fn receives a real DOM div and can use
 * any vanilla JS / DOM API to build its UI inside it.
 */
export default function PluginSidebarPanel({ panel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // Hand the container to the plugin
    const cleanup = panel.render(el)
    return () => {
      cleanup?.()
      // Clear leftover DOM so a re-mount starts fresh
      if (el) el.innerHTML = ''
    }
  }, [panel.id]) // re-run only when the panel id changes (different plugin selected)

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-auto"
      data-plugin-panel={panel.id}
    />
  )
}
