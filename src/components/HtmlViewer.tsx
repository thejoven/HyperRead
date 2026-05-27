'use client'

import { memo, useMemo } from 'react'

interface HtmlViewerProps {
  content: string
  fileName: string
  filePath?: string
  className?: string
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function pathToFileUrl(filePath?: string): string | null {
  if (!filePath || filePath.startsWith('blob:')) return null

  const normalizedPath = filePath.replace(/\\/g, '/')
  const directoryPath = normalizedPath.includes('/')
    ? normalizedPath.slice(0, normalizedPath.lastIndexOf('/') + 1)
    : ''

  if (!directoryPath) return null

  const encodedPath = directoryPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return directoryPath.startsWith('/')
    ? `file://${encodedPath}`
    : `file:///${encodedPath}`
}

function addBaseElement(html: string, baseHref: string | null): string {
  if (!baseHref || /<base\s/i.test(html)) return html

  const baseElement = `<base href="${escapeAttribute(baseHref)}" target="_blank">`

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${baseElement}`)
  }

  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html([^>]*)>/i, `<html$1><head>${baseElement}</head>`)
  }

  return `<!doctype html><html><head>${baseElement}</head><body>${html}</body></html>`
}

function resolveRootRelativeUrl(value: string, baseHref: string): string {
  const trimmedValue = value.trim()
  if (!trimmedValue.startsWith('/') || trimmedValue.startsWith('//')) return value

  try {
    return new URL(trimmedValue.slice(1), baseHref).toString()
  } catch {
    return value
  }
}

function rewriteSrcSet(value: string, baseHref: string): string {
  return value
    .split(',')
    .map((entry) => {
      const parts = entry.trim().split(/\s+/)
      const url = parts.shift()
      if (!url) return entry

      return [resolveRootRelativeUrl(url, baseHref), ...parts].join(' ')
    })
    .join(', ')
}

function sanitizeHtmlDocument(html: string, baseHref: string | null): string {
  if (typeof DOMParser === 'undefined') return html

  const document = new DOMParser().parseFromString(html, 'text/html')
  document.querySelectorAll('script').forEach(script => script.remove())

  if (baseHref) {
    document.querySelectorAll<HTMLElement>('[href], [src], [poster], [action]').forEach((element) => {
      for (const attr of ['href', 'src', 'poster', 'action']) {
        const value = element.getAttribute(attr)
        if (value) {
          element.setAttribute(attr, resolveRootRelativeUrl(value, baseHref))
        }
      }
    })

    document.querySelectorAll<HTMLElement>('[srcset]').forEach((element) => {
      const value = element.getAttribute('srcset')
      if (value) {
        element.setAttribute('srcset', rewriteSrcSet(value, baseHref))
      }
    })
  }

  return `<!doctype html>\n${document.documentElement.outerHTML}`
}

function prepareHtml(content: string, filePath?: string): string {
  const baseHref = pathToFileUrl(filePath)
  return sanitizeHtmlDocument(addBaseElement(content, baseHref), baseHref)
}

function HtmlViewer({ content, fileName, filePath, className = '' }: HtmlViewerProps) {
  const html = useMemo(() => prepareHtml(content, filePath), [content, filePath])

  return (
    <div className={`h-full w-full bg-background ${className}`}>
      <iframe
        title={fileName}
        srcDoc={html}
        sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        className="h-full w-full border-0 bg-white"
      />
    </div>
  )
}

export default memo(HtmlViewer)
