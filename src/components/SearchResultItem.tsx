'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { SearchMatch } from '@/lib/search/search-engine'

interface SearchResultItemProps {
  match: SearchMatch
  isActive: boolean
  onClick: () => void
}

export default memo(function SearchResultItem({ match, isActive, onClick }: SearchResultItemProps) {
  const { lineNumber, lineContent, matchStart, matchEnd, beforeContext, afterContext } = match

  // Split the line content into before, match, and after for highlighting
  const beforeMatch = lineContent.substring(0, matchStart)
  const matchedText = lineContent.substring(matchStart, matchEnd)
  const afterMatch = lineContent.substring(matchEnd)

  return (
    <div
      className={`px-3 py-2 rounded-md cursor-pointer transition-colors duration-150 ${
        isActive
          ? 'bg-primary/10 hover:bg-primary/15'
          : 'hover:bg-muted/50'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Search result at line ${lineNumber}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Line number badge */}
      <div className="flex items-start gap-2.5">
        <div
          className={`flex-shrink-0 flex items-center justify-center text-xs font-mono min-w-[2.5rem] px-2 py-0.5 rounded ${
            isActive
              ? 'bg-primary/20 text-primary font-medium'
              : 'bg-muted/60 text-muted-foreground'
          }`}
          aria-label={`Line ${lineNumber}`}
        >
          {lineNumber}
        </div>

        {/* Content with highlighted match */}
        <div className="flex-1 min-w-0 text-sm leading-relaxed">
          <div className="font-mono break-all">
            {beforeMatch && (
              <span className="text-muted-foreground">{beforeMatch}</span>
            )}
            <span className="bg-yellow-200/80 dark:bg-yellow-500/20 text-foreground font-medium px-0.5 rounded">
              {matchedText}
            </span>
            {afterMatch && (
              <span className="text-muted-foreground">{afterMatch}</span>
            )}
          </div>

          {/* Context preview if line is too long */}
          {lineContent.length > 100 && (
            <div className="text-xs text-muted-foreground mt-1 truncate opacity-70">
              {beforeContext}
              <span className="text-foreground font-medium">{matchedText}</span>
              {afterContext}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})