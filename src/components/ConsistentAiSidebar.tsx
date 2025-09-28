'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Send, Bot, User, Settings, Copy, Check, Trash2, FileText, MessageSquare, Layers, Clock, History } from 'lucide-react'
import { createAiService } from '@/lib/ai-service'
import { conversationStorage } from '@/lib/conversation-storage'

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
  const [isProcessingLongDoc, setIsProcessingLongDoc] = useState(false)
  const [processingProgress, setProcessingProgress] = useState({ completed: 0, total: 0 })
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
          isConfigured: !!(config.apiKey && config.model)
        })
      } catch (error) {
        console.error('Failed to load AI config:', error)
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
      }
    } else if (messages.length === 0) {
      // 没有当前文档且没有消息时，创建通用系统消息
      const systemMessage: Message = {
        id: 'system-init',
        role: 'system',
        content: '你是一个专业的文档分析助手。帮助用户分析文档内容、回答技术问题、提供建议等。保持回答准确、有用且友好。使用中文回答。',
        timestamp: new Date()
      }
      setMessages([systemMessage])
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

      // 检查是否需要长文档处理
      const shouldUseLongDocProcessing = currentDocument &&
        currentDocument.content.length > 8000 &&
        (originalQuestion.includes('总结') || originalQuestion.includes('分析') || originalQuestion.includes('概述'))

      if (shouldUseLongDocProcessing) {
        await processLongDocument(aiService, originalQuestion)
      } else {
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
      }
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

  const processLongDocument = async (aiService: any, question: string) => {
    if (!currentDocument) return

    setIsProcessingLongDoc(true)
    setProcessingProgress({ completed: 0, total: 0 })

    // 添加处理状态消息
    const statusMessage: Message = {
      id: `processing-${Date.now()}`,
      role: 'assistant',
      content: `📄 检测到长文档 (${Math.round(currentDocument.content.length / 1000)}k字符)，正在分段处理...`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, statusMessage])

    try {
      // 分段处理
      const chunks = aiService.splitDocument(currentDocument.content)
      setProcessingProgress({ completed: 0, total: chunks.length })

      // 更新状态消息
      const updateMessage: Message = {
        id: `chunks-${Date.now()}`,
        role: 'assistant',
        content: `🔄 已分成 ${chunks.length} 个片段，开始并行处理...`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, updateMessage])

      // 处理各个片段
      const tasks = await aiService.processDocumentChunks(
        chunks,
        'summarize',
        (progress) => {
          setProcessingProgress(progress)

          // 更新进度消息
          if (progress.currentTask) {
            const progressMessage: Message = {
              id: `progress-${Date.now()}`,
              role: 'assistant',
              content: `⚡ 处理进度: ${progress.completed}/${progress.total} (正在处理第${progress.currentTask.chunk.index + 1}部分)`,
              timestamp: new Date()
            }
            setMessages(prev => {
              // 替换最后一条进度消息
              const filtered = prev.filter(m => !m.id.startsWith('progress-'))
              return [...filtered, progressMessage]
            })
          }
        }
      )

      // 综合结果
      const finalResult = await aiService.synthesizeResults(tasks, question)

      const finalMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalResult,
        timestamp: new Date()
      }

      // 清理进度消息并添加最终结果
      setMessages(prev => {
        const filtered = prev.filter(m =>
          !m.id.startsWith('processing-') &&
          !m.id.startsWith('chunks-') &&
          !m.id.startsWith('progress-')
        )
        return [...filtered, finalMessage]
      })

    } catch (error) {
      console.error('Long document processing failed:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ 长文档处理失败：${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: new Date()
      }
      setMessages(prev => {
        const filtered = prev.filter(m =>
          !m.id.startsWith('processing-') &&
          !m.id.startsWith('chunks-') &&
          !m.id.startsWith('progress-')
        )
        return [...filtered, errorMessage]
      })
    } finally {
      setIsProcessingLongDoc(false)
      setProcessingProgress({ completed: 0, total: 0 })
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
            <div className={`w-1.5 h-1.5 rounded-full ${isProcessingLongDoc ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="macos-text">
              {isProcessingLongDoc ? (
                <>
                  <Layers className="w-3 h-3 inline mr-1" />
                  长文档处理中 {processingProgress.total > 0 && `(${processingProgress.completed}/${processingProgress.total})`}
                </>
              ) : (
                <>
                  {aiConfig.provider === 'openai' && 'OpenAI'}
                  {aiConfig.provider === 'anthropic' && 'Anthropic'}
                  {aiConfig.provider === 'custom' && '自定义'}
                  {' · '}
                  {aiConfig.model}
                  {currentDocument && currentDocument.content.length > 8000 && (
                    <> · <Layers className="w-3 h-3 inline mx-1" />长文档支持</>
                  )}
                </>
              )}
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
                  ? `正在分析 "${currentDocument.fileName}"，问我相关问题。${
                      conversationStorage.loadConversation(currentDocument.filePath, currentDocument.fileName).length > 1
                        ? ' 已恢复历史对话。'
                        : ''
                    }`
                  : '我可以帮助您分析文档内容和回答问题。'}
              </p>
              {currentDocument && (
                <div className="w-full space-y-1">
                  <p className="text-xs font-medium text-muted-foreground macos-text">建议问题：</p>
                  <div className="space-y-1 text-xs">
                    {(currentDocument && currentDocument.content.length > 8000 ? [
                      '📄 总结这个长文档',
                      '🔍 分析文档结构',
                      '📋 提取关键信息',
                      '💡 这个文档讲什么？'
                    ] : [
                      '这个文档讲什么？',
                      '总结一下要点',
                      '解释这个概念'
                    ]).map((suggestion, index) => (
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
              placeholder={
                isProcessingLongDoc ? "长文档处理中..." :
                aiConfig.isConfigured ? "输入问题..." : "请先配置 AI 服务"
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || isProcessingLongDoc || !aiConfig.isConfigured}
              className="h-6 text-xs bg-background/50 border-border/30 focus:border-border/60"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading || isProcessingLongDoc || !aiConfig.isConfigured}
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