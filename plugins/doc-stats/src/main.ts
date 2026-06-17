// Document Statistics for HyperRead
interface PluginAPI {
  on(event: string, handler: (data?: any) => void): void
  off(event: string, handler: (data?: any) => void): void
  addStatusBarItem(item: { id: string; text: string; tooltip?: string; onClick?: () => void }): { update(text: string): void; remove(): void }
  getActiveDocument(): { content: string; fileName: string } | null
  log(...args: unknown[]): void
}

interface DocStats {
  paragraphs: number
  sentences: number
  chineseChars: number
  englishWords: number
  totalChars: number
  lines: number
}

function analyze(text: string): DocStats {
  const lines = text.split('\n').length
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
  const sentences = text.split(/[。！？.!?]+/).filter(s => s.trim().length > 0).length
  const chineseChars = (text.match(/[一-鿿]/g) || []).length
  const nonCn = text.replace(/[一-鿿　-〿＀-￯]/g, ' ')
  const englishWords = nonCn.trim().split(/\s+/).filter(w => /[a-zA-Z]/.test(w)).length
  const totalChars = text.replace(/\s/g, '').length
  return { paragraphs, sentences, chineseChars, englishWords, totalChars, lines }
}

let detailPanel: HTMLElement | null = null

export default {
  async onload(api: PluginAPI) {
    const statusItem = api.addStatusBarItem({
      id: 'doc-stats',
      text: '📊 —',
      tooltip: '文档统计（点击查看详情）',
      onClick: () => showDetail(api)
    })

    function showDetail(api: PluginAPI) {
      const doc = api.getActiveDocument()
      if (!doc) return
      const s = analyze(doc.content)

      if (detailPanel) { detailPanel.remove(); detailPanel = null; return }

      detailPanel = document.createElement('div')
      detailPanel.className = 'doc-stats-detail'
      detailPanel.style.cssText = 'position:fixed;bottom:40px;right:16px;background:var(--background,#1e1e1e);border:1px solid var(--border,#333);border-radius:8px;padding:16px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-size:13px;min-width:220px;'
      detailPanel.innerHTML = `
        <div style="font-weight:600;margin-bottom:8px;">📊 文档统计</div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;">
          <span style="opacity:0.6">段落</span><span>${s.paragraphs}</span>
          <span style="opacity:0.6">句子</span><span>${s.sentences}</span>
          <span style="opacity:0.6">行数</span><span>${s.lines}</span>
          <span style="opacity:0.6">中文字</span><span>${s.chineseChars.toLocaleString()}</span>
          <span style="opacity:0.6">英文词</span><span>${s.englishWords.toLocaleString()}</span>
          <span style="opacity:0.6">总字符</span><span>${s.totalChars.toLocaleString()}</span>
        </div>
      `
      document.body.appendChild(detailPanel)
      const close = (e: MouseEvent) => {
        if (detailPanel && !detailPanel.contains(e.target as Node)) {
          detailPanel.remove(); detailPanel = null
          document.removeEventListener('click', close)
        }
      }
      setTimeout(() => document.addEventListener('click', close), 50)
    }

    function updateStats() {
      const doc = api.getActiveDocument()
      if (doc) {
        const s = analyze(doc.content)
        statusItem.update(`📊 ${s.chineseChars + s.englishWords} 字 · ${s.paragraphs} 段`)
      } else {
        statusItem.update('📊 —')
      }
    }

    api.on('document:open', updateStats)
    api.on('document:close', () => { statusItem.update('📊 —'); if (detailPanel) { detailPanel.remove(); detailPanel = null } })
    api.on('app:ready', updateStats)
    updateStats()
    api.log('Doc Stats plugin loaded')
  },
  async onunload() {
    if (detailPanel) { detailPanel.remove(); detailPanel = null }
  }
}
