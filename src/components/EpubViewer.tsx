'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import ePub, { Book, Rendition } from 'epubjs'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { useShortcuts } from '@/contexts/ShortcutContext'
import { epubReadingProgress, ReadingProgress } from '@/lib/epub-reading-progress'
import ResumeReadingDialog from './ResumeReadingDialog'

interface EpubViewerProps {
  data: string  // EPUB file path or blob URL
  fileName: string
  filePath: string
  className?: string
  fontSize?: number
  contentWidth?: 'narrow' | 'medium' | 'wide' | 'full'
}

// Pure utility functions extracted outside the component
function getContentPadding(contentWidth: 'narrow' | 'medium' | 'wide' | 'full'): string {
  switch (contentWidth) {
    case 'narrow':
      return '2rem 3rem'
    case 'medium':
      return '2rem 2.5rem'
    case 'wide':
      return '2rem 2rem'
    case 'full':
      return '2rem 2rem'
    default:
      return '2rem 2.5rem'
  }
}

function getMaxWidth(width: 'narrow' | 'medium' | 'wide' | 'full'): string {
  switch (width) {
    case 'narrow':
      return '672px'  // max-w-2xl
    case 'medium':
      return '896px'  // max-w-4xl
    case 'wide':
      return '1152px' // max-w-6xl
    case 'full':
      return '100%'   // max-w-none
    default:
      return '896px'
  }
}

function getThemeConfig(fontSize: number, contentWidth: 'narrow' | 'medium' | 'wide' | 'full') {
  return {
    body: {
      'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
      'font-size': `${fontSize}px !important`,
      'line-height': '1.7 !important',
      'color': 'var(--foreground) !important',
      'background': 'var(--background) !important',
      'padding': `${getContentPadding(contentWidth)} !important`,
      'text-align': 'justify !important',
      'hyphens': 'auto !important',
      'word-spacing': '0.05em !important'
    },
    'p': {
      'margin': '0 0 1.2em 0 !important',
      'text-indent': '1.5em !important'
    },
    'h1, h2, h3, h4, h5, h6': {
      'margin': '1.5em 0 0.8em 0 !important',
      'line-height': '1.3 !important',
      'font-weight': '600 !important'
    },
    'h1': {
      'font-size': '1.8em !important'
    },
    'h2': {
      'font-size': '1.5em !important'
    },
    'h3': {
      'font-size': '1.3em !important'
    },
    'img': {
      'max-width': '100% !important',
      'height': 'auto !important',
      'margin': '1em auto !important',
      'display': 'block !important'
    },
    'blockquote': {
      'margin': '1em 2em !important',
      'padding-left': '1em !important',
      'border-left': '3px solid var(--border) !important',
      'font-style': 'italic !important'
    }
  }
}

