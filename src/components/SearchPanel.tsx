'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Search, ChevronDown, ChevronUp, Type, Regex, FileSearch } from 'lucide-react'
import { searchInContent, formatResultCount, debounce, SearchOptions, SearchMatch } from '@/lib/search/search-engine'
import SearchResultItem from './SearchResultItem'

interface SearchPanelProps {
  isOpen: boolean
  onClose: () => void
  content: string
  onNavigateToLine?: (lineNumber: number) => void
  onSearchQueryChange?: (query: string, options: SearchOptions) => void
}

export default function SearchPanel({ isOpen, onClose, content, onNavigateToLine, onSearchQueryChange }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    useRegex: false,
    wholeWord: false
  })
  const [matches, setMatches] = useState<SearchMatch[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTime, setSearchTime] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure animation completes
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string, options: SearchOptions) => {
        if (!searchQuery.trim()) {
          setMatches([])
          setCurrentMatchIndex(0)
          setSearchTime(0)
          setIsSearching(false)
          return
        }

        setIsSearching(true)
        const result = searchInContent(content, searchQuery, options)
        setMatches(result.matches)
        setCurrentMatchIndex(result.matches.length > 0 ? 0 : -1)
        setSearchTime(result.searchTime)
        setIsSearching(false)
      }, 300),
    [content]
  )

  // Trigger search when query or options change
  useEffect(() => {
    debouncedSearch(query, searchOptions)
    // Notify parent about search query change
    if (onSearchQueryChange) {
      onSearchQueryChange(query, searchOptions)
    }
  }, [query, searchOptions, debouncedSearch, onSearchQueryChange])

  // Navigate to next match
  const goToNextMatch = useCallback(() => {
    if (matches.length === 0) return

    const nextIndex = (currentMatchIndex + 1) % matches.length
    setCurrentMatchIndex(nextIndex)

    if (onNavigateToLine) {
      onNavigateToLine(matches[nextIndex].lineNumber)
    }

    // Scroll to the result in the list
    scrollToResultItem(nextIndex)
  }, [matches, currentMatchIndex, onNavigateToLine])

  // Navigate to previous match
  const goToPreviousMatch = useCallback(() => {
    if (matches.length === 0) return

    const prevIndex = currentMatchIndex === 0 ? matches.length - 1 : currentMatchIndex - 1
    setCurrentMatchIndex(prevIndex)

    if (onNavigateToLine) {
      onNavigateToLine(matches[prevIndex].lineNumber)
    }

    // Scroll to the result in the list
    scrollToResultItem(prevIndex)
  }, [matches, currentMatchIndex, onNavigateToLine])

  // Scroll to specific result item in the list
  const scrollToResultItem = (index: number) => {
    if (!resultsContainerRef.current) return

    const resultItems = resultsContainerRef.current.querySelectorAll('[role="button"]')
    const targetItem = resultItems[index] as HTMLElement

    if (targetItem) {
      targetItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      // Enter to go to next match
      else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        goToNextMatch()
      }
      // Shift+Enter to go to previous match
      else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault()
        goToPreviousMatch()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, goToNextMatch, goToPreviousMatch])

  // Handle clicking on a result item
  const handleResultClick = useCallback(
    (index: number) => {
      setCurrentMatchIndex(index)
      if (onNavigateToLine) {
        onNavigateToLine(matches[index].lineNumber)
      }
    },
    [matches, onNavigateToLine]
  )

  // Toggle search options
  const toggleOption = (option: keyof SearchOptions) => {
    setSearchOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  if (!isOpen) return null

  return (
    <div
      className="animate-in slide-in-from-top duration-300"
      role="dialog"
      aria-label="Search panel"
      aria-modal="true"
    >
      <Card className="shadow-lg border border-border/50 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
            {/* Search Input Section */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="在文档中搜索..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-4 h-9 text-sm bg-muted/50 border-border/50 focus:bg-background"
                  aria-label="Search query"
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousMatch}
                  disabled={matches.length === 0}
                  className="h-9 w-9 p-0 hover:bg-muted"
                  title="上一个 (Shift+Enter)"
                  aria-label="Previous match"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMatch}
                  disabled={matches.length === 0}
                  className="h-9 w-9 p-0 hover:bg-muted"
                  title="下一个 (Enter)"
                  aria-label="Next match"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 p-0 hover:bg-muted"
                title="关闭 (Esc)"
                aria-label="Close search panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Options */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleOption('caseSensitive')}
                  className={`h-7 px-2.5 text-xs ${searchOptions.caseSensitive ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                  title="区分大小写"
                  aria-label="Toggle case sensitive search"
                  aria-pressed={searchOptions.caseSensitive}
                >
                  <Type className="h-3 w-3 mr-1" />
                  Aa
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleOption('wholeWord')}
                  className={`h-7 px-2.5 text-xs ${searchOptions.wholeWord ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                  title="全词匹配"
                  aria-label="Toggle whole word search"
                  aria-pressed={searchOptions.wholeWord}
                >
                  <FileSearch className="h-3 w-3 mr-1" />
                  词
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleOption('useRegex')}
                  className={`h-7 px-2.5 text-xs ${searchOptions.useRegex ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                  title="正则表达式"
                  aria-label="Toggle regex search"
                  aria-pressed={searchOptions.useRegex}
                >
                  <Regex className="h-3 w-3 mr-1" />
                  .*
                </Button>
              </div>

              {/* Result Count */}
              <div className="text-xs text-muted-foreground font-mono">
                {isSearching ? (
                  <span>搜索中...</span>
                ) : query ? (
                  <span>
                    {matches.length === 0 ? '无结果' : `${matches.length} 项结果`}
                    {matches.length > 0 && ` · ${currentMatchIndex + 1}/${matches.length}`}
                    {searchTime > 0 && (
                      <span className="ml-2 opacity-60">
                        {searchTime.toFixed(0)}ms
                      </span>
                    )}
                  </span>
                ) : (
                  <span>输入搜索内容</span>
                )}
              </div>
            </div>

            {/* Results List */}
            <div
              ref={resultsContainerRef}
              className="max-h-80 overflow-y-auto space-y-0.5"
              style={{ scrollbarWidth: 'thin' }}
              role="list"
              aria-label="Search results"
            >
              {matches.length === 0 && query && !isSearching ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">未找到匹配项</p>
                  <p className="text-xs mt-1 opacity-70">尝试不同的搜索词或搜索选项</p>
                </div>
              ) : matches.length === 0 && !query ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">开始搜索文档</p>
                  <p className="text-xs mt-2 opacity-70 space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd>
                    <span>下一个</span>
                    <span>·</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Shift+Enter</kbd>
                    <span>上一个</span>
                  </p>
                </div>
              ) : (
                matches.map((match, index) => (
                  <SearchResultItem
                    key={`${match.lineNumber}-${index}`}
                    match={match}
                    isActive={index === currentMatchIndex}
                    onClick={() => handleResultClick(index)}
                  />
                ))
              )}
            </div>
        </CardContent>
      </Card>
    </div>
  )
}