import { useCallback } from 'react'
import { toast } from 'sonner'
import { resolvePath } from '@/utils/path'
import type { FileData } from '@/types/file'

interface UseFileNavigationOptions {
  setLoading: (loading: boolean) => void
  setFileData: (data: FileData) => void
  openTabWithData: (data: FileData) => void
}

interface UseFileNavigationReturn {
  handleFileNavigation: (targetPath: string, currentPath?: string) => Promise<void>
}

export function useFileNavigation({
  setLoading,
  setFileData,
  openTabWithData
}: UseFileNavigationOptions): UseFileNavigationReturn {

  const handleFileNavigation = useCallback(async (targetPath: string, currentPath?: string) => {
    try {
      setLoading(true)

      // Resolve the target file path
      const resolvedPath = resolvePath(targetPath, currentPath)

      console.log('File navigation details:', {
        targetPath,
        currentPath,
        resolvedPath,
        currentDir: currentPath ? currentPath.substring(0, currentPath.lastIndexOf('/')) : 'undefined'
      })

      // Read the target file
      if (window.electronAPI?.readFile) {
        const newFileData = await window.electronAPI.readFile(resolvedPath)

        if (newFileData) {
          openTabWithData(newFileData)
          setFileData(newFileData)
          console.log('Successfully navigated to:', resolvedPath)
        } else {
          console.error('Failed to read file:', resolvedPath)

          // Check if it's a path resolution issue
          const isCurrentPathAbsolute = currentPath && (currentPath.startsWith('/') || currentPath.includes(':\\'))
          if (!isCurrentPathAbsolute) {
            toast.error(`无法跳转到文件: ${targetPath}\n\n原因: 当前文件路径不是绝对路径，无法进行相对路径解析。\n\n请通过文件对话框重新打开此文件以启用内部链接功能。`)
          } else {
            toast.error(`无法打开文件: ${resolvedPath}`)
          }
        }
      } else {
        console.error('electronAPI.readFile not available')
        toast.error('文件读取功能不可用')
      }
    } catch (error) {
      console.error('File navigation error:', error)
      toast.error(`文件跳转失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }, [setLoading, setFileData, openTabWithData])

  return { handleFileNavigation }
}
