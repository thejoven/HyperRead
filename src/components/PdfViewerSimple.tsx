'use client'

import React, { useEffect, useState } from 'react'

interface PdfViewerSimpleProps {
  data: string  // PDF file path (in Electron)
  fileName: string
  filePath: string
  className?: string
}

function encodeFilePath(filePath: string) {
  return filePath
    .replace(/\\/g, '/')
    .split('/')
    .map((segment, index) => {
      if (index === 0 && segment === '') return ''
      if (index === 0 && /^[A-Za-z]:$/.test(segment)) return segment
      return encodeURIComponent(segment)
    })
    .join('/')
}

function createPdfUrl(data: string) {
  if (data.startsWith('blob:') || data.startsWith('file:')) {
    return data
  }

  if (data.startsWith('/') || data.match(/^[A-Z]:\\/i)) {
    const encodedPath = encodeFilePath(data)
    return encodedPath.match(/^[A-Z]:\//i)
      ? `file:///${encodedPath}`
      : `file://${encodedPath}`
  }

  return ''
}

export default function PdfViewerSimple({ data, fileName, filePath: _filePath, className }: PdfViewerSimpleProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('')

  useEffect(() => {
    setPdfUrl(createPdfUrl(data))
  }, [data])

  if (!pdfUrl) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center p-8">
          <div className="text-muted-foreground text-sm">加载 PDF…</div>
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
