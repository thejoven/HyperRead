'use client'

import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { renderMermaidSVG, type RenderOptions } from 'beautiful-mermaid'
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw, Hand, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MermaidDiagramProps {
  chart: string
  id?: string
}

type RenderedMermaid =
  | { svg: string; error: null }
  | { svg: null; error: Error }

const beautifulMermaidOptions = {
  bg: 'hsl(var(--card))',
  fg: 'hsl(var(--foreground))',
  line: 'hsl(var(--muted-foreground))',
  accent: 'hsl(var(--primary))',
  muted: 'hsl(var(--muted-foreground))',
  surface: 'hsl(var(--secondary))',
  border: 'hsl(var(--border))',
  transparent: true,
  padding: 48,
  nodeSpacing: 36,
  layerSpacing: 52,
} satisfies RenderOptions

const googleFontImportPattern =
  /@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=[^']+'\);\s*/g

const normalizeError = (error: unknown) => (
  error instanceof Error ? error : new Error(String(error))
)

const prepareSvg = (svg: string) => {
  const localFontSvg = svg.replace(googleFontImportPattern, '')

  if (localFontSvg.includes('role="img"')) {
    return localFontSvg
  }

  return localFontSvg.replace('<svg ', '<svg role="img" aria-label="Mermaid diagram" ')
}

const renderBeautifulMermaid = (chart: string): RenderedMermaid => {
  try {
    return {
      svg: prepareSvg(renderMermaidSVG(chart, beautifulMermaidOptions)),
      error: null,
    }
  } catch (error) {
    return {
      svg: null,
      error: normalizeError(error),
    }
  }
}

const applyTransform = (
  element: HTMLDivElement | null,
  x: number,
  y: number,
  zoom: number,
  transition: boolean,
) => {
  if (!element) return

  const safeZoom = Math.max(0.1, Math.min(5, zoom))
  element.style.transform = `translate(${x}px, ${y}px) scale(${safeZoom})`
  element.style.transformOrigin = 'center center'
  element.style.transition = transition ? 'transform 0.2s ease' : 'none'
  element.style.visibility = 'visible'
  element.style.opacity = '1'
}

function MermaidError({ chart, error }: { chart: string; error: Error }) {
  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded-lg dark:border-red-900/60 dark:bg-red-950/30">
      <p className="text-red-600 text-sm font-medium dark:text-red-300">Mermaid 图表渲染失败</p>
      <p className="text-xs text-red-500 mt-2 whitespace-pre-wrap dark:text-red-300/80">{error.message}</p>
      <pre className="text-xs text-red-500 mt-2 whitespace-pre-wrap dark:text-red-300/80">{chart}</pre>
    </div>
  )
}

