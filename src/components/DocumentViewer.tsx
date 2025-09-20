'use client'

import { memo } from 'react'
import MarkdownContent from './MarkdownContent'

interface DocumentViewerProps {
  content: string
  className?: string
  fontSize?: number
  filePath?: string
  onFileNavigation?: (targetPath: string, currentPath?: string) => void
}

export default memo(function DocumentViewer({ content, className = '', fontSize = 16, filePath, onFileNavigation }: DocumentViewerProps) {
  return (
    <div className={className}>
      {/* Document Content */}
      <MarkdownContent content={content} fontSize={fontSize} filePath={filePath} onFileNavigation={onFileNavigation} />
    </div>
  )
})