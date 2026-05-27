'use client'

import { memo, useCallback, useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react'
import { ListTree, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getContentHeadings,
  scrollToHeadingByIndex,
  type Heading,
} from '@/lib/toc-utils'

interface TocMinimapProps {
  headings: Heading[]
  scrollContainerRef: RefObject<HTMLDivElement | null>
  className?: string
}

function TocMinimap({ headings, scrollContainerRef, className }: TocMinimapProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '')
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)

  const headingIndexById = useMemo(() => {
    return new Map(headings.map((heading, index) => [heading.id, index]))
  }, [headings])

  const updateActiveHeading = useCallback(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || headings.length === 0) return

    const domHeadings = getContentHeadings(scrollContainer)
    const containerRect = scrollContainer.getBoundingClientRect()
    const activationLine = containerRect.top + Math.min(120, scrollContainer.clientHeight * 0.22)
    let currentId = domHeadings[0]?.id ?? headings[0]?.id ?? ''

    for (const heading of domHeadings) {
      const rect = heading.getBoundingClientRect()
      if (rect.top <= activationLine) {
        currentId = heading.id
      } else {
        break
      }
    }

    if (currentId) {
      setActiveId(currentId)
    }
  }, [headings, scrollContainerRef])

  useEffect(() => {
    setActiveId(headings[0]?.id ?? '')
    setIsOpen(false)
    const frame = window.requestAnimationFrame(updateActiveHeading)
    return () => window.cancelAnimationFrame(frame)
  }, [headings, updateActiveHeading])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || headings.length === 0) return

    let frame = 0
    const handleScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        updateActiveHeading()
      })
    }

    const resizeObserver = new ResizeObserver(handleScroll)
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    resizeObserver.observe(scrollContainer)

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      resizeObserver.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [headings.length, scrollContainerRef, updateActiveHeading])

  useEffect(() => {
    if (!isOpen || !activeId || !navRef.current) return

    const activeLink = Array.from(navRef.current.querySelectorAll<HTMLElement>('[data-heading-id]'))
      .find((item) => item.dataset.headingId === activeId)
    activeLink?.scrollIntoView({ block: 'nearest' })
  }, [activeId, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (headings.length === 0) {
    return null
  }

  const activeIndex = Math.max(0, headings.findIndex((heading) => heading.id === activeId))

  return (
    <div
      ref={rootRef}
      className={cn(
        'pointer-events-none absolute bottom-4 right-4 z-40 flex flex-col items-end gap-2',
        className
      )}
    >
      {isOpen && (
        <aside
          id={panelId}
          className={cn(
            'pointer-events-auto flex w-[min(320px,calc(100vw-1.5rem))] max-h-[min(24rem,calc(100vh-7rem))] flex-col overflow-hidden',
            'rounded-lg border border-border/50 bg-background/95 shadow-2xl shadow-black/15 backdrop-blur-xl',
            'ring-1 ring-white/40 dark:bg-background/90 dark:shadow-black/35 dark:ring-white/5'
          )}
          aria-label="文档目录"
        >
          <div className="flex h-10 flex-shrink-0 items-center gap-2 border-b border-border/20 px-2.5">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ListTree className="h-[15px] w-[15px]" strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-foreground">目录</span>
                <span className="rounded bg-muted/80 px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
                  {activeIndex + 1}/{headings.length}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="关闭目录"
              aria-label="关闭目录"
            >
              <X className="h-[15px] w-[15px]" strokeWidth={1.8} />
            </button>
          </div>

          <nav ref={navRef} className="min-h-0 flex-1 overflow-y-auto px-1.5 py-1.5">
            <ol className="space-y-px">
              {headings.map((heading, index) => {
                const isActive = heading.id === activeId
                const indent = Math.min(Math.max(heading.level - 1, 0), 4) * 9

                return (
                  <li key={`${heading.id}-${index}`}>
                    <button
                      type="button"
                      data-heading-id={heading.id}
                      onClick={() => {
                        const targetIndex = headingIndexById.get(heading.id) ?? index
                        scrollToHeadingByIndex(targetIndex, scrollContainerRef.current, setActiveId)
                        if (window.innerWidth < 768) {
                          setIsOpen(false)
                        }
                      }}
                      className={cn(
                        'group relative flex min-h-7 w-full items-start gap-1.5 rounded-md py-1.5 pr-2 text-left text-[11px] leading-4 transition-colors',
                        isActive
                          ? 'bg-primary/10 font-medium text-primary shadow-[inset_2px_0_0_hsl(var(--primary))]'
                          : 'text-muted-foreground hover:bg-muted/65 hover:text-foreground',
                        heading.level <= 2 && !isActive && 'font-medium text-foreground/80'
                      )}
                      style={{ paddingLeft: `${8 + indent}px` }}
                      title={heading.text}
                    >
                      <span
                        className={cn(
                          'mt-[6px] h-1 w-1 flex-shrink-0 rounded-full transition-colors',
                          isActive ? 'bg-primary' : 'bg-muted-foreground/25 group-hover:bg-muted-foreground/65'
                        )}
                      />
                      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {heading.text}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>
        </aside>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-border/55 bg-background/95 text-foreground',
          'shadow-lg shadow-black/10 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:text-primary hover:shadow-xl',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45',
          isOpen && 'border-primary/35 text-primary shadow-xl'
        )}
        aria-expanded={isOpen}
        aria-controls={panelId}
        title={isOpen ? '收起目录' : '展开目录'}
        aria-label={isOpen ? '收起目录' : '展开目录'}
      >
        <ListTree className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>
    </div>
  )
}

export default memo(TocMinimap)
