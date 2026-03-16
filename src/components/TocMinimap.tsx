'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { extractHeadings, scrollToHeading, type Heading } from '@/lib/toc-utils'

interface SegmentData extends Heading {
  proportion: number
}

interface TocMinimapProps {
  content: string
  className?: string
}

const MAX_BAR_WIDTH = 56  // px
const MIN_BAR_WIDTH = 6   // px
const BAR_HEIGHT = 4      // px
const BAR_GAP = 3         // px

export default function TocMinimap({ content, className }: TocMinimapProps) {
  const headings = useMemo(() => extractHeadings(content), [content])
  const [segments, setSegments] = useState<SegmentData[]>([])
  const [activeId, setActiveId] = useState('')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const measureTimerRef = useRef<NodeJS.Timeout | null>(null)
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Measure DOM heading positions and calculate proportions
  const measureSegments = useCallback(() => {
    if (headings.length === 0) { setSegments([]); return }

    const scrollContainer = document.querySelector('.content-scroll') ||
      document.querySelector('[class*="overflow-y-auto"]') ||
      document.documentElement

    const totalHeight = scrollContainer === document.documentElement
      ? document.documentElement.scrollHeight
      : (scrollContainer as Element).scrollHeight

    if (totalHeight === 0) return

    const positions: number[] = headings.map((h) => {
      const el = document.getElementById(h.id)
      if (!el) return 0
      if (scrollContainer === document.documentElement) return el.offsetTop
      const containerRect = (scrollContainer as Element).getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      return (scrollContainer as Element).scrollTop + elRect.top - containerRect.top
    })

    const rawSegments = headings.map((h, i) => {
      const start = positions[i]
      const end = i + 1 < headings.length ? positions[i + 1] : totalHeight
      return { ...h, proportion: Math.max(0, end - start) / totalHeight }
    })

    setSegments(rawSegments)
  }, [headings])

  useEffect(() => {
    if (measureTimerRef.current) clearTimeout(measureTimerRef.current)
    measureTimerRef.current = setTimeout(measureSegments, 300)
    return () => { if (measureTimerRef.current) clearTimeout(measureTimerRef.current) }
  }, [measureSegments])

  useEffect(() => {
    const scrollContainer = document.querySelector('.content-scroll') ||
      document.querySelector('[class*="overflow-y-auto"]') ||
      document.body

    const observer = new ResizeObserver(() => {
      if (measureTimerRef.current) clearTimeout(measureTimerRef.current)
      measureTimerRef.current = setTimeout(measureSegments, 150)
    })
    observer.observe(scrollContainer as Element)
    return () => observer.disconnect()
  }, [measureSegments])

  // Active heading tracking on scroll
  const updateActive = useCallback(() => {
    if (headings.length === 0) return
    const viewportHeight = window.innerHeight
    const activeZoneTop = viewportHeight * 0.2
    const activeZoneBottom = viewportHeight * 0.8
    let bestId = ''
    let closestDist = Infinity

    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.top <= activeZoneBottom && rect.bottom >= activeZoneTop) {
        const dist = Math.abs(rect.top - viewportHeight / 2)
        if (dist < closestDist) { closestDist = dist; bestId = h.id }
      } else if (rect.top <= activeZoneTop) {
        bestId = h.id
      }
    })

    if (bestId) setActiveId(bestId)
  }, [headings])

  useEffect(() => {
    const handleScroll = () => {
      updateActive()
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = setTimeout(updateActive, 100)
    }

    const scrollContainer = document.querySelector('.content-scroll') ||
      document.querySelector('[class*="overflow-y-auto"]') || window

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    setTimeout(updateActive, 250)

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    }
  }, [updateActive])


  if (headings.length === 0) return null

  // Normalize widths with average as midpoint — prevents extreme long/short bars.
  // Clamp each proportion to [avg*0.2, avg*4], then scale to [MIN_BAR_WIDTH, MAX_BAR_WIDTH].
  const avgProportion = segments.length > 0
    ? segments.reduce((s, seg) => s + seg.proportion, 0) / segments.length
    : 0.001
  const clampLo = avgProportion * 0.2
  const clampHi = avgProportion * 4
  const getBarWidth = (proportion: number) => {
    const clamped = Math.max(clampLo, Math.min(clampHi, proportion))
    const t = clampHi > clampLo ? (clamped - clampLo) / (clampHi - clampLo) : 0.5
    return Math.max(MIN_BAR_WIDTH, Math.round(MIN_BAR_WIDTH + t * (MAX_BAR_WIDTH - MIN_BAR_WIDTH)))
  }

  return (
    <div
      className={cn(
        'absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end',
        'transition-opacity duration-200',
        isHovered ? 'opacity-90' : 'opacity-30',
        className
      )}
      style={{ gap: `${BAR_GAP}px`, pointerEvents: 'auto' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setHoveredIndex(null) }}
    >
      {segments.map((seg, i) => {
        const isActive = seg.id === activeId
        const isSegHovered = hoveredIndex === i
        const barWidth = getBarWidth(seg.proportion)

        return (
          <div
            key={`${seg.id}-${i}`}
            className="relative flex items-center justify-end pointer-events-auto"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Tooltip */}
            {isSegHovered && (
              <div
                className={cn(
                  'absolute right-full mr-2 px-2 py-1 rounded-full text-xs whitespace-nowrap pointer-events-none',
                  'bg-background/95 backdrop-blur-sm border border-border/60 shadow-md text-foreground'
                )}
                style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {seg.text}
              </div>
            )}

            {/* Bar capsule */}
            <div
              className={cn(
                'rounded-full cursor-pointer transition-all duration-150',
                isActive
                  ? 'bg-primary'
                  : isSegHovered
                    ? 'bg-primary/60'
                    : 'bg-foreground/25'
              )}
              style={{ width: `${barWidth}px`, height: `${BAR_HEIGHT}px` }}
              onClick={() => scrollToHeading(seg.id, setActiveId, seg.text)}
            />
          </div>
        )
      })}
    </div>
  )
}
