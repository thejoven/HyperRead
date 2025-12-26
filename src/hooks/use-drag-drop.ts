import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { FileInfo, DirectoryData } from '@/types/directory'
import type { FileData } from '@/types/file'

export type FileType = 'markdown' | 'pdf' | 'epub'

interface DraggedFile {
  file: File
  fullPath: string
  name: string
  fileType?: FileType
}

interface UseDragDropOptions {
  onSingleFileDrop: (data: FileData) => void
  onDirectoryDrop: (
    directoryData: DirectoryData,
    fileContentCache: Record<string, string>,
    directoryEntries: FileSystemDirectoryEntry[],
    directoryNames: string[],
    allFiles: DraggedFile[],
    firstFileData: FileData | null
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
                    fileType: fileType
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
                fileType: getFileType(entry.name)
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
          const relativePath = fileData.fullPath.replace(/^\//, '')
          const directory = relativePath.includes('/') ?
            relativePath.substring(0, relativePath.lastIndexOf('/')) : '.'

          return {
            name: fileData.name.replace(/\.(md|markdown|pdf|epub)$/i, ''),
            fileName: fileData.name,
            fullPath: fileData.fullPath,
            relativePath: relativePath,
            directory: directory,
            fileType: getFileType(fileData.name)
          }
        })

        // Cache all file contents
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

            fileContentsCache[fileData.fullPath] = content
          } catch (error) {
            console.error(`React: Failed to read content for ${fileData.name}:`, error)
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
          const content = fileContentsCache[firstFile.fullPath]
          if (content) {
            const fileType = getFileType(firstFile.name)
            firstFileData = {
              content: content,
              fileName: firstFile.name.replace(/\.(md|markdown|pdf|epub)$/i, ''),
              filePath: firstFile.fullPath,
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
          firstFileData
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
