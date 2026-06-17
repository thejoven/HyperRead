'use client'

import { memo, useMemo, useRef } from 'react'
import { PencilLine } from 'lucide-react'
import DocumentViewer from './DocumentViewer'
import TocMinimap from './TocMinimap'
import { extractHeadings } from '@/lib/toc-utils'
import { usePlugins } from '@/contexts/PluginContext'
import type { FileData } from '@/types/file'

interface MarkdownContentWrapperProps {
  fileData: FileData
  content: string
  filePath?: string
  fontSize: number
  onFileNavigation: (targetPath: string, currentPath?: string) => void
  searchQuery?: string
  searchOptions?: { caseSensitive: boolean; useRegex: boolean; wholeWord: boolean }
  className?: string
}

function MarkdownContentWrapper({
  fileData,
  content,
  filePath,
  fontSize,
  onFileNavigation,
  searchQuery,
  searchOptions,
  className = ''
}: MarkdownContentWrapperProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { documentActions } = usePlugins()
  const headings = useMemo(() => extractHeadings(content), [content])
  const hasTocButton = headings.length > 0
  const visibleActions = useMemo(() => {
    // 拖拽进来的文档不显示编辑按钮
    if (fileData.isDragged) return []
    const fileType = fileData.fileType.toLowerCase()
    return documentActions.filter(action =>
      action.fileTypes.map(type => type.toLowerCase()).includes(fileType)
    )
  }, [documentActions, fileData.fileType, fileData.isDragged])

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
      {visibleActions.length > 0 && (
        <div className={`absolute bottom-4 z-40 flex flex-row-reverse gap-2 ${hasTocButton ? 'right-20' : 'right-4'}`}>
          {visibleActions.map(action => (
            <button
              key={`${action.pluginId}:${action.id}`}
              type="button"
              className="flex size-11 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-lg shadow-black/10 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:text-primary hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
              title={action.title}
              aria-label={action.title}
              onClick={() => {
                void Promise.resolve(action.onClick({ fileData })).catch(error => {
                  console.error(`[Plugin:${action.pluginId}] document action failed:`, error)
                })
              }}
            >
              {action.icon === 'edit' ? (
                <PencilLine className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <span className="text-lg leading-none" aria-hidden="true">{action.icon}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// 使用严格比较函数，只在必要属性变化时重新渲染
export default memo(MarkdownContentWrapper, (prevProps, nextProps) => {
  return (
    prevProps.fileData.fileType === nextProps.fileData.fileType &&
    prevProps.fileData.isDragged === nextProps.fileData.isDragged &&
    prevProps.content === nextProps.content &&
    prevProps.filePath === nextProps.filePath &&
    prevProps.fontSize === nextProps.fontSize &&
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.searchOptions?.caseSensitive === nextProps.searchOptions?.caseSensitive &&
    prevProps.searchOptions?.useRegex === nextProps.searchOptions?.useRegex &&
    prevProps.searchOptions?.wholeWord === nextProps.searchOptions?.wholeWord
  )
})
