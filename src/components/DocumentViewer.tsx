'use client'

import { memo } from 'react'
import MarkdownContent from './MarkdownContent'

interface DocumentViewerProps {
  content: string
  className?: string
  fontSize?: number
}

export default memo(function DocumentViewer({ content, className = '', fontSize = 16 }: DocumentViewerProps) {
  return (
    <div className={className}>
      {/* Document Content */}
      <MarkdownContent content={content} fontSize={fontSize} />
    </div>
  )
})