function MermaidOutput({
  chart,
  error,
  fullscreen = false,
  isLegacyFallback,
  isLoading,
  svg,
}: {
  chart: string
  error: Error | null
  fullscreen?: boolean
  isLegacyFallback: boolean
  isLoading: boolean
  svg: string | null
}) {
  if (svg) {
    const rendererClassName = isLegacyFallback ? 'legacy-mermaid-container' : 'beautiful-mermaid-container'
    const fullscreenClassName = fullscreen ? 'mermaid-svg-container--fullscreen' : ''

    return (
      <div
        className={`mermaid-container mermaid-svg-container ${rendererClassName} ${fullscreenClassName}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        正在渲染 Mermaid 图表...
      </div>
    )
  }

  return <MermaidError chart={chart} error={error ?? new Error('Unknown Mermaid rendering error')} />
}

export default function MermaidDiagram({ chart, id }: MermaidDiagramProps) {
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const fallbackIdRef = useRef(id || `mermaid-${Math.random().toString(36).slice(2, 9)}`)
  const fallbackRenderCountRef = useRef(0)

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragEnabled, setIsDragEnabled] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [justFinishedDragging, setJustFinishedDragging] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => (
    typeof document === 'undefined' ? false : document.documentElement.classList.contains('dark')
  ))
  const [fallbackSvg, setFallbackSvg] = useState<string | null>(null)
  const [fallbackError, setFallbackError] = useState<Error | null>(null)

  const beautifulResult = useMemo(() => renderBeautifulMermaid(chart), [chart])

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }

    checkDarkMode()

    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (beautifulResult.svg) {
      setFallbackSvg(null)
      setFallbackError(null)
      return
    }

    let cancelled = false
    setFallbackSvg(null)
    setFallbackError(null)

    const renderWithLegacyMermaid = async () => {
      try {
        const { default: mermaid } = await import('mermaid')

        if (cancelled) return

        mermaid.initialize({
          startOnLoad: false,
          theme: isDarkMode ? 'dark' : 'default',
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
          },
          sequence: {
            useMaxWidth: true,
            mirrorActors: false,
          },
          gantt: {
            useMaxWidth: true,
          },
        })

        await mermaid.parse(chart)

        const renderId = `${fallbackIdRef.current}-${fallbackRenderCountRef.current}`
        fallbackRenderCountRef.current += 1
        const { svg } = await mermaid.render(renderId, chart)

        if (!cancelled) {
          setFallbackSvg(prepareSvg(svg))
        }
      } catch (error) {
        if (!cancelled) {
          setFallbackError(normalizeError(error))
        }
      }
    }

    void renderWithLegacyMermaid()

    return () => {
      cancelled = true
    }
  }, [beautifulResult.svg, chart, isDarkMode])

  const resetInteraction = useCallback(() => {
    setZoomLevel(1)
    setPanX(0)
    setPanY(0)
    setIsDragEnabled(false)
    setIsDragging(false)
    setJustFinishedDragging(false)
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
    resetInteraction()
  }, [resetInteraction])

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false)
    resetInteraction()
  }, [resetInteraction])

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5))
  }

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.1))
  }

  const resetZoom = () => {
    setZoomLevel(1)
    setPanX(0)
    setPanY(0)
  }

  const resetPosition = () => {
    setPanX(0)
    setPanY(0)
  }

  const toggleDragMode = () => {
    setIsDragEnabled(prev => !prev)
    setIsDragging(false)
  }

  useEffect(() => {
    if (isFullscreen && !isDragging && !justFinishedDragging) {
      applyTransform(fullscreenRef.current, panX, panY, zoomLevel, true)
    }
  }, [zoomLevel, panX, panY, isFullscreen, isDragging, justFinishedDragging])

  useEffect(() => {
    if (!isFullscreen || !fullscreenContainerRef.current || !isDragEnabled) return

    const container = fullscreenContainerRef.current
    const dragState = {
      isActive: false,
      startX: 0,
      startY: 0,
      startPanX: 0,
      startPanY: 0,
      currentPanX: panX,
      currentPanY: panY,
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return

      dragState.isActive = true
      dragState.startX = event.clientX
      dragState.startY = event.clientY
      dragState.startPanX = panX
      dragState.startPanY = panY

      setIsDragging(true)
      event.preventDefault()
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!dragState.isActive) return

      const nextPanX = dragState.startPanX + event.clientX - dragState.startX
      const nextPanY = dragState.startPanY + event.clientY - dragState.startY

      dragState.currentPanX = nextPanX
      dragState.currentPanY = nextPanY
      applyTransform(fullscreenRef.current, nextPanX, nextPanY, zoomLevel, false)
    }

    const handleMouseUp = () => {
      if (!dragState.isActive) return

      const finalPanX = dragState.currentPanX
      const finalPanY = dragState.currentPanY

      applyTransform(fullscreenRef.current, finalPanX, finalPanY, zoomLevel, false)

      setJustFinishedDragging(true)
      setPanX(finalPanX)
      setPanY(finalPanY)

      dragState.isActive = false
      setIsDragging(false)

      window.setTimeout(() => {
        setJustFinishedDragging(false)
      }, 100)
    }

    container.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isFullscreen, isDragEnabled, panX, panY, zoomLevel])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        closeFullscreen()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeFullscreen, isFullscreen])

  const activeSvg = beautifulResult.svg ?? fallbackSvg
  const isLegacyFallback = !beautifulResult.svg && Boolean(fallbackSvg)
  const activeError = fallbackError ?? (beautifulResult.svg ? null : beautifulResult.error)
  const isFallbackLoading = !beautifulResult.svg && !fallbackSvg && !fallbackError
  const fullscreenTransformStyle: CSSProperties = {
    minWidth: 'max-content',
    minHeight: 'max-content',
    transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
    transformOrigin: 'center center',
    transition: isDragging ? 'none' : 'transform 0.2s ease',
  }

  return (
    <>
      <div className="relative group my-6 p-4 bg-card border border-border rounded-lg overflow-x-auto">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity size-8 p-0 bg-background/80 hover:bg-background border border-border shadow-sm"
          onClick={toggleFullscreen}
          title="全屏查看图表"
        >
          <Maximize2 className="size-4" />
        </Button>
        <MermaidOutput
          chart={chart}
          error={activeError}
          isLegacyFallback={isLegacyFallback}
          isLoading={isFallbackLoading}
          svg={activeSvg}
        />
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm">
          <div className="relative bg-background w-full h-full flex flex-col">
            <div className="flex items-center justify-end p-4 border-b border-border bg-background z-10 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={closeFullscreen}
                title="关闭全屏"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div
              ref={fullscreenContainerRef}
              className="flex-1 overflow-hidden flex items-center justify-center"
              style={{
                cursor: isDragEnabled ? (isDragging ? 'grabbing' : 'grab') : 'default',
                userSelect: isDragEnabled ? 'none' : 'auto',
              }}
            >
              <div className="relative">
                <div ref={fullscreenRef} style={fullscreenTransformStyle}>
                  <MermaidOutput
                    chart={chart}
                    error={activeError}
                    fullscreen
                    isLegacyFallback={isLegacyFallback}
                    isLoading={isFallbackLoading}
                    svg={activeSvg}
                  />
                </div>
              </div>
            </div>

            <div className="fixed bottom-4 left-4 flex flex-col gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg z-20">
              <Button
                variant={isDragEnabled ? 'default' : 'ghost'}
                size="sm"
                className="size-8 p-0"
                onClick={toggleDragMode}
                title={isDragEnabled ? '关闭拖拽模式' : '开启拖拽模式'}
              >
                <Hand className={`size-4 ${isDragEnabled ? 'text-primary-foreground' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={resetPosition}
                title="回到原点"
              >
                <Home className="size-4" />
              </Button>

              <div className="h-px bg-border mx-1" />

              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={zoomIn}
                title="放大"
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={zoomOut}
                title="缩小"
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={resetZoom}
                title="重置缩放和位置"
              >
                <RotateCcw className="size-4" />
              </Button>

              <div className="text-xs text-center text-muted-foreground px-1">
                {Math.round(zoomLevel * 100)}%
              </div>
              {isDragEnabled && (
                <div className="text-xs text-center text-primary px-1">
                  拖拽
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
