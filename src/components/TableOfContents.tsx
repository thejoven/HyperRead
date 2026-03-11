'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { List, X, ChevronRight, Search, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

const generateHeadingId = (text: string): string => {
  if (typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff-]/g, '') // Support Chinese characters
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const extractHeadings = (content: string): Heading[] => {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: Heading[] = []
  const usedIds = new Set<string>()
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    let id = generateHeadingId(text)

    // 确保ID唯一性，避免同名标题冲突
    let counter = 1
    let uniqueId = id
    while (usedIds.has(uniqueId)) {
      uniqueId = `${id}-${counter}`
      counter++
    }
    usedIds.add(uniqueId)

    headings.push({
      id: uniqueId,
      text,
      level
    })
  }

  return headings
}

export default function TableOfContents({ content, className }: TableOfContentsProps) {
  const t = useT()

  // 状态管理
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeHeading, setActiveHeading] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrollDirection = useRef<'up' | 'down'>('down')
  const lastScrollY = useRef(0)

  const headings = useMemo(() => extractHeadings(content), [content])

  // 过滤标题
  const filteredHeadings = useMemo(() => {
    if (!searchTerm.trim()) return headings
    return headings.filter(heading =>
      heading.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [headings, searchTerm])

  // 高精度滚动检测和标题高亮
  const updateActiveHeading = useCallback(() => {
    if (headings.length === 0) return

    const scrollContainer = document.querySelector('.content-scroll') ||
                           document.querySelector('[class*="overflow-y-auto"]') ||
                           document.documentElement

    const scrollTop = scrollContainer === document.documentElement
      ? window.scrollY
      : scrollContainer.scrollTop

    const viewportHeight = window.innerHeight
    const activeZoneTop = viewportHeight * 0.2
    const activeZoneBottom = viewportHeight * 0.8

    let activeId = ''
    let closestDistance = Infinity

    // 检测滚动方向
    const currentScrollY = scrollTop
    if (currentScrollY !== lastScrollY.current) {
      lastScrollDirection.current = currentScrollY > lastScrollY.current ? 'down' : 'up'
      lastScrollY.current = currentScrollY
    }

    // 寻找最佳匹配的标题
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (!element) return

      const rect = element.getBoundingClientRect()
      const elementTop = rect.top
      const elementHeight = rect.height

      // 元素在活跃区域内
      if (elementTop <= activeZoneBottom && elementTop + elementHeight >= activeZoneTop) {
        const distanceFromCenter = Math.abs(elementTop - viewportHeight / 2)
        if (distanceFromCenter < closestDistance) {
          closestDistance = distanceFromCenter
          activeId = heading.id
        }
      }
      // 根据滚动方向调整逻辑
      else if (lastScrollDirection.current === 'down' && elementTop <= activeZoneTop) {
        activeId = heading.id
      }
    })

    if (activeId && activeId !== activeHeading) {
      setActiveHeading(activeId)
    }
  }, [headings, activeHeading])

  // 智能滚动监听
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // 立即更新，但也设置延迟更新以处理快速滚动
      updateActiveHeading()

      scrollTimeoutRef.current = setTimeout(() => {
        updateActiveHeading()
      }, 100)
    }

    const scrollContainer = document.querySelector('.content-scroll') ||
                           document.querySelector('[class*="overflow-y-auto"]') ||
                           window

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })

    // 初始化时也要检测一次
    setTimeout(updateActiveHeading, 200)

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [updateActiveHeading])

  // 优化的滚动到标题函数
  const scrollToHeading = useCallback((headingId: string) => {
    const element = document.getElementById(headingId)
    if (!element) return

    const scrollContainer = document.querySelector('.content-scroll') ||
                           document.querySelector('[class*="overflow-y-auto"]') ||
                           document.documentElement

    const viewportHeight = window.innerHeight
    const offsetTop = viewportHeight * 0.15 // 偏移到视口15%的位置

    if (scrollContainer === document.documentElement) {
      const elementTop = element.offsetTop
      window.scrollTo({
        top: Math.max(0, elementTop - offsetTop),
        behavior: 'smooth'
      })
    } else {
      const containerRect = scrollContainer.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const currentScroll = scrollContainer.scrollTop
      const targetScroll = currentScroll + elementRect.top - containerRect.top - offsetTop

      scrollContainer.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
      })
    }

    // 暂时设置为活跃状态以提供即时反馈
    setActiveHeading(headingId)
  }, [])

  // 自动收起处理
  const scheduleCollapse = useCallback(() => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false)
    }, 500)
  }, [])

  const cancelCollapse = useCallback(() => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
  }, [])

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    }
  }, [])

  // 渲染头部区域
  const renderHeader = useCallback(() => (
    <div className="flex items-center gap-2 p-3 bg-background/98 backdrop-blur-md border-b border-border/40">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t('tableOfContents.placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 h-8 text-xs bg-muted/30 border-0 focus:bg-background/90 focus:ring-1 focus:ring-primary/20 transition-all"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/70"
            title={t('tableOfContents.clearSearch')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(false)}
        className="h-8 w-8 p-0 hover:bg-muted/70 transition-colors flex-shrink-0"
        title={t('tableOfContents.collapse')}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  ), [searchTerm, t])

  // 自定义滚动容器组件
  const CustomScrollArea = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div
      ref={scrollContainerRef}
      className={cn(
        "overflow-y-auto overflow-x-hidden",
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500",
        className
      )}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#9ca3af transparent'
      }}
    >
      {children}
    </div>
  )

  // 渲染标题列表
  const renderHeadings = useCallback(() => (
    <div className="py-1">
      {filteredHeadings.map((heading, index) => {
        const isActive = activeHeading === heading.id
        const indentLevel = Math.max(0, heading.level - 1) * 10

        return (
          <div
            key={`${heading.id}-${index}`}
            className="w-full flex"
            style={{ paddingLeft: `${8 + indentLevel}px` }}
          >
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "inline-flex items-center gap-2 text-left text-xs transition-all duration-200 rounded-md mb-0.5",
                "hover:bg-muted/70 active:scale-[0.98]",
                "border border-transparent hover:border-border/30",
                "min-w-0 overflow-hidden px-2 py-1.5",
                isActive && "bg-primary/10 text-primary font-medium border-primary/20 shadow-sm ring-1 ring-primary/10",
                !isActive && "text-foreground/90 hover:text-foreground"
              )}
              title={`${t('tableOfContents.jumpTo')}: ${heading.text}`}
            >
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-all duration-200 flex-shrink-0",
                isActive ? "rotate-90 text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            <span className={cn(
              "truncate transition-colors leading-relaxed min-w-0 flex-1",
              "break-all overflow-hidden",
              heading.level === 1 && "font-semibold text-xs",
              heading.level === 2 && "font-medium text-xs",
              heading.level === 3 && "text-xs",
              heading.level >= 4 && "text-xs text-muted-foreground",
              isActive && "font-medium"
            )}>
              {heading.text}
            </span>
            </button>
          </div>
        )
      })}

      {searchTerm && filteredHeadings.length === 0 && (
        <div className="text-center py-8 px-4 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs leading-relaxed">{t('tableOfContents.noMatchingItems')}</p>
          <p className="text-xs mt-1 opacity-60">{t('tableOfContents.tryOtherKeywords')}</p>
        </div>
      )}

      {filteredHeadings.length === 0 && !searchTerm && (
        <div className="text-center py-8 px-4 text-muted-foreground">
          <div className="h-8 w-8 mx-auto mb-2 opacity-40 rounded bg-muted flex items-center justify-center">
            <List className="h-4 w-4" />
          </div>
          <p className="text-xs">{t('tableOfContents.noToc')}</p>
        </div>
      )}
    </div>
  ), [filteredHeadings, activeHeading, searchTerm, scrollToHeading, t])

  // 如果没有标题，不显示目录
  if (headings.length === 0) {
    return null
  }

  return (
    <div
      className={cn("absolute right-0 top-1/2 -translate-y-1/2 z-40 flex items-center", className)}
      onMouseEnter={cancelCollapse}
      onMouseLeave={scheduleCollapse}
    >
      {/* 展开面板 */}
      <div
        className={cn(
          "absolute right-6 top-1/2 -translate-y-1/2",
          "bg-background/98 backdrop-blur-md border border-border/60 rounded-xl shadow-xl",
          "w-60 max-h-[70vh] overflow-hidden",
          "transition-all duration-300 ease-in-out origin-right",
          isExpanded
            ? "opacity-100 scale-x-100 pointer-events-auto"
            : "opacity-0 scale-x-0 pointer-events-none"
        )}
      >
        {renderHeader()}
        <CustomScrollArea className="flex-1 min-h-0 max-h-[calc(70vh-4rem)]">
          {renderHeadings()}
        </CustomScrollArea>
      </div>

      {/* 省略号指示器胶囊 */}
      <button
        onClick={() => setIsExpanded(v => !v)}
        onMouseEnter={() => { cancelCollapse(); setIsExpanded(true) }}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5",
          "w-5 h-16 rounded-l-md",
          "bg-background/80 backdrop-blur-sm border border-r-0 border-border/40 shadow-md",
          "transition-opacity duration-200",
          isExpanded ? "opacity-80" : "opacity-30 hover:opacity-70"
        )}
        title={`${t('tableOfContents.openToc')} (${t('tableOfContents.itemsCount', { count: filteredHeadings.length })})`}
      >
        <MoreVertical className="h-3.5 w-3.5 text-foreground/70" />
      </button>
    </div>
  )
}
