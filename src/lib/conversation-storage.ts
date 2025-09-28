interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface ConversationHistory {
  filePath: string
  fileName: string
  messages: Message[]
  lastUpdated: Date
  documentHash?: string // 用于检测文档是否发生变化
}

class ConversationStorageService {
  private static readonly STORAGE_KEY = 'ai-conversations'
  private static readonly MAX_CONVERSATIONS = 100 // 最多保存100个文档的对话历史

  // 生成文档的唯一标识符
  private generateDocumentKey(filePath: string): string {
    // 使用文件路径的 hash 作为键，避免特殊字符问题
    return btoa(encodeURIComponent(filePath)).replace(/[/+=]/g, '_')
  }

  // 生成文档内容的简单hash
  private generateContentHash(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return hash.toString(36)
  }

  // 获取所有对话历史
  private getAllConversations(): Record<string, ConversationHistory> {
    try {
      const stored = localStorage.getItem(ConversationStorageService.STORAGE_KEY)
      if (!stored) return {}

      const parsed = JSON.parse(stored)

      // 转换日期字符串回Date对象
      Object.values(parsed as Record<string, ConversationHistory>).forEach((conv: ConversationHistory) => {
        conv.lastUpdated = new Date(conv.lastUpdated)
        conv.messages.forEach(msg => {
          msg.timestamp = new Date(msg.timestamp)
        })
      })

      return parsed
    } catch (error) {
      console.error('Failed to load conversation history:', error)
      return {}
    }
  }

  // 保存所有对话历史
  private saveAllConversations(conversations: Record<string, ConversationHistory>): void {
    try {
      // 清理超过数量限制的对话
      const entries = Object.entries(conversations)
      if (entries.length > ConversationStorageService.MAX_CONVERSATIONS) {
        // 按最后更新时间排序，保留最新的
        entries.sort((a, b) => b[1].lastUpdated.getTime() - a[1].lastUpdated.getTime())
        const toKeep = entries.slice(0, ConversationStorageService.MAX_CONVERSATIONS)
        conversations = Object.fromEntries(toKeep)
      }

      localStorage.setItem(ConversationStorageService.STORAGE_KEY, JSON.stringify(conversations))
    } catch (error) {
      console.error('Failed to save conversation history:', error)
    }
  }

  // 加载特定文档的对话历史
  loadConversation(filePath: string, fileName: string, documentContent?: string): Message[] {
    const conversations = this.getAllConversations()
    const docKey = this.generateDocumentKey(filePath)
    const conversation = conversations[docKey]

    if (!conversation) {
      return [] // 没有历史对话
    }

    // 检查文档是否发生变化
    if (documentContent) {
      const currentHash = this.generateContentHash(documentContent)
      if (conversation.documentHash && conversation.documentHash !== currentHash) {
        // 文档内容发生变化，清空对话历史但保留系统消息
        console.log('Document content changed, clearing conversation history')
        const systemMessages = conversation.messages.filter(msg => msg.role === 'system')
        return systemMessages
      }
    }

    return conversation.messages
  }

  // 保存对话历史
  saveConversation(
    filePath: string,
    fileName: string,
    messages: Message[],
    documentContent?: string
  ): void {
    const conversations = this.getAllConversations()
    const docKey = this.generateDocumentKey(filePath)

    const conversationHistory: ConversationHistory = {
      filePath,
      fileName,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp) // 确保是Date对象
      })),
      lastUpdated: new Date(),
      documentHash: documentContent ? this.generateContentHash(documentContent) : undefined
    }

    conversations[docKey] = conversationHistory
    this.saveAllConversations(conversations)
  }

  // 删除特定文档的对话历史
  deleteConversation(filePath: string): void {
    const conversations = this.getAllConversations()
    const docKey = this.generateDocumentKey(filePath)

    if (conversations[docKey]) {
      delete conversations[docKey]
      this.saveAllConversations(conversations)
    }
  }

  // 获取所有有对话历史的文档列表
  getConversationList(): Array<{
    filePath: string
    fileName: string
    lastUpdated: Date
    messageCount: number
  }> {
    const conversations = this.getAllConversations()

    return Object.values(conversations)
      .map(conv => ({
        filePath: conv.filePath,
        fileName: conv.fileName,
        lastUpdated: conv.lastUpdated,
        messageCount: conv.messages.filter(msg => msg.role !== 'system').length
      }))
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
  }

  // 清空所有对话历史
  clearAllConversations(): void {
    localStorage.removeItem(ConversationStorageService.STORAGE_KEY)
  }

  // 导出对话历史（用于备份）
  exportConversations(): string {
    const conversations = this.getAllConversations()
    return JSON.stringify(conversations, null, 2)
  }

  // 导入对话历史（用于恢复）
  importConversations(data: string): boolean {
    try {
      const conversations = JSON.parse(data)
      this.saveAllConversations(conversations)
      return true
    } catch (error) {
      console.error('Failed to import conversations:', error)
      return false
    }
  }

  // 获取存储使用情况
  getStorageInfo(): {
    conversationCount: number
    storageSize: number
    maxConversations: number
  } {
    const conversations = this.getAllConversations()
    const storageSize = new Blob([localStorage.getItem(ConversationStorageService.STORAGE_KEY) || '']).size

    return {
      conversationCount: Object.keys(conversations).length,
      storageSize,
      maxConversations: ConversationStorageService.MAX_CONVERSATIONS
    }
  }
}

// 导出单例实例
export const conversationStorage = new ConversationStorageService()

// 导出类型
export type { Message, ConversationHistory }