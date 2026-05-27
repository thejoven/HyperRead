const PANEL_ID = 'article-notebook'
const AI_PANEL_ID = 'ai-assistant'
const CONTEXT_CHARS = 80
const MAX_PROMPT_TEXT = 2400

const HIGHLIGHT_COLORS = [
  { id: 'yellow', label: '黄', value: 'rgba(250, 204, 21, 0.42)' },
  { id: 'green', label: '绿', value: 'rgba(34, 197, 94, 0.30)' },
  { id: 'blue', label: '蓝', value: 'rgba(59, 130, 246, 0.28)' },
  { id: 'pink', label: '粉', value: 'rgba(244, 114, 182, 0.30)' },
]

export default {
  state: null,

  async onload(api) {
    const state = createState(api)
    this.state = state

    const storedData = await api.loadData()
    state.data = normalizeData(storedData)
    state.currentDoc = api.getActiveDocument()

    state.sidebarHandle = api.registerSidebarPanel({
      id: PANEL_ID,
      title: '记事本',
      icon: '📝',
      render(container) {
        state.panelEl = container
        renderPanel(state)
        scheduleHighlightRender(state)
        return () => {
          state.panelEl = null
          container.innerHTML = ''
        }
      }
    })

    state.statusHandle = api.addStatusBarItem({
      id: 'article-notebook-status',
      text: '记事本: —',
      tooltip: '打开文章记事本',
      onClick: () => openPluginPanel(PANEL_ID)
    })

    state.onDocumentOpen = (fileData) => {
      state.currentDoc = fileData
      state.selectedText = ''
      state.selectedMeta = null
      state.activeHighlightId = null
      hideSelectionPopover(state)
      renderPanel(state)
      updateStatusItem(state)
      scheduleHighlightRender(state)
    }

    state.onDocumentClose = () => {
      clearRenderedHighlights()
      state.currentDoc = null
      state.selectedText = ''
      state.selectedMeta = null
      state.activeHighlightId = null
      hideSelectionPopover(state)
      renderPanel(state)
      updateStatusItem(state)
    }

    api.on('document:open', state.onDocumentOpen)
    api.on('tab:activate', state.onDocumentOpen)
    api.on('document:close', state.onDocumentClose)

    state.onSelectionChange = () => scheduleSelectionCapture(state, false)
    state.onSelectionMouseUp = () => scheduleSelectionCapture(state, true)
    state.onSelectionKeyUp = (event) => {
      if (event.key === 'Shift' || event.key.startsWith('Arrow')) {
        scheduleSelectionCapture(state, true)
      }
    }
    state.onReaderScroll = () => hideSelectionPopover(state)

    document.addEventListener('selectionchange', state.onSelectionChange)
    document.addEventListener('mouseup', state.onSelectionMouseUp)
    document.addEventListener('keyup', state.onSelectionKeyUp)
    document.addEventListener('scroll', state.onReaderScroll, true)

    api.addCommand({
      id: 'open-article-notebook',
      name: '打开文章记事本',
      callback: () => openPluginPanel(PANEL_ID)
    })

    renderPanel(state)
    updateStatusItem(state)
    scheduleHighlightRender(state)
    api.log('文章记事本插件已加载')
  },

  async onunload() {
    const state = this.state
    if (!state) return

    await saveNow(state)
    clearRenderedHighlights()
    hideSelectionPopover(state)
    cleanupRootClick(state)

    if (state.onDocumentOpen) {
      state.api.off('document:open', state.onDocumentOpen)
      state.api.off('tab:activate', state.onDocumentOpen)
    }
    if (state.onDocumentClose) state.api.off('document:close', state.onDocumentClose)
    if (state.onSelectionChange) document.removeEventListener('selectionchange', state.onSelectionChange)
    if (state.onSelectionMouseUp) document.removeEventListener('mouseup', state.onSelectionMouseUp)
    if (state.onSelectionKeyUp) document.removeEventListener('keyup', state.onSelectionKeyUp)
    if (state.onReaderScroll) document.removeEventListener('scroll', state.onReaderScroll, true)
    if (state.selectionTimer) window.clearTimeout(state.selectionTimer)
    if (state.highlightTimer) window.clearTimeout(state.highlightTimer)
    if (state.saveTimer) window.clearTimeout(state.saveTimer)
    if (state.statusTimer) window.clearTimeout(state.statusTimer)

    state.statusHandle?.remove?.()
    state.sidebarHandle?.remove?.()
    this.state = null
  }
}

