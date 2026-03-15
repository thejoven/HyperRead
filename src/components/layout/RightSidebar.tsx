'use client'

import type { RegisteredSidebarPanel } from '@/lib/plugins/types'
import { useResize } from '@/hooks/use-resize'
import PluginSidebarPanel from '@/components/PluginSidebarPanel'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RightSidebarProps {
  panels: RegisteredSidebarPanel[]
  activePanel: string | null
  onActiveChange: (id: string | null) => void
  width: number
  onWidthChange: (width: number) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export default function RightSidebar({
  panels,
  activePanel,
  onActiveChange,
  width,
  onWidthChange,
  isCollapsed,
  onToggleCollapse,
}: RightSidebarProps) {
  const { elementRef, handleMouseDown } = useResize({
    minWidth: 240,
    maxWidth: 800,
    initialWidth: width,
    onWidthChange,
    direction: 'left',
  })

  const activeP = panels.find(p => p.id === activePanel) ?? null

  if (isCollapsed) {
    return (
      <div className="flex-shrink-0 border-l border-border/30 bg-background flex items-start justify-center pt-2" style={{ width: '24px' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-7 w-5 p-0 opacity-50 hover:opacity-100"
          title="展开右侧栏"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div
      ref={elementRef}
      className="flex-shrink-0 border-l border-border/30 bg-background flex flex-col overflow-hidden relative"
      style={{ width: `${width}px` }}
    >
      {/* Drag-resize handle on the left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10 hover:bg-primary/30 transition-colors"
        onMouseDown={handleMouseDown}
      />

      {/* Tab bar — one button per registered plugin panel + collapse button */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/20 flex-shrink-0 overflow-x-auto">
        {panels.map(panel => (
          <button
            key={panel.id}
            onClick={() => onActiveChange(activePanel === panel.id ? null : panel.id)}
            className={`
              h-7 px-2.5 rounded text-xs flex items-center gap-1.5 flex-shrink-0 transition-colors
              ${activePanel === panel.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
            title={panel.title}
          >
            {panel.icon && (
              <span className="text-sm leading-none">{panel.icon}</span>
            )}
            <span className="macos-text">{panel.title}</span>
          </button>
        ))}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-7 w-7 p-0 flex-shrink-0 opacity-50 hover:opacity-100"
          title="收起右侧栏"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Panel content area */}
      <div className="flex-1 overflow-hidden">
        {activeP ? (
          <PluginSidebarPanel key={activeP.id} panel={activeP} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground">点击上方标签打开面板</p>
          </div>
        )}
      </div>
    </div>
  )
}
