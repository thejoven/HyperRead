/**
 * EPUB 阅读进度存储服务
 * 用于保存和恢复 EPUB 文件的阅读位置
 */

export interface ReadingProgress {
  filePath: string
  fileName: string
  cfi: string              // EPUB CFI (Canonical Fragment Identifier) - 精确定位
  currentPage: number      // 当前页码
  totalPages: number       // 总页码
  percentage: number       // 阅读百分比 (0-100)
  lastReadAt: Date         // 最后阅读时间
}

class EpubReadingProgressService {
  private static readonly STORAGE_KEY = 'epub-reading-progress'
  private static readonly MAX_RECORDS = 200 // 最多保存200本书的阅读进度

  // 生成文档的唯一标识符
  private generateDocumentKey(filePath: string): string {
    // 使用文件路径的 hash 作为键，避免特殊字符问题
    return btoa(encodeURIComponent(filePath)).replace(/[/+=]/g, '_')
  }

  // 获取所有阅读进度
  private getAllProgress(): Record<string, ReadingProgress> {
    try {
      const stored = localStorage.getItem(EpubReadingProgressService.STORAGE_KEY)
      if (!stored) return {}

      const parsed = JSON.parse(stored)

      // 转换日期字符串回 Date 对象
      Object.values(parsed as Record<string, ReadingProgress>).forEach((progress: ReadingProgress) => {
        progress.lastReadAt = new Date(progress.lastReadAt)
      })

      return parsed
    } catch (error) {
      console.error('Failed to load reading progress:', error)
      return {}
    }
  }

  // 保存所有阅读进度
  private saveAllProgress(progressRecords: Record<string, ReadingProgress>): void {
    try {
      // 清理超过数量限制的记录
      const entries = Object.entries(progressRecords)
      if (entries.length > EpubReadingProgressService.MAX_RECORDS) {
        // 按最后阅读时间排序，保留最新的
        entries.sort((a, b) => b[1].lastReadAt.getTime() - a[1].lastReadAt.getTime())
        const toKeep = entries.slice(0, EpubReadingProgressService.MAX_RECORDS)
        progressRecords = Object.fromEntries(toKeep)
      }

      localStorage.setItem(EpubReadingProgressService.STORAGE_KEY, JSON.stringify(progressRecords))
    } catch (error) {
      console.error('Failed to save reading progress:', error)
    }
  }

  /**
   * 保存阅读进度
   */
  saveProgress(
    filePath: string,
    fileName: string,
    cfi: string,
    currentPage: number,
    totalPages: number
  ): void {
    const progressRecords = this.getAllProgress()
    const docKey = this.generateDocumentKey(filePath)

    const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0

    const progress: ReadingProgress = {
      filePath,
      fileName,
      cfi,
      currentPage,
      totalPages,
      percentage,
      lastReadAt: new Date()
    }

    progressRecords[docKey] = progress
    this.saveAllProgress(progressRecords)
  }

  /**
   * 获取阅读进度
   * @returns 如果有保存的进度返回进度对象，否则返回 null
   */
  getProgress(filePath: string): ReadingProgress | null {
    const progressRecords = this.getAllProgress()
    const docKey = this.generateDocumentKey(filePath)
    return progressRecords[docKey] || null
  }

  /**
   * 检查是否有保存的阅读进度
   */
  hasProgress(filePath: string): boolean {
    return this.getProgress(filePath) !== null
  }

  /**
   * 删除特定文件的阅读进度
   */
  deleteProgress(filePath: string): void {
    const progressRecords = this.getAllProgress()
    const docKey = this.generateDocumentKey(filePath)

    if (progressRecords[docKey]) {
      delete progressRecords[docKey]
      this.saveAllProgress(progressRecords)
    }
  }

  /**
   * 获取所有有阅读进度的文件列表
   */
  getProgressList(): ReadingProgress[] {
    const progressRecords = this.getAllProgress()

    return Object.values(progressRecords)
      .sort((a, b) => b.lastReadAt.getTime() - a.lastReadAt.getTime())
  }

  /**
   * 清空所有阅读进度
   */
  clearAllProgress(): void {
    localStorage.removeItem(EpubReadingProgressService.STORAGE_KEY)
  }

  /**
   * 导出阅读进度（用于备份）
   */
  exportProgress(): string {
    const progressRecords = this.getAllProgress()
    return JSON.stringify(progressRecords, null, 2)
  }

  /**
   * 导入阅读进度（用于恢复）
   */
  importProgress(data: string): boolean {
    try {
      const progressRecords = JSON.parse(data)
      this.saveAllProgress(progressRecords)
      return true
    } catch (error) {
      console.error('Failed to import reading progress:', error)
      return false
    }
  }

  /**
   * 获取存储使用情况
   */
  getStorageInfo(): {
    recordCount: number
    storageSize: number
    maxRecords: number
  } {
    const progressRecords = this.getAllProgress()
    const storageSize = new Blob([localStorage.getItem(EpubReadingProgressService.STORAGE_KEY) || '']).size

    return {
      recordCount: Object.keys(progressRecords).length,
      storageSize,
      maxRecords: EpubReadingProgressService.MAX_RECORDS
    }
  }

  /**
   * 格式化最后阅读时间为友好的显示文本
   */
  formatLastReadTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) {
      return '刚刚'
    } else if (diffMins < 60) {
      return `${diffMins} 分钟前`
    } else if (diffHours < 24) {
      return `${diffHours} 小时前`
    } else if (diffDays < 7) {
      return `${diffDays} 天前`
    } else {
      return date.toLocaleDateString()
    }
  }
}

// 导出单例实例
export const epubReadingProgress = new EpubReadingProgressService()
