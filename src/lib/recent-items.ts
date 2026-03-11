/**
 * 最近打开文件/目录的存储服务
 */

export interface RecentItem {
  type: 'file' | 'directory'
  filePath: string
  fileName: string
  fileType?: string
  openedAt: string // ISO timestamp
}

class RecentItemsService {
  private static readonly STORAGE_KEY = 'recent-items'
  private static readonly MAX_ITEMS = 20

  getAll(): RecentItem[] {
    try {
      const stored = localStorage.getItem(RecentItemsService.STORAGE_KEY)
      if (!stored) return []
      const items: RecentItem[] = JSON.parse(stored)
      return items.sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime())
    } catch {
      return []
    }
  }

  add(item: Omit<RecentItem, 'openedAt'>): void {
    try {
      const items = this.getAll()
      const existing = items.findIndex(i => i.filePath === item.filePath)
      if (existing !== -1) {
        items.splice(existing, 1)
      }
      items.unshift({ ...item, openedAt: new Date().toISOString() })
      const trimmed = items.slice(0, RecentItemsService.MAX_ITEMS)
      localStorage.setItem(RecentItemsService.STORAGE_KEY, JSON.stringify(trimmed))
    } catch (error) {
      console.error('Failed to save recent item:', error)
    }
  }

  remove(filePath: string): void {
    try {
      const items = this.getAll().filter(i => i.filePath !== filePath)
      localStorage.setItem(RecentItemsService.STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Failed to remove recent item:', error)
    }
  }

  clear(): void {
    localStorage.removeItem(RecentItemsService.STORAGE_KEY)
  }
}

export const recentItemsService = new RecentItemsService()