function createState(api) {
  return {
    api,
    data: { documents: {} },
    currentDoc: null,
    panelEl: null,
    selectedText: '',
    selectedMeta: null,
    selectedColor: HIGHLIGHT_COLORS[0].value,
    activeHighlightId: null,
    sidebarHandle: null,
    statusHandle: null,
    statusText: '',
    statusTimer: null,
    saveTimer: null,
    selectionTimer: null,
    highlightTimer: null,
    popoverEl: null,
    rootClickEl: null,
    rootClickHandler: null,
    onDocumentOpen: null,
    onDocumentClose: null,
    onSelectionChange: null,
    onSelectionMouseUp: null,
    onSelectionKeyUp: null,
    onReaderScroll: null,
  }
}

function normalizeData(data) {
  if (!data || typeof data !== 'object') return { documents: {} }
  const documents = data.documents && typeof data.documents === 'object' ? data.documents : {}

  for (const entry of Object.values(documents)) {
    if (!entry || typeof entry !== 'object') continue
    entry.articleNote = typeof entry.articleNote === 'string' ? entry.articleNote : ''
    entry.highlights = Array.isArray(entry.highlights) ? entry.highlights : []
  }

  return { documents }
}

function getDocKey(doc) {
  const source = doc?.filePath || `${doc?.fileName || 'untitled'}:${hashString(doc?.content || '')}`
  return btoa(encodeURIComponent(source)).replace(/[/+=]/g, '_')
}

