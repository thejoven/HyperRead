// Bookmark Manager for HyperRead
interface PluginAPI {
  on(event: string, handler: (data?: any) => void): void
  registerSidebarPanel(panel: { id: string; title: string; icon?: string; render: (container: HTMLElement) => (() => void) | void }): { remove(): void }
  registerDocumentAction(action: { id: string; title: string; icon: string; fileTypes: string[]; onClick: (ctx: any) => void }): { remove(): void }
  getActiveDocument(): { content: string; fileName: string; filePath: string; fileType?: string } | null
  readFile(path: string): Promise<any>
  loadData(): Promise<Record<string, unknown>>
  saveData(data: Record<string, unknown>): Promise<void>
  log(...args: unknown[]): void
}

interface BookmarkEntry { fileName: string; filePath: string; addedAt: number }

function showToast(msg: string) {
  const t = document.createElement('div')
  t.className = 'bm-toast'
  t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => t.remove(), 2000)
}

export default {
  async onload(api: PluginAPI) {
    let bookmarks: BookmarkEntry[] = []
    const saved = await api.loadData()
    if (saved?.bookmarks && Array.isArray(saved.bookmarks)) {
      bookmarks = saved.bookmarks as BookmarkEntry[]
    }

    function save() { api.saveData({ bookmarks }) }

    function isBookmarked(filePath: string): boolean {
      return bookmarks.some(b => b.filePath === filePath)
    }

    function toggleBookmark() {
      const doc = api.getActiveDocument()
      if (!doc) return
      if (isBookmarked(doc.filePath)) {
        bookmarks = bookmarks.filter(b => b.filePath !== doc.filePath)
        showToast('已取消书签')
      } else {
        bookmarks.unshift({ fileName: doc.fileName, filePath: doc.filePath, addedAt: Date.now() })
        showToast('已添加书签 ⭐')
      }
      save()
    }

    // Register document action (appears in document toolbar)
    api.registerDocumentAction({
      id: 'toggle-bookmark',
      title: '收藏书签',
      icon: '⭐',
      fileTypes: ['markdown', 'pdf', 'epub', 'html', 'text'],
      onClick: () => toggleBookmark()
    })

    api.registerSidebarPanel({
      id: 'bookmarks',
      title: '书签',
      icon: '⭐',
      render(container) {
        container.style.overflow = 'auto'
        container.style.padding = '0'

        function renderList() {
          container.innerHTML = ''
          if (bookmarks.length === 0) {
            container.innerHTML = '<div class="bm-empty">⭐ 暂无书签<br><small>在文档操作中点击 ⭐ 收藏</small></div>'
            return
          }

          const header = document.createElement('div')
          header.className = 'bm-header'
          header.textContent = '⭐ 书签 (' + bookmarks.length + ')'
          container.appendChild(header)

          const list = document.createElement('ul')
          list.className = 'bm-list'

          bookmarks.forEach((bm, idx) => {
            const li = document.createElement('li')
            li.className = 'bm-item'
            li.innerHTML = `
              <span class="bm-item-icon">📄</span>
              <div class="bm-item-info">
                <div class="bm-item-name">${bm.fileName}</div>
                <div class="bm-item-path">${bm.filePath}</div>
              </div>
              <span class="bm-item-remove" title="移除书签">✕</span>
            `
            li.querySelector('.bm-item-info')!.addEventListener('click', async () => {
              try { await api.readFile(bm.filePath) } catch (e) { api.log('Failed to open', e) }
            })
            li.querySelector('.bm-item-remove')!.addEventListener('click', (e) => {
              e.stopPropagation()
              bookmarks.splice(idx, 1)
              save()
              renderList()
            })
            list.appendChild(li)
          })

          container.appendChild(list)
        }

        renderList()
        // Re-render when document changes (bookmark state may have changed)
        api.on('document:open', renderList)
        api.on('document:close', renderList)

        return () => {}
      }
    })

    api.log('Bookmark plugin loaded')
  },
  async onunload() {}
}
