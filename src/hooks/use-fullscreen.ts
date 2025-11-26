import { useState, useEffect } from 'react'

interface FullscreenChangedEvent extends CustomEvent {
  detail: {
    isFull: boolean
  }
}

export function useFullscreen(): boolean {
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    // Initialize fullscreen state
    const init = async () => {
      try {
        const val = await window.electronAPI?.getFullScreen?.()
        if (typeof val === 'boolean') {
          setIsFullScreen(val)
        }
      } catch {
        // Ignore errors
      }
    }
    init()

    // Listen for fullscreen changes
    const handler = (e: Event) => {
      const event = e as FullscreenChangedEvent
      if (event?.detail && typeof event.detail.isFull === 'boolean') {
        setIsFullScreen(event.detail.isFull)
      }
    }

    window.addEventListener('fullscreen-changed', handler)
    return () => window.removeEventListener('fullscreen-changed', handler)
  }, [])

  return isFullScreen
}
