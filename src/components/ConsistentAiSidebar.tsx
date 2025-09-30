'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Send, Bot, User, Settings, Copy, Check, Trash2, FileText, MessageSquare, Layers, Clock, History, UserCog, ChevronDown } from 'lucide-react'
import { createAiService } from '@/lib/ai-service'
import { conversationStorage } from '@/lib/conversation-storage'
import { toast } from "sonner"
import { useT } from '@/lib/i18n'

interface ConsistentAiSidebarProps {
  isOpen: boolean
  onClose: () => void
  currentDocument?: {
    fileName: string
    content: string
    filePath: string
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface AiConfig {
  provider: string
  apiKey: string
  apiUrl: string
  model: string
  isConfigured: boolean
}

interface AiRole {
  id: string
  name: string
  systemPrompt: string
  description?: string
  isDefault?: boolean
}

export default function ConsistentAiSidebar({ isOpen, onClose, currentDocument }: ConsistentAiSidebarProps) {
  const t = useT()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiConfig, setAiConfig] = useState<AiConfig>({
    provider: 'custom',
    apiKey: '',
    apiUrl: '',
    model: '',
    isConfigured: false
  })
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [aiRoles, setAiRoles] = useState<AiRole[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<string>('default')
  const [showRoleSelector, setShowRoleSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousDocumentRef = useRef<typeof currentDocument>(null)

  // 加载 AI 配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setAiConfig({
          ...config,
          provider: 'custom', // 强制使用自定义服务商
          isConfigured: !!(config.apiKey && config.model && config.apiUrl)
        })
      } catch (error) {
        console.error('Failed to load AI config:', error)
      }
    }

    // 加载 AI 角色
    const savedRoles = localStorage.getItem('ai-roles')
    if (savedRoles) {
      try {
        const roles = JSON.parse(savedRoles)
        setAiRoles(roles)
      } catch (error) {
        console.error('Failed to load AI roles:', error)
      }
    }
  }, [isOpen])

  // 保存当前文档引用，用于在文档切换时保存对话
  useEffect(() => {
    previousDocumentRef.current = currentDocument
  }, [currentDocument])

  // 组件卸载时保存对话历史
  useEffect(() => {
    return () => {
      if (previousDocumentRef.current && messages.length > 0) {
        conversationStorage.saveConversation(
          previousDocumentRef.current.filePath,
          previousDocumentRef.current.fileName,
          messages,
          previousDocumentRef.current.content
        )
      }
    }
  }, [])

  // 处理文档切换
  useEffect(() => {
    if (!isOpen) return

    if (currentDocument) {
      // 加载当前文档的对话历史
      const savedMessages = conversationStorage.loadConversation(
        currentDocument.filePath,
        currentDocument.fileName,
        currentDocument.content
      )

      if (savedMessages.length > 0) {
        // 如果有保存的对话，直接加载
        setMessages(savedMessages)
      } else {
        // 如果没有保存的对话，创建新的系统消息
        setMessages([createSystemMessage()])
      }
    } else if (messages.length === 0) {
      // 没有当前文档且没有消息时，创建通用系统消息
      setMessages([createSystemMessage()])
    }
  }, [isOpen, currentDocument?.filePath])

  // 自动保存对话历史
  useEffect(() => {
    if (currentDocument && messages.length > 1) { // 至少有系统消息+1条其他消息才保存
      const timeoutId = setTimeout(() => {
        conversationStorage.saveConversation(
          currentDocument.filePath,
          currentDocument.fileName,
          messages,
          currentDocument.content
        )
      }, 2000) // 2秒延迟保存，避免频繁保存

      return () => clearTimeout(timeoutId)
    }
  }, [messages, currentDocument])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // 创建系统消息
  const createSystemMessage = (): Message => {
    const selectedRole = aiRoles.find(r => r.id === selectedRoleId) || aiRoles.find(r => r.isDefault)
    let systemPrompt = selectedRole?.systemPrompt || 'You are a professional document analysis assistant. Help users analyze document content, answer technical questions, provide suggestions, etc. Keep answers accurate, helpful, and friendly.'

    if (currentDocument) {
      systemPrompt = `${systemPrompt}\n\nThe user is currently viewing the document "${currentDocument.fileName}".\n\nDocument content:\n${currentDocument.content.substring(0, 3000)}${currentDocument.content.length > 3000 ? '...\n\n(Document content truncated, please tell the user if they need to see the complete content)' : ''}\n\nPlease answer user questions based on this document content. If users ask about document-related content, please specifically cite content from the document.`
    }

    return {
      id: 'system-init',
      role: 'system',
      content: systemPrompt,
      timestamp: new Date()
    }
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !aiConfig.isConfigured) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    const originalQuestion = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    try {
      const aiService = createAiService(aiConfig)

      // 常规处理
      const aiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const aiResponse = await aiService.sendMessage(aiMessages)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI request failed:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `${t('aiSidebar.messages.errorPrefix')} ${error instanceof Error ? error.message : 'Unknown error'}${t('aiSidebar.messages.errorNetwork')}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    const systemMessage = messages.find(m => m.role === 'system')
    setMessages(systemMessage ? [systemMessage] : [])

    // 清空保存的对话历史
    if (currentDocument) {
      conversationStorage.deleteConversation(currentDocument.filePath)
    }
  }

  const displayMessages = messages.filter(m => m.role !== 'system')

  return (
    <div className={`fixed top-14 right-0 h-[calc(100vh-56px)] w-72 min-w-72 z-40 macos-sidebar flex flex-col border-l border-border transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      {/* 头部 - 与FileList保持一致 */}
      <div className="px-2 py-2 border-b border-border/50 flex-shrink-0 bg-background/80">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2 flex-1">
            {currentDocument && (
              <>
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate macos-text" title={currentDocument.fileName}>
                  {currentDocument.fileName}
                </span>
                {messages.length > 1 && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <History className="h-3 w-3 text-green-500" />
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!aiConfig.isConfigured && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toast.error(t('aiSidebar.messages.needConfiguration'))
                }}
                className="h-6 w-6 p-0 macos-button flex-shrink-0"
                title={t('aiSidebar.tooltips.configureAi')}
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="h-6 w-6 p-0 macos-button flex-shrink-0"
              title={t('aiSidebar.tooltips.clearChat')}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 macos-button flex-shrink-0"
              title={t('aiSidebar.tooltips.close')}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* AI 状态 - 简洁版 */}
      {aiConfig.isConfigured && (
        <div className="px-2 py-1.5 text-xs text-muted-foreground bg-background/80 border-b border-border/30">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="macos-text">
              {aiConfig.provider === 'openai' && 'OpenAI'}
              {aiConfig.provider === 'anthropic' && 'Anthropic'}
              {aiConfig.provider === 'custom' && t('settings.ai.providerOptions.custom')}
              {' · '}
              {aiConfig.model}
            </span>
          </div>
        </div>
      )}

      {/* 消息区域 - 使用sidebar-scroll */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <div className="p-2 space-y-1">
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <div className="w-10 h-10 bg-muted/60 rounded-md flex items-center justify-center mb-3">
                <Bot className="h-5 w-5 text-muted-foreground" />
              </div>
              <h4 className="text-sm font-medium mb-1 macos-text">{t('aiSidebar.messages.startConversation')}</h4>
              <p className="text-xs text-muted-foreground mb-4 max-w-[220px] macos-text">
                {currentDocument
                  ? (conversationStorage.loadConversation(currentDocument.filePath, currentDocument.fileName).length > 1
                      ? t('aiSidebar.messages.analysisReadyWithHistory', { fileName: currentDocument.fileName })
                      : t('aiSidebar.messages.analysisReady', { fileName: currentDocument.fileName }))
                  : t('aiSidebar.messages.generalAssistant')}
              </p>
              {currentDocument && (
                <div className="w-full space-y-1">
                  <p className="text-xs font-medium text-muted-foreground macos-text">{t('aiSidebar.suggestions.title')}</p>
                  <div className="space-y-1 text-xs">
                    {[
                      t('aiSidebar.suggestions.whatIsThis'),
                      t('aiSidebar.suggestions.summarize'),
                      t('aiSidebar.suggestions.explainConcept')
                    ].map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="justify-start h-7 px-2 py-1 w-full text-left transition-all duration-150 macos-file-item text-muted-foreground hover:text-foreground"
                        onClick={() => setInputValue(suggestion)}
                      >
                        <span className="truncate text-xs macos-text">{suggestion}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}

                  <div className={`group flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-lg px-3 py-2 text-xs macos-text leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background/80 border border-border/30 text-foreground'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <span className="text-xs text-muted-foreground font-mono">
                        {message.timestamp.toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="h-5 w-5 p-0 macos-button"
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="h-2.5 w-2.5 text-green-500" />
                          ) : (
                            <Copy className="h-2.5 w-2.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-6 h-6 bg-muted/60 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-primary animate-pulse" />
                  </div>
                  <div className="bg-background/80 border border-border/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground macos-text">{t('aiSidebar.status.thinking')}</span>
                      <div className="flex gap-0.5">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 - 与FileList搜索框保持一致 */}
      <div className="px-2 py-2 border-t border-border/50 flex-shrink-0 bg-background/80">
        {!aiConfig.isConfigured && (
          <div className="mb-2 p-2 rounded-lg border border-border/30 bg-background/60">
            <div className="flex items-center gap-1.5">
              <Settings className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground macos-text">
                {t('aiSidebar.messages.needConfiguration')}
              </p>
            </div>
          </div>
        )}

        {/* 角色选择器 */}
        {aiRoles.length > 0 && (
          <div className="mb-2 relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="w-full h-7 justify-between text-xs macos-button"
            >
              <div className="flex items-center gap-1.5">
                <UserCog className="h-3 w-3" />
                <span>{aiRoles.find(r => r.id === selectedRoleId)?.name || t('settings.roles.selectRole')}</span>
              </div>
              <ChevronDown className="h-3 w-3" />
            </Button>

            {/* 角色下拉菜单 */}
            {showRoleSelector && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-background border border-border/30 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                {aiRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRoleId(role.id)
                      setShowRoleSelector(false)
                      // 更新系统消息
                      const systemMessage = createSystemMessage()
                      setMessages(prev => {
                        const filtered = prev.filter(m => m.role !== 'system')
                        return [systemMessage, ...filtered]
                      })
                      toast.success(`${t('settings.roles.switchedTo')} ${role.name}`)
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-muted/50 transition-colors ${
                      selectedRoleId === role.id ? 'bg-primary/10 text-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="font-medium">{role.name}</div>
                        {role.description && (
                          <div className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{role.description}</div>
                        )}
                      </div>
                      {selectedRoleId === role.id && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              placeholder={aiConfig.isConfigured ? t('aiSidebar.placeholders.input') : t('aiSidebar.placeholders.inputDisabled')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || !aiConfig.isConfigured}
              className="h-6 text-xs bg-background/50 border-border/30 focus:border-border/60"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading || !aiConfig.isConfigured}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 macos-button flex-shrink-0"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
        {aiConfig.isConfigured && (
          <p className="mt-1.5 text-xs text-muted-foreground text-center macos-text">
            {t('aiSidebar.status.enterToSend')} · {t('aiSidebar.status.shiftEnterForNewLine')}
          </p>
        )}
      </div>
    </div>
  )
}