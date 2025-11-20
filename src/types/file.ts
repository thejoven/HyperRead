export interface FileData {
  content: string
  fileName: string
  filePath: string
  fileType?: 'markdown' | 'pdf' | 'text'
}

export interface PdfData {
  data: string  // base64 encoded PDF data
  fileName: string
  filePath: string
  fileType: 'pdf'
}

