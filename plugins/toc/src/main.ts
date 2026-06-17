// Table of Contents for HyperRead
interface PluginAPI {
  on(event: string, handler: (data?: any) => void): void
  registerSidebarPanel(panel: { id: string; title: string; icon?: string; render: (container: HTMLElement) => (() => void) | void }): { remove(): void }
  getActiveDocument(): { content: string; fileName: string } | null
  log(...args: unknown[]): void
}

interface TocEntry { level: number; text: string; id: string }

function parseHeadings(content: string): TocEntry[] {
  const lines = content.split('\n')
  const entries: TocEntry[] = []
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+)/)
    if (m) {
      const level = m[1].length
      const text = m[2].replace(/[*_`~\[\]]/g, '').trim()
      const id = 'heading-' + text.toLowerCase().replace(/[^\w一-鿿]+/g, '-').replace(/^-|-$/g, '')
      entries.push({ level, text, id })
    }
  }
  return entries
}

export default {
  async onload(api: PluginAPI) {
    api.registerSidebarPanel({
      id: 'toc',
      title: '目录',
      icon: '📑',
      render(container) {
        container.style.overflow = 'auto'
        container.style.padding = '0'

        function renderToc() {
          container.innerHTML = ''
          const doc = api.getActiveDocument()

          if (!doc) {
            container.innerHTML = '<div class="toc-empty">打开文档后显示目录</div>'
            return
          }

          const entries = parseHeadings(doc.content)
          if (entries.length === 0) {
            container.innerHTML = '<div class="toc-empty">未找到标题</div>'
            return
          }

          const header = document.createElement('div')
          header.className = 'toc-header'
          header.textContent = '📑 ' + doc.fileName.replace(/\.[^.]+$/, '')
          container.appendChild(header)

          const list = document.createElement('ul')
          list.className = 'toc-list'

          entries.forEach((entry) => {
            const li = document.createElement('li')
            li.className = 'toc-item toc-h' + Math.min(entry.level, 4)
            li.textContent = entry.text
            li.title = entry.text
            li.addEventListener('click', () => {
              // Try to scroll to heading in the viewer
              const headings = document.querySelectorAll('h1,h2,h3,h4,h5,h6')
              for (const h of headings) {
                if (h.textContent?.trim() === entry.text) {
                  h.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  break
                }
              }
              // Mark active
              list.querySelectorAll('.toc-item').forEach(el => el.classList.remove('active'))
              li.classList.add('active')
            })
            list.appendChild(li)
          })

          container.appendChild(list)
        }

        renderToc()
        api.on('document:open', () => renderToc())
        api.on('document:close', () => { container.innerHTML = '<div class="toc-empty">打开文档后显示目录</div>' })

        return () => {}
      }
    })

    api.log('TOC plugin loaded')
  },
  async onunload() {}
}
