// demo-plugin/doc-assistant/main.js
// 文档助手插件 — 演示 registerSidebarPanel + document:open 事件读取文档内容
// 注意：本插件不依赖外部 AI API，完全本地运行（简单关键词摘要）

export default {
  async onload(api) {
    let currentDoc = null
    let panelEl = null

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
        .da-keywords { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
        .da-keyword { background: var(--primary, #3b82f6); color: #fff; border-radius: 4px; padding: 2px 8px; font-size: 11px; }
        .da-qa { display: flex; flex-direction: column; gap: 6px; }
        .da-input { width: 100%; box-sizing: border-box; border: 1px solid var(--border, #e5e7eb); border-radius: 6px; padding: 6px 8px; font-size: 12px; background: var(--background); color: var(--foreground); resize: none; }
        .da-btn { background: var(--primary, #3b82f6); color: #fff; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer; }
        .da-btn:hover { opacity: 0.85; }
        .da-answer { background: var(--muted, #f5f5f5); border-radius: 6px; padding: 8px 10px; line-height: 1.6; min-height: 40px; }
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
        row.innerHTML = `<span class="da-stat-label">${label}</span><span class="da-stat-value">${value}</span>`
        statsSection.appendChild(row)
      }
      root.appendChild(statsSection)

      // --- 关键词 ---
      if (stats.keywords.length > 0) {
        const kwSection = document.createElement('div')
        kwSection.className = 'da-section'
        kwSection.innerHTML = `<div class="da-section-title">🏷 关键词</div>`
        const kwList = document.createElement('div')
        kwList.className = 'da-keywords'
        for (const kw of stats.keywords) {
          const tag = document.createElement('span')
          tag.className = 'da-keyword'
          tag.textContent = kw
          kwList.appendChild(tag)
        }
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
      const textarea = document.createElement('textarea')
      textarea.className = 'da-input'
      textarea.rows = 2
      textarea.placeholder = '输入关键词，在文档中查找相关段落…'
      const btn = document.createElement('button')
      btn.className = 'da-btn'
      btn.textContent = '搜索'
      const answer = document.createElement('div')
      answer.className = 'da-answer'
      answer.style.display = 'none'

      btn.addEventListener('click', () => {
        const q = textarea.value.trim()
        if (!q) return
        const result = searchInDoc(content, q)
        answer.style.display = 'block'
        answer.innerHTML = result ? escHtml(result) : '<em>未找到相关内容</em>'
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

      // 提取标题行作为关键词
      const headings = (text.match(/^#{1,3}\s+(.+)$/gm) || [])
        .map(h => h.replace(/^#{1,3}\s+/, '').trim())
        .slice(0, 8)

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

      return { chars, chinese, words, paragraphs, readTime, keywords: headings, summary }
    }

    function searchInDoc(text, query) {
      const lines = text.split('\n')
      const results = []
      const lq = query.toLowerCase()
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(lq)) {
          const start = Math.max(0, i - 1)
          const end = Math.min(lines.length - 1, i + 1)
          const snippet = lines.slice(start, end + 1)
            .join(' ')
            .replace(/^#+\s+/g, '')
            .replace(/[*_`]/g, '')
            .trim()
            .slice(0, 300)
          results.push(snippet)
          if (results.length >= 3) break
        }
      }
      return results.join('\n\n…\n\n')
    }

    function escHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
  },

  async onunload() {}
}