function ensureDocEntry(state) {
  if (!state.currentDoc) return null

  const key = getDocKey(state.currentDoc)
  if (!state.data.documents[key]) {
    state.data.documents[key] = {
      filePath: state.currentDoc.filePath,
      fileName: state.currentDoc.fileName,
      fileType: state.currentDoc.fileType,
      articleNote: '',
      highlights: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  const entry = state.data.documents[key]
  entry.filePath = state.currentDoc.filePath
  entry.fileName = state.currentDoc.fileName
  entry.fileType = state.currentDoc.fileType
  entry.highlights = Array.isArray(entry.highlights) ? entry.highlights : []
  entry.articleNote = typeof entry.articleNote === 'string' ? entry.articleNote : ''
  return entry
}

function hashString(text) {
  let hash = 0
  for (let index = 0; index < text.length; index++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

function saveSoon(state) {
  if (state.saveTimer) window.clearTimeout(state.saveTimer)
  state.saveTimer = window.setTimeout(() => saveNow(state), 250)
}

async function saveNow(state) {
  if (state.saveTimer) {
    window.clearTimeout(state.saveTimer)
    state.saveTimer = null
  }
  await state.api.saveData(state.data)
}

function renderPanel(state) {
  const container = state.panelEl
  if (!container) return

  container.innerHTML = ''
  const root = createEl('div', 'an-root')
  container.append(root)

  const header = createEl('div', 'an-header')
  const titleWrap = createEl('div', 'an-title-wrap')
  titleWrap.append(
    createEl('div', 'an-title', '记事本'),
    createEl('div', 'an-subtitle', state.currentDoc ? state.currentDoc.fileName : '未打开文章')
  )
  header.append(titleWrap)

  const entry = ensureDocEntry(state)
  const highlightCount = entry?.highlights.length || 0
  header.append(createEl('div', 'an-pill', state.currentDoc ? '自动保存' : '待机'))
  root.append(header)

  if (!state.currentDoc || !entry) {
    const empty = createEl('div', 'an-empty')
    empty.append(
      createEl('div', 'an-empty-title', '没有打开的文章'),
      createEl('div', 'an-empty-text', '打开文档后，这里会显示全文笔记、选区和高亮。')
    )
    root.append(empty)
    return
  }

  root.append(renderOverview(state, entry, highlightCount))
  root.append(renderArticleNoteSection(state, entry))
  root.append(renderSelectionSection(state, entry))
  root.append(renderHighlightsSection(state, entry))

  const status = createEl('div', 'an-status', state.statusText)
  root.append(status)
}

function renderOverview(state, entry, highlightCount) {
  const overview = createEl('div', 'an-overview')
  overview.append(
    renderStat('高亮', String(highlightCount)),
    renderStat('笔记', entry.articleNote.trim() ? '已写' : '空'),
    renderStat('选区', state.selectedText ? `${state.selectedText.length} 字` : '无')
  )
  return overview
}

function renderStat(label, value) {
  const item = createEl('div', 'an-stat')
  item.append(createEl('span', 'an-stat-label', label), createEl('strong', 'an-stat-value', value))
  return item
}

function renderArticleNoteSection(state, entry) {
  const section = createEl('section', 'an-section an-section-note')
  const header = createEl('div', 'an-section-header')
  header.append(createEl('div', 'an-section-title', '全文笔记'), createEl('div', 'an-muted', '自动保存'))
  section.append(header)

  const textarea = document.createElement('textarea')
  textarea.className = 'an-doc-note'
  textarea.value = entry.articleNote
  textarea.placeholder = '记录这篇文章的摘要、疑问、想法或待办...'
  textarea.addEventListener('input', () => {
    entry.articleNote = textarea.value
    entry.updatedAt = new Date().toISOString()
    setStatus(state, '全文笔记已保存')
    updateStatusItem(state)
    saveSoon(state)
  })
  section.append(textarea)

  const actions = createEl('div', 'an-actions')
  const sendBtn = createButton('发给 AI', 'an-btn primary')
  sendBtn.addEventListener('click', () => sendArticleNoteToAI(state, entry))
  actions.append(sendBtn)

  const copyBtn = createButton('复制', 'an-btn')
  copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(entry.articleNote || '')
    setStatus(state, '已复制全文笔记')
  })
  actions.append(copyBtn)

  section.append(actions)
  return section
}

function renderSelectionSection(state) {
  const section = createEl('section', 'an-section')
  const header = createEl('div', 'an-section-header')
  header.append(createEl('div', 'an-section-title', '当前选区'), createEl('div', 'an-muted', state.selectedText ? `${state.selectedText.length} 字` : '无'))
  section.append(header)

  if (!state.selectedText) {
    const empty = createEl('div', 'an-inline-empty', '暂无选区')
    section.append(empty)
    return section
  }

  const card = createEl('div', 'an-selection-card')
  card.append(createEl('div', 'an-text-preview', clampText(state.selectedText, 900)))

  const note = document.createElement('textarea')
  note.className = 'an-note-input'
  note.placeholder = '给这段文字写一条笔记（可选）...'
  card.append(note)

  const colorRow = createEl('div', 'an-color-row')
  colorRow.append(createEl('span', 'an-color-label', '高亮颜色'))
  HIGHLIGHT_COLORS.forEach(color => {
    const swatch = document.createElement('button')
    swatch.className = `an-swatch${state.selectedColor === color.value ? ' active' : ''}`
    swatch.title = color.label
    swatch.style.background = color.value
    swatch.addEventListener('click', () => {
      state.selectedColor = color.value
      renderPanel(state)
    })
    colorRow.append(swatch)
  })
  card.append(colorRow)

  const actions = createEl('div', 'an-actions')
  const highlightBtn = createButton('高亮', 'an-btn primary')
  highlightBtn.addEventListener('click', () => addHighlightFromSelection(state, note.value.trim()))
  actions.append(highlightBtn)

  const aiBtn = createButton('发送到 AI', 'an-btn')
  aiBtn.addEventListener('click', () => sendSelectionToAI(state, note.value.trim()))
  actions.append(aiBtn)

  const clearBtn = createButton('清除', 'an-btn')
  clearBtn.addEventListener('click', () => {
    state.selectedText = ''
    state.selectedMeta = null
    hideSelectionPopover(state)
    renderPanel(state)
  })
  actions.append(clearBtn)

  card.append(actions)
  section.append(card)
  return section
}

function renderHighlightsSection(state, entry) {
  const section = createEl('section', 'an-section an-section-highlights')
  const header = createEl('div', 'an-section-header')
  header.append(createEl('div', 'an-section-title', '文本笔记'), createEl('div', 'an-muted', `${entry.highlights.length} 条`))
  section.append(header)

  if (entry.highlights.length === 0) {
    const empty = createEl('div', 'an-inline-empty', '还没有高亮')
    section.append(empty)
    return section
  }

  const list = createEl('div', 'an-highlight-list')
  entry.highlights.slice().reverse().forEach(highlight => {
    const card = createEl('div', `an-highlight-card${state.activeHighlightId === highlight.id ? ' active' : ''}`)
    const meta = createEl('div', 'an-highlight-meta')
    meta.append(createEl('span', '', formatDate(highlight.createdAt)))
    const colorDot = createEl('span', 'an-color-dot')
    colorDot.style.background = highlight.color
    meta.append(colorDot)
    card.append(meta)

    card.append(createEl('div', 'an-text-preview', clampText(highlight.text, 700)))

    const note = document.createElement('textarea')
    note.className = 'an-note-input'
    note.value = highlight.note || ''
    note.placeholder = '给这段高亮补充笔记...'
    note.addEventListener('input', () => {
      highlight.note = note.value
      highlight.updatedAt = new Date().toISOString()
      entry.updatedAt = highlight.updatedAt
      setStatus(state, '文本笔记已保存')
      saveSoon(state)
    })
    card.append(note)

    const actions = createEl('div', 'an-actions')
    const jumpBtn = createButton('定位', 'an-btn')
    jumpBtn.addEventListener('click', () => scrollToHighlight(state, highlight.id))
    actions.append(jumpBtn)

    const aiBtn = createButton('发送到 AI', 'an-btn')
    aiBtn.addEventListener('click', () => sendHighlightToAI(state, highlight))
    actions.append(aiBtn)

    const delBtn = createButton('删除', 'an-btn danger')
    delBtn.addEventListener('click', () => deleteHighlight(state, entry, highlight.id))
    actions.append(delBtn)

    card.append(actions)
    list.append(card)
  })

  section.append(list)
  return section
}

function createEl(tag, className, text) {
  const el = document.createElement(tag)
  if (className) el.className = className
  if (text !== undefined) el.textContent = text
  return el
}

function createButton(text, className) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = className
  button.textContent = text
  return button
}

function scheduleSelectionCapture(state, showPopover) {
  if (state.selectionTimer) window.clearTimeout(state.selectionTimer)
  state.selectionTimer = window.setTimeout(() => captureSelection(state, showPopover), 80)
}

function captureSelection(state, showPopover) {
  const root = getReaderRoot()
  const selection = window.getSelection()
  if (!root || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
    hideSelectionPopover(state)
    return
  }

  const range = selection.getRangeAt(0)
  if (!rangeIntersectsRoot(range, root)) {
    hideSelectionPopover(state)
    return
  }

  const text = range.toString().trim()
  if (!text || text.length < 1) {
    hideSelectionPopover(state)
    return
  }

  const meta = buildSelectionMeta(root, range, text)
  state.selectedText = meta.text
  state.selectedMeta = meta
  renderPanel(state)

  if (showPopover) showSelectionPopover(state, range)
}

function buildSelectionMeta(root, range, text) {
  const rootText = root.textContent || ''
  let startOffset = 0

  try {
    const preRange = document.createRange()
    preRange.selectNodeContents(root)
    preRange.setEnd(range.startContainer, range.startOffset)
    startOffset = preRange.toString().length
    preRange.detach?.()
  } catch {
    startOffset = Math.max(0, rootText.indexOf(text))
  }

  const endOffset = startOffset + text.length
  return {
    text,
    prefix: rootText.slice(Math.max(0, startOffset - CONTEXT_CHARS), startOffset),
    suffix: rootText.slice(endOffset, endOffset + CONTEXT_CHARS),
    startOffset,
  }
}

function rangeIntersectsRoot(range, root) {
  const ancestor = range.commonAncestorContainer
  if (root.contains(ancestor.nodeType === Node.ELEMENT_NODE ? ancestor : ancestor.parentElement)) return true

  try {
    return range.intersectsNode(root)
  } catch {
    return false
  }
}

function showSelectionPopover(state, range) {
  hideSelectionPopover(state)
  if (!state.selectedText) return

  const rect = range.getBoundingClientRect()
  if (!rect || (rect.width === 0 && rect.height === 0)) return

  const popover = createEl('div', 'article-notebook-popover')
  popover.addEventListener('mousedown', event => event.preventDefault())

  const highlightBtn = createButton('高亮', '')
  highlightBtn.addEventListener('click', () => addHighlightFromSelection(state, ''))

  const noteBtn = createButton('记笔记', '')
  noteBtn.addEventListener('click', () => {
    openPluginPanel(PANEL_ID)
    addHighlightFromSelection(state, '')
  })

  const aiBtn = createButton('问 AI', '')
  aiBtn.addEventListener('click', () => sendSelectionToAI(state, ''))

  popover.append(highlightBtn, noteBtn, aiBtn)
  document.body.append(popover)

  const top = Math.max(8, rect.top - popover.offsetHeight - 8)
  const left = Math.min(window.innerWidth - popover.offsetWidth - 8, Math.max(8, rect.left + rect.width / 2 - popover.offsetWidth / 2))
  popover.style.top = `${top}px`
  popover.style.left = `${left}px`
  state.popoverEl = popover
}

function hideSelectionPopover(state) {
  state.popoverEl?.remove()
  state.popoverEl = null
}

function addHighlightFromSelection(state, note) {
  const entry = ensureDocEntry(state)
  const meta = state.selectedMeta
  if (!entry || !meta?.text) {
    setStatus(state, '请先在正文中框选一段文字')
    return
  }

  const now = new Date().toISOString()
  const highlight = {
    id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: meta.text,
    prefix: meta.prefix,
    suffix: meta.suffix,
    startOffset: meta.startOffset,
    note: note || '',
    color: state.selectedColor || HIGHLIGHT_COLORS[0].value,
    createdAt: now,
    updatedAt: now,
  }

  entry.highlights.push(highlight)
  entry.updatedAt = now
  state.activeHighlightId = highlight.id

  saveSoon(state)
  updateStatusItem(state)
  renderPanel(state)
  scheduleHighlightRender(state)
  hideSelectionPopover(state)
  openPluginPanel(PANEL_ID)
  setStatus(state, note ? '已保存高亮和文本笔记' : '已添加高亮')
}

function deleteHighlight(state, entry, id) {
  entry.highlights = entry.highlights.filter(item => item.id !== id)
  entry.updatedAt = new Date().toISOString()
  if (state.activeHighlightId === id) state.activeHighlightId = null
  saveSoon(state)
  updateStatusItem(state)
  renderPanel(state)
  scheduleHighlightRender(state)
  setStatus(state, '已删除高亮')
}

function scheduleHighlightRender(state) {
  if (state.highlightTimer) window.clearTimeout(state.highlightTimer)
  state.highlightTimer = window.setTimeout(() => applyHighlights(state), 120)
}

function applyHighlights(state) {
  clearRenderedHighlights()
  const root = getReaderRoot()
  const entry = ensureDocEntry(state)
  if (!root || !entry || entry.highlights.length === 0) {
    cleanupRootClick(state)
    return
  }

  bindRootClick(state, root)

  const nodeInfos = collectTextNodeInfos(root)
  const fullText = nodeInfos.map(info => info.text).join('')
  if (!fullText) return

  const occupied = []
  const matches = []
  for (const highlight of entry.highlights) {
    const match = findBestMatch(fullText, highlight, occupied)
    if (!match) continue
    occupied.push(match)
    matches.push({ ...match, highlight })
  }

  if (matches.length === 0) return

  const segmentsByNode = new Map()
  for (const match of matches) {
    for (const info of nodeInfos) {
      if (match.end <= info.start) break
      if (match.start >= info.end) continue

      const localStart = Math.max(0, match.start - info.start)
      const localEnd = Math.min(info.text.length, match.end - info.start)
      if (localEnd <= localStart) continue

      if (!segmentsByNode.has(info.node)) segmentsByNode.set(info.node, [])
      segmentsByNode.get(info.node).push({
        start: localStart,
        end: localEnd,
        highlight: match.highlight,
        active: state.activeHighlightId === match.highlight.id,
      })
    }
  }

  for (const info of nodeInfos) {
    const segments = segmentsByNode.get(info.node)
    if (segments?.length) replaceTextNodeWithSegments(info.node, segments)
  }
}

function clearRenderedHighlights() {
  const marks = document.querySelectorAll('mark.article-notebook-highlight[data-article-notebook-highlight]')
  marks.forEach(mark => {
    const text = document.createTextNode(mark.textContent || '')
    mark.replaceWith(text)
    text.parentElement?.normalize()
  })
}

function collectTextNodeInfos(root) {
  const infos = []
  let offset = 0
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (parent.closest('pre, code, textarea, input, button, select, script, style, .article-notebook-popover')) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    }
  })

  let node = walker.nextNode()
  while (node) {
    const text = node.nodeValue || ''
    infos.push({ node, text, start: offset, end: offset + text.length })
    offset += text.length
    node = walker.nextNode()
  }

  return infos
}

