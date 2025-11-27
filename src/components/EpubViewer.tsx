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

  // Get max width value based on contentWidth setting
  const getMaxWidth = (width: 'narrow' | 'medium' | 'wide' | 'full'): string => {
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

  // Resume reading dialog state
  const [showResumeDialog, setShowResumeDialog] = useState<boolean>(false)
  const [savedProgress, setSavedProgress] = useState<ReadingProgress | null>(null)
  const pendingCfiRef = useRef<string | null>(null) // 保存待跳转的 CFI
  const showResumeDialogRef = useRef<boolean>(false) // Ref to track dialog state for closures

  // Keep ref in sync with state
  useEffect(() => {
    showResumeDialogRef.current = showResumeDialog
  }, [showResumeDialog])

  // Debug: Log props on mount
  useEffect(() => {
    console.log('EpubViewer: Component mounted with props:', {
      data,
      fileName,
      filePath,
      dataType: typeof data,
      dataLength: data?.length
    })
  }, [])

  useEffect(() => {
    console.log('EpubViewer: useEffect triggered', {
      hasViewerRef: !!viewerRef.current,
      hasData: !!data,
      data: data?.substring?.(0, 50) || data
    })

    if (!data) {
      console.error('EpubViewer: data is missing or empty')
      setError('EPUB 文件路径为空')
      setIsLoading(false)
      return
    }

    let isMounted = true
    let currentRendition: Rendition | null = null
    let currentBook: Book | null = null

    const loadEpub = async () => {
      try {
        console.log('EpubViewer: Starting to load EPUB from:', data?.substring?.(0, 50) || data)
        setIsLoading(true)
        setError(null)
        isInitialLoadRef.current = true // Reset for new EPUB file

        // Fetch the EPUB file
        let epubData: ArrayBuffer
        if (data.startsWith('blob:')) {
          // Handle blob URL (from drag-drop)
          console.log('EpubViewer: Fetching from blob URL')
          const response = await fetch(data)
          epubData = await response.arrayBuffer()
        } else {
          // Handle base64 data (from file dialog)
          console.log('EpubViewer: Converting base64 data to ArrayBuffer')
          try {
            // Decode base64 to binary string
            const binaryString = atob(data)
            // Convert binary string to ArrayBuffer
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }
            epubData = bytes.buffer
          } catch (decodeError) {
            console.error('EpubViewer: Failed to decode base64:', decodeError)
            throw new Error('无法解码 EPUB 数据')
          }
        }

        console.log('EpubViewer: EPUB data loaded, size:', epubData.byteLength, 'bytes')

        if (!isMounted) return

        // Create the book from ArrayBuffer
        const newBook = ePub(epubData)
        currentBook = newBook
        console.log('EpubViewer: Book object created')

        // Wait for book to be ready
        await newBook.ready
        console.log('EpubViewer: Book is ready')

        if (!isMounted) return

        setBook(newBook)

        // Render the book with proper options
        // Wait for viewerRef to be available
        let renderAttempts = 0
        while (!viewerRef.current && renderAttempts < 20 && isMounted) {
          console.log(`EpubViewer: Waiting for viewerRef (attempt ${renderAttempts + 1}/20)`)
          await new Promise(resolve => setTimeout(resolve, 100))
          renderAttempts++
        }

        if (!viewerRef.current) {
          throw new Error('Viewer container not found after waiting')
        }

        const newRendition = newBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none', // Single page view (like Apple Books on iPhone)
          flow: 'paginated', // Paginated mode
          snap: true, // Snap to pages for smooth transitions
          manager: 'default',
          allowScriptedContent: true // Allow scripts for interactive EPUB content
        })

        currentRendition = newRendition
        console.log('EpubViewer: Rendition created')

        if (!isMounted) return

        setRendition(newRendition)

        // Apply Apple Books-like theme before displaying
        // Calculate content padding based on contentWidth setting
        // With maxWidth already applied to container, we use consistent padding
        const getContentPadding = () => {
          switch (contentWidth) {
            case 'narrow':
              return '2rem 3rem' // Comfortable padding for narrow content
            case 'medium':
              return '2rem 2.5rem' // Default padding
            case 'wide':
              return '2rem 2rem' // Standard padding for wide content
            case 'full':
              return '2rem 2rem' // Consistent padding for full width
            default:
              return '2rem 2.5rem'
          }
        }

        newRendition.themes.default({
          body: {
            'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
            'font-size': `${fontSize}px !important`,
            'line-height': '1.7 !important',
            'color': 'var(--foreground) !important',
            'background': 'var(--background) !important',
            'padding': `${getContentPadding()} !important`,
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
        })

        // Display the book
        await newRendition.display()
        console.log('EpubViewer: EPUB displayed successfully')

        if (!isMounted) return

        // Generate locations for accurate page numbers (this may take a moment for large books)
        console.log('EpubViewer: Generating locations for accurate pagination...')
        await newBook.locations.generate(1600) // 1600 characters per "page" (Apple Books standard)
        console.log('EpubViewer: Locations generated:', newBook.locations.total)

        if (!isMounted) return

        // Check for saved reading progress before showing content
        const savedReadingProgress = epubReadingProgress.getProgress(filePath)
        if (savedReadingProgress && savedReadingProgress.cfi) {
          console.log('EpubViewer: Found saved progress:', savedReadingProgress)
          setSavedProgress(savedReadingProgress)
          pendingCfiRef.current = savedReadingProgress.cfi
          setShowResumeDialog(true)
        }

        setIsLoading(false)
        isInitialLoadRef.current = false // Mark initial load as complete

        // Listen to location changes
        newRendition.on('relocated', (location: any) => {
          console.log('EpubViewer: Relocated to:', location)

          // Use locations for accurate page numbers
          if (newBook.locations.total > 0) {
            const currentLocation = location.start.cfi
            const currentPage = newBook.locations.locationFromCfi(currentLocation)
            const totalPages = newBook.locations.total

            console.log('EpubViewer: Location-based page:', currentPage, '/', totalPages)
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
              console.log('EpubViewer: Progress saved at CFI:', currentLocation)
            }
          } else {
            // Fallback to displayed page numbers if locations not available
            const current = location.start.displayed.page || 1
            const total = location.start.displayed.total || 1
            setCurrentPage(current)
            setTotalPages(total)
          }
        })

        // Handle rendering errors
        newRendition.on('renderError', (err: Error) => {
          console.error('EpubViewer: Render error:', err)
        })

        // Add page transition animations
        newRendition.on('started', () => {
          console.log('EpubViewer: Started rendering')
        })

        newRendition.on('displayed', () => {
          console.log('EpubViewer: Page displayed')
        })

        // Add keyboard event listener to iframe content
        // This handles keyboard events when focus is inside the EPUB iframe
        // Note: We don't call preventDefault here as it's a passive event listener
        // The window-level listener (with passive: false) will handle preventDefault
        newRendition.on('keydown', (e: KeyboardEvent) => {
          console.log('EpubViewer: Keydown in iframe:', e.key)

          // Skip if resume dialog is showing
          if (showResumeDialogRef.current) return

          // Handle arrow keys and other navigation
          const key = e.key
          const noModifiers = !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey

          // Previous page
          if ((key === 'ArrowLeft' || key === 'PageUp' || key === 'k') && noModifiers) {
            // Don't call preventDefault here - let the window listener handle it
            newRendition.prev()
            return
          }

          // Next page
          if ((key === 'ArrowRight' || key === 'PageDown' || key === 'j' || key === ' ') && noModifiers) {
            // Don't call preventDefault here - let the window listener handle it
            newRendition.next()
            return
          }

          // Previous page with Shift+Space
          if (key === ' ' && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Don't call preventDefault here - let the window listener handle it
            newRendition.prev()
            return
          }

          // First page
          if (key === 'Home' && noModifiers) {
            // Don't call preventDefault here - let the window listener handle it
            newRendition.display(0)
            return
          }

          // Last page
          if (key === 'End' && noModifiers) {
            // Don't call preventDefault here - let the window listener handle it
            const spine = newBook.spine as any
            if (spine && spine.last) {
              newRendition.display(spine.last().href)
            }
            return
          }
        })

        console.log('EpubViewer: Setup complete')

      } catch (err) {
        console.error('EpubViewer: Failed to load EPUB:', err)
        console.error('EpubViewer: Error stack:', err instanceof Error ? err.stack : 'No stack trace')
        console.error('EpubViewer: Error details:', {
          name: err instanceof Error ? err.name : 'Unknown',
          message: err instanceof Error ? err.message : String(err),
          type: typeof err,
          dataInfo: {
            type: typeof data,
            length: data?.length,
            isBlob: data?.startsWith?.('blob:'),
            preview: data?.substring?.(0, 100)
          }
        })

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
          console.log('EpubViewer: Rendition destroyed')
        } catch (err) {
          console.error('EpubViewer: Error destroying rendition:', err)
        }
      }
      if (currentBook) {
        try {
          currentBook.destroy()
          console.log('EpubViewer: Book destroyed')
        } catch (err) {
          console.error('EpubViewer: Error destroying book:', err)
        }
      }
    }
  }, [data])

  // Re-apply theme when fontSize changes
  useEffect(() => {
    if (!rendition) return

    const getContentPadding = () => {
      switch (contentWidth) {
        case 'narrow':
          return '2rem 3rem' // Comfortable padding for narrow content
        case 'medium':
          return '2rem 2.5rem' // Default padding
        case 'wide':
          return '2rem 2rem' // Standard padding for wide content
        case 'full':
          return '2rem 2rem' // Consistent padding for full width
        default:
          return '2rem 2.5rem'
      }
    }

    rendition.themes.default({
      body: {
        'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
        'font-size': `${fontSize}px !important`,
        'line-height': '1.7 !important',
        'color': 'var(--foreground) !important',
        'background': 'var(--background) !important',
        'padding': `${getContentPadding()} !important`,
        'text-align': 'justify !important',
        'hyphens': 'auto !important',
        'word-spacing': '0.05em !important'
      }
    })
  }, [fontSize, contentWidth, rendition])

  // Handle contentWidth and fontSize changes - resize rendition and regenerate locations
  useEffect(() => {
    if (!rendition || !book) return

    // Skip resize on initial load (it's already sized correctly)
    if (isInitialLoadRef.current) {
      console.log('EpubViewer: Skipping resize for initial load')
      return
    }

    const handleResize = async () => {
      try {
        console.log('EpubViewer: Settings changed (width/fontSize), resizing rendition')
        setIsResizing(true)

        // Save current reading position (CFI)
        const currentLocation = rendition.currentLocation()
        const currentCfi = currentLocation?.start?.cfi

        console.log('EpubViewer: Current CFI before resize:', currentCfi)

        // Resize the rendition to fit new container width
        rendition.resize()

        // Wait a bit for resize to take effect
        await new Promise(resolve => setTimeout(resolve, 150))

        // Regenerate locations for accurate pagination with new width/fontSize
        console.log('EpubViewer: Regenerating locations after resize...')
        await book.locations.generate(1600)
        console.log('EpubViewer: Locations regenerated:', book.locations.total)

        // Restore reading position if we had one
        if (currentCfi) {
          console.log('EpubViewer: Restoring position to CFI:', currentCfi)
          await rendition.display(currentCfi)
        }

        setIsResizing(false)
      } catch (error) {
        console.error('EpubViewer: Error during resize:', error)
        setIsResizing(false)
      }
    }

    handleResize()
  }, [contentWidth, fontSize, rendition, book])

  const goToPrev = async () => {
    if (rendition) {
      try {
        await rendition.prev()
        console.log('EpubViewer: Moved to previous page')
      } catch (err) {
        console.error('EpubViewer: Error going to previous page:', err)
      }
    }
  }

  const goToNext = async () => {
    if (rendition) {
      try {
        await rendition.next()
        console.log('EpubViewer: Moved to next page')
      } catch (err) {
        console.error('EpubViewer: Error going to next page:', err)
      }
    }
  }

  // Go to first page
  const goToFirst = async () => {
    if (rendition && book) {
      try {
        await rendition.display(0)
        console.log('EpubViewer: Moved to first page')
      } catch (err) {
        console.error('EpubViewer: Error going to first page:', err)
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
          console.log('EpubViewer: Moved to last page')
        }
      } catch (err) {
        console.error('EpubViewer: Error going to last page:', err)
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
        console.log('EpubViewer: Resuming reading at CFI:', pendingCfiRef.current)
        await rendition.display(pendingCfiRef.current)
        console.log('EpubViewer: Successfully jumped to saved position')
      } catch (err) {
        console.error('EpubViewer: Error jumping to saved position:', err)
      }
    }
    setShowResumeDialog(false)
    setSavedProgress(null)
    pendingCfiRef.current = null
  }, [rendition])

  // Handle start over - stay at beginning
  const handleStartOver = useCallback(() => {
    console.log('EpubViewer: Starting from beginning')
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
                <div className="mt-2">调试信息:</div>
                <div className="font-mono text-left bg-muted p-2 rounded mt-1">
                  <div>Data type: {typeof data}</div>
                  <div>Data length: {data?.length || 0}</div>
                  <div>Is blob URL: {data?.startsWith?.('blob:') ? 'Yes' : 'No'}</div>
                  <div>ViewerRef ready: {viewerRef.current ? 'Yes' : 'No'}</div>
                </div>
              </div>
              <div className="text-xs text-yellow-600 mb-4">
                请打开开发者工具 (Cmd+Option+I) 查看控制台日志获取更多信息
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
