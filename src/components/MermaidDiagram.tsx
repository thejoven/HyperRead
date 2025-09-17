'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw, Move, Hand, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MermaidDiagramProps {
  chart: string
  id?: string
}

export default function MermaidDiagram({ chart, id }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragEnabled, setIsDragEnabled] = useState(false)

  // Simple drag state - no complex refs needed
  const [isDragging, setIsDragging] = useState(false)
  const [justFinishedDragging, setJustFinishedDragging] = useState(false)

  const chartId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    // Initialize mermaid with different configs for regular vs fullscreen
    const initializeMermaid = (useMaxWidth = true) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: {
          useMaxWidth: useMaxWidth,
          htmlLabels: true
        },
        sequence: {
          useMaxWidth: useMaxWidth,
          mirrorActors: false
        },
        gantt: {
          useMaxWidth: useMaxWidth
        }
      })
    }

    // Initialize with width constraints for regular view
    initializeMermaid(true)

    const renderChart = async (container: HTMLDivElement, fullscreen = false) => {
      try {
        // Clear any existing content
        container.innerHTML = ''

        // Validate and render the chart
        await mermaid.parse(chart)
        const renderChartId = `${chartId}-${fullscreen ? 'fullscreen' : 'normal'}`
        const { svg } = await mermaid.render(renderChartId, chart)

        container.innerHTML = svg

        // Add some styling to the SVG
        const svgElement = container.querySelector('svg')
        if (svgElement) {
          svgElement.style.maxWidth = '100%'
          svgElement.style.height = 'auto'
          svgElement.style.display = 'block'
          svgElement.style.margin = '0 auto'
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error)
        container.innerHTML = `
          <div class="p-4 border border-red-200 bg-red-50 rounded-lg">
            <p class="text-red-600 text-sm font-medium">Mermaid 图表渲染失败</p>
            <pre class="text-xs text-red-500 mt-2 whitespace-pre-wrap">${chart}</pre>
          </div>
        `
      }
    }

    const renderRegularChart = () => {
      if (ref.current) {
        renderChart(ref.current, false)
      }
    }

    renderRegularChart()
  }, [chart, chartId])

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    // Reset zoom, pan, and drag state when toggling fullscreen
    setZoomLevel(1)
    setPanX(0)
    setPanY(0)
    setIsDragEnabled(false)
    setIsDragging(false)
  }

  // Zoom functions
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5)) // Max zoom 5x
  }

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.1)) // Min zoom 0.1x
  }

  const resetZoom = () => {
    setZoomLevel(1)
    setPanX(0)
    setPanY(0)
  }

  // Reset to original position (center)
  const resetPosition = () => {
    setPanX(0)
    setPanY(0)
  }

  // Toggle drag mode
  const toggleDragMode = () => {
    setIsDragEnabled(!isDragEnabled)
    setIsDragging(false)
  }

  // Safe transform application with bounds checking
  const applyTransform = (x: number, y: number, zoom: number) => {
    if (fullscreenRef.current) {
      const svgElement = fullscreenRef.current.querySelector('svg')
      if (svgElement) {
        // Ensure zoom is within reasonable bounds
        const safeZoom = Math.max(0.1, Math.min(5, zoom))

        svgElement.style.transform = `translate(${x}px, ${y}px) scale(${safeZoom})`
        svgElement.style.transformOrigin = 'center center'
        svgElement.style.transition = isDragging ? 'none' : 'transform 0.2s ease'

        // Ensure the element remains visible
        svgElement.style.visibility = 'visible'
        svgElement.style.opacity = '1'
      }
    }
  }

  // Apply transform when zoom or pan changes (but not during or right after dragging)
  useEffect(() => {
    if (isFullscreen && !isDragging && !justFinishedDragging) {
      if (fullscreenRef.current) {
        const svgElement = fullscreenRef.current.querySelector('svg')
        if (svgElement) {
          const safeZoom = Math.max(0.1, Math.min(5, zoomLevel))
          svgElement.style.transform = `translate(${panX}px, ${panY}px) scale(${safeZoom})`
          svgElement.style.transformOrigin = 'center center'
          svgElement.style.transition = 'transform 0.2s ease'
          svgElement.style.visibility = 'visible'
          svgElement.style.opacity = '1'
        }
      }
    }
  }, [zoomLevel, panX, panY, isFullscreen, isDragging, justFinishedDragging])

  // Stable drag handler with proper state management
  useEffect(() => {
    if (!isFullscreen || !fullscreenContainerRef.current || !isDragEnabled) return

    const container = fullscreenContainerRef.current
    let dragState = {
      isActive: false,
      startX: 0,
      startY: 0,
      startPanX: 0,
      startPanY: 0
    }

    const handleMouseDown = (e: MouseEvent) => {
      dragState.isActive = true
      dragState.startX = e.clientX
      dragState.startY = e.clientY
      dragState.startPanX = panX
      dragState.startPanY = panY

      setIsDragging(true)
      e.preventDefault()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isActive) return

      const deltaX = e.clientX - dragState.startX
      const deltaY = e.clientY - dragState.startY

      const newPanX = dragState.startPanX + deltaX
      const newPanY = dragState.startPanY + deltaY

      // Apply transform directly during drag for smoothness
      if (fullscreenRef.current) {
        const svgElement = fullscreenRef.current.querySelector('svg')
        if (svgElement) {
          const safeZoom = Math.max(0.1, Math.min(5, zoomLevel))
          svgElement.style.transform = `translate(${newPanX}px, ${newPanY}px) scale(${safeZoom})`
          svgElement.style.transformOrigin = 'center center'
          svgElement.style.transition = 'none'
          svgElement.style.visibility = 'visible'
          svgElement.style.opacity = '1'
        }
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragState.isActive) return

      const deltaX = e.clientX - dragState.startX
      const deltaY = e.clientY - dragState.startY
      const finalPanX = dragState.startPanX + deltaX
      const finalPanY = dragState.startPanY + deltaY

      // Apply final transform without transition to avoid flash
      if (fullscreenRef.current) {
        const svgElement = fullscreenRef.current.querySelector('svg')
        if (svgElement) {
          const safeZoom = Math.max(0.1, Math.min(5, zoomLevel))
          svgElement.style.transform = `translate(${finalPanX}px, ${finalPanY}px) scale(${safeZoom})`
          svgElement.style.transformOrigin = 'center center'
          svgElement.style.transition = 'none' // Keep no transition to prevent flash
          svgElement.style.visibility = 'visible'
          svgElement.style.opacity = '1'
        }
      }

      // Mark as just finished dragging to prevent immediate re-render
      setJustFinishedDragging(true)

      // Update React state silently (this won't cause re-render of transform)
      setPanX(finalPanX)
      setPanY(finalPanY)

      dragState.isActive = false
      setIsDragging(false)

      // Clear the "just finished" flag after a brief moment
      setTimeout(() => {
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

  // Render fullscreen chart when modal opens
  useEffect(() => {
    if (isFullscreen && fullscreenRef.current) {
      const renderFullscreenChart = async () => {
        if (fullscreenRef.current) {
          try {
            // Clear any existing content
            fullscreenRef.current.innerHTML = ''

            // Re-initialize mermaid without width constraints for fullscreen
            mermaid.initialize({
              startOnLoad: false,
              theme: 'default',
              securityLevel: 'loose',
              flowchart: {
                useMaxWidth: false,
                htmlLabels: true
              },
              sequence: {
                useMaxWidth: false,
                mirrorActors: false
              },
              gantt: {
                useMaxWidth: false
              }
            })

            // Validate and render the chart
            await mermaid.parse(chart)
            const renderChartId = `${chartId}-fullscreen-${Date.now()}`
            const { svg } = await mermaid.render(renderChartId, chart)

            fullscreenRef.current.innerHTML = svg

            // Add minimal styling to the SVG for fullscreen - allow natural size
            const svgElement = fullscreenRef.current.querySelector('svg')
            if (svgElement) {
              svgElement.style.display = 'block'
              svgElement.style.margin = '0'
              svgElement.style.maxWidth = 'none'
              svgElement.style.width = 'auto'
              svgElement.style.height = 'auto'
              svgElement.style.position = 'relative'

              // Apply initial transform
              svgElement.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`
              svgElement.style.transformOrigin = 'center center'
              svgElement.style.transition = 'transform 0.2s ease'
            }
          } catch (error) {
            console.error('Mermaid fullscreen rendering error:', error)
            if (fullscreenRef.current) {
              fullscreenRef.current.innerHTML = `
                <div class="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <p class="text-red-600 text-sm font-medium">Mermaid 图表渲染失败</p>
                  <pre class="text-xs text-red-500 mt-2 whitespace-pre-wrap">${chart}</pre>
                </div>
              `
            }
          }
        }
      }

      // Give the modal time to render, then render the chart
      const timer = setTimeout(renderFullscreenChart, 200)
      return () => clearTimeout(timer)
    }
  }, [isFullscreen, chart, chartId, panX, panY, zoomLevel])

  // Re-initialize mermaid when exiting fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      // Re-initialize mermaid with width constraints for regular view
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true
        },
        sequence: {
          useMaxWidth: true,
          mirrorActors: false
        },
        gantt: {
          useMaxWidth: true
        }
      })
    }
  }, [isFullscreen])

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isFullscreen])

  return (
    <>
      {/* Regular diagram view */}
      <div className="relative group my-6 p-4 bg-card border border-border rounded-lg overflow-x-auto">
        {/* Expand button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 bg-background/80 hover:bg-background border border-border shadow-sm"
          onClick={toggleFullscreen}
          title="全屏查看图表"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <div ref={ref} className="mermaid-container" />
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm">
          <div className="relative bg-background w-full h-full flex flex-col">
            {/* Header with only close button */}
            <div className="flex items-center justify-end p-4 border-b border-border bg-background z-10 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={toggleFullscreen}
                title="关闭全屏"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chart content - centered container */}
            <div
              ref={fullscreenContainerRef}
              className="flex-1 overflow-hidden flex items-center justify-center"
              style={{
                cursor: isDragEnabled ? (isDragging ? 'grabbing' : 'grab') : 'default',
                userSelect: isDragEnabled ? 'none' : 'auto'
              }}
            >
              <div className="relative">
                <div
                  ref={fullscreenRef}
                  className="mermaid-container"
                  style={{
                    minWidth: 'max-content',
                    minHeight: 'max-content'
                  }}
                />
              </div>
            </div>

            {/* Zoom and Pan controls - fixed position outside scroll container */}
            <div className="fixed bottom-4 left-4 flex flex-col gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg z-20">
              {/* Drag toggle button */}
              <Button
                variant={isDragEnabled ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={toggleDragMode}
                title={isDragEnabled ? "关闭拖拽模式" : "开启拖拽模式"}
              >
                <Hand className={`h-4 w-4 ${isDragEnabled ? 'text-primary-foreground' : ''}`} />
              </Button>

              {/* Reset position button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={resetPosition}
                title="回到原点"
              >
                <Home className="h-4 w-4" />
              </Button>

              {/* Separator */}
              <div className="h-px bg-border mx-1" />

              {/* Zoom controls */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={zoomIn}
                title="放大"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={zoomOut}
                title="缩小"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={resetZoom}
                title="重置缩放和位置"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              {/* Status display */}
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