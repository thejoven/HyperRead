// Recent Files for HyperRead
interface PluginAPI {
  on(event: string, handler: (data?: any) => void): void
  registerSidebarPanel(panel: { id: string; title: string; icon?: string; render: (container: HTMLElement) => (() => void) | void }): { remove(): void }
  getActiveDocument(): { content: string; fileName: string; filePath: string } | null
  readFile(path: string): Promise<any>
  getSetting<T>(key: string): T | undefined
  loadData(): Promise<Record<string, unknown>>
  saveData(data: Record<string, unknown>): Promise<void>
  log(...args: unknown[]): void
}

interface RecentEntry { fileName: string; filePath: string; lastOpened: number }

const FILE_ICONS: Record<string, string> = {
  md: '📝', pdf: '📕', epub: '📚', html: '🌐', txt: '📄', json: '📋', csv: '📊'
}

function getIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  return FILE_ICONS[ext] || '📄'
}

function formatTime(ts: number): string {
  const now = Date.now()
  const diff = now - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + ' 天前'
  return new Date(ts).toLocaleDateString()
}

export default {
  async onload(api: PluginAPI) {
    const maxItems = api.getSetting<number>('maxItems') || 50
    let recentFiles: RecentEntry[] = []

    // Load saved data
    const saved = await api.loadData()
    if (saved?.files && Array.isArray(saved.files)) {
      recentFiles = saved.files as RecentEntry[]
    }

    function saveFiles() {
      api.saveData({ files: recentFiles.slice(0, maxItems) })
    }

    function addRecent(fileName: string, filePath: string) {
      recentFiles = recentFiles.filter(f => f.filePath !== filePath)
      recentFiles.unshift({ fileName, filePath, lastOpened: Date.now() })
      recentFiles = recentFiles.slice(0, maxItems)
      saveFiles()
    }

    api.registerSidebarPanel({
      id: 'recent-files',
      title: '最近文件',
      icon: '🕐',
      render(container) {
        container.style.overflow = 'auto'
        container.style.padding = '0'

        function renderList() {
          container.innerHTML = ''
          if (recentFiles.length === 0) {
            container.innerHTML = '<div class="recent-empty">暂无最近打开的文件</div>'
            return
          }

          const header = document.createElement('div')
          header.className = 'recent-header'
          header.innerHTML = '<span>🕐 最近文件 (' + recentFiles.length + ')</span>'
          const clearBtn = document.createElement('span')
          clearBtn.className = 'recent-clear'
          clearBtn.textContent = '清空'
          clearBtn.addEventListener('click', () => { recentFiles = []; saveFiles(); renderList() })
          header.appendChild(clearBtn)
          container.appendChild(header)

          const list = document.createElement('ul')
          list.className = 'recent-list'

          recentFiles.forEach(entry => {
            const li = document.createElement('li')
            li.className = 'recent-item'
            li.innerHTML = `
              <span class="recent-item-icon">${getIcon(entry.fileName)}</span>
              <div class="recent-item-info">
                <div class="recent-item-name">${entry.fileName}</div>
                <div class="recent-item-path">${entry.filePath}</div>
              </div>
              <span class="recent-item-time">${formatTime(entry.lastOpened)}</span>
            `
            li.addEventListener('click', async () => {
              try { await api.readFile(entry.filePath) } catch (e) { api.log('Failed to open', e) }
            })
            list.appendChild(li)
          })

          container.appendChild(list)
        }

        renderList()
        api.on('document:open', () => {
          const doc = api.getActiveDocument()
          if (doc) { addRecent(doc.fileName, doc.filePath); renderList() }
        })

        return () => {}
      }
    })

    // Track initial file
    const initialDoc = api.getActiveDocument()
    if (initialDoc) addRecent(initialDoc.fileName, initialDoc.filePath)

    api.log('Recent Files plugin loaded')
  },
  async onunload() {}
}
