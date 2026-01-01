import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import type { FileInfo, DirectoryData } from '@/types/directory'
import type { FileData } from '@/types/file'

export type FileType = 'markdown' | 'pdf' | 'epub'

interface DraggedFile {
  file: File
  fullPath: string
  name: string
  fileType?: FileType
  systemPath?: string
}

interface UseDragDropOptions {
  onSingleFileDrop: (data: FileData) => void
  onDirectoryDrop: (
    directoryData: DirectoryData,
    fileContentCache: Record<string, string>,
    directoryEntries: FileSystemDirectoryEntry[],
    directoryNames: string[],
    allFiles: DraggedFile[],
    firstFileData: FileData | null,
    systemRootPath?: string | null
  ) => void
}

interface UseDragDropReturn {
  isDragOver: boolean
}

// Helper function to check if file is supported
function isSupportedFile(fileName: string): boolean {
  const lowerName = fileName.toLowerCase()
  return lowerName.endsWith('.md') ||
         lowerName.endsWith('.markdown') ||
         lowerName.endsWith('.pdf') ||
         lowerName.endsWith('.epub')
}

// Helper function to get file type
function getFileType(fileName: string): FileType {
  const lowerName = fileName.toLowerCase()
  if (lowerName.endsWith('.pdf')) return 'pdf'
  if (lowerName.endsWith('.epub')) return 'epub'
  // Default to markdown for supported text files
  return 'markdown'
}

// Helper function to read file content
function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// Helper function to process directory entries recursively
async function processDirectoryEntry(
  directoryEntry: FileSystemDirectoryEntry,
  depth = 0
): Promise<DraggedFile[]> {
  const indent = '  '.repeat(depth)
  console.log(`${indent}React: Processing directory "${directoryEntry.name}" at depth ${depth}`)

  const files: DraggedFile[] = []
  const reader = directoryEntry.createReader()

  return new Promise((resolve, reject) => {
    const allEntries: FileSystemEntry[] = []

    const readAllEntries = () => {
      reader.readEntries(async (entries: FileSystemEntry[]) => {
        if (entries.length === 0) {
          console.log(`${indent}React: Total entries found in "${directoryEntry.name}": ${allEntries.length}`)

          try {
            for (const entry of allEntries) {
              if (entry.isFile && isSupportedFile(entry.name)) {
                try {
                  const fileType = getFileType(entry.name)
                  console.log(`${indent}React: Reading ${fileType} file: ${entry.name}`)
                  const file = await new Promise<File>((res, rej) => {
                    (entry as FileSystemFileEntry).file((f: File) => {
                      console.log(`${indent}React: File object created for ${entry.name}`)
                      res(f)
                    }, rej)
                  })

                  files.push({
                    file: file,
                    fullPath: entry.fullPath,
                    name: entry.name,
                    fileType: fileType,
                    systemPath: 'path' in file ? (file as any).path : undefined
                  })
                } catch (error) {
                  console.warn(`${indent}React: Failed to read file:`, entry.name, error)
                }
              } else if (entry.isDirectory && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                try {
                  const subFiles = await processDirectoryEntry(entry as FileSystemDirectoryEntry, depth + 1)
                  files.push(...subFiles)
                  console.log(`${indent}React: Got ${subFiles.length} files from subdirectory "${entry.name}"`)
                } catch (error) {
                  console.warn(`${indent}React: Failed to read subdirectory:`, entry.name, error)
                }
              }
            }

            console.log(`${indent}React: Finished processing directory "${directoryEntry.name}", found ${files.length} files`)
            resolve(files)
          } catch (error) {
            reject(error)
          }
          return
        }

        allEntries.push(...entries)
        console.log(`${indent}React: Reading entries batch: ${entries.length}, total so far: ${allEntries.length}`)
        readAllEntries()
      }, (error: DOMException) => {
        console.error(`${indent}React: Error reading entries:`, error)
        reject(error)
      })
    }

    readAllEntries()
  })
}