export default function EpubViewer({ data, fileName, filePath, className, fontSize = 16, contentWidth = 'medium' }: EpubViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [book, setBook] = useState<Book | null>(null)
  const [rendition, setRendition] = useState<Rendition | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [isResizing, setIsResizing] = useState<boolean>(false)

  // Track if initial load is complete to avoid unnecessary resize
  const isInitialLoadRef = useRef<boolean>(true)

  // Resume reading dialog state
  const [showResumeDialog, setShowResumeDialog] = useState<boolean>(false)
  const [savedProgress, setSavedProgress] = useState<ReadingProgress | null>(null)
  const pendingCfiRef = useRef<string | null>(null) // 保存待跳转的 CFI
  const showResumeDialogRef = useRef<boolean>(false) // Ref to track dialog state for closures

  // Keep ref in sync with state
  useEffect(() => {
    showResumeDialogRef.current = showResumeDialog
  }, [showResumeDialog])

  useEffect(() => {
    if (!data) {
      setError('EPUB 文件路径为空')
      setIsLoading(false)
      return
    }

    let isMounted = true
    let currentRendition: Rendition | null = null
    let currentBook: Book | null = null

    const loadEpub = async () => {
      try {
        setIsLoading(true)
        setError(null)
        isInitialLoadRef.current = true

        // Fetch the EPUB file
        let epubData: ArrayBuffer
        if (data.startsWith('blob:')) {
          const response = await fetch(data)
          epubData = await response.arrayBuffer()
        } else if (data.startsWith('/') || data.match(/^[A-Z]:\\/i)) {
          const fileUrl = `file://${data.replace(/\\/g, '/')}`
          const response = await fetch(fileUrl)
          if (!response.ok) throw new Error(`Failed to load file: ${response.statusText}`)
          epubData = await response.arrayBuffer()
        } else {
          // Handle base64 data (from file dialog)
          try {
            const binaryString = atob(data)
            const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0))
            epubData = bytes.buffer
          } catch {
            // Fallback: try treating as URL if base64 fails
            try {
               const response = await fetch(data)
               epubData = await response.arrayBuffer()
            } catch {
               throw new Error('无法解码 EPUB 数据或加载文件')
            }
          }
        }

        if (!isMounted) return

        // Create the book from ArrayBuffer
        const newBook = ePub(epubData)
        currentBook = newBook

        // Wait for book to be ready
        await newBook.ready

        if (!isMounted) return

        setBook(newBook)

        // Wait for viewerRef to be available
        let renderAttempts = 0
        while (!viewerRef.current && renderAttempts < 20 && isMounted) {
          await new Promise(resolve => setTimeout(resolve, 100))
          renderAttempts++
        }

        if (!viewerRef.current) {
          throw new Error('Viewer container not found after waiting')
        }

        const newRendition = newBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
          flow: 'paginated',
          snap: true,
          manager: 'default',
          allowScriptedContent: true
        })

        currentRendition = newRendition

        if (!isMounted) return

        setRendition(newRendition)

        // Apply Apple Books-like theme before displaying
        newRendition.themes.default(getThemeConfig(fontSize, contentWidth))

        // Display the book
        await newRendition.display()

        if (!isMounted) return

        // Generate locations for accurate page numbers
        await newBook.locations.generate(1600)

        if (!isMounted) return

        // Check for saved reading progress before showing content
        const savedReadingProgress = epubReadingProgress.getProgress(filePath)
        if (savedReadingProgress && savedReadingProgress.cfi) {
          setSavedProgress(savedReadingProgress)
          pendingCfiRef.current = savedReadingProgress.cfi
          setShowResumeDialog(true)
        }

        setIsLoading(false)
        isInitialLoadRef.current = false

        // Listen to location changes
        newRendition.on('relocated', (location: any) => {
          if (newBook.locations.total > 0) {
            const currentLocation = location.start.cfi
            const currentPage = newBook.locations.locationFromCfi(currentLocation)
            const totalPages = newBook.locations.total

            setCurrentPage(currentPage || 1)
            setTotalPages(totalPages)

            // Save reading progress (only if dialog is not showing)
            if (!showResumeDialogRef.current && currentLocation) {
              epubReadingProgress.saveProgress(
                filePath,
                fileName,
                currentLocation,
                currentPage || 1,
                totalPages
              )
            }
          } else {
            const current = location.start.displayed.page || 1
            const total = location.start.displayed.total || 1
            setCurrentPage(current)
            setTotalPages(total)
          }
        })

        // Add keyboard event listener to iframe content
        newRendition.on('keydown', (e: KeyboardEvent) => {
          // Skip if resume dialog is showing
          if (showResumeDialogRef.current) return

          const key = e.key
          const noModifiers = !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey

          // Previous page
          if ((key === 'ArrowLeft' || key === 'PageUp' || key === 'k') && noModifiers) {
            newRendition.prev()
            return
          }

          // Next page
          if ((key === 'ArrowRight' || key === 'PageDown' || key === 'j' || key === ' ') && noModifiers) {
            newRendition.next()
            return
          }

          // Previous page with Shift+Space
          if (key === ' ' && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
            newRendition.prev()
            return
          }

          // First page
          if (key === 'Home' && noModifiers) {
            newRendition.display(0)
            return
          }

          // Last page
          if (key === 'End' && noModifiers) {
            const spine = newBook.spine as any
            if (spine && spine.last) {
              newRendition.display(spine.last().href)
            }
            return
          }
        })

      } catch (err) {
        if (!isMounted) return

        const errorMessage = err instanceof Error ? err.message : String(err)
        setError(`加载 EPUB 失败: ${errorMessage}`)
        setIsLoading(false)
      }
    }

    loadEpub()

    return () => {
      isMounted = false
      if (currentRendition) {
        try {
          currentRendition.destroy()
        } catch {
          // ignore cleanup errors
        }
      }
      if (currentBook) {
        try {
          currentBook.destroy()
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }, [data])

  // Re-apply theme when fontSize or contentWidth changes
  useEffect(() => {
    if (!rendition) return

    rendition.themes.default(getThemeConfig(fontSize, contentWidth))
  }, [fontSize, contentWidth, rendition])

  // Handle contentWidth and fontSize changes - resize rendition and regenerate locations
  useEffect(() => {
    if (!rendition || !book) return

    // Skip resize on initial load (it's already sized correctly)
    if (isInitialLoadRef.current) {
      return
    }

    const handleResize = async () => {
      try {
        setIsResizing(true)

        // Save current reading position (CFI)
        const currentLocation = rendition.currentLocation()
        const currentCfi = currentLocation?.start?.cfi

        // Resize the rendition to fit new container width
        rendition.resize()

        // Wait a bit for resize to take effect
        await new Promise(resolve => setTimeout(resolve, 150))

        // Regenerate locations for accurate pagination with new width/fontSize
        await book.locations.generate(1600)

        // Restore reading position if we had one
        if (currentCfi) {
          await rendition.display(currentCfi)
        }

        setIsResizing(false)
      } catch {
        setIsResizing(false)
      }
    }

    handleResize()
  }, [contentWidth, fontSize, rendition, book])

  const goToPrev = async () => {
    if (rendition) {
      try {
        await rendition.prev()
      } catch {
        // ignore navigation errors
      }
    }
  }

  const goToNext = async () => {
    if (rendition) {
      try {
        await rendition.next()
      } catch {
        // ignore navigation errors
      }
    }
  }

  // Go to first page
  const goToFirst = async () => {
    if (rendition && book) {
      try {
        await rendition.display(0)
      } catch {
        // ignore navigation errors
      }
    }
  }

  // Go to last page
  const goToLast = async () => {
    if (rendition && book) {
      try {
        const spine = book.spine as any
        if (spine && spine.last) {
          await rendition.display(spine.last().href)
        }
      } catch {
        // ignore navigation errors
      }
    }
  }

  // Get shortcuts from context
  const { shortcuts } = useShortcuts()

  // Helper function to check if a key event matches a shortcut key
  const matchesKey = useCallback((e: KeyboardEvent, shortcutKey: string): boolean => {
    const key = e.key.toLowerCase()
    const shortcutKeyLower = shortcutKey.toLowerCase()

    // Handle modifier combinations like "shift+space"
    if (shortcutKeyLower.includes('+')) {
      const parts = shortcutKeyLower.split('+')
      const mainKey = parts[parts.length - 1]
      const modifiers = parts.slice(0, -1)

      const hasShift = modifiers.includes('shift')
      const hasCtrl = modifiers.includes('ctrl') || modifiers.includes('cmd')
      const hasAlt = modifiers.includes('alt')

      // Check main key
      let keyMatches = false
      if (mainKey === 'space') keyMatches = e.key === ' '
      else keyMatches = key === mainKey

      // Check modifiers
      const modifiersMatch =
        (hasShift === e.shiftKey) &&
        (hasCtrl === (e.ctrlKey || e.metaKey)) &&
        (hasAlt === e.altKey)

      return keyMatches && modifiersMatch
    }

    // Handle simple keys (without modifiers)
    const noModifiers = !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey
    if (shortcutKeyLower === 'space') return e.key === ' ' && noModifiers
    if (shortcutKeyLower === 'arrowleft') return e.key === 'ArrowLeft' && noModifiers
    if (shortcutKeyLower === 'arrowright') return e.key === 'ArrowRight' && noModifiers
    if (shortcutKeyLower === 'pageup') return e.key === 'PageUp' && noModifiers
    if (shortcutKeyLower === 'pagedown') return e.key === 'PageDown' && noModifiers
    if (shortcutKeyLower === 'home') return e.key === 'Home' && noModifiers
    if (shortcutKeyLower === 'end') return e.key === 'End' && noModifiers

    return key === shortcutKeyLower && noModifiers
  }, [])

  // Check if event matches any of the shortcut's keys
  const matchesShortcut = useCallback((e: KeyboardEvent, shortcutId: string): boolean => {
    const shortcut = shortcuts.find(s => s.id === shortcutId)
    if (!shortcut || !shortcut.enabled) return false
    return shortcut.keys.some(key => matchesKey(e, key))
  }, [shortcuts, matchesKey])

  // Keyboard navigation with configurable shortcuts
  useEffect(() => {
    if (!rendition) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      // Skip if resume dialog is showing
      if (showResumeDialog) return

      // Previous page shortcuts
      if (
        matchesShortcut(e, 'reading-prev-page') ||
        matchesShortcut(e, 'reading-prev-page-vim') ||
        matchesShortcut(e, 'reading-prev-page-space')
      ) {
        e.preventDefault()
        rendition.prev()
        return
      }

      // Next page shortcuts
      if (
        matchesShortcut(e, 'reading-next-page') ||
        matchesShortcut(e, 'reading-next-page-vim') ||
        matchesShortcut(e, 'reading-next-page-space')
      ) {
        e.preventDefault()
        rendition.next()
        return
      }

      // First page
      if (matchesShortcut(e, 'reading-first-page')) {
        e.preventDefault()
        rendition.display(0)
        return
      }

      // Last page
      if (matchesShortcut(e, 'reading-last-page') && book) {
        e.preventDefault()
        const spine = book.spine as any
        if (spine && spine.last) {
          rendition.display(spine.last().href)
        }
        return
      }
    }

    // Add event listener with passive: false to allow preventDefault
    window.addEventListener('keydown', handleKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [rendition, book, matchesShortcut, showResumeDialog])

  // Handle resume reading - jump to saved position
  const handleResumeReading = useCallback(async () => {
    if (rendition && pendingCfiRef.current) {
      try {
        await rendition.display(pendingCfiRef.current)
      } catch {
        // ignore navigation errors
      }
    }
    setShowResumeDialog(false)
    setSavedProgress(null)
    pendingCfiRef.current = null
  }, [rendition])

  // Handle start over - stay at beginning
  const handleStartOver = useCallback(() => {
    setShowResumeDialog(false)
    setSavedProgress(null)
    pendingCfiRef.current = null
  }, [])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Navigation bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrev}
          className="h-7 w-7 p-0"
          title="上一页 (← / PageUp / K / Shift+Space)"
          disabled={isLoading || !!error}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={fileName}>
            {fileName}
          </span>
          {totalPages > 0 && !isLoading && !error && (
            <span className="text-xs text-muted-foreground">
              ({currentPage}/{totalPages})
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          className="h-7 w-7 p-0"
          title="下一页 (→ / PageDown / J / Space)"
          disabled={isLoading || !!error}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* EPUB content container - always rendered */}
      <div className="flex-1 relative overflow-hidden flex justify-center">
        <div
          ref={viewerRef}
          className="h-full overflow-hidden"
          style={{
            position: 'relative',
            background: 'var(--background)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            maxWidth: getMaxWidth(contentWidth)
          }}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/95 z-50">
            <div className="text-center p-8 max-w-md">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <div className="text-muted-foreground text-sm mb-2">正在加载 EPUB...</div>
              <div className="text-xs text-muted-foreground mb-3">
                <BookOpen className="inline h-4 w-4 mr-1" />
                {fileName}
              </div>
              <div className="text-xs text-muted-foreground/70 italic">
                正在生成精确页码，大型书籍可能需要几秒钟
              </div>
            </div>
          </div>
        )}

        {/* Resizing overlay */}
        {isResizing && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-40">
            <div className="text-center p-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-3"></div>
              <div className="text-muted-foreground text-sm">正在调整布局...</div>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/95 z-50">
            <div className="text-center p-8 max-w-2xl">
              <div className="text-red-500 text-lg mb-2">EPUB 加载错误</div>
              <div className="text-muted-foreground text-sm mb-4">{error}</div>
              <div className="text-xs text-muted-foreground mb-4">
                <div>文件名: {fileName}</div>
                <div>文件路径: {filePath}</div>
              </div>
              <Button onClick={() => window.location.reload()} className="mt-4">
                重新加载
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Resume Reading Dialog */}
      <ResumeReadingDialog
        isOpen={showResumeDialog}
        onResume={handleResumeReading}
        onStartOver={handleStartOver}
        progress={savedProgress}
      />
    </div>
  )
}
