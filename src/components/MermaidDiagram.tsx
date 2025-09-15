'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { Maximize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MermaidDiagramProps {
  chart: string
  id?: string
}

export default function MermaidDiagram({ chart, id }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
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
  }

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
              svgElement.style.margin = '0 auto'
              // Remove size constraints to allow full diagram display
              svgElement.style.maxWidth = 'none'
              svgElement.style.width = 'auto'
              svgElement.style.height = 'auto'
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
  }, [isFullscreen, chart, chartId])

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
            
            {/* Chart content - pure scroll container */}
            <div className="flex-1 overflow-auto">
              <div className="p-4">
                <div 
                  ref={fullscreenRef} 
                  className="mermaid-container min-h-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}