function findBestMatch(fullText, highlight, occupied) {
  const needle = highlight.text
  if (!needle) return null

  let index = fullText.indexOf(needle)
  let best = null

  while (index !== -1) {
    const end = index + needle.length
    if (!rangesOverlap(index, end, occupied)) {
      const prefix = highlight.prefix || ''
      const suffix = highlight.suffix || ''
      const before = fullText.slice(Math.max(0, index - prefix.length), index)
      const after = fullText.slice(end, end + suffix.length)

      let score = 0
      if (prefix && before === prefix) score += prefix.length * 2
      else if (prefix && before.endsWith(prefix.slice(-Math.min(prefix.length, 24)))) score += 24
      if (suffix && after === suffix) score += suffix.length * 2
      else if (suffix && after.startsWith(suffix.slice(0, Math.min(suffix.length, 24)))) score += 24
      if (typeof highlight.startOffset === 'number') {
        score -= Math.abs(index - highlight.startOffset) / 1000
      }

      if (!best || score > best.score) best = { start: index, end, score }
    }
    index = fullText.indexOf(needle, index + Math.max(needle.length, 1))
  }

  return best ? { start: best.start, end: best.end } : null
}

function rangesOverlap(start, end, ranges) {
  return ranges.some(range => start < range.end && end > range.start)
}

