'use client'

import { useState, useEffect, useRef } from 'react'
import { ImageIcon, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import ImageViewer from './ImageViewer'
import { useLinkContext } from './LinkContext'

interface LocalImageProps {
  src: string
  alt?: string
  title?: string
  className?: string
  markdownFilePath?: string
  disablePreview?: boolean
}

export default function LocalImage({
  src,
  alt = '',
  title = '',
  className = '',
  markdownFilePath,
  disablePreview = false
}: LocalImageProps) {
  const isInsideLink = useLinkContext()
  const shouldDisablePreview = disablePreview || isInsideLink
  const [imageData, setImageData] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 2
  const isMountedRef = useRef(true)

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Load image data
  useEffect(() => {
    if (!src || !window.electronAPI?.readImage) {
      setLoading(false)
      setError('Image source not available or not in Electron environment')
      return
    }

    const loadImage = async (attempt = 0) => {
      try {
        setLoading(true)
        setError(null)

        console.log(`LocalImage: Loading image "${src}" (attempt ${attempt + 1}/${maxRetries + 1})`, {
          markdownFilePath,
          src
        })

        const result = await window.electronAPI.readImage(src, markdownFilePath)

        // Check if component is still mounted
        if (!isMountedRef.current) return

        if (result.success && result.dataUrl) {
          console.log('LocalImage: Image loaded successfully:', {
            path: result.path,
            size: result.size,
            mimeType: result.mimeType
          })
          setImageData(result.dataUrl)
          setError(null)
        } else {
          console.error('LocalImage: Failed to load image:', result.error)

          // Try retry logic for certain errors
          if (attempt < maxRetries && result.error?.includes('not exist')) {
            console.log(`LocalImage: Retrying image load (${attempt + 1}/${maxRetries})`)
            setTimeout(() => loadImage(attempt + 1), 500 * (attempt + 1))
            return
          }

          setError(result.error || 'Unknown error occurred')
          setImageData(null)
        }
      } catch (err) {
        console.error('LocalImage: Exception during image loading:', err)

        if (!isMountedRef.current) return

        const errorMessage = err instanceof Error ? err.message : 'Failed to load image'

        // Retry on network/IPC errors
        if (attempt < maxRetries) {
          console.log(`LocalImage: Retrying due to exception (${attempt + 1}/${maxRetries})`)
          setTimeout(() => loadImage(attempt + 1), 1000 * (attempt + 1))
          return
        }

        setError(errorMessage)
        setImageData(null)
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    loadImage()
  }, [src, markdownFilePath, retryCount])

  // Manual retry function
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  // Check if it's a remote image
  const isRemoteImage = src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')

  // For remote images, use normal img tag with conditional ImageViewer
  if (isRemoteImage) {
    const imageElement = (
      <img
        src={src}
        alt={alt}
        title={title}
        className={`max-w-full h-auto rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow ${className}`}
        loading="lazy"
        onError={(e) => {
          console.warn('LocalImage: Remote image failed to load:', src)
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
        }}
      />
    )

    if (shouldDisablePreview) {
      return <div className="my-4">{imageElement}</div>
    }

    return (
      <ImageViewer
        src={src}
        alt={alt}
        title={title}
        className="my-4"
      >
        {imageElement}
      </ImageViewer>
    )
  }

  // Loading state
  if (loading) {
    return (
      <Card className="inline-block border border-border bg-muted/20">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-sm text-muted-foreground">
              Loading image...
            </div>
            <div className="text-xs text-muted-foreground/70 font-mono truncate max-w-xs">
              {src}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error || !imageData) {
    return (
      <Card className="inline-block border border-destructive/30 bg-destructive/5">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="h-8 w-8 text-destructive/70" />
            <div className="text-sm font-medium text-destructive">
              Failed to load image
            </div>
            <div className="text-xs text-muted-foreground/70 font-mono truncate max-w-xs">
              {src}
            </div>
            {error && (
              <div className="text-xs text-destructive/70 mt-1 max-w-xs break-words">
                {error}
              </div>
            )}
            <button
              onClick={handleRetry}
              className="text-xs text-primary hover:text-primary/80 underline mt-2"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Success state - display the image with conditional ImageViewer
  const imageElement = (
    <img
      src={imageData}
      alt={alt}
      title={title}
      className={`max-w-full h-auto rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow ${className}`}
      style={{ maxHeight: '600px' }}
      onError={() => {
        console.error('LocalImage: Failed to display loaded image data')
        setError('Failed to display image')
        setImageData(null)
      }}
    />
  )

  return (
    <div className="my-4">
      {shouldDisablePreview ? (
        imageElement
      ) : (
        <ImageViewer
          src={imageData}
          alt={alt}
          title={title}
        >
          {imageElement}
        </ImageViewer>
      )}
      {alt && (
        <div className="text-xs text-muted-foreground/70 text-center mt-2 italic">
          {alt}
        </div>
      )}
    </div>
  )
}