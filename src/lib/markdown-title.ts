const FRONTMATTER_BOUNDARY = /^(---|\.\.\.)\s*$/

function cleanMarkdownTitle(rawTitle: string): string {
  return rawTitle
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractFrontmatterTitle(lines: string[]): { title?: string; nextIndex: number } {
  if (lines[0]?.trim() !== '---') {
    return { nextIndex: 0 }
  }

  let title: string | undefined

  for (let index = 1; index < lines.length; index++) {
    const line = lines[index].trim()

    if (FRONTMATTER_BOUNDARY.test(line)) {
      return { title, nextIndex: index + 1 }
    }

    const titleMatch = line.match(/^title:\s*(.+?)\s*$/i)
    if (titleMatch) {
      const cleaned = cleanMarkdownTitle(titleMatch[1])
      if (cleaned) title = cleaned
    }
  }

  return { title, nextIndex: 0 }
}

export function extractMarkdownTitle(content: string): string | undefined {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/)
  const { title, nextIndex } = extractFrontmatterTitle(lines)

  if (title) return title

  let inFence = false
  let fenceMarker = ''

  for (let index = nextIndex; index < lines.length; index++) {
    const line = lines[index]
    const trimmedStart = line.trimStart()
    const fenceMatch = trimmedStart.match(/^(`{3,}|~{3,})/)

    if (fenceMatch) {
      const marker = fenceMatch[1][0]
      if (!inFence) {
        inFence = true
        fenceMarker = marker
      } else if (marker === fenceMarker) {
        inFence = false
        fenceMarker = ''
      }
      continue
    }

    if (inFence) continue

    const atxHeading = line.match(/^\s{0,3}#\s+(.+?)\s*#*\s*$/)
    if (atxHeading) {
      const cleaned = cleanMarkdownTitle(atxHeading[1])
      if (cleaned) return cleaned
    }

    const setextTitle = line.trim()
    const setextUnderline = lines[index + 1]?.match(/^\s{0,3}=+\s*$/)
    if (setextTitle && setextUnderline) {
      const cleaned = cleanMarkdownTitle(setextTitle)
      if (cleaned) return cleaned
    }
  }

  return undefined
}
