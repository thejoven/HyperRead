import { X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import type { TabInfo } from '@/hooks/use-tabs'

interface DocumentTabsProps {
  tabs: TabInfo[]
  activeTab: string | null
  onActivate: (filePath: string) => void
  onClose: (filePath: string) => void
}

export default function DocumentTabs({ tabs, activeTab, onActivate, onClose }: DocumentTabsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [showRightFade, setShowRightFade] = useState(false)
  const [showLeftFade, setShowLeftFade] = useState(false)

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
            className={`group shrink-0 flex items-center h-7 pl-3 pr-1 rounded-md border transition-colors cursor-default select-none ${
              activeTab === tab.filePath
                ? 'bg-primary/10 border-primary/30 text-foreground'
                : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
            }`}
            style={{ width: 'clamp(120px, 18vw, 220px)' }}
            onClick={() => onActivate(tab.filePath)}
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