export function useDragDrop({ onSingleFileDrop, onDirectoryDrop }: UseDragDropOptions): UseDragDropReturn {
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)

  const handleDrop = useCallback(async (e: DragEvent) => {
    console.log('React: drop event triggered - processing with webkitGetAsEntry')
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    dragCounter.current = 0

    try {
      const items = [...(e.dataTransfer?.items || [])]
      console.log(`React: Processing ${items.length} dropped items`)

      const allFiles: DraggedFile[] = []
      const directories: string[] = []
      const directoryEntries: FileSystemDirectoryEntry[] = []

      // Process each item using webkitGetAsEntry API
      for (const item of items) {
        if (item.kind === 'file') {
          const entry = (item as DataTransferItem & { webkitGetAsEntry(): FileSystemEntry | null }).webkitGetAsEntry()

          if (entry) {
            if (entry.isDirectory) {
              console.log('React: Processing directory:', entry.name)
              directories.push(entry.name)
              directoryEntries.push(entry as FileSystemDirectoryEntry)
              const dirFiles = await processDirectoryEntry(entry as FileSystemDirectoryEntry)
              allFiles.push(...dirFiles)
              console.log(`React: Found ${dirFiles.length} supported files in directory: ${entry.name}`)
            } else if (entry.isFile && isSupportedFile(entry.name)) {
              const file = await new Promise<File>((resolve, reject) => {
                (entry as FileSystemFileEntry).file(resolve, reject)
              })
              allFiles.push({
                file: file,
                fullPath: entry.fullPath,
                name: entry.name,
                fileType: getFileType(entry.name),
                systemPath: 'path' in file ? (file as any).path : undefined
              })
              console.log(`React: Added file: ${entry.name} (type: ${getFileType(entry.name)})`)
            }
          }
        }
      }

      console.log(`React: Found ${allFiles.length} supported files in ${directories.length} directories`)

      if (allFiles.length === 0) {
        toast.error('未找到支持的文件。请拖拽 Markdown (.md/.markdown)、PDF (.pdf) 或 EPUB (.epub) 文件，或包含这些文件的文件夹。')
        return
      }

      // Process the files based on whether it's a single file or directory
      if (allFiles.length === 1 && directories.length === 0) {
        // Single file
        const fileData = allFiles[0]
        const fileType = getFileType(fileData.name)

        let content: string
        if (fileType === 'pdf' || fileType === 'epub') {
          content = URL.createObjectURL(fileData.file)
          console.log(`React: Created object URL for ${fileType}:`, content)
        } else {
          content = await readFileContent(fileData.file)
        }

        onSingleFileDrop({
          content: content,
          fileName: fileData.name.replace(/\.(md|markdown|pdf|epub)$/i, ''),
          filePath: fileData.fullPath,
          fileType: fileType
        })
        console.log(`React: Loaded single ${fileType} file:`, fileData.name)
      } else {
        // Multiple files or directory mode
        console.log('React: Setting up directory mode with enhanced caching')

        // Create file infos
        const fileInfos: FileInfo[] = allFiles.map(fileData => {
          // relativePath is based on the virtual path structure for display/tree
          const relativePath = fileData.fullPath.replace(/^\//, '')
          const directory = relativePath.includes('/') ?
            relativePath.substring(0, relativePath.lastIndexOf('/')) : '.'

          // Use the system path if available (crucial for Electron to read the actual file)
          // Otherwise fall back to virtual path (which might fail in Electron fs.readFile)
          let actualPath = fileData.systemPath || fileData.fullPath
          
          // Normalize path separators to forward slashes for consistency
          if (actualPath) {
            actualPath = actualPath.replace(/\\/g, '/')
          }

          return {
            name: fileData.name.replace(/\.(md|markdown|pdf|epub)$/i, ''),
            fileName: fileData.name,
            fullPath: actualPath,
            relativePath: relativePath,
            directory: directory,
            fileType: getFileType(fileData.name)
          }
        })

        // Cache all file contents using system path as key if available
        const fileContentsCache: Record<string, string> = {}
        for (const fileData of allFiles) {
          try {
            const fileType = getFileType(fileData.name)
            let content: string

            if (fileType === 'pdf' || fileType === 'epub') {
              content = URL.createObjectURL(fileData.file)
              console.log(`React: Created object URL for ${fileType}: ${fileData.name}`)
            } else {
              content = await readFileContent(fileData.file)
              console.log(`React: Cached content for file: ${fileData.name}`)
            }
            
            // Use system path for cache key to match fileInfos
            let cacheKey = fileData.systemPath || fileData.fullPath
            if (cacheKey) cacheKey = cacheKey.replace(/\\/g, '/')
            
            fileContentsCache[cacheKey] = content
          } catch (error) {
            console.error(`React: Failed to read content for ${fileData.name}:`, error)
          }
        }

        // Calculate system root path if possible
        let systemRootPath: string | null = null

        // Method 1: Check e.dataTransfer.files directly (works in Electron for dropped folders)
        if (directories.length === 1 && e.dataTransfer?.files?.length) {
          const droppedDirName = directories[0]
          console.log(`React: Checking e.dataTransfer.files for system path of "${droppedDirName}"`)
          
          for (let i = 0; i < e.dataTransfer.files.length; i++) {
            const file = e.dataTransfer.files[i]
            // In Electron, File objects have a 'path' property
            const filePath = (file as any).path
            // Case insensitive name check
            if (filePath && file.name.toLowerCase() === droppedDirName.toLowerCase()) {
              systemRootPath = filePath
              // Normalize path separators
              systemRootPath = systemRootPath!.replace(/\\/g, '/')
              console.log(`React: Found system root path in dataTransfer: ${systemRootPath}`)
              break
            }
          }
        }

        // Method 2: Deduce from child files (Fallback)
        if (!systemRootPath && directories.length === 1 && allFiles.length > 0) {
          const droppedDirName = directories[0]
          console.log(`React: Attempting to deduce system root path for dropped folder: "${droppedDirName}"`)

          // Simple path helpers for browser environment
          const getDirname = (p: string) => {
            const separator = p.includes('\\') ? '\\' : '/'
            return p.substring(0, p.lastIndexOf(separator))
          }
          const getBasename = (p: string) => {
            const separator = p.includes('\\') ? '\\' : '/'
            return p.substring(p.lastIndexOf(separator) + 1)
          }

          // Try to deduce root path from any file that has a system path
          for (const file of allFiles) {
            if (file.systemPath) {
              let currentPath = file.systemPath
              // Normalize before processing
              currentPath = currentPath.replace(/\\/g, '/')
              let found = false
              
              // Walk up at most 10 levels to prevent infinite loops
              for (let i = 0; i < 10; i++) {
                currentPath = getDirname(currentPath)
                if (!currentPath || currentPath === file.systemPath) break // Reached root or no change
                
                const base = getBasename(currentPath)
                if (base.toLowerCase() === droppedDirName.toLowerCase()) {
                  systemRootPath = currentPath
                  found = true
                  console.log(`React: Found matching system path for "${droppedDirName}": ${systemRootPath}`)
                  break
                }
              }
              
              if (found) break
            }
          }
          
          if (!systemRootPath) {
            console.warn('React: Failed to deduce system root path. Refresh functionality may be limited.')
          }
        }

        // Set states
        const rootPath = directories.length > 0 ?
          `Dropped ${directories.length} folder(s)` :
          'Dropped files'

        // Load first file content
        let firstFileData: FileData | null = null
        if (allFiles.length > 0) {
          const firstFile = allFiles[0]
          // Construct the key used for cache
          let cacheKey = firstFile.systemPath || firstFile.fullPath
          if (cacheKey) cacheKey = cacheKey.replace(/\\/g, '/')
            
          const content = fileContentsCache[cacheKey]
          if (content) {
            const fileType = getFileType(firstFile.name)
            firstFileData = {
              content: content,
              fileName: firstFile.name.replace(/\.(md|markdown|pdf|epub)$/i, ''),
              filePath: cacheKey, // Use the system path (or virtual if system missing)
              fileType: fileType
            }
          }
        }

        onDirectoryDrop(
          { files: fileInfos, rootPath },
          fileContentsCache,
          directoryEntries,
          directories,
          allFiles,
          firstFileData,
          systemRootPath
        )

        console.log('React: Directory mode setup complete')
      }

    } catch (error) {
      console.error('React: Error processing dropped files:', error)
      toast.error('处理拖拽文件时出错: ' + (error as Error).message)
    }
  }, [onSingleFileDrop, onDirectoryDrop])

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      // Check if the drag event contains files
      if (e.dataTransfer?.types.includes('Files')) {
        dragCounter.current += 1
        console.log('React: dragenter, counter:', dragCounter.current)
        
        if (dragCounter.current === 1) {
          console.log('React: Files detected, setting isDragOver to true')
          setIsDragOver(true)
        }
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      dragCounter.current -= 1
      console.log('React: dragleave, counter:', dragCounter.current)
      
      // Safety check to prevent negative counter
      if (dragCounter.current < 0) {
        dragCounter.current = 0
      }

      if (dragCounter.current === 0) {
        setIsDragOver(false)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy'
      }
    }

    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [handleDrop])

  return { isDragOver }
}