import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { FileData } from '@/types/file'

export interface TabInfo {
  filePath: string
  fileName: string
  fileType?: 'markdown' | 'pdf' | 'epub' | 'text'
}

export function useTabs() {
  const [openTabs, setOpenTabs] = useState<TabInfo[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [cache, setCache] = useState<Map<string, string>>(new Map())

  const openTabWithData = useCallback((data: FileData) => {
    setActiveTab(data.filePath)
    setOpenTabs((prev) => (prev.some((t) => t.filePath === data.filePath)
      ? prev
      : [...prev, { filePath: data.filePath, fileName: data.fileName, fileType: data.fileType }]))
    setCache((prev) => {
      const next = new Map(prev)
      next.set(data.filePath, data.content)
      return next
    })
  }, [])

  const replaceTabWithData = useCallback((data: FileData) => {
    setActiveTab(data.filePath)
    setOpenTabs([{ filePath: data.filePath, fileName: data.fileName, fileType: data.fileType }])
    setCache(new Map([[data.filePath, data.content]]))
  }, [])

  const resetTabsWithCache = useCallback((data: FileData | null, cacheEntries: Record<string, string>) => {
    if (data) {
      setActiveTab(data.filePath)
      setOpenTabs([{ filePath: data.filePath, fileName: data.fileName, fileType: data.fileType }])
    } else {
      setActiveTab(null)
      setOpenTabs([])
    }
    setCache(new Map(Object.entries(cacheEntries)))
  }, [])

  const activateTab = useCallback(async (filePath: string) => {
    try {
      setActiveTab(filePath)
      const tab = openTabs.find((t) => t.filePath === filePath)
      if (!tab) return
      const cached = cache.get(filePath)
      if (cached) return
      if (window.electronAPI?.readFile) {
        const data = await window.electronAPI.readFile(filePath)
        openTabWithData(data)
      }
    } catch (e) {
      console.error('Failed to activate tab:', e)
      toast.error('切换标签失败')
    }
  }, [openTabs, cache, openTabWithData])

  const closeTab = useCallback((filePath: string, onActivateData?: (path: string) => void) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t.filePath !== filePath)
      if (activeTab === filePath) {
        const last = next[next.length - 1]
        if (last) {
          setActiveTab(last.filePath)
          onActivateData?.(last.filePath)
        } else {
          setActiveTab(null)
        }
      }
      return next
    })
    setCache((prev) => {
      const next = new Map(prev)
      next.delete(filePath)
      return next
    })
  }, [activeTab])

  const setCacheEntry = useCallback((filePath: string, content: string) => {
    setCache((prev) => {
      const next = new Map(prev)
      next.set(filePath, content)
      return next
    })
  }, [])

  const setCacheBulk = useCallback((entries: Record<string, string>) => {
    setCache(new Map(Object.entries(entries)))
  }, [])

  const clearTabs = useCallback(() => {
    setOpenTabs([])
    setActiveTab(null)
    setCache(new Map())
  }, [])

  return {
    openTabs,
    activeTab,
    cache,
    openTabWithData,
    replaceTabWithData,
    resetTabsWithCache,
    activateTab,
    closeTab,
    clearTabs,
    setCacheEntry,
    setCacheBulk,
    setActiveTab,
  }
}

