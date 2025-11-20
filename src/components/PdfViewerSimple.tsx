'use client'

import React, { useEffect, useState } from 'react'

interface PdfViewerSimpleProps {
  data: string  // PDF file path (in Electron)
  fileName: string
  filePath: string
  className?: string
}

export default function PdfViewerSimple({ data, fileName, filePath, className }: PdfViewerSimpleProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('')

  useEffect(() => {
    // 创建 file:// URL
    if (data.startsWith('/') || data.match(/^[A-Z]:\\/)) {
      const fileUrl = `file://${data.replace(/\\/g, '/')}`
      console.log('PDF file URL:', fileUrl)
      setPdfUrl(fileUrl)
    }
  }, [data])

  if (!pdfUrl) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center p-8">
          <div className="text-muted-foreground text-sm">加载 PDF...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full w-full ${className}`}>
      <iframe
        src={pdfUrl}
        className="w-full h-full border-0"
        title={fileName}
      />
    </div>
  )
}
