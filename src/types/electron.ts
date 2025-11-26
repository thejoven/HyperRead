import type { FileData } from './file'
import type { FileInfo, DirectoryData } from './directory'

export interface ReadImageResult {
  success: boolean
  dataUrl?: string
  mimeType?: string
  size?: number
  path?: string
  error?: string
}

export interface ElectronAPI {
  readFile: (filePath: string) => Promise<FileData>
  openFileDialog: () => Promise<FileData | null>
  openDirectoryDialog: () => Promise<DirectoryData | null>
  scanDirectory: (dirPath: string) => Promise<DirectoryData>
  openExternal: (url: string) => Promise<void>
  readImage: (imagePath: string, markdownFilePath?: string) => Promise<ReadImageResult>
  isElectron: boolean
  platform: string
  // Enhanced drag-drop functions
  handleFileContent: (data: { content: string; fileName: string; originalName: string; isDirectory: boolean }) => void
  handleDirectoryContent: (data: { files: FileInfo[]; rootPath: string }) => void
  handleDirectoryDrop: (directoryName: string) => void
  handleMultipleFileContents: (data: { fileContents: Record<string, string>; totalFiles: number }) => void
  classifyFiles: (fileData: any[]) => Promise<{ directories: any[]; markdownFiles: any[] }>
  getFullScreen?: () => Promise<boolean>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
