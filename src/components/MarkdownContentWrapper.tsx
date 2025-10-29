'use client'

import { memo } from 'react'
import DocumentViewer from './DocumentViewer'

interface MarkdownContentWrapperProps {
  content: string
  filePath?: string
  fontSize: number
  onFileNavigation: (targetPath: string, currentPath?: string) => void
  searchQuery?: string
  searchOptions?: { caseSensitive: boolean; useRegex: boolean; wholeWord: boolean }
  className?: string
}

function MarkdownContentWrapper({
  content,
  filePath,
  fontSize,
  onFileNavigation,
  searchQuery,
  searchOptions,
  className = ''
}: MarkdownContentWrapperProps) {
  return (
    <div className="h-full overflow-y-auto content-scroll">
      <div className={className}>
        <DocumentViewer
          content={content}
          fontSize={fontSize}
          filePath={filePath}
          onFileNavigation={onFileNavigation}
          searchQuery={searchQuery}
          searchOptions={searchOptions}
        />
      </div>
    </div>
  )
}

// 使用严格比较函数，只在必要属性变化时重新渲染
export default memo(MarkdownContentWrapper, (prevProps, nextProps) => {
  return (
    prevProps.content === nextProps.content &&
    prevProps.filePath === nextProps.filePath &&
    prevProps.fontSize === nextProps.fontSize &&
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.searchOptions?.caseSensitive === nextProps.searchOptions?.caseSensitive &&
    prevProps.searchOptions?.useRegex === nextProps.searchOptions?.useRegex &&
    prevProps.searchOptions?.wholeWord === nextProps.searchOptions?.wholeWord
  )
})