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

function DocumentViewer({ content, className = '', fontSize = 16, filePath, onFileNavigation, searchQuery, searchOptions }: DocumentViewerProps) {
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
}

// 使用自定义比较函数优化 memoization
export default memo(DocumentViewer, (prevProps, nextProps) => {
  // 只有当内容、搜索查询或文件路径实际变化时才重新渲染
  return (
    prevProps.content === nextProps.content &&
    prevProps.fontSize === nextProps.fontSize &&
    prevProps.filePath === nextProps.filePath &&
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.searchOptions?.caseSensitive === nextProps.searchOptions?.caseSensitive &&
    prevProps.searchOptions?.useRegex === nextProps.searchOptions?.useRegex &&
    prevProps.searchOptions?.wholeWord === nextProps.searchOptions?.wholeWord
  )
})