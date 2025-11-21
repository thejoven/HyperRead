'use client'

import React, { useEffect, useRef, useState } from 'react'
import ePub, { Book, Rendition } from 'epubjs'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'

interface EpubViewerProps {
  data: string  // EPUB file path or blob URL
  fileName: string
  filePath: string
  className?: string
}

export default function EpubViewer({ data, fileName, filePath, className }: EpubViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [book, setBook] = useState<Book | null>(null)
  const [rendition, setRendition] = useState<Rendition | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)

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
        newRendition.themes.default({
          body: {
            'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
            'font-size': '1.1em !important',
            'line-height': '1.7 !important',
            'color': 'var(--foreground) !important',
            'background': 'var(--background) !important',
            'padding': '2rem 3rem !important',
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

        setIsLoading(false)

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        goToPrev()
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [rendition])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Navigation bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrev}
          className="h-7 w-7 p-0"
          title="上一页 (← / PageUp)"
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
          title="下一页 (→ / PageDown)"
          disabled={isLoading || !!error}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* EPUB content container - always rendered */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={viewerRef}
          className="w-full h-full overflow-hidden"
          style={{
            position: 'relative',
            background: 'var(--background)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
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
    </div>
  )
}
