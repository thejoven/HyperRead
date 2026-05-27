'use client'

import { memo, useMemo, useRef } from 'react'
import DocumentViewer from './DocumentViewer'
import TocMinimap from './TocMinimap'
import { extractHeadings } from '@/lib/toc-utils'

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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const headings = useMemo(() => extractHeadings(content), [content])

  return (
    <div className="h-full relative flex min-w-0">
      <div ref={scrollContainerRef} className="flex-1 min-w-0 overflow-y-auto content-scroll">
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
      <TocMinimap headings={headings} scrollContainerRef={scrollContainerRef} />
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