function replaceTextNodeWithSegments(node, segments) {
  const text = node.nodeValue || ''
  const cleanSegments = []
  const sortedSegments = segments
    .slice()
    .sort((a, b) => a.start - b.start)

  let lastEnd = 0
  for (const segment of sortedSegments) {
    if (segment.end <= segment.start || segment.start < lastEnd) continue
    cleanSegments.push(segment)
    lastEnd = segment.end
  }

  const fragment = document.createDocumentFragment()
  let cursor = 0

  cleanSegments.forEach(segment => {
    if (segment.start > cursor) {
      fragment.append(document.createTextNode(text.slice(cursor, segment.start)))
    }

    const mark = document.createElement('mark')
    mark.className = `article-notebook-highlight${segment.active ? ' active' : ''}`
    mark.dataset.articleNotebookHighlight = segment.highlight.id
    mark.style.setProperty('--an-highlight-color', segment.highlight.color || HIGHLIGHT_COLORS[0].value)
    mark.title = segment.highlight.note ? `笔记：${segment.highlight.note}` : '点击在记事本中查看'
    mark.textContent = text.slice(segment.start, segment.end)
    fragment.append(mark)
    cursor = segment.end
  })

  if (cursor < text.length) {
    fragment.append(document.createTextNode(text.slice(cursor)))
  }

  node.replaceWith(fragment)
}

