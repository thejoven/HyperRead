export interface FileInfo {
  name: string
  fileName: string
  fullPath: string
  relativePath: string
  directory: string
  fileType?: 'markdown' | 'pdf' | 'epub'
}

export interface DirectoryData {
  files: FileInfo[]
  rootPath: string
}
