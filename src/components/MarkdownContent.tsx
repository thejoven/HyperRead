'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import MermaidDiagram from './MermaidDiagram'
import LocalImage from './LocalImage'
import TableOfContents from './TableOfContents'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LinkProvider, useLinkContext } from './LinkContext'

interface MarkdownContentProps {
  content: string
  fontSize?: number
  className?: string
  filePath?: string
  onFileNavigation?: (targetPath: string, currentPath?: string) => void
}

export default function MarkdownContent({ content, fontSize = 16, className = '', filePath, onFileNavigation }: MarkdownContentProps) {
  const articleRef = useRef<HTMLElement>(null)
  
  // Calculate relative sizes based on the base fontSize
  const scale = fontSize / 16
  const getFontSize = (baseSize: number) => Math.round(baseSize * scale)
  
  // Generate heading ID from text - same logic as before for consistency
  const usedHeadingIds = useRef(new Set<string>())

  const generateHeadingId = (text: string): string => {
    if (typeof text !== 'string') return ''
    let id = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff-]/g, '') // Support Chinese characters
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // 确保ID唯一性，避免同名标题冲突
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
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }, [content])
  
  return (
    <div className="relative">
      <TableOfContents content={content} />
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
        components={{
          h1: ({ children }) => {
            const textContent = Array.isArray(children) ? children.join('') : String(children || '')
            const id = generateHeadingId(textContent)
            return (
              <h1
                id={id}
                className="font-bold text-foreground mb-8 pb-4 border-b-2 border-border scroll-mt-20 break-words"
                style={{ fontSize: `${getFontSize(36)}px` }}
              >
                {children}
              </h1>
            )
          },
          h2: ({ children }) => {
            const textContent = Array.isArray(children) ? children.join('') : String(children || '')
            const id = generateHeadingId(textContent)
            return (
              <h2
                id={id}
                className="font-semibold text-foreground mt-10 mb-6 pb-3 border-b border-border scroll-mt-20 break-words"
                style={{ fontSize: `${getFontSize(28)}px` }}
              >
                {children}
              </h2>
            )
          },
          h3: ({ children }) => {
            const textContent = Array.isArray(children) ? children.join('') : String(children || '')
            const id = generateHeadingId(textContent)
            return (
              <h3
                id={id}
                className="font-semibold text-foreground mt-8 mb-4 scroll-mt-20 break-words"
                style={{ fontSize: `${getFontSize(24)}px` }}
              >
                {children}
              </h3>
            )
          },
          h4: ({ children }) => {
            const textContent = Array.isArray(children) ? children.join('') : String(children || '')
            const id = generateHeadingId(textContent)
            return (
              <h4
                id={id}
                className="font-semibold text-foreground mt-6 mb-3 scroll-mt-20 break-words"
                style={{ fontSize: `${getFontSize(20)}px` }}
              >
                {children}
              </h4>
            )
          },
          h5: ({ children }) => {
            const textContent = Array.isArray(children) ? children.join('') : String(children || '')
            const id = generateHeadingId(textContent)
            return (
              <h5
                id={id}
                className="font-semibold text-foreground mt-5 mb-2 scroll-mt-20 break-words"
                style={{ fontSize: `${getFontSize(18)}px` }}
              >
                {children}
              </h5>
            )
          },
          h6: ({ children }) => {
            const textContent = Array.isArray(children) ? children.join('') : String(children || '')
            const id = generateHeadingId(textContent)
            return (
              <h6
                id={id}
                className="font-semibold text-foreground mt-4 mb-2 scroll-mt-20 break-words"
                style={{ fontSize: `${getFontSize(16)}px` }}
              >
                {children}
              </h6>
            )
          },
          p: ({ children }) => (
            <p className="text-muted-foreground leading-7 mb-6 text-base break-words overflow-wrap-anywhere">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-6 space-y-2 text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-muted-foreground leading-6 break-words">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <Card className="my-6 border-l-4 border-l-primary border-t-0 border-r-0 border-b-0 rounded-l-none bg-muted/20">
              <CardContent className="p-6 py-4">
                <div className="text-muted-foreground italic break-words overflow-wrap-anywhere">
                  {children}
                </div>
              </CardContent>
            </Card>
          ),
          code: ({ className, children, ...props }) => {
            const inline = !className
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const codeString = String(children).replace(/\n$/, '')
            
            // Handle Mermaid diagrams
            if (!inline && (language === 'mermaid' || language === 'mmd')) {
              return <MermaidDiagram chart={codeString} />
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
                {children}
              </code>
            )
          },
          table: ({ children }) => (
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
          thead: ({ children }) => (
            <thead className="bg-muted">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-card divide-y divide-border">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/50 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground bg-muted break-words min-w-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 text-sm text-muted-foreground break-words min-w-0">
              {children}
            </td>
          ),
          a: ({ href, children }) => {
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
                        // 在 Electron 中打开外部链接
                        try {
                          window.electronAPI.openExternal(href)
                          console.log('External link opened successfully')
                        } catch (error) {
                          console.error('Failed to open external link:', error)
                        }
                      } else {
                        console.log('Opening external link via window.open:', href)
                        // 在浏览器中正常打开
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
                      // Decode the URL-encoded href and find the element
                      const decodedHref = decodeURIComponent(href)
                      let element = document.querySelector(decodedHref)
                      
                      // If direct query fails, try with getElementById using the ID without #
                      if (!element && decodedHref.startsWith('#')) {
                        const id = decodedHref.substring(1)
                        element = document.getElementById(id)
                      }
                      
                      // If still not found, try to find by the generated ID format
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

                    // Extract file path and optional anchor
                    const [targetPath, anchor] = href.split('#')

                    console.log('Local file link clicked:', {
                      href,
                      targetPath,
                      anchor,
                      currentPath: filePath,
                      filePathType: typeof filePath,
                      filePathLength: filePath ? filePath.length : 0
                    })

                    // Call the navigation callback
                    onFileNavigation(targetPath, filePath)

                    // If there's an anchor, scroll to it after navigation
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
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-muted-foreground">
              {children}
            </em>
          ),
          hr: () => (
            <hr className="my-8 border-t border-border" />
          ),
          img: ({ src, alt, title, ...props }) => {
            if (!src) return null

            // Use LocalImage component to handle both local and remote images
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
        }}
      >
        {content}
      </ReactMarkdown>
      </article>
    </div>
  )
}