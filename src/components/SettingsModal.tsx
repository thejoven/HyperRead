'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Minus, Plus, BookOpen, Languages, Check, Bot, Key, Globe, Cpu, History, Trash, Keyboard, UserCog, Edit2, Save, ChevronRight, ChevronDown, Settings2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { conversationStorage } from '@/lib/conversation-storage'
import { toast } from "sonner"
import ShortcutSettings from './ShortcutSettings'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  contentWidth: 'narrow' | 'medium' | 'wide' | 'full'
  onContentWidthChange: (width: 'narrow' | 'medium' | 'wide' | 'full') => void
}

// 设置类别定义
interface SettingsCategory {
  id: string
  label: string
  icon: React.ReactNode
  children?: SettingsSubCategory[]
}

interface SettingsSubCategory {
  id: string
  label: string
  icon: React.ReactNode
}

interface AiRole {
  id: string
  name: string
  systemPrompt: string
  description?: string
  isDefault?: boolean
}

export default function SettingsModal({ isOpen, onClose, fontSize, onFontSizeChange, contentWidth, onContentWidthChange }: SettingsModalProps) {
  const { t, currentLanguage, languages, changeLanguage } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('reading')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['general']))

  // AI 配置状态
  const [aiConfig, setAiConfig] = useState({
    provider: 'custom',
    apiKey: '',
    apiUrl: '',
    model: '',
    isConfigured: false
  })
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle')

  // AI 角色管理状态
  const [aiRoles, setAiRoles] = useState<AiRole[]>([])
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<AiRole | null>(null)

  // 动态设置分类，使用多语言（支持二级分类）
  const settingsCategories: SettingsCategory[] = [
    {
      id: 'general',
      label: t('settings.categories.general'),
      icon: <Settings2 className="w-4 h-4" />,
      children: [
        {
          id: 'reading',
          label: t('settings.categories.reading'),
          icon: <BookOpen className="w-3.5 h-3.5" />
        },
        {
          id: 'language',
          label: t('settings.categories.language'),
          icon: <Languages className="w-3.5 h-3.5" />
        },
        {
          id: 'shortcuts',
          label: t('settings.categories.shortcuts'),
          icon: <Keyboard className="w-3.5 h-3.5" />
        }
      ]
    },
    {
      id: 'ai-assistant',
      label: t('settings.categories.aiAssistant'),
      icon: <Bot className="w-4 h-4" />,
      children: [
        {
          id: 'ai',
          label: t('settings.categories.ai'),
          icon: <Key className="w-3.5 h-3.5" />
        },
        {
          id: 'roles',
          label: t('settings.categories.roles'),
          icon: <UserCog className="w-3.5 h-3.5" />
        },
        {
          id: 'history',
          label: t('settings.categories.history'),
          icon: <History className="w-3.5 h-3.5" />
        }
      ]
    }
  ]

  // 切换分类展开/收起
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // 加载 AI 配置
  useEffect(() => {
    const savedAiConfig = localStorage.getItem('ai-config')
    if (savedAiConfig) {
      try {
        const config = JSON.parse(savedAiConfig)
        setAiConfig(prev => ({
          ...prev,
          ...config,
          provider: 'custom', // 强制使用自定义服务商
          isConfigured: !!(config.apiKey && config.model && config.apiUrl)
        }))
      } catch (error) {
        console.error('Failed to load AI config:', error)
      }
    }
  }, [])

  // 加载 AI 角色配置
  useEffect(() => {
    const savedRoles = localStorage.getItem('ai-roles')
    if (savedRoles) {
      try {
        const roles = JSON.parse(savedRoles)
        setAiRoles(roles)
      } catch (error) {
        console.error('Failed to load AI roles:', error)
        // 加载默认角色
        setAiRoles(getDefaultRoles())
      }
    } else {
      // 初始化默认角色
      const defaultRoles = getDefaultRoles()
      setAiRoles(defaultRoles)
      localStorage.setItem('ai-roles', JSON.stringify(defaultRoles))
    }
  }, [])

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // 获取默认角色
  const getDefaultRoles = (): AiRole[] => {
    return [
      {
        id: 'default',
        name: t('settings.roles.defaultRoles.documentAssistant.name'),
        systemPrompt: 'You are a professional document analysis assistant. Help users analyze document content, answer technical questions, provide suggestions, etc. Keep answers accurate, helpful, and friendly.',
        description: t('settings.roles.defaultRoles.documentAssistant.description'),
        isDefault: true
      },
      {
        id: 'translator',
        name: t('settings.roles.defaultRoles.translator.name'),
        systemPrompt: 'You are a professional translator. Translate the content accurately while maintaining the original meaning and style. Provide natural and fluent translations.',
        description: t('settings.roles.defaultRoles.translator.description')
      },
      {
        id: 'summarizer',
        name: t('settings.roles.defaultRoles.summarizer.name'),
        systemPrompt: 'You are an expert at summarizing documents. Extract key points and provide concise, well-structured summaries that capture the essential information.',
        description: t('settings.roles.defaultRoles.summarizer.description')
      }
    ]
  }

  // 角色管理函数
  const saveRoles = (roles: AiRole[]) => {
    try {
      localStorage.setItem('ai-roles', JSON.stringify(roles))
      setAiRoles(roles)
      toast.success(t('settings.roles.roleSaved'))
    } catch (error) {
      console.error('Failed to save AI roles:', error)
      toast.error(t('settings.roles.saveFailed'))
    }
  }

  const addRole = () => {
    const newRole: AiRole = {
      id: `role-${Date.now()}`,
      name: t('settings.roles.addRole').replace('添加', '').replace('Add New ', ''),
      systemPrompt: '',
      description: ''
    }
    setEditingRoleId(newRole.id)
    setEditingRole(newRole)
    const updatedRoles = [...aiRoles, newRole]
    setAiRoles(updatedRoles)
  }

  const updateRole = (role: AiRole) => {
    const updatedRoles = aiRoles.map(r => r.id === role.id ? role : r)
    saveRoles(updatedRoles)
    setEditingRoleId(null)
    setEditingRole(null)
  }

  const deleteRole = (roleId: string) => {
    const role = aiRoles.find(r => r.id === roleId)
    if (role?.isDefault) {
      toast.error(t('settings.roles.cannotDeleteDefault'))
      return
    }
    const updatedRoles = aiRoles.filter(r => r.id !== roleId)
    saveRoles(updatedRoles)
  }

  const startEditRole = (role: AiRole) => {
    setEditingRoleId(role.id)
    setEditingRole({ ...role })
  }

  const cancelEditRole = () => {
    if (editingRole && !aiRoles.find(r => r.id === editingRole.id)?.name) {
      // 如果是新角色但未保存，删除它
      setAiRoles(aiRoles.filter(r => r.id !== editingRole.id))
    }
    setEditingRoleId(null)
    setEditingRole(null)
  }

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleFontSizeDecrease = () => {
    const newSize = Math.max(12, fontSize - 2)
    onFontSizeChange(newSize)
  }

  const handleFontSizeIncrease = () => {
    const newSize = Math.min(24, fontSize + 2)
    onFontSizeChange(newSize)
  }

  const handleFontSizeReset = () => {
    onFontSizeChange(16)
  }

  // 渲染阅读设置内容
  const renderReadingSettings = () => {
    const widthOptions = [
      { value: 'narrow' as const, label: t('settings.reading.widthNarrow'), description: '672px' },
      { value: 'medium' as const, label: t('settings.reading.widthMedium'), description: '896px' },
      { value: 'wide' as const, label: t('settings.reading.widthWide'), description: '1152px' },
      { value: 'full' as const, label: t('settings.reading.widthFull'), description: t('settings.reading.widthFullDesc') }
    ]

    return (
      <div className="space-y-2">
        {/* 字体大小设置 - 一行布局 */}
        <div className="flex items-center justify-between py-2 px-3 bg-muted/20 rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground">{t('settings.reading.fontSize')}</label>
            <p className="text-xs text-muted-foreground">{t('settings.reading.fontSizeDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFontSizeDecrease}
              disabled={fontSize <= 12}
              className="h-7 w-7 p-0 macos-button"
              title={t('settings.reading.decrease')}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-mono bg-muted/60 px-2 py-1 rounded-md min-w-[3rem] text-center">
              {fontSize}px
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFontSizeIncrease}
              disabled={fontSize >= 24}
              className="h-7 w-7 p-0 macos-button"
              title={t('settings.reading.increase')}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* 重置按钮 - 单独一行 */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFontSizeReset}
            className="macos-button text-xs h-7"
          >
            {t('settings.reading.resetDefault')} (16px)
          </Button>
        </div>

        {/* 内容宽度设置 */}
        <div className="py-2 px-3 bg-muted/20 rounded-lg">
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground">{t('settings.reading.contentWidth')}</label>
            <p className="text-xs text-muted-foreground">{t('settings.reading.contentWidthDesc')}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {widthOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onContentWidthChange(option.value)}
                className={`px-3 py-2 text-left rounded-lg border transition-all ${
                  contentWidth === option.value
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-muted/30 border-border/30 hover:bg-muted/50'
                }`}
              >
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 渲染语言设置内容
  const renderLanguageSettings = () => {
    return (
      <div className="space-y-2">
        {/* 语言选择 */}
        <div className="py-2 px-3 bg-muted/20 rounded-lg">
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground">{t('settings.language.title')}</label>
            <p className="text-xs text-muted-foreground">{t('settings.language.description')}</p>
          </div>
          <div className="space-y-2">
            {languages.map((language) => (
              <Button
                key={language.code}
                variant={currentLanguage === language.code ? "default" : "outline"}
                size="sm"
                onClick={() => changeLanguage(language.code)}
                className="w-full justify-between h-8 macos-button"
              >
                <span className="flex items-center gap-2">
                  <span>{language.nativeName}</span>
                  <span className="text-xs text-muted-foreground">({language.name})</span>
                </span>
                {currentLanguage === language.code && (
                  <Check className="h-3 w-3" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // AI 配置处理函数
  const saveAiConfig = () => {
    try {
      const configToSave = { ...aiConfig, provider: 'custom' }
      localStorage.setItem('ai-config', JSON.stringify(configToSave))
      setAiConfig(prev => ({
        ...prev,
        provider: 'custom',
        isConfigured: !!(aiConfig.apiKey && aiConfig.model && aiConfig.apiUrl)
      }))
      toast.success(t('common.success'))
    } catch (error) {
      console.error('Failed to save AI config:', error)
      toast.error(t('common.error'))
    }
  }

  const testConnection = async () => {
    if (!aiConfig.apiKey || !aiConfig.model || !aiConfig.apiUrl) {
      toast.error('请先填写 API Key、API URL 和模型名称')
      return
    }

    setConnectionStatus('testing')

    try {
      // 动态导入 AI 服务
      const { createAiService } = await import('@/lib/ai-service')
      const aiService = createAiService({
        ...aiConfig,
        isConfigured: true
      })

      const success = await aiService.testConnection()
      setConnectionStatus(success ? 'success' : 'failed')

      setTimeout(() => setConnectionStatus('idle'), 3000)
    } catch (error) {
      console.error('Connection test failed:', error)
      setConnectionStatus('failed')
      setTimeout(() => setConnectionStatus('idle'), 3000)
    }
  }

  // 渲染 AI 设置内容
  const renderAiSettings = () => {
    return (
      <div className="space-y-4">
        {/* 自定义 AI 服务配置 */}
        <div className="py-2 px-3 bg-muted/20 rounded-lg">
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground">{t('settings.history.aiConfig')}</label>
            <p className="text-xs text-muted-foreground">{t('settings.history.aiConfigDesc')}</p>
          </div>
        </div>

        {/* API 配置 */}
        <div className="space-y-3">
          {/* API Key */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Key className="w-3 h-3" />
              {t('settings.ai.apiKey')}
            </label>
            <Input
              type="password"
              placeholder={t('settings.ai.apiKeyPlaceholder')}
              value={aiConfig.apiKey}
              onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              className="h-8"
            />
          </div>

          {/* API URL */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Globe className="w-3 h-3" />
              {t('settings.ai.apiUrl')}
            </label>
            <Input
              type="url"
              placeholder={t('settings.ai.apiUrlPlaceholder')}
              value={aiConfig.apiUrl}
              onChange={(e) => setAiConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
              className="h-8"
            />
          </div>

          {/* 模型选择 */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Cpu className="w-3 h-3" />
              {t('settings.ai.model')}
            </label>
            <Input
              placeholder={t('settings.ai.modelPlaceholder')}
              value={aiConfig.model}
              onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
              className="h-8"
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={connectionStatus === 'testing' || !aiConfig.apiKey || !aiConfig.model || !aiConfig.apiUrl}
            className="flex-1 h-8 macos-button"
          >
            {connectionStatus === 'testing' ? t('settings.ai.status.testing') : t('settings.ai.testConnection')}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={saveAiConfig}
            className="flex-1 h-8 macos-button"
          >
            {t('settings.ai.saveConfig')}
          </Button>
        </div>

        {/* 状态指示 */}
        {connectionStatus !== 'idle' && (
          <div className={`text-xs text-center p-2 rounded ${
            connectionStatus === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            connectionStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            'bg-primary/10 text-primary'
          }`}>
            {t(`settings.ai.status.${connectionStatus}`)}
          </div>
        )}
      </div>
    )
  }

  // 渲染对话历史设置内容
  const renderHistorySettings = () => {
    const storageInfo = conversationStorage.getStorageInfo()
    const conversationList = conversationStorage.getConversationList()

    return (
      <div className="space-y-4">
        {/* 存储信息 */}
        <div className="py-2 px-3 bg-muted/20 rounded-lg">
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground">{t('settings.history.storageStatus')}</label>
            <p className="text-xs text-muted-foreground">{t('settings.history.storageStatusDesc')}</p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>{t('settings.history.savedConversations')}：</span>
              <span className="font-mono">{storageInfo.conversationCount} / {storageInfo.maxConversations}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('settings.history.storageSize')}：</span>
              <span className="font-mono">{(storageInfo.storageSize / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        </div>

        {/* 对话历史列表 */}
        {conversationList.length > 0 && (
          <div className="py-2 px-3 bg-muted/20 rounded-lg">
            <div className="mb-3">
              <label className="text-sm font-medium text-foreground">{t('settings.history.historyList')}</label>
              <p className="text-xs text-muted-foreground">{t('settings.history.historyListDesc')}</p>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {conversationList.slice(0, 10).map((conv, index) => (
                <div key={conv.filePath} className="flex items-center justify-between p-2 bg-background/60 rounded border border-border/30">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" title={conv.fileName}>
                      {conv.fileName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {conv.messageCount} {t('settings.history.messages')} · {conv.lastUpdated.toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      conversationStorage.deleteConversation(conv.filePath)
                      // 强制重新渲染
                      setActiveCategory('history')
                    }}
                    className="h-6 w-6 p-0 macos-button flex-shrink-0 ml-2"
                    title={t('settings.history.deleteConversation')}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 管理操作 */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.error(t('settings.history.clearAllConfirm'), {
                  action: {
                    label: t('settings.history.clearAllAction'),
                    onClick: () => {
                      conversationStorage.clearAllConversations()
                      toast.success(t('settings.history.clearAllSuccess'))
                      setActiveCategory('history') // 强制重新渲染
                    }
                  },
                  cancel: {
                    label: t('common.cancel'),
                    onClick: () => {}
                  }
                })
              }}
              className="flex-1 h-8 macos-button"
            >
              <Trash className="h-3 w-3 mr-1" />
              {t('settings.history.clearAll')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const data = conversationStorage.exportConversations()
                const blob = new Blob([data], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `ai-conversations-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast.success(t('settings.history.exportSuccess'))
              }}
              className="flex-1 h-8 macos-button"
            >
              {t('settings.history.exportBackup')}
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">{t('settings.history.importHistory')}</label>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    try {
                      const data = event.target?.result as string
                      if (conversationStorage.importConversations(data)) {
                        toast.success(t('settings.history.importSuccess'))
                        setActiveCategory('history') // 强制重新渲染
                      } else {
                        toast.error(t('settings.history.importFailed'))
                      }
                    } catch (error) {
                      toast.error(t('settings.history.importError'))
                    }
                  }
                  reader.readAsText(file)
                }
                e.target.value = '' // 清空input
              }}
              className="w-full text-xs p-2 border border-border/30 rounded bg-background/50"
            />
          </div>
        </div>

        {conversationList.length === 0 && (
          <div className="text-center py-6">
            <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('settings.history.noHistory')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('settings.history.noHistoryDesc')}</p>
          </div>
        )}
      </div>
    )
  }

  // 渲染角色管理设置内容
  const renderRolesSettings = () => {
    return (
      <div className="space-y-4">
        {/* 角色说明 */}
        <div className="py-2 px-3 bg-muted/20 rounded-lg">
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground">{t('settings.roles.title')}</label>
            <p className="text-xs text-muted-foreground">{t('settings.roles.description')}</p>
          </div>
        </div>

        {/* 角色列表 */}
        <div className="space-y-2">
          {aiRoles.map((role) => (
            <div key={role.id} className="p-3 bg-muted/20 rounded-lg border border-border/30">
              {editingRoleId === role.id && editingRole ? (
                // 编辑模式
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">{t('settings.roles.roleName')}</label>
                    <Input
                      value={editingRole.name}
                      onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                      className="h-7 text-xs"
                      placeholder={t('settings.roles.roleNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">{t('settings.roles.roleDescription')}</label>
                    <Input
                      value={editingRole.description || ''}
                      onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                      className="h-7 text-xs"
                      placeholder={t('settings.roles.roleDescriptionPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">{t('settings.roles.systemPrompt')}</label>
                    <textarea
                      value={editingRole.systemPrompt}
                      onChange={(e) => setEditingRole({ ...editingRole, systemPrompt: e.target.value })}
                      className="w-full min-h-[100px] p-2 text-xs border border-border/30 rounded-md bg-background/50 resize-y"
                      placeholder={t('settings.roles.systemPromptPlaceholder')}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => updateRole(editingRole)}
                      disabled={!editingRole.name.trim() || !editingRole.systemPrompt.trim()}
                      className="flex-1 h-7 macos-button"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      {t('settings.roles.saveRole')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEditRole}
                      className="flex-1 h-7 macos-button"
                    >
                      {t('settings.roles.cancelEdit')}
                    </Button>
                  </div>
                </div>
              ) : (
                // 显示模式
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">{role.name}</h4>
                        {role.isDefault && (
                          <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">{t('settings.roles.defaultRole')}</span>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditRole(role)}
                        className="h-6 w-6 p-0 macos-button"
                        title={t('settings.roles.editRole')}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      {!role.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRole(role.id)}
                          className="h-6 w-6 p-0 macos-button"
                          title={t('settings.roles.deleteRole')}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-background/60 rounded text-xs text-muted-foreground">
                    <div className="line-clamp-2">{role.systemPrompt}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 添加新角色按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={addRole}
          className="w-full h-8 macos-button"
        >
          <Plus className="h-3 w-3 mr-1" />
          {t('settings.roles.addRole')}
        </Button>
      </div>
    )
  }

  // 渲染快捷键设置内容
  const renderShortcutSettings = () => {
    return <ShortcutSettings />
  }

  // 渲染分类内容
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'reading':
        return renderReadingSettings()
      case 'language':
        return renderLanguageSettings()
      case 'ai':
        return renderAiSettings()
      case 'roles':
        return renderRolesSettings()
      case 'history':
        return renderHistorySettings()
      case 'shortcuts':
        return renderShortcutSettings()
      default:
        return renderReadingSettings()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 macos-fade-in p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-[800px] h-[600px] glass-effect border border-border/30 shadow-2xl macos-scale-in overflow-hidden flex flex-col">
        {/* 主体内容区 - 固定高度，横向布局 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧导航栏 - 灰色背景，增加宽度以支持二级分类 */}
          <div className="w-48 bg-muted/30 border-r border-border/20 flex-shrink-0 overflow-y-auto">
            <div className="p-3">
              <nav className="space-y-1">
                {settingsCategories.map((category) => (
                  <div key={category.id}>
                    {/* 一级分类 */}
                    <button
                      onClick={() => {
                        if (category.children && category.children.length > 0) {
                          toggleCategory(category.id)
                        } else {
                          setActiveCategory(category.id)
                        }
                      }}
                      className={`
                        w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors
                        ${!category.children && activeCategory === category.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'hover:bg-muted/50 text-foreground'
                        }
                      `}
                    >
                      {category.icon}
                      <span className="text-sm font-medium flex-1">{category.label}</span>
                      {category.children && category.children.length > 0 && (
                        expandedCategories.has(category.id)
                          ? <ChevronDown className="w-3.5 h-3.5" />
                          : <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* 二级分类 */}
                    {category.children && expandedCategories.has(category.id) && (
                      <div className="ml-2 mt-1 space-y-1">
                        {category.children.map((subCategory) => (
                          <button
                            key={subCategory.id}
                            onClick={() => setActiveCategory(subCategory.id)}
                            className={`
                              w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left transition-colors
                              ${activeCategory === subCategory.id
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                              }
                            `}
                          >
                            {subCategory.icon}
                            <span className="text-xs">{subCategory.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* 右侧内容区 - 白色背景，可滚动 */}
          <div className="flex-1 bg-background overflow-y-auto">
            <div className="p-6">
              {renderCategoryContent()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}