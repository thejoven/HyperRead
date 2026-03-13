'use client'

import type { RegisteredStatusBarItem } from '@/lib/plugins/types'

interface StatusBarProps {
  items: RegisteredStatusBarItem[]
}

export default function StatusBar({ items }: StatusBarProps) {
  if (items.length === 0) return null

  return (
    <div className="flex items-center h-6 px-3 border-t border-border/20 bg-muted/20 text-xs text-muted-foreground gap-3 flex-shrink-0 overflow-hidden">
      {items.map(item => (
        <span
          key={`${item.pluginId}:${item.id}`}
          title={item.tooltip}
          onClick={item.onClick}
          className={item.onClick ? 'cursor-pointer hover:text-foreground transition-colors' : ''}
        >
          {item.text}
        </span>
      ))}
    </div>
  )
}
