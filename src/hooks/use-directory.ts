import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { FileInfo, DirectoryData } from '@/types/directory'
import type { FileData } from '@/types/file'
import { useT } from '@/lib/i18n'

interface DraggedFile {
  file: File
  fullPath: string
  name: string
}

interface UseDirectoryReturn {
  // State
  directoryData: DirectoryData | null
  actualRootPath: string | null
  isDirectoryMode: boolean
  isEnhancedDragMode: boolean
  draggedDirectoryEntries: FileSystemDirectoryEntry[]
  draggedDirectoryNames: string[]
  lastDraggedFiles: DraggedFile[]
  showRefreshHint: boolean
  isRefreshing: boolean

  // Setters
  setDirectoryData: (data: DirectoryData | null) => void
  setActualRootPath: (path: string | null) => void
  setIsDirectoryMode: (mode: boolean) => void
  setIsEnhancedDragMode: (mode: boolean) => void
  setDraggedDirectoryEntries: (entries: FileSystemDirectoryEntry[]) => void
  setDraggedDirectoryNames: (names: string[]) => void
  setLastDraggedFiles: (files: DraggedFile[]) => void
  setShowRefreshHint: (show: boolean) => void

  // Actions
  handleRefresh: (fileContentCache: Map<string, string>, setCacheBulk: (entries: Record<string, string>) => void) => Promise<void>
  loadFileFromDirectory: (
    fileInfo: FileInfo,
    fileContentCache: Map<string, string>,
    setFileData: (data: FileData) => void,
    openTabWithData: (data: FileData) => void,
    setLoading: (loading: boolean) => void
  ) => Promise<void>
  clearDirectoryState: () => void
}

export function useDirectory(): UseDirectoryReturn {
  const t = useT()

  const [directoryData, setDirectoryData] = useState<DirectoryData | null>(null)
  const [actualRootPath, setActualRootPath] = useState<string | null>(null)
  const [isDirectoryMode, setIsDirectoryMode] = useState(false)
  const [isEnhancedDragMode, setIsEnhancedDragMode] = useState(false)
  const [draggedDirectoryEntries, setDraggedDirectoryEntries] = useState<FileSystemDirectoryEntry[]>([])
  const [draggedDirectoryNames, setDraggedDirectoryNames] = useState<string[]>([])
  const [lastDraggedFiles, setLastDraggedFiles] = useState<DraggedFile[]>([])
  const [showRefreshHint, setShowRefreshHint] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const clearDirectoryState = useCallback(() => {
    setDirectoryData(null)
    setActualRootPath(null)
    setIsDirectoryMode(false)
    setIsEnhancedDragMode(false)
    setDraggedDirectoryEntries([])
    setDraggedDirectoryNames([])
    setLastDraggedFiles([])
    setShowRefreshHint(false)
  }, [])

  const loadFileFromDirectory = useCallback(async (
    fileInfo: FileInfo,
    fileContentCache: Map<string, string>,
    setFileData: (data: FileData) => void,
    openTabWithData: (data: FileData) => void,
    setLoading: (loading: boolean) => void
  ) => {
    if (!window.electronAPI) return

    setLoading(true)
    try {
      console.log('React: loading file from directory:', fileInfo.fullPath)

      // Check if we're in enhanced drag mode and have cached content
      if (isEnhancedDragMode && fileContentCache.has(fileInfo.fullPath)) {
        console.log('React: using cached content for enhanced drag mode:', fileInfo.fullPath)
        const cachedContent = fileContentCache.get(fileInfo.fullPath)!
        const opened = {
          content: cachedContent,
          fileName: fileInfo.name,
          filePath: fileInfo.fullPath,
          fileType: fileInfo.fileType
        }
        openTabWithData(opened)
        setFileData(opened)
      } else {
        // Fallback to IPC file reading
        console.log('React: reading file via IPC:', fileInfo.fullPath)
        const data = await window.electronAPI.readFile(fileInfo.fullPath)
        const opened = {
          ...data,
          filePath: fileInfo.fullPath
        }
        openTabWithData(opened)
        setFileData(opened)
      }
    } catch (error) {
      console.error('React: Failed to load file from directory:', error)
      toast.error(t('ui.messages.fileLoadFailed') + ': ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [isEnhancedDragMode, t])

  const handleRefresh = useCallback(async (
    fileContentCache: Map<string, string>,
    setCacheBulk: (entries: Record<string, string>) => void
  ) => {
    if (!window.electronAPI || isRefreshing) return

    // Check if we have an actual path to refresh
    let pathToRefresh = actualRootPath
    if (!pathToRefresh && directoryData?.rootPath) {
      if (!directoryData.rootPath.startsWith('Dropped ')) {
        pathToRefresh = directoryData.rootPath
      }
    }

    // In enhanced drag mode or if we don't have a valid path, show hint
    if (!pathToRefresh) {
      if (isEnhancedDragMode || (directoryData?.rootPath && directoryData.rootPath.startsWith('Dropped '))) {
        setIsRefreshing(true)
        try {
          // For enhanced drag mode without a system path, we can't refresh without re-dragging
          // Show the refresh hint modal
          console.log('React: Enhanced drag mode refresh - showing hint')
          setShowRefreshHint(true)
        } finally {
          setIsRefreshing(false)
        }
        return
      }
      
      console.log('React: No path available for refresh')
      return
    }

    setIsRefreshing(true)
    try {
      console.log('React: refreshing directory:', pathToRefresh)
      const data = await window.electronAPI.scanDirectory(pathToRefresh)
      if (data && data.files.length > 0) {
        setDirectoryData(data)
        setActualRootPath(data.rootPath)
        // Clear enhanced drag mode cache as directory has been rescanned
        if (isEnhancedDragMode) {
          setCacheBulk({})
          setIsEnhancedDragMode(false)
          console.log('React: cleared enhanced drag mode cache after refresh')
        }
        console.log('React: directory refreshed successfully with', data.files.length, 'files')
      } else {
        console.log('React: no files found after refresh')
      }
    } catch (error) {
      console.error('React: Failed to refresh directory:', error)
      toast.error(t('ui.messages.directoryLoadFailed') + ': ' + (error as Error).message)
    } finally {
      setIsRefreshing(false)
    }
  }, [actualRootPath, directoryData?.rootPath, isEnhancedDragMode, isRefreshing, t])

  return {
    // State
    directoryData,
    actualRootPath,
    isDirectoryMode,
    isEnhancedDragMode,
    draggedDirectoryEntries,
    draggedDirectoryNames,
    lastDraggedFiles,
    showRefreshHint,
    isRefreshing,

    // Setters
    setDirectoryData,
    setActualRootPath,
    setIsDirectoryMode,
    setIsEnhancedDragMode,
    setDraggedDirectoryEntries,
    setDraggedDirectoryNames,
    setLastDraggedFiles,
    setShowRefreshHint,

    // Actions
    handleRefresh,
    loadFileFromDirectory,
    clearDirectoryState
  }
}
