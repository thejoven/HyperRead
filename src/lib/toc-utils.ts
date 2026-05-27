export interface Heading {
  id: string
  text: string
  level: number
}

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6'
const ARTICLE_HEADING_SELECTOR = 'article h1, article h2, article h3, article h4, article h5, article h6'

export function stripMarkdownInline(text: string): string {
  return text
    .replace(/\\([\\`*{}[\]()#+\-.!_>])/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/[*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function createHeadingSlug(text: string): string {
  const cleanText = stripMarkdownInline(text)
  const slug = cleanText
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || 'section'
}

export function createHeadingIdFactory() {
  const usedIds = new Set<string>()

  return (text: string): string => {
    const baseId = createHeadingSlug(text)
    let uniqueId = baseId
    let counter = 1

    while (usedIds.has(uniqueId)) {
      uniqueId = `${baseId}-${counter}`
      counter++
    }

    usedIds.add(uniqueId)
    return uniqueId
  }
}

function stripFencedCodeBlocks(content: string): string {
  const lines = content.split(/\r?\n/)
  let fence: string | null = null

  return lines
    .map((line) => {
      const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/)
      if (fenceMatch) {
        const marker = fenceMatch[1][0]
        if (!fence) {
          fence = marker
          return ''
        }

        if (fence === marker) {
          fence = null
          return ''
        }
      }

      return fence ? '' : line
    })
    .join('\n')
}

function cleanAtxHeadingText(rawText: string): string {
  return rawText.replace(/[ \t]+#+[ \t]*$/, '').trim()
}

export function extractHeadings(content: string): Heading[] {
  const lines = stripFencedCodeBlocks(content).split(/\r?\n/)
  const headings: Heading[] = []
  const createId = createHeadingIdFactory()

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const atxMatch = line.match(/^ {0,3}(#{1,6})[ \t]+(.+)$/)

    if (atxMatch) {
      const level = atxMatch[1].length
      const text = stripMarkdownInline(cleanAtxHeadingText(atxMatch[2]))
      if (text) {
        headings.push({ id: createId(text), text, level })
      }
      continue
    }

    const nextLine = lines[index + 1]
    const setextMatch = nextLine?.match(/^ {0,3}(=+|-+)[ \t]*$/)
    const setextText = stripMarkdownInline(line.trim())

    if (setextMatch && setextText) {
      headings.push({
        id: createId(setextText),
        text: setextText,
        level: setextMatch[1].startsWith('=') ? 1 : 2,
      })
      index++
    }
  }

  return headings
}

export function getScrollContainer(from?: Element | null): HTMLElement {
  return (
    from?.closest('.content-scroll') as HTMLElement | null
  ) || (
    document.querySelector('.content-scroll') as HTMLElement | null
  ) || document.documentElement
}

export function getContentHeadings(scrollContainer?: Element | null): HTMLElement[] {
  const root = scrollContainer ?? document
  const articleHeadings = Array.from(root.querySelectorAll<HTMLElement>(ARTICLE_HEADING_SELECTOR))

  if (articleHeadings.length > 0) {
    return articleHeadings
  }

  return Array.from(root.querySelectorAll<HTMLElement>(HEADING_SELECTOR))
}

export function scrollElementIntoView(
  element: HTMLElement,
  scrollContainer = getScrollContainer(element),
  offsetRatio = 0.15
) {
  const viewportHeight = scrollContainer === document.documentElement
    ? window.innerHeight
    : scrollContainer.clientHeight
  const offsetTop = Math.min(120, Math.max(72, viewportHeight * offsetRatio))

  if (scrollContainer === document.documentElement) {
    window.scrollTo({ top: Math.max(0, element.offsetTop - offsetTop), behavior: 'smooth' })
    return
  }

  const containerRect = scrollContainer.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  const targetScroll = scrollContainer.scrollTop + elementRect.top - containerRect.top - offsetTop

  scrollContainer.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: 'smooth',
  })
}

export function scrollToHeadingByIndex(
  index: number,
  scrollContainer?: HTMLElement | null,
  onActiveChange?: (id: string) => void
): boolean {
  const container = scrollContainer ?? getScrollContainer()
  const element = getContentHeadings(container)[index]

  if (!element) return false

  scrollElementIntoView(element, container)
  onActiveChange?.(element.id)
  return true
}

export function scrollToHeadingById(
  headingId: string,
  root?: Element | null,
  onActiveChange?: (id: string) => void
): boolean {
  const id = headingId.startsWith('#') ? headingId.slice(1) : headingId
  if (!id) return false

  const searchRoot = root ?? document
  const escapedId = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id.replace(/"/g, '\\"')
  const element = searchRoot.querySelector<HTMLElement>(`#${escapedId}`) ?? document.getElementById(id)

  if (!element) return false

  scrollElementIntoView(element, getScrollContainer(element))
  onActiveChange?.(id)
  return true
}
