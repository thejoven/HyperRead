'use client'

import React, { useEffect, useRef, memo, useMemo, Suspense } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import LocalImage from './LocalImage'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LinkProvider, useLinkContext } from './LinkContext'

const MermaidDiagram = React.lazy(() => import('./MermaidDiagram'))

interface MarkdownContentProps {
  content: string
  fontSize?: number
  className?: string
  filePath?: string
  onFileNavigation?: (targetPath: string, currentPath?: string) => void
  searchQuery?: string
  searchOptions?: { caseSensitive: boolean; useRegex: boolean; wholeWord: boolean }
}

// Helper function to highlight search matches in text
function highlightSearchText(text: string, query: string, options: { caseSensitive: boolean; useRegex: boolean; wholeWord: boolean }): React.ReactNode {
  if (!query || !query.trim()) {
    return text
  }

  try {
    let pattern = query
    if (!options.useRegex) {
      // Escape special regex characters
      pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
    if (options.wholeWord) {
      pattern = `\\b${pattern}\\b`
    }

    const flags = options.caseSensitive ? 'g' : 'gi'
    const regex = new RegExp(pattern, flags)

    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      // Add highlighted match
      parts.push(
        <mark key={`${match.index}-${match[0]}`} className="bg-yellow-200/80 dark:bg-yellow-500/20 text-foreground px-0.5 rounded">
          {match[0]}
        </mark>
      )

      lastIndex = match.index + match[0].length

      // Prevent infinite loop for zero-length matches
      if (match.index === regex.lastIndex) {
        regex.lastIndex++
      }
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? <>{parts}</> : text
  } catch (error) {
    // If regex is invalid, return original text
    return text
  }
}

function MarkdownContent({ content, fontSize = 16, className = '', filePath, onFileNavigation, searchQuery, searchOptions }: MarkdownContentProps) {
  const articleRef = useRef<HTMLElement>(null)

  // Calculate relative sizes based on the base fontSize
  const scale = fontSize / 16
  const getFontSize = (baseSize: number) => Math.round(baseSize * scale)

  // Helper function to process children and apply highlighting
  const processChildren = (children: React.ReactNode): React.ReactNode => {
    if (!searchQuery || !searchOptions) {
      return children
    }

    if (typeof children === 'string') {
      return highlightSearchText(children, searchQuery, searchOptions)
    }

    if (Array.isArray(children)) {
      return children.map((child, index) => {
        if (typeof child === 'string') {
          return <span key={index}>{highlightSearchText(child, searchQuery, searchOptions)}</span>
        }
        return child
      })
    }

    return children
  }
  
  // Extract plain text from React children recursively (handles bold, code, links, etc.)
  const extractPlainText = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node
    if (typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(extractPlainText).join('')
    if (node && typeof node === 'object' && 'props' in (node as React.ReactElement)) {
      return extractPlainText((node as React.ReactElement).props?.children)
    }
    return ''
  }

  // Generate heading ID - accepts React children or raw string
  const usedHeadingIds = useRef(new Set<string>())

  const generateHeadingId = (children: React.ReactNode | string): string => {
    const text = typeof children === 'string' ? children : extractPlainText(children)
    if (!text) return ''
    let id = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    let counter = 1
    let uniqueId = id
    while (usedHeadingIds.current.has(uniqueId)) {
      uniqueId = `${id}-${counter}`
      counter++
    }
    usedHeadingIds.current.add(uniqueId)
    return uniqueId
  }

  // Reset used IDs when content changes
  useEffect(() => {
    usedHeadingIds.current.clear()
  }, [content])
  
  // Global click handler for all anchor links within the article
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const anchor = target.closest('a')
      
      if (anchor && anchor.href) {
        const url = new URL(anchor.href)
        const hash = url.hash
        
        // Only handle internal anchor links
        if (hash && url.origin === window.location.origin) {
          event.preventDefault()
          
          try {
            // Decode the URL-encoded hash and find the element
            const decodedHash = decodeURIComponent(hash)
            let element = null
            
            // Try direct querySelector first
            try {
              element = document.querySelector(decodedHash)
            } catch (e) {
              // querySelector failed, try other methods
            }
            
            // If direct query fails, try with getElementById using the ID without #
            if (!element && decodedHash.startsWith('#')) {
              const id = decodedHash.substring(1)
              element = document.getElementById(id)
            }
            
            // If still not found, try to find by the generated ID format
            if (!element && decodedHash.startsWith('#')) {
              const originalText = decodedHash.substring(1)
              const generatedId = generateHeadingId(originalText)
              element = document.getElementById(generatedId)
            }
            
            if (element) {
              // Find the scrollable container
              const scrollContainer = element.closest('.content-scroll') || 
                                   element.closest('[class*="overflow-y-auto"]') ||
                                   document.documentElement
              
              if (scrollContainer === document.documentElement) {
                // Use standard scrollIntoView for document
                element.scrollIntoView({ behavior: 'smooth' })
              } else {
                // Calculate position and scroll the container
                const containerRect = scrollContainer.getBoundingClientRect()
                const elementRect = element.getBoundingClientRect()
                const currentScroll = scrollContainer.scrollTop
                const targetScroll = currentScroll + elementRect.top - containerRect.top - 100 // 100px offset
                
                scrollContainer.scrollTo({
                  top: targetScroll,
                  behavior: 'smooth'
                })
              }
            }
          } catch (error) {
            console.warn('Failed to navigate to anchor:', hash, error)
          }
        }
      }
    }
    
    const article = articleRef.current
    if (article) {
      article.addEventListener('click', handleAnchorClick)
      return () => {
        article.removeEventListener('click', handleAnchorClick)
      }
    }
  }, [content])
  
  // Reset scroll position when content changes
  useEffect(() => {
    const article = articleRef.current
    if (article) {
      // Find the scrollable container
      const scrollContainer = article.closest('.content-scroll') || 
                             article.closest('[class*="overflow-y-auto"]') ||
                             document.documentElement
      
      // Scroll to top when content changes
      if (scrollContainer === document.documentElement) {
        window.scrollTo({ top: 0 })
      } else {
        scrollContainer.scrollTo({ top: 0 })
      }
    }
  }, [content])
  
  // Memoize the ReactMarkdown components object to avoid re-creating on every render
  const markdownComponents = useMemo(() => ({
    h1: ({ children }: { children?: React.ReactNode }) => {
      const id = generateHeadingId(children)
      return (
        <h1
          id={id}
          className="font-bold text-foreground mb-8 pb-4 border-b-2 border-border scroll-mt-20 break-words"
          style={{ fontSize: `${getFontSize(36)}px` }}
        >
          {processChildren(children)}
        </h1>
      )
    },
    h2: ({ children }: { children?: React.ReactNode }) => {
      const id = generateHeadingId(children)
      return (
        <h2
          id={id}
          className="font-semibold text-foreground mt-10 mb-6 pb-3 border-b border-border scroll-mt-20 break-words"
          style={{ fontSize: `${getFontSize(28)}px` }}
        >
          {processChildren(children)}
        </h2>
      )
    },
    h3: ({ children }: { children?: React.ReactNode }) => {
      const id = generateHeadingId(children)
      return (
        <h3
          id={id}
          className="font-semibold text-foreground mt-8 mb-4 scroll-mt-20 break-words"
          style={{ fontSize: `${getFontSize(24)}px` }}
        >
          {processChildren(children)}
        </h3>
      )
    },
    h4: ({ children }: { children?: React.ReactNode }) => {
      const id = generateHeadingId(children)
      return (
        <h4
          id={id}
          className="font-semibold text-foreground mt-6 mb-3 scroll-mt-20 break-words"
          style={{ fontSize: `${getFontSize(20)}px` }}
        >
          {processChildren(children)}
        </h4>
      )
    },
    h5: ({ children }: { children?: React.ReactNode }) => {
      const id = generateHeadingId(children)
      return (
        <h5
          id={id}
          className="font-semibold text-foreground mt-5 mb-2 scroll-mt-20 break-words"
          style={{ fontSize: `${getFontSize(18)}px` }}
        >
          {processChildren(children)}
        </h5>
      )
    },
    h6: ({ children }: { children?: React.ReactNode }) => {
      const id = generateHeadingId(children)
      return (
        <h6
          id={id}
          className="font-semibold text-foreground mt-4 mb-2 scroll-mt-20 break-words"
          style={{ fontSize: `${getFontSize(16)}px` }}
        >
          {processChildren(children)}
        </h6>
      )
    },
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-muted-foreground leading-7 mb-6 break-words overflow-wrap-anywhere">
        {processChildren(children)}
      </p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal pl-6 mb-6 space-y-2 text-muted-foreground">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-muted-foreground leading-6 break-words">
        {processChildren(children)}
      </li>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <Card className="my-6 border-l-4 border-l-primary border-t-0 border-r-0 border-b-0 rounded-l-none bg-muted/20">
        <CardContent className="p-6 py-4">
          <div className="text-muted-foreground italic break-words overflow-wrap-anywhere">
            {processChildren(children)}
          </div>
        </CardContent>
      </Card>
    ),
    code: ({ className, children, ...props }: any) => {
      const inline = !className
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      const codeString = String(children).replace(/\n$/, '')

      // Handle Mermaid diagrams
      if (!inline && (language === 'mermaid' || language === 'mmd')) {
        return (
          <Suspense fallback={<div className="flex items-center justify-center p-4 text-muted-foreground">Loading diagram...</div>}>
            <MermaidDiagram chart={codeString} />
          </Suspense>
        )
      }

      return !inline && match ? (
        <Card className="my-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted px-4 py-2 border-b border-border">
              <span className="text-xs font-mono text-muted-foreground uppercase">
                {language}
              </span>
            </div>
            <pre className="bg-card text-card-foreground p-6 overflow-x-auto text-sm whitespace-pre-wrap break-all">
              <code className={cn(className, "break-all whitespace-pre-wrap")} {...props}>
                {children}
              </code>
            </pre>
          </CardContent>
        </Card>
      ) : (
        <code className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm font-mono break-all whitespace-pre-wrap" {...props}>
          {processChildren(children)}
        </code>
      )
    },
    table: ({ children }: { children?: React.ReactNode }) => (
      <Card className="my-6 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              {children}
            </table>
          </div>
        </CardContent>
      </Card>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
      <thead className="bg-muted">
        {children}
      </thead>
    ),
    tbody: ({ children }: { children?: React.ReactNode }) => (
      <tbody className="bg-card divide-y divide-border">
        {children}
      </tbody>
    ),
    tr: ({ children }: { children?: React.ReactNode }) => (
      <tr className="hover:bg-muted/50 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground bg-muted break-words min-w-0">
        {processChildren(children)}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-6 py-4 text-sm text-muted-foreground break-words min-w-0">
        {processChildren(children)}
      </td>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
      if (!href) return <span>{children}</span>

      const isExternal = href.startsWith('http') || href.startsWith('https') || href.startsWith('//')
      const isAnchor = href.startsWith('#')

      // External links - open in external browser
      if (isExternal) {
        return (
          <LinkProvider value={true}>
            <a
              href={href}
              className="text-primary hover:text-foreground underline font-medium hover:no-underline transition-colors break-all"
              onClick={(e) => {
                console.log('External link clicked:', href)
                console.log('electronAPI available:', !!window.electronAPI)
                console.log('openExternal available:', !!window.electronAPI?.openExternal)

                e.preventDefault()
                e.stopPropagation()

                if (window.electronAPI?.openExternal) {
                  console.log('Opening external link via Electron:', href)
                  try {
                    window.electronAPI.openExternal(href)
                    console.log('External link opened successfully')
                  } catch (error) {
                    console.error('Failed to open external link:', error)
                  }
                } else {
                  console.log('Opening external link via window.open:', href)
                  window.open(href, '_blank', 'noopener,noreferrer')
                }
              }}
            >
              {children}
            </a>
          </LinkProvider>
        )
      }

      // Anchor links - scroll to section
      if (isAnchor) {
        return (
          <a
            href={href}
            className="text-primary hover:text-foreground underline font-medium hover:no-underline transition-colors break-all"
            onClick={(e) => {
              e.preventDefault()
              try {
                const decodedHref = decodeURIComponent(href)
                let element = document.querySelector(decodedHref)

                if (!element && decodedHref.startsWith('#')) {
                  const id = decodedHref.substring(1)
                  element = document.getElementById(id)
                }

                if (!element && decodedHref.startsWith('#')) {
                  const originalText = decodedHref.substring(1)
                  const generatedId = generateHeadingId(originalText)
                  element = document.getElementById(generatedId)
                }

                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              } catch (error) {
                console.warn('Failed to navigate to anchor:', href, error)
              }
            }}
          >
            {children}
          </a>
        )
      }

      // Local file links - navigate to other markdown files
      const isLocalFile = !isExternal && !isAnchor && (
        href.endsWith('.md') ||
        href.endsWith('.markdown') ||
        href.endsWith('.txt') ||
        href.includes('.md#') ||
        href.includes('.markdown#')
      )

      if (isLocalFile && onFileNavigation) {
        return (
          <a
            href={href}
            className="text-primary hover:text-foreground underline font-medium hover:no-underline transition-colors cursor-pointer break-all"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              const [targetPath, anchor] = href.split('#')

              console.log('Local file link clicked:', {
                href,
                targetPath,
                anchor,
                currentPath: filePath,
                filePathType: typeof filePath,
                filePathLength: filePath ? filePath.length : 0
              })

              onFileNavigation(targetPath, filePath)

              if (anchor) {
                setTimeout(() => {
                  const element = document.getElementById(anchor)
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                  }
                }, 100)
              }
            }}
            title={`打开文件: ${href}`}
          >
            {children}
          </a>
        )
      }

      // Other links - treat as disabled in single-file mode
      return (
        <span className="text-muted-foreground underline cursor-not-allowed" title="此链接在单文件模式下不可用">
          {children}
        </span>
      )
    },
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-bold text-foreground">
        {processChildren(children)}
      </strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic text-muted-foreground">
        {processChildren(children)}
      </em>
    ),
    hr: () => (
      <hr className="my-8 border-t border-border" />
    ),
    img: ({ src, alt, title, ...props }: any) => {
      if (!src) return null

      return (
        <LocalImage
          src={src}
          alt={alt}
          title={title}
          markdownFilePath={filePath}
          {...props}
        />
      )
    }
  }), [searchQuery, searchOptions, fontSize, filePath, onFileNavigation])

  return (
    <div className="relative">
      <article
        ref={articleRef}
        className={cn(
          "prose prose-lg max-w-none",
          "break-words overflow-wrap-anywhere",
          "min-w-0 w-full overflow-x-hidden",
          className
        )}
        style={{ fontSize: `${fontSize}px` }}
      >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
      </article>
    </div>
  )
}

// 使用严格比较函数优化 memoization
export default memo(MarkdownContent, (prevProps, nextProps) => {
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