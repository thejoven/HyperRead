export interface Heading {
  id: string
  text: string
  level: number
}

export const generateHeadingId = (text: string): string => {
  if (typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const extractHeadings = (content: string): Heading[] => {
  // Strip fenced code blocks (``` or ~~~) before scanning for headings
  // to avoid matching # comments inside code as headings
  const stripped = content.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1[ \t]*$/gm, (match) =>
    match.replace(/^(?!`|~).+$/gm, '')
  )
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: Heading[] = []
  const usedIds = new Set<string>()
  let match

  while ((match = headingRegex.exec(stripped)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    let id = generateHeadingId(text)

    let counter = 1
    let uniqueId = id
    while (usedIds.has(uniqueId)) {
      uniqueId = `${id}-${counter}`
      counter++
    }
    usedIds.add(uniqueId)

    headings.push({ id: uniqueId, text, level })
  }

  return headings
}

// Strip markdown inline formatting to get plain text (matches DOM textContent)
const stripMarkdown = (text: string) =>
  text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .trim()

const getScrollContainer = () =>
  document.querySelector('.content-scroll') ||
  document.querySelector('[class*="overflow-y-auto"]') ||
  document.documentElement

const getContentHeadings = (scrollContainer: Element | Document): NodeListOf<Element> => {
  const root = scrollContainer === document.documentElement ? document : scrollContainer
  return root.querySelectorAll('h1, h2, h3, h4, h5, h6')
}

const scrollElementIntoView = (element: HTMLElement, scrollContainer: Element | EventTarget) => {
  const viewportHeight = window.innerHeight
  const offsetTop = viewportHeight * 0.15

  if (scrollContainer === document.documentElement) {
    window.scrollTo({ top: Math.max(0, element.offsetTop - offsetTop), behavior: 'smooth' })
  } else {
    const containerEl = scrollContainer as Element
    const containerRect = containerEl.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const targetScroll = containerEl.scrollTop + elementRect.top - containerRect.top - offsetTop
    containerEl.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' })
  }
}

// Primary scroll method: use DOM index to avoid ID mismatches (most reliable)
export const scrollToHeadingByIndex = (
  index: number,
  setActive?: (id: string) => void,
  tocHeadingId?: string
) => {
  const scrollContainer = getScrollContainer()
  const allHeadings = getContentHeadings(scrollContainer as Element)
  const element = allHeadings[index] as HTMLElement | undefined
  if (!element) return

  scrollElementIntoView(element, scrollContainer)
  setActive?.(tocHeadingId ?? element.id ?? '')
}

export const scrollToHeading = (headingId: string, setActive?: (id: string) => void, headingText?: string) => {
  let element: HTMLElement | null = document.getElementById(headingId)

  // Fallback: find by text content if ID lookup fails (handles ID generation mismatches)
  if (!element && headingText) {
    const normalizedSearch = stripMarkdown(headingText)
    const candidates = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    for (const h of candidates) {
      if (h.textContent?.trim() === normalizedSearch) {
        element = h as HTMLElement
        break
      }
    }
  }

  if (!element) return

  const scrollContainer = getScrollContainer()
  scrollElementIntoView(element, scrollContainer)
  setActive?.(headingId)
}

export { getScrollContainer, getContentHeadings }
