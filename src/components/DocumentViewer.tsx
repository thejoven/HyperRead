'use client'

import { memo } from 'react'
import MarkdownContent from './MarkdownContent'

interface DocumentViewerProps {
  content: string
  className?: string
  fontSize?: number
  filePath?: string
  onFileNavigation?: (targetPath: string, currentPath?: string) => void
  searchQuery?: string
  searchOptions?: { caseSensitive: boolean; useRegex: boolean; wholeWord: boolean }
}

export default memo(function DocumentViewer({ content, className = '', fontSize = 16, filePath, onFileNavigation, searchQuery, searchOptions }: DocumentViewerProps) {
  return (
    <div className={className}>
      {/* Document Content */}
      <MarkdownContent
        content={content}
        fontSize={fontSize}
        filePath={filePath}
        onFileNavigation={onFileNavigation}
        searchQuery={searchQuery}
        searchOptions={searchOptions}
      />
    </div>
  )
})