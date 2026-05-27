// demo-plugin/doc-assistant/main.js
// 文档助手插件 — 演示 registerSidebarPanel + document:open 事件读取文档内容
// 注意：本插件不依赖外部 AI API，完全本地运行（简单关键词摘要）

export default {
  async onload(api) {
    let currentDoc = null
    let panelEl = null
    const ENGLISH_STOP_WORDS = new Set([
      'the', 'and', 'for', 'with', 'from', 'this', 'that', 'into', 'your', 'you', 'are',
      'was', 'were', 'have', 'has', 'had', 'not', 'but', 'can', 'will', 'would', 'should',
      'about', 'after', 'before', 'between', 'through', 'using', 'use', 'used', 'then',
      'than', 'when', 'where', 'what', 'which', 'each', 'also', 'more', 'less'
    ])
    const CHINESE_STOP_WORDS = new Set([
      '这个', '那个', '这些', '那些', '可以', '进行', '一个', '一种', '一些', '以及',
      '或者', '如果', '因为', '所以', '但是', '然后', '这里', '那里', '我们', '你们',
      '他们', '它们', '对于', '通过', '使用', '需要', '已经', '没有', '什么', '如何',
      '功能', '内容', '相关'
    ])
    const CHINESE_EDGE_STOP_CHARS = '的了和与及或是在对为从到以将把被中上下内后前等也都并而让能可会要'

    // --- 读取当前已打开的文档 ---
    currentDoc = api.getActiveDocument()

    // --- 监听文档打开事件 ---
    api.on('document:open', (fileData) => {
      currentDoc = fileData
      if (panelEl) renderContent(panelEl)
    })

    api.on('document:close', () => {
      currentDoc = null
      if (panelEl) renderContent(panelEl)
    })

    // --- 注册侧边栏面板 ---
    api.registerSidebarPanel({
      id: 'doc-assistant-panel',
      title: '文档助手',
      icon: '🔍',
      render(container) {
        panelEl = container
        renderContent(container)
        // 返回清理函数
        return () => { panelEl = null }
      }
    })

    api.addCommand({
      id: 'open-panel',
      name: '打开文档助手面板',
      callback() {
        api.log('文档助手面板已通过命令触发')
      }
    })

    // --- 渲染面板内容（纯 DOM） ---
    function renderContent(el) {
      el.innerHTML = ''

      const style = document.createElement('style')
      style.textContent = `
        .da-root { font-family: var(--font-sans, system-ui); font-size: 13px; color: var(--foreground); padding: 12px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
        .da-title { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .da-empty { color: var(--muted-foreground, #888); text-align: center; margin-top: 32px; line-height: 1.7; }
        .da-section { background: var(--muted, #f5f5f5); border-radius: 8px; padding: 10px 12px; }
        .da-section-title { font-weight: 600; font-size: 12px; color: var(--muted-foreground, #666); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .da-stat { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid var(--border, #e5e7eb); }
        .da-stat:last-child { border-bottom: none; }
        .da-stat-label { color: var(--muted-foreground, #666); }
        .da-stat-value { font-weight: 500; }
        .da-summary { line-height: 1.65; color: var(--foreground); }
        .da-keyword-hint { color: var(--muted-foreground, #666); font-size: 11px; line-height: 1.5; margin-bottom: 8px; }
        .da-keywords { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
        .da-keyword { background: var(--background); color: var(--foreground); border: 1px solid var(--border, #e5e7eb); border-radius: 6px; padding: 3px 8px; font-size: 11px; cursor: pointer; line-height: 1.4; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
        .da-keyword:hover { border-color: var(--primary, #3b82f6); color: var(--primary, #3b82f6); }
        .da-keyword:focus-visible { outline: 2px solid var(--primary, #3b82f6); outline-offset: 2px; }
        .da-keyword-heading { background: rgba(59, 130, 246, 0.10); border-color: var(--primary, #3b82f6); }
        .da-qa { display: flex; flex-direction: column; gap: 6px; }
        .da-input { width: 100%; box-sizing: border-box; border: 1px solid var(--border, #e5e7eb); border-radius: 6px; padding: 6px 8px; font-size: 12px; background: var(--background); color: var(--foreground); resize: none; }
        .da-btn { background: var(--primary, #3b82f6); color: #fff; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer; }
        .da-btn:hover { opacity: 0.85; }
        .da-answer { background: var(--muted, #f5f5f5); border-radius: 6px; padding: 8px 10px; line-height: 1.6; min-height: 40px; }
        .da-result-count { color: var(--muted-foreground, #666); font-size: 11px; margin-bottom: 6px; }
        .da-result { border-top: 1px solid var(--border, #e5e7eb); padding-top: 8px; margin-top: 8px; }
        .da-result:first-of-type { border-top: none; padding-top: 0; margin-top: 0; }
        .da-highlight { background: #fef08a; color: #1f2937; border-radius: 3px; padding: 0 2px; }
      `
      el.appendChild(style)

      const root = document.createElement('div')
      root.className = 'da-root'

      const title = document.createElement('div')
      title.className = 'da-title'
      title.innerHTML = '🔍 文档助手'
      root.appendChild(title)

      if (!currentDoc) {
        const empty = document.createElement('div')
        empty.className = 'da-empty'
        empty.innerHTML = '请先打开一篇文档<br>助手将自动分析文档内容'
        root.appendChild(empty)
        el.appendChild(root)
        return
      }

      const content = currentDoc.content || ''
      const stats = analyzeContent(content)
      let textarea = null
      let answer = null
      let runSearch = () => {}

      // --- 统计信息 ---
      const statsSection = document.createElement('div')
      statsSection.className = 'da-section'
      statsSection.innerHTML = `<div class="da-section-title">📊 文档统计</div>`
      const statRows = [
        ['文件名', currentDoc.fileName],
        ['文件类型', currentDoc.fileType?.toUpperCase() ?? '—'],
        ['字符数', stats.chars.toLocaleString()],
        ['汉字数', stats.chinese.toLocaleString()],
        ['英文单词', stats.words.toLocaleString()],
        ['段落数', stats.paragraphs.toLocaleString()],
        ['预计阅读', stats.readTime + ' 分钟'],
      ]
      for (const [label, value] of statRows) {
        const row = document.createElement('div')
        row.className = 'da-stat'
        const labelEl = document.createElement('span')
        labelEl.className = 'da-stat-label'
        labelEl.textContent = label
        const valueEl = document.createElement('span')
        valueEl.className = 'da-stat-value'
        valueEl.textContent = value
        row.appendChild(labelEl)
        row.appendChild(valueEl)
        statsSection.appendChild(row)
      }
      root.appendChild(statsSection)

      // --- 关键词 ---
      if (stats.keywords.length > 0) {
        const kwSection = document.createElement('div')
        kwSection.className = 'da-section'
        kwSection.innerHTML = `<div class="da-section-title">🏷 关键词</div>`
        const hint = document.createElement('div')
        hint.className = 'da-keyword-hint'
        hint.textContent = '已结合标题与正文频率提取，点击关键词可直接搜索相关段落'
        const kwList = document.createElement('div')
        kwList.className = 'da-keywords'
        for (const kw of stats.keywords) {
          const tag = document.createElement('button')
          tag.type = 'button'
          tag.className = `da-keyword${kw.source === 'heading' ? ' da-keyword-heading' : ''}`
          tag.textContent = kw.text
          tag.title = kw.source === 'heading'
            ? '来自标题，点击搜索'
            : `正文中出现 ${kw.count} 次，点击搜索`
          tag.addEventListener('click', () => {
            if (!textarea) return
            textarea.value = kw.text
            runSearch(kw.text)
          })
          kwList.appendChild(tag)
        }
        kwSection.appendChild(hint)
        kwSection.appendChild(kwList)
        root.appendChild(kwSection)
      }

      // --- 文档摘要（首段） ---
      if (stats.summary) {
        const sumSection = document.createElement('div')
        sumSection.className = 'da-section'
        sumSection.innerHTML = `<div class="da-section-title">📝 摘要</div><div class="da-summary">${escHtml(stats.summary)}</div>`
        root.appendChild(sumSection)
      }

      // --- 简单问答（全文搜索） ---
      const qaSection = document.createElement('div')
      qaSection.className = 'da-section'
      qaSection.innerHTML = `<div class="da-section-title">💬 文档内搜索</div>`
      const qaInner = document.createElement('div')
      qaInner.className = 'da-qa'
      textarea = document.createElement('textarea')
      textarea.className = 'da-input'
      textarea.rows = 2
      textarea.placeholder = '输入关键词，在文档中查找相关段落…'
      const btn = document.createElement('button')
      btn.className = 'da-btn'
      btn.textContent = '搜索'
      answer = document.createElement('div')
      answer.className = 'da-answer'
      answer.style.display = 'none'

      runSearch = (query = textarea.value) => {
        const q = query.trim()
        if (!q) return
        const result = searchInDoc(content, q)
        answer.style.display = 'block'
        answer.innerHTML = renderSearchResults(result, q)
      }

      btn.addEventListener('click', () => {
        runSearch()
      })
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); btn.click() }
      })

      qaInner.appendChild(textarea)
      qaInner.appendChild(btn)
      qaInner.appendChild(answer)
      qaSection.appendChild(qaInner)
      root.appendChild(qaSection)

      el.appendChild(root)
    }

    // --- 辅助函数 ---
    function analyzeContent(text) {
      const chars = text.length
      const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length
      const words = (text.match(/\b[a-zA-Z]+\b/g) || []).length
      const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 10).length
      const readTime = Math.max(1, Math.round((chinese + words * 2) / 300))

      const headings = (text.match(/^#{1,4}\s+(.+)$/gm) || [])
        .map(h => h.replace(/^#{1,4}\s+/, '').trim())
        .filter(Boolean)
      const keywords = extractKeywords(text, headings)

      // 首段摘要（去掉 Markdown 符号）
      const firstPara = text.split(/\n{2,}/).find(p => {
        const clean = p.replace(/^#+\s+/gm, '').replace(/[*_`#\[\]]/g, '').trim()
        return clean.length > 20
      }) || ''
      const summary = firstPara
        .replace(/^#+\s+/gm, '')
        .replace(/[*_`#\[\]]/g, '')
        .replace(/\n/g, ' ')
        .trim()
        .slice(0, 200)

      return { chars, chinese, words, paragraphs, readTime, keywords, summary }
    }

    function searchInDoc(text, query) {
      const terms = getSearchTerms(query)
      if (terms.length === 0) return []

      const blocks = buildSearchBlocks(text)
      const scored = []

      for (let i = 0; i < blocks.length; i++) {
        const normalized = normalizeSearchText(blocks[i])
        const exactHit = normalized.includes(normalizeSearchText(query))
        const hitCount = terms.reduce((count, term) => {
          return normalized.includes(normalizeSearchText(term)) ? count + 1 : count
        }, 0)

        if (!exactHit && hitCount === 0) continue

        scored.push({
          text: trimSnippet(blocks[i], terms, 360),
          score: (exactHit ? 12 : 0) + hitCount * 4 - i * 0.01
        })
      }

      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    }

    function renderSearchResults(results, query) {
      if (results.length === 0) return '<em>未找到相关内容</em>'

      const count = `<div class="da-result-count">找到 ${results.length} 个相关段落</div>`
      const items = results
        .map(result => `<div class="da-result">${highlightText(result.text, query)}</div>`)
        .join('')

      return count + items
    }

    function extractKeywords(text, headings) {
      const candidates = new Map()
      const bodyTerms = tokenizeKeywords(stripMarkdown(text), { includeChinesePhrases: true })

      headings.forEach((heading, index) => {
        const headingWeight = Math.max(4, 9 - index)
        if (!isLongChineseHeading(heading)) {
          addKeywordCandidate(candidates, heading, headingWeight, 'heading')
        }
        tokenizeKeywords(heading, { includeChinesePhrases: false }).forEach(term => {
          if (hasChinese(term) && term.length < 3) return
          addKeywordCandidate(candidates, term, headingWeight + 2, 'heading')
        })
      })

      bodyTerms.forEach((term, index) => {
        const earlyBoost = index < 160 ? 0.6 : 0
        addKeywordCandidate(candidates, term, 1 + earlyBoost, 'body')
      })

      return dedupeKeywords([...candidates.values()]
        .filter(item => item.source === 'heading' || item.count >= 2 || item.score >= 3)
        .sort((a, b) => {
          if (b.source === 'heading' && a.source !== 'heading' && b.score >= a.score - 2) return 1
          if (a.source === 'heading' && b.source !== 'heading' && a.score >= b.score - 2) return -1
          return b.score - a.score || b.text.length - a.text.length
        }))
        .slice(0, 12)
        .map(item => ({ text: item.text, count: item.count, source: item.source }))
    }

    function addKeywordCandidate(candidates, rawTerm, weight, source) {
      const text = cleanKeyword(rawTerm)
      if (!isUsefulKeyword(text)) return

      const key = canonicalKeyword(text)
      const existing = candidates.get(key)

      if (existing) {
        existing.score += weight
        existing.count += source === 'body' ? 1 : 0
        if (source === 'heading') existing.source = 'heading'
        if (source === 'heading' && text.length > existing.text.length) existing.text = text
        return
      }

      candidates.set(key, {
        key,
        text,
        score: weight,
        count: source === 'body' ? 1 : 0,
        source
      })
    }

    function tokenizeKeywords(text, options = {}) {
      const tokens = []
      const englishMatches = text.match(/[A-Za-z][A-Za-z0-9-]{2,}/g) || []
      englishMatches.forEach(word => tokens.push(word))

      extractChineseWords(text).forEach(word => tokens.push(word))
      if (options.includeChinesePhrases) {
        extractChinesePhrases(text).forEach(phrase => tokens.push(phrase))
      }
      return tokens
    }

    function extractChineseWords(text) {
      const chunks = text.match(/[\u3400-\u9fff]{2,}/g) || []
      const words = []

      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter('zh', { granularity: 'word' })
        chunks.forEach(chunk => {
          for (const part of segmenter.segment(chunk)) {
            if (part.isWordLike) words.push(part.segment)
          }
        })
        return words
      }

      chunks.forEach(chunk => {
        if (chunk.length <= 6) {
          words.push(chunk)
          return
        }

        for (let size = 2; size <= 4; size++) {
          for (let i = 0; i <= chunk.length - size; i++) {
            words.push(chunk.slice(i, i + size))
          }
        }
      })

      return words
    }

    function extractChinesePhrases(text) {
      const phraseText = text.length > 30000 ? text.slice(0, 30000) : text
      const chunks = phraseText.match(/[\u3400-\u9fff]{3,}/g) || []
      const phrases = []

      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter('zh', { granularity: 'word' })

        chunks.forEach(chunk => {
          const parts = [...segmenter.segment(chunk)]
            .filter(part => part.isWordLike)
            .map(part => part.segment)

          for (let i = 0; i < parts.length; i++) {
            if (parts[i].length < 2) continue
            let phrase = parts[i]

            for (let j = i + 1; j < Math.min(parts.length, i + 3); j++) {
              phrase += parts[j]
              if (phrase.length >= 3 && phrase.length <= 8) phrases.push(phrase)
            }
          }
        })

        return phrases
      }

      chunks.forEach(chunk => {
        const maxSize = Math.min(6, chunk.length)
        for (let size = maxSize; size >= 3; size--) {
          for (let i = 0; i <= chunk.length - size; i++) {
            phrases.push(chunk.slice(i, i + size))
          }
        }
      })

      return phrases
    }

    function dedupeKeywords(items) {
      const selected = []

      for (const item of items) {
        if (hasBetterChinesePhrase(items, item)) continue

        const duplicate = selected.some(existing => {
          if (existing.key === item.key) return true
          const bothChinese = hasChinese(existing.text) && hasChinese(item.text)
          if (!bothChinese) return false
          return existing.key.includes(item.key) && item.key.length <= 2 && existing.score >= item.score
        })

        if (!duplicate) selected.push(item)
      }

      return selected
    }

    function hasBetterChinesePhrase(items, item) {
      if (!hasChinese(item.text) || item.key.length > 2) return false

      return items.some(other => {
        if (other.key === item.key || !hasChinese(other.text)) return false
        return other.key.includes(item.key) &&
          other.key.length > item.key.length &&
          other.score >= item.score * 0.55
      })
    }

    function cleanKeyword(term) {
      return String(term)
        .replace(/^#{1,6}\s+/, '')
        .replace(/^\d+[.)、]\s*/, '')
        .replace(/!\[[^\]]*]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
        .replace(/[`*_~>#|\\]/g, ' ')
        .replace(/^[^\u3400-\u9fffA-Za-z0-9]+/, '')
        .replace(/[^\u3400-\u9fffA-Za-z0-9]+$/, '')
        .replace(/^[\s.,，。:：;；!?！？()[\]{}"'“”‘’<>《》-]+/, '')
        .replace(/[\s.,，。:：;；!?！？()[\]{}"'“”‘’<>《》-]+$/, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    function canonicalKeyword(term) {
      return term.toLowerCase().replace(/\s+/g, ' ')
    }

    function isUsefulKeyword(term) {
      const key = canonicalKeyword(term)
      if (!key || key.length < 2 || key.length > 32) return false
      if (/^\d+$/.test(key)) return false
      if (hasChinese(term)) {
        if (term.length < 2 || term.length > 14) return false
        if (term.length > 2 && (
          CHINESE_EDGE_STOP_CHARS.includes(term[0]) ||
          CHINESE_EDGE_STOP_CHARS.includes(term[term.length - 1])
        )) return false
        return !CHINESE_STOP_WORDS.has(term)
      }
      if (key.length < 3) return false
      return !ENGLISH_STOP_WORDS.has(key)
    }

    function isLongChineseHeading(heading) {
      const text = cleanKeyword(heading)
      return hasChinese(text) && text.replace(/\s+/g, '').length > 8
    }

    function buildSearchBlocks(text) {
      const paragraphs = text
        .split(/\n{2,}/)
        .map(block => stripMarkdown(block).replace(/\s+/g, ' ').trim())
        .filter(block => block.length > 0)

      if (paragraphs.length > 0) return paragraphs

      return text
        .split('\n')
        .map(line => stripMarkdown(line).trim())
        .filter(Boolean)
    }

    function getSearchTerms(query) {
      const terms = [query.trim(), ...tokenizeKeywords(query, { includeChinesePhrases: false })]
        .map(cleanKeyword)
        .filter(Boolean)

      return [...new Set(terms)].sort((a, b) => b.length - a.length)
    }

    function normalizeSearchText(text) {
      return stripMarkdown(text).toLowerCase().replace(/\s+/g, ' ').trim()
    }

    function trimSnippet(text, terms, maxLength) {
      const compact = text.replace(/\s+/g, ' ').trim()
      if (compact.length <= maxLength) return compact

      const lower = compact.toLowerCase()
      const firstHit = terms
        .map(term => lower.indexOf(term.toLowerCase()))
        .filter(index => index >= 0)
        .sort((a, b) => a - b)[0] ?? 0
      const start = Math.max(0, firstHit - Math.floor(maxLength / 3))
      const end = Math.min(compact.length, start + maxLength)
      const prefix = start > 0 ? '…' : ''
      const suffix = end < compact.length ? '…' : ''

      return prefix + compact.slice(start, end).trim() + suffix
    }

    function stripMarkdown(text) {
      return text
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/[*_~>#|\\]/g, ' ')
    }

    function highlightText(text, query) {
      const terms = getSearchTerms(query).filter(term => term.length > 1)
      if (terms.length === 0) return escHtml(text)

      const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi')
      return escHtml(text).replace(pattern, '<mark class="da-highlight">$1</mark>')
    }

    function escapeRegExp(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    function hasChinese(text) {
      return /[\u3400-\u9fff]/.test(text)
    }

    function escHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

  },

  async onunload() {}
}
