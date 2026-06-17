export interface FileData {
  content: string
  fileName: string
  filePath: string
  fileType?: 'markdown' | 'pdf' | 'epub' | 'html' | 'text'
  /** 拖拽进来的文件标记为 true，隐藏编辑按钮 */
  isDragged?: boolean
}

export interface PdfData {
  data: string  // base64 encoded PDF data
  fileName: string
  filePath: string
  fileType: 'pdf'
}
