import { useState, useEffect } from 'react'
import { applyPrimaryColor, type PrimaryColor } from '@/utils/theme'

export type ContentWidth = 'narrow' | 'medium' | 'wide' | 'full'

interface Settings {
  fontSize: number
  contentWidth: ContentWidth
  primaryColor: PrimaryColor
  isSidebarCollapsed: boolean
  sidebarWidth: number
  rightSidebarWidth: number
}

interface UseSettingsReturn extends Settings {
  setFontSize: (size: number) => void
  setContentWidth: (width: ContentWidth) => void
  setPrimaryColor: (color: PrimaryColor) => void
  setIsSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  setRightSidebarWidth: (width: number) => void
  getMaxWidthClass: () => string
}

const STORAGE_KEYS = {
  fontSize: 'docs-font-size',
  contentWidth: 'docs-content-width',
  primaryColor: 'docs-primary-color',
  sidebarCollapsed: 'docs-sidebar-collapsed',
  sidebarWidth: 'docs-sidebar-width',
  rightSidebarWidth: 'docs-right-sidebar-width',
} as const

const DEFAULTS = {
  fontSize: 16,
  contentWidth: 'medium' as ContentWidth,
  primaryColor: 'cyan' as PrimaryColor,
  sidebarCollapsed: false,
  sidebarWidth: 288,
  rightSidebarWidth: 320,
} as const

export function useSettings(): UseSettingsReturn {
  const [fontSize, setFontSizeState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.fontSize)
    return saved ? parseInt(saved, 10) : DEFAULTS.fontSize
  })

  const [contentWidth, setContentWidthState] = useState<ContentWidth>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.contentWidth)
    return saved ? (saved as ContentWidth) : DEFAULTS.contentWidth
  })

  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.primaryColor)
    return saved ? (saved as PrimaryColor) : DEFAULTS.primaryColor
  })

  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.sidebarCollapsed)
    return saved ? JSON.parse(saved) : DEFAULTS.sidebarCollapsed
  })

  const [sidebarWidth, setSidebarWidthState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.sidebarWidth)
    if (saved) {
      const width = parseInt(saved, 10)
      if (width >= 200 && width <= 600) return width
    }
    return DEFAULTS.sidebarWidth
  })

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

  const [rightSidebarWidth, setRightSidebarWidthState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.rightSidebarWidth)
    if (saved) {
      const width = parseInt(saved, 10)
      if (width >= 240 && width <= 800) return width
    }
    return DEFAULTS.rightSidebarWidth
  })

  const setRightSidebarWidth = (width: number) => {
    setRightSidebarWidthState(width)
    localStorage.setItem(STORAGE_KEYS.rightSidebarWidth, width.toString())
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
    rightSidebarWidth,
    setFontSize,
    setContentWidth,
    setPrimaryColor,
    setIsSidebarCollapsed,
    toggleSidebar,
    setSidebarWidth,
    setRightSidebarWidth,
    getMaxWidthClass
  }
}