function bindRootClick(state, root) {
  if (state.rootClickEl === root && state.rootClickHandler) return
  cleanupRootClick(state)

  state.rootClickEl = root
  state.rootClickHandler = (event) => {
    const mark = event.target?.closest?.('mark.article-notebook-highlight[data-article-notebook-highlight]')
    if (!mark) return

    state.activeHighlightId = mark.dataset.articleNotebookHighlight
    openPluginPanel(PANEL_ID)
    renderPanel(state)
  }
  root.addEventListener('click', state.rootClickHandler)
}

function cleanupRootClick(state) {
  if (state.rootClickEl && state.rootClickHandler) {
    state.rootClickEl.removeEventListener('click', state.rootClickHandler)
  }
  state.rootClickEl = null
  state.rootClickHandler = null
}

function scrollToHighlight(state, id) {
  const selector = `mark.article-notebook-highlight[data-article-notebook-highlight="${cssEscape(id)}"]`
  const mark = document.querySelector(selector)
  if (!mark) {
    scheduleHighlightRender(state)
    setStatus(state, '正在重新定位高亮')
    return
  }

  state.activeHighlightId = id
  mark.scrollIntoView({ behavior: 'smooth', block: 'center' })
  document
    .querySelectorAll('mark.article-notebook-highlight.active')
    .forEach(item => item.classList.remove('active'))
  document
    .querySelectorAll(selector)
    .forEach(item => {
      item.classList.add('active', 'flash')
      window.setTimeout(() => item.classList.remove('flash'), 1300)
    })
  renderPanel(state)
}

