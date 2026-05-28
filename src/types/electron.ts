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

export interface PluginInstallResult {
  success: boolean
  manifest: any
}

export interface DefaultDocumentAppAssociation {
  extension: string
  label: string
  uti?: string
  currentHandler?: string
  status?: number
  isDefault: boolean
  error?: string
}

export interface DefaultDocumentAppStatus {
  supported: boolean
  isPackaged: boolean
  bundleId: string
  appBundlePath?: string | null
  associations: DefaultDocumentAppAssociation[]
  isDefault: boolean
  success: boolean
  error?: string
}

export interface PluginElectronAPI {
  listInstalled: () => Promise<any[]>
  readFile: (pluginId: string, fileName: string) => Promise<{ content: string; fileName: string; filePath: string; fileType: string }>
  loadData: (pluginId: string) => Promise<Record<string, unknown>>
  saveData: (pluginId: string, data: Record<string, unknown>) => Promise<void>
  getSettings: (pluginId: string) => Promise<Record<string, unknown>>
  saveSettings: (pluginId: string, settings: Record<string, unknown>) => Promise<void>
  openZipDialog: () => Promise<string | null>
  installZip: (zipPath: string) => Promise<PluginInstallResult>
  uninstall: (pluginId: string) => Promise<void>
}

export interface ElectronAPI {
  readFile: (filePath: string) => Promise<FileData>
  openFileDialog: () => Promise<FileData | null>
  openDirectoryDialog: () => Promise<DirectoryData | null>
  scanDirectory: (dirPath: string) => Promise<DirectoryData>
  openExternal: (url: string) => Promise<void>
  openMarkdownEditor: (filePath: string) => Promise<void>
  readImage: (imagePath: string, markdownFilePath?: string) => Promise<ReadImageResult>
  getDefaultDocumentAppStatus: () => Promise<DefaultDocumentAppStatus>
  setDefaultDocumentApp: () => Promise<DefaultDocumentAppStatus>
  isElectron: boolean
  platform: string
  // Enhanced drag-drop functions
  handleFileContent: (data: {
    content: string
    fileName: string
    originalName: string
    filePath?: string
    fileType?: string
    isDirectory: boolean
  }) => void
  handleDirectoryContent: (data: { files: FileInfo[]; rootPath: string }) => void
  handleDirectoryDrop: (directoryName: string) => void
  handleMultipleFileContents: (data: { fileContents: Record<string, string>; totalFiles: number }) => void
  classifyFiles: (fileData: any[]) => Promise<{ directories: any[]; markdownFiles: any[] }>
  getFullScreen?: () => Promise<boolean>
  pluginAPI?: PluginElectronAPI
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
