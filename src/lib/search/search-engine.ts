/**
 * Search Engine for Full-Text Search in Markdown Documents
 * Supports regex patterns, case-sensitive/insensitive search, and whole word matching
 */

export interface SearchOptions {
  caseSensitive: boolean
  useRegex: boolean
  wholeWord: boolean
}

export interface SearchMatch {
  lineNumber: number
  lineContent: string
  matchStart: number
  matchEnd: number
  beforeContext: string
  afterContext: string
  matchedText: string
}

export interface SearchResult {
  matches: SearchMatch[]
  totalMatches: number
  searchTime: number
}

/**
 * Debounce function to limit search frequency
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Create regex pattern based on search options
 */
function createSearchPattern(query: string, options: SearchOptions): RegExp | null {
  if (!query) return null

  try {
    let pattern = query

    // If not using regex mode, escape special characters
    if (!options.useRegex) {
      pattern = escapeRegex(query)
    }

    // Add word boundary if whole word matching is enabled
    if (options.wholeWord) {
      pattern = `\\b${pattern}\\b`
    }

    // Create regex with appropriate flags
    const flags = options.caseSensitive ? 'g' : 'gi'
    return new RegExp(pattern, flags)
  } catch (error) {
    // Invalid regex pattern
    console.error('Invalid search pattern:', error)
    return null
  }
}

/**
 * Get context around a match (characters before and after)
 */
function getContext(line: string, matchStart: number, matchEnd: number, contextLength: number = 40): {
  before: string
  after: string
} {
  const before = line.substring(Math.max(0, matchStart - contextLength), matchStart)
  const after = line.substring(matchEnd, Math.min(line.length, matchEnd + contextLength))

  return {
    before: before.length < matchStart ? before : '...' + before.substring(3),
    after: after.length < line.length - matchEnd ? after : after.substring(0, after.length - 3) + '...'
  }
}

/**
 * Search through markdown content
 */
export function searchInContent(
  content: string,
  query: string,
  options: SearchOptions
): SearchResult {
  const startTime = performance.now()

  // Create search pattern
  const pattern = createSearchPattern(query, options)

  if (!pattern) {
    return {
      matches: [],
      totalMatches: 0,
      searchTime: performance.now() - startTime
    }
  }

  // Split content into lines
  const lines = content.split('\n')
  const matches: SearchMatch[] = []

  // Search each line
  lines.forEach((line, index) => {
    // Reset regex lastIndex for each line
    pattern.lastIndex = 0

    let match: RegExpExecArray | null
    while ((match = pattern.exec(line)) !== null) {
      const matchStart = match.index
      const matchEnd = match.index + match[0].length
      const context = getContext(line, matchStart, matchEnd)

      matches.push({
        lineNumber: index + 1, // 1-indexed line numbers
        lineContent: line,
        matchStart,
        matchEnd,
        beforeContext: context.before,
        afterContext: context.after,
        matchedText: match[0]
      })

      // Prevent infinite loop for zero-width matches
      if (match.index === pattern.lastIndex) {
        pattern.lastIndex++
      }
    }
  })

  const endTime = performance.now()

  return {
    matches,
    totalMatches: matches.length,
    searchTime: endTime - startTime
  }
}

/**
 * Highlight matches in text for display
 */
export function highlightMatches(
  text: string,
  matchStart: number,
  matchEnd: number
): { before: string; match: string; after: string } {
  return {
    before: text.substring(0, matchStart),
    match: text.substring(matchStart, matchEnd),
    after: text.substring(matchEnd)
  }
}

/**
 * Format search result count message
 */
export function formatResultCount(count: number): string {
  if (count === 0) {
    return 'No results'
  } else if (count === 1) {
    return '1 result'
  } else {
    return `${count} results`
  }
}