'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Send, Bot, User, Settings, Copy, Check, Trash2, FileText, MessageSquare } from 'lucide-react'
import { createAiService } from '@/lib/ai-service'

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

export default function ConsistentAiSidebar({ isOpen, onClose, currentDocument }: ConsistentAiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiConfig, setAiConfig] = useState<AiConfig>({
    provider: 'openai',
    apiKey: '',
    apiUrl: '',
    model: '',
    isConfigured: false
  })
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 加载 AI 配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setAiConfig({
          ...config,
          isConfigured: !!(config.apiKey && config.model)
        })
      } catch (error) {
        console.error('Failed to load AI config:', error)
      }
    }
  }, [isOpen])

  // 当文档切换时重新初始化对话
  useEffect(() => {
    if (isOpen && currentDocument) {
      const systemMessage: Message = {
        id: 'system-init',
        role: 'system',
        content: `你是一个专业的文档分析助手。当前用户正在查看文档"${currentDocument.fileName}"。

文档内容：
${currentDocument.content.substring(0, 3000)}${currentDocument.content.length > 3000 ? '...\n\n(文档内容已截断，如需查看完整内容请告诉用户)' : ''}

请基于这个文档内容来回答用户的问题。如果用户询问文档相关内容，请具体引用文档中的内容。保持回答准确、有用且友好。使用中文回答。`,
        timestamp: new Date()
      }
      setMessages([systemMessage])
    } else if (isOpen && !currentDocument && messages.length === 0) {
      const systemMessage: Message = {
        id: 'system-init',
        role: 'system',
        content: '你是一个专业的文档分析助手。帮助用户分析文档内容、回答技术问题、提供建议等。保持回答准确、有用且友好。使用中文回答。',
        timestamp: new Date()
      }
      setMessages([systemMessage])
    }
  }, [isOpen, currentDocument?.filePath])

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
    setInputValue('')
    setIsLoading(true)

    try {
      const aiService = createAiService(aiConfig)

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
        content: `抱歉，AI 服务出现错误：${error instanceof Error ? error.message : '未知错误'}。请检查您的网络连接和 AI 配置。`,
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
            <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            {currentDocument && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate macos-text" title={currentDocument.fileName}>
                  {currentDocument.fileName}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!aiConfig.isConfigured && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  alert('请在设置中配置 AI 服务商、API Key 和模型信息')
                }}
                className="h-6 w-6 p-0 macos-button flex-shrink-0"
                title="配置 AI"
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="h-6 w-6 p-0 macos-button flex-shrink-0"
              title="清空对话"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 macos-button flex-shrink-0"
              title="关闭"
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
              {aiConfig.provider === 'custom' && '自定义'}
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
              <h4 className="text-sm font-medium mb-1 macos-text">开始对话</h4>
              <p className="text-xs text-muted-foreground mb-4 max-w-[220px] macos-text">
                {currentDocument
                  ? `正在分析 "${currentDocument.fileName}"，问我相关问题。`
                  : '我可以帮助您分析文档内容和回答问题。'}
              </p>
              {currentDocument && (
                <div className="w-full space-y-1">
                  <p className="text-xs font-medium text-muted-foreground macos-text">建议问题：</p>
                  <div className="space-y-1 text-xs">
                    {[
                      '这个文档讲什么？',
                      '总结一下要点',
                      '解释这个概念'
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
                      <span className="text-xs text-muted-foreground macos-text">思考中</span>
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
                需要配置 AI 服务
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              placeholder={aiConfig.isConfigured ? "输入问题..." : "请先配置 AI 服务"}
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
            Enter 发送 · Shift+Enter 换行
          </p>
        )}
      </div>
    </div>
  )
}