'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw, Hand, Home, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageViewerProps {
  src: string
  alt?: string
  title?: string
  className?: string
  children: React.ReactNode
}

export default function ImageViewer({
  src,
  alt = '',
  title = '',
  className = '',
  children
}: ImageViewerProps) {
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

  // Apply transform when zoom or pan changes (but not during or right after dragging)
  useEffect(() => {
    if (isFullscreen && !isDragging && !justFinishedDragging) {
      if (fullscreenRef.current) {
        const imgElement = fullscreenRef.current.querySelector('img')
        if (imgElement) {
          const safeZoom = Math.max(0.1, Math.min(5, zoomLevel))
          imgElement.style.transform = `translate(${panX}px, ${panY}px) scale(${safeZoom})`
          imgElement.style.transformOrigin = 'center center'
          imgElement.style.transition = 'transform 0.2s ease'
          imgElement.style.visibility = 'visible'
          imgElement.style.opacity = '1'
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
        const imgElement = fullscreenRef.current.querySelector('img')
        if (imgElement) {
          const safeZoom = Math.max(0.1, Math.min(5, zoomLevel))
          imgElement.style.transform = `translate(${newPanX}px, ${newPanY}px) scale(${safeZoom})`
          imgElement.style.transformOrigin = 'center center'
          imgElement.style.transition = 'none'
          imgElement.style.visibility = 'visible'
          imgElement.style.opacity = '1'
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
        const imgElement = fullscreenRef.current.querySelector('img')
        if (imgElement) {
          const safeZoom = Math.max(0.1, Math.min(5, zoomLevel))
          imgElement.style.transform = `translate(${finalPanX}px, ${finalPanY}px) scale(${safeZoom})`
          imgElement.style.transformOrigin = 'center center'
          imgElement.style.transition = 'none' // Keep no transition to prevent flash
          imgElement.style.visibility = 'visible'
          imgElement.style.opacity = '1'
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
      {/* Regular image view with click handler */}
      <div
        className={`relative group cursor-pointer ${className}`}
        onClick={toggleFullscreen}
        title="点击查看大图"
      >
        {/* Expand button - top right corner */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 bg-background/80 hover:bg-background border border-border shadow-sm z-10"
          title="全屏查看图片"
          onClick={(e) => {
            e.stopPropagation()
            toggleFullscreen()
          }}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        {children}
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm">
          <div className="relative bg-black w-full h-full flex flex-col">
            {/* Header with close button */}
            <div className="flex items-center justify-end p-4 border-b border-white/20 bg-black/50 z-10 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={toggleFullscreen}
                title="关闭全屏"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Image content - centered container */}
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
                  className="image-container"
                  style={{
                    minWidth: 'max-content',
                    minHeight: 'max-content'
                  }}
                >
                  <img
                    src={src}
                    alt={alt}
                    title={title}
                    className="max-w-none h-auto"
                    style={{
                      display: 'block',
                      margin: '0',
                      transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.2s ease'
                    }}
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {/* Zoom and Pan controls - fixed position */}
            <div className="fixed bottom-4 left-4 flex flex-col gap-2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-2 shadow-lg z-20">
              {/* Drag toggle button */}
              <Button
                variant={isDragEnabled ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${isDragEnabled ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
                onClick={toggleDragMode}
                title={isDragEnabled ? "关闭拖拽模式" : "开启拖拽模式"}
              >
                <Hand className="h-4 w-4" />
              </Button>

              {/* Reset position button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={resetPosition}
                title="回到原点"
              >
                <Home className="h-4 w-4" />
              </Button>

              {/* Separator */}
              <div className="h-px bg-white/20 mx-1" />

              {/* Zoom controls */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={zoomIn}
                title="放大"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={zoomOut}
                title="缩小"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={resetZoom}
                title="重置缩放和位置"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              {/* Status display */}
              <div className="text-xs text-center text-white/80 px-1">
                {Math.round(zoomLevel * 100)}%
              </div>
              {isDragEnabled && (
                <div className="text-xs text-center text-white px-1">
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