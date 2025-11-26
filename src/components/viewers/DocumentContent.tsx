'use client'

import PdfViewerSimple from '@/components/PdfViewerSimple'
import EpubViewer from '@/components/EpubViewer'
import MarkdownContentWrapper from '@/components/MarkdownContentWrapper'
import SearchPanel from '@/components/SearchPanel'
import type { FileData } from '@/types/file'
import type { ContentWidth } from '@/hooks/use-settings'

export interface SearchOptions {
  caseSensitive: boolean
  useRegex: boolean
  wholeWord: boolean
}

interface DocumentContentProps {
  fileData: FileData
  fontSize: number
  contentWidth: ContentWidth
  maxWidthClass: string
  showSearch: boolean
  searchQuery: string
  searchOptions: SearchOptions
  onCloseSearch: () => void
  onSearchChange: (query: string, options: SearchOptions) => void
  onFileNavigation: (targetPath: string, currentPath?: string) => void
  onNavigateToLine: (lineNumber: number) => void
  className?: string
}

export default function DocumentContent({
  fileData,
  fontSize,
  contentWidth,
  maxWidthClass,
  showSearch,
  searchQuery,
  searchOptions,
  onCloseSearch,
  onSearchChange,
  onFileNavigation,
  onNavigateToLine,
  className = ''
}: DocumentContentProps) {
  // PDF Viewer
  if (fileData.fileType === 'pdf') {
    return (
      <PdfViewerSimple
        data={fileData.content}
        fileName={fileData.fileName}
        filePath={fileData.filePath}
        className={`h-full ${className}`}
      />
    )
  }

  // EPUB Viewer
  if (fileData.fileType === 'epub') {
    return (
      <EpubViewer
        data={fileData.content}
        fileName={fileData.fileName}
        filePath={fileData.filePath}
        className={`h-full ${className}`}
        fontSize={fontSize}
        contentWidth={contentWidth}
      />
    )
  }

  // Markdown Viewer (default)
  return (
    <div className={`h-full ${className}`}>
      {/* Search Panel - positioned above content */}
      {showSearch && (
        <div className="absolute top-0 left-0 right-0 z-50 p-4">
          <div className={`${maxWidthClass} mx-auto`}>
            <SearchPanel
              isOpen={showSearch}
              onClose={onCloseSearch}
              content={fileData.content}
              onNavigateToLine={onNavigateToLine}
              onSearchQueryChange={onSearchChange}
            />
          </div>
        </div>
      )}
      <MarkdownContentWrapper
        content={fileData.content}
        filePath={fileData.filePath}
        fontSize={fontSize}
        onFileNavigation={onFileNavigation}
        searchQuery={showSearch ? searchQuery : undefined}
        searchOptions={showSearch ? searchOptions : undefined}
        className={`${maxWidthClass} mx-auto px-4 py-6`}
      />
    </div>
  )
}
