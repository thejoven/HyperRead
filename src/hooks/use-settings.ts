import { useState, useEffect } from 'react'
import { applyPrimaryColor, type PrimaryColor } from '@/utils/theme'

export type ContentWidth = 'narrow' | 'medium' | 'wide' | 'full'

interface Settings {
  fontSize: number
  contentWidth: ContentWidth
  primaryColor: PrimaryColor
  isSidebarCollapsed: boolean
  sidebarWidth: number
  aiSidebarWidth: number
}

interface UseSettingsReturn extends Settings {
  setFontSize: (size: number) => void
  setContentWidth: (width: ContentWidth) => void
  setPrimaryColor: (color: PrimaryColor) => void
  setIsSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  setAiSidebarWidth: (width: number) => void
  getMaxWidthClass: () => string
}

const STORAGE_KEYS = {
  fontSize: 'docs-font-size',
  contentWidth: 'docs-content-width',
  primaryColor: 'docs-primary-color',
  sidebarCollapsed: 'docs-sidebar-collapsed',
  sidebarWidth: 'docs-sidebar-width',
  aiSidebarWidth: 'docs-ai-sidebar-width'
} as const

const DEFAULTS = {
  fontSize: 16,
  contentWidth: 'medium' as ContentWidth,
  primaryColor: 'cyan' as PrimaryColor,
  sidebarCollapsed: false,
  sidebarWidth: 288,
  aiSidebarWidth: 288
} as const

export function useSettings(): UseSettingsReturn {
  const [fontSize, setFontSizeState] = useState<number>(DEFAULTS.fontSize)
  const [contentWidth, setContentWidthState] = useState<ContentWidth>(DEFAULTS.contentWidth)
  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>(DEFAULTS.primaryColor)
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState<boolean>(DEFAULTS.sidebarCollapsed)
  const [sidebarWidth, setSidebarWidthState] = useState<number>(DEFAULTS.sidebarWidth)
  const [aiSidebarWidth, setAiSidebarWidthState] = useState<number>(DEFAULTS.aiSidebarWidth)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem(STORAGE_KEYS.fontSize)
    if (savedFontSize) {
      setFontSizeState(parseInt(savedFontSize, 10))
    }

    const savedContentWidth = localStorage.getItem(STORAGE_KEYS.contentWidth)
    if (savedContentWidth) {
      setContentWidthState(savedContentWidth as ContentWidth)
    }

    const savedPrimaryColor = localStorage.getItem(STORAGE_KEYS.primaryColor)
    if (savedPrimaryColor) {
      setPrimaryColorState(savedPrimaryColor as PrimaryColor)
    }

    const savedSidebarState = localStorage.getItem(STORAGE_KEYS.sidebarCollapsed)
    if (savedSidebarState) {
      setIsSidebarCollapsedState(JSON.parse(savedSidebarState))
    }

    const savedSidebarWidth = localStorage.getItem(STORAGE_KEYS.sidebarWidth)
    if (savedSidebarWidth) {
      const width = parseInt(savedSidebarWidth, 10)
      if (width >= 200 && width <= 600) {
        setSidebarWidthState(width)
      }
    }

    const savedAiSidebarWidth = localStorage.getItem(STORAGE_KEYS.aiSidebarWidth)
    if (savedAiSidebarWidth) {
      const width = parseInt(savedAiSidebarWidth, 10)
      if (width >= 288 && width <= 800) {
        setAiSidebarWidthState(width)
      }
    }
  }, [])

  // Save and apply font size
  const setFontSize = (size: number) => {
    setFontSizeState(size)
    localStorage.setItem(STORAGE_KEYS.fontSize, size.toString())
  }

  // Save content width
  const setContentWidth = (width: ContentWidth) => {
    setContentWidthState(width)
    localStorage.setItem(STORAGE_KEYS.contentWidth, width)
  }

  // Save and apply primary color
  const setPrimaryColor = (color: PrimaryColor) => {
    setPrimaryColorState(color)
    localStorage.setItem(STORAGE_KEYS.primaryColor, color)
    applyPrimaryColor(color)
  }

  // Apply primary color on initial load and when color changes
  useEffect(() => {
    applyPrimaryColor(primaryColor)
  }, [primaryColor])

  // Save sidebar collapsed state
  const setIsSidebarCollapsed = (collapsed: boolean) => {
    setIsSidebarCollapsedState(collapsed)
    localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, JSON.stringify(collapsed))
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Save sidebar width
  const setSidebarWidth = (width: number) => {
    setSidebarWidthState(width)
    localStorage.setItem(STORAGE_KEYS.sidebarWidth, width.toString())
  }

  // Save AI sidebar width
  const setAiSidebarWidth = (width: number) => {
    setAiSidebarWidthState(width)
    localStorage.setItem(STORAGE_KEYS.aiSidebarWidth, width.toString())
  }

  // Get max width class based on content width setting
  const getMaxWidthClass = (): string => {
    switch (contentWidth) {
      case 'narrow':
        return 'max-w-2xl'  // 672px
      case 'medium':
        return 'max-w-4xl'  // 896px
      case 'wide':
        return 'max-w-6xl'  // 1152px
      case 'full':
        return 'max-w-none' // No max width
      default:
        return 'max-w-4xl'
    }
  }

  return {
    fontSize,
    contentWidth,
    primaryColor,
    isSidebarCollapsed,
    sidebarWidth,
    aiSidebarWidth,
    setFontSize,
    setContentWidth,
    setPrimaryColor,
    setIsSidebarCollapsed,
    toggleSidebar,
    setSidebarWidth,
    setAiSidebarWidth,
    getMaxWidthClass
  }
}
