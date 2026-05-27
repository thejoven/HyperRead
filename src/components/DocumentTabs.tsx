import { X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import type { TabInfo } from '@/hooks/use-tabs'

interface DocumentTabsProps {
  tabs: TabInfo[]
  activeTab: string | null
  onActivate: (filePath: string) => void
  onClose: (filePath: string) => void
  onCloseAll: () => void
  onCloseOthers: (filePath: string) => void
}

interface ContextMenuState {
  filePath: string
  x: number
  y: number
}

export default function DocumentTabs({
  tabs,
  activeTab,
  onActivate,
  onClose,
  onCloseAll,
  onCloseOthers
}: DocumentTabsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [showRightFade, setShowRightFade] = useState(false)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    // 将垂直滚动转换为水平滚动（不调用 preventDefault，避免 passive 警告）
    const el = e.currentTarget
    if (!el) return
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY
    }
  }

  // 处理右侧渐变显示逻辑
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const updateFade = () => {
      const canScroll = el.scrollWidth > el.clientWidth + 1
      const atEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth - 1
      const atStart = el.scrollLeft <= 1
      setShowRightFade(canScroll && !atEnd)
      setShowLeftFade(canScroll && !atStart)
    }

    updateFade()
    const onScroll = () => updateFade()
    const onResize = () => updateFade()
    el.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [tabs])

  useEffect(() => {
    if (!contextMenu) return

    const closeMenu = () => setContextMenu(null)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }

    window.addEventListener('click', closeMenu)
    window.addEventListener('blur', closeMenu)
    window.addEventListener('resize', closeMenu)
    window.addEventListener('scroll', closeMenu, true)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('click', closeMenu)
      window.removeEventListener('blur', closeMenu)
      window.removeEventListener('resize', closeMenu)
      window.removeEventListener('scroll', closeMenu, true)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [contextMenu])

  const openContextMenu = (e: React.MouseEvent<HTMLDivElement>, filePath: string) => {
    e.preventDefault()
    e.stopPropagation()

    const menuWidth = 144
    const menuHeight = 118
    const margin = 8
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - margin)
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - margin)

    setContextMenu({
      filePath,
      x: Math.max(margin, x),
      y: Math.max(margin, y)
    })
  }

  const handleMenuAction = (action: () => void) => {
    action()
    setContextMenu(null)
  }

  return (
    <div className="relative h-7">
      <div
        ref={scrollerRef}
        className="flex items-center gap-1 overflow-x-auto scrollbar-thin h-7"
        style={{ overscrollBehaviorX: 'contain', overscrollBehaviorY: 'none' }}
        onWheel={onWheel}
        aria-label="文档标签"
      >
        {tabs.map((tab) => (
          <div
            key={tab.filePath}
            className={`group shrink-0 flex w-fit max-w-[260px] items-center h-7 pl-3 pr-1 rounded-md border transition-colors cursor-default select-none ${
              activeTab === tab.filePath
                ? 'bg-primary/10 border-primary/30 text-foreground'
                : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onActivate(tab.filePath)}
            onContextMenu={(e) => openContextMenu(e, tab.filePath)}
            title={tab.filePath}
          >
            <span className="text-xs truncate mr-2 min-w-0 flex-1">{tab.fileName}</span>
            <button
              className={`inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted/80 transition-colors ${
                activeTab === tab.filePath ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onClose(tab.filePath)
              }}
              aria-label="关闭标签"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      {contextMenu && (
        <div
          className="no-drag fixed z-[100] w-36 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            className="w-full rounded px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleMenuAction(() => onClose(contextMenu.filePath))}
            role="menuitem"
          >
            关闭标签
          </button>
          <button
            type="button"
            className="w-full rounded px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-45"
            onClick={() => handleMenuAction(() => onCloseOthers(contextMenu.filePath))}
            disabled={tabs.length <= 1}
            role="menuitem"
          >
            关闭其他
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            className="w-full rounded px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleMenuAction(onCloseAll)}
            role="menuitem"
          >
            关闭全部
          </button>
        </div>
      )}
      {showLeftFade && (
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-8 z-10"
          style={{
            background: 'linear-gradient(to right, hsla(var(--background), 1) 65%, hsla(var(--background), 0))',
            boxShadow: 'inset 10px 0 8px -8px rgba(0,0,0,0.12)'
          }}
        />
      )}
      {showRightFade && (
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-8 z-10"
          style={{
            background: 'linear-gradient(to left, hsla(var(--background), 1) 65%, hsla(var(--background), 0))',
            boxShadow: 'inset -10px 0 8px -8px rgba(0,0,0,0.12)'
          }}
        />
      )}
    </div>
  )
}