function sendArticleNoteToAI(state, entry) {
  if (!entry.articleNote.trim()) {
    setStatus(state, '全文笔记为空，先写一点再发送给 AI')
    return
  }

  const prompt = [
    `我正在阅读《${state.currentDoc.fileName}》。`,
    '下面是我的全文笔记，请帮我整理结构、提炼重点、指出遗漏或可继续追问的问题。',
    '',
    '全文笔记：',
    entry.articleNote.trim(),
  ].join('\n')
  sendToAI(state, prompt)
}

function sendSelectionToAI(state, note) {
  const meta = state.selectedMeta
  if (!meta?.text) {
    setStatus(state, '请先框选一段文字')
    return
  }

  const prompt = buildTextPrompt(state.currentDoc, {
    title: '请分析我框选的这段文字',
    text: meta.text,
    note,
    prefix: meta.prefix,
    suffix: meta.suffix,
  })
  sendToAI(state, prompt)
}

function sendHighlightToAI(state, highlight) {
  const prompt = buildTextPrompt(state.currentDoc, {
    title: '请分析我在文章中保存的这条高亮和笔记',
    text: highlight.text,
    note: highlight.note,
    prefix: highlight.prefix,
    suffix: highlight.suffix,
  })
  sendToAI(state, prompt)
}

function buildTextPrompt(doc, payload) {
  const lines = [
    `${payload.title}。`,
    `文章：${doc?.fileName || '当前文章'}`,
    '',
  ]

  if (payload.prefix || payload.suffix) {
    lines.push('上下文：')
    lines.push(clampText(`${payload.prefix || ''}【框选文本】${payload.suffix || ''}`, MAX_PROMPT_TEXT))
    lines.push('')
  }

  lines.push('框选文本：')
  lines.push(clampText(payload.text, MAX_PROMPT_TEXT))

  if (payload.note?.trim()) {
    lines.push('', '我的笔记：', payload.note.trim())
  }

  lines.push('', '请给出：1. 这段话的核心意思；2. 关键概念或隐含前提；3. 我可以继续追问的 3 个问题。')
  return lines.join('\n')
}

function sendToAI(state, prompt) {
  openPluginPanel(AI_PANEL_ID)
  window.dispatchEvent(new CustomEvent('hyperread:ai-assistant:send', {
    detail: {
      source: PANEL_ID,
      text: prompt,
    }
  }))
  setStatus(state, '已发送到 AI 助手')
}

function openPluginPanel(panelId) {
  window.dispatchEvent(new CustomEvent('hyperread:open-plugin-panel', {
    detail: { panelId }
  }))
}

function updateStatusItem(state) {
  const entry = ensureDocEntry(state)
  if (!state.statusHandle) return
  if (!entry) {
    state.statusHandle.update('记事本: —')
    return
  }

  const hasArticleNote = entry.articleNote.trim().length > 0
  const noteText = hasArticleNote ? '有全文笔记' : '无全文笔记'
  state.statusHandle.update(`记事本: ${entry.highlights.length} 高亮 · ${noteText}`)
}

function setStatus(state, text) {
  state.statusText = text
  const statusEl = state.panelEl?.querySelector('.an-status')
  if (statusEl) statusEl.textContent = text

  if (state.statusTimer) window.clearTimeout(state.statusTimer)
  state.statusTimer = window.setTimeout(() => {
    state.statusText = ''
    const nextStatusEl = state.panelEl?.querySelector('.an-status')
    if (nextStatusEl) nextStatusEl.textContent = ''
  }, 2600)
}

function getReaderRoot() {
  return (
    document.querySelector('.content-scroll article') ||
    document.querySelector('.content-scroll .prose') ||
    document.querySelector('.content-scroll')
  )
}

function clampText(text, maxLength) {
  if (!text) return ''
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function cssEscape(value) {
  if (window.CSS?.escape) return window.CSS.escape(value)
  return String(value).replace(/["\\]/g, '\\$&')
}
