// AI 助手插件 for HyperRead
// 使用纯 DOM (vanilla JS) 实现，无需 React

// ===== AI 服务 =====
class AiService {
  constructor(config) {
    this.config = config
  }

  async sendMessage(messages) {
    if (!this.config.isConfigured) throw new Error('AI 服务未配置')
    if (!this.config.apiUrl) throw new Error('自定义 API 需要配置 API URL')

    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`API 错误: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    if (data.choices && data.choices[0]?.message?.content) return data.choices[0].message.content
    if (data.content && data.content[0]?.text) return data.content[0].text
    if (data.response) return data.response
    if (data.text) return data.text
    throw new Error('无法解析 API 响应格式')
  }

  async testConnection() {
    try {
      const response = await this.sendMessage([{ role: 'user', content: 'Hello, this is a connection test.' }])
      return response.length > 0
    } catch {
      return false
    }
  }
}

// ===== 状态管理 =====
function createState(api) {
  return {
    config: { provider: 'custom', apiKey: '', apiUrl: '', model: '', isConfigured: false },
    roles: [],
    messages: [], // {id, role, content, timestamp}
    currentDocument: null,
    isLoading: false,
    selectedRoleId: 'default',
    sidebarWidth: 320,
    // 保存句柄
    sidebarHandle: null,
    settingsHandle: null,
    // 对话历史 (keyed by docKey)
    conversations: {},
    api
  }
}

// ===== 对话历史存储 =====
function genDocKey(filePath) {
  return btoa(encodeURIComponent(filePath)).replace(/[/+=]/g, '_')
}

function genContentHash(content) {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

async function loadConversations(state) {
  const data = await state.api.loadData()
  state.conversations = data.conversations || {}
  state.config = data.config || state.config
  state.roles = data.roles || getDefaultRoles()
  state.sidebarWidth = data.sidebarWidth || 320
}

async function saveConversations(state) {
  await state.api.saveData({
    conversations: state.conversations,
    config: state.config,
    roles: state.roles,
    sidebarWidth: state.sidebarWidth
  })
}

function getMessagesForDoc(state, filePath, content) {
  const key = genDocKey(filePath)
  const conv = state.conversations[key]
  if (!conv) return []
  if (content) {
    const hash = genContentHash(content)
    if (conv.documentHash && conv.documentHash !== hash) {
      return conv.messages.filter(m => m.role === 'system')
    }
  }
  return conv.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
}

function saveMessagesForDoc(state, filePath, fileName, messages, content) {
  const key = genDocKey(filePath)
  state.conversations[key] = {
    filePath, fileName,
    messages: messages.map(m => ({ ...m, timestamp: new Date(m.timestamp).toISOString() })),
    lastUpdated: new Date().toISOString(),
    documentHash: content ? genContentHash(content) : undefined
  }
  // 限制最多100条对话
  const entries = Object.entries(state.conversations)
  if (entries.length > 100) {
    entries.sort((a, b) => new Date(b[1].lastUpdated) - new Date(a[1].lastUpdated))
    state.conversations = Object.fromEntries(entries.slice(0, 100))
  }
}

function getDefaultRoles() {
  return [
    {
      id: 'default',
      name: '文档助手',
      systemPrompt: 'You are a professional document analysis assistant. Help users analyze document content, answer technical questions, provide suggestions, etc. Keep answers accurate, helpful, and friendly.',
      description: '专业的文档分析和问答助手',
      isDefault: true
    },
    {
      id: 'translator',
      name: '翻译助手',
      systemPrompt: 'You are a professional translator. Translate the content accurately while maintaining the original meaning and style. Provide natural and fluent translations.',
      description: '准确翻译文档内容'
    },
    {
      id: 'summarizer',
      name: '摘要助手',
      systemPrompt: 'You are an expert at summarizing documents. Extract key points and provide concise, well-structured summaries that capture the essential information.',
      description: '提取关键点并生成简洁摘要'
    }
  ]
}

// ===== 工具函数 =====
function el(tag, attrs = {}, ...children) {
  const elem = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'style' && typeof v === 'object') {
      Object.assign(elem.style, v)
    } else if (k.startsWith('on') && typeof v === 'function') {
      elem.addEventListener(k.slice(2).toLowerCase(), v)
    } else if (k === 'className') {
      elem.className = v
    } else {
      elem.setAttribute(k, v)
    }
  }
  for (const child of children) {
    if (typeof child === 'string') elem.appendChild(document.createTextNode(child))
    else if (child) elem.appendChild(child)
  }
  return elem
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// ===== 侧边栏聊天 UI =====
function renderSidebar(container, state, onClose) {
  // 主容器
  container.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;font-size:13px;position:relative;'

  // 拖拽调整宽度（左边缘）
  const resizeHandle = el('div', {
    style: {
      position: 'absolute', left: '0', top: '0', bottom: '0', width: '4px',
      cursor: 'ew-resize', zIndex: '10', background: 'transparent'
    }
  })
  let resizing = false, startX = 0, startW = 0
  resizeHandle.addEventListener('mousedown', e => {
    resizing = true
    startX = e.clientX
    startW = container.parentElement?.offsetWidth || state.sidebarWidth
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
    e.preventDefault()
  })
  document.addEventListener('mousemove', e => {
    if (!resizing) return
    const delta = startX - e.clientX
    const newW = Math.max(280, Math.min(800, startW + delta))
    state.sidebarWidth = newW
    if (container.parentElement) container.parentElement.style.width = newW + 'px'
  })
  document.addEventListener('mouseup', () => {
    if (!resizing) return
    resizing = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    saveConversations(state)
  })
  container.appendChild(resizeHandle)

  // 头部
  const header = el('div', { style: 'padding:8px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:4px;flex-shrink:0;background:var(--background);' })

  const docInfo = el('div', { style: 'flex:1;display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden;' })
  const docName = el('span', { style: 'font-size:11px;color:var(--muted-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' })
  docInfo.appendChild(docName)

  const updateDocName = () => {
    if (state.currentDocument) {
      docName.textContent = state.currentDocument.fileName
      docName.title = state.currentDocument.fileName
    } else {
      docName.textContent = 'AI 助手'
    }
  }
  updateDocName()

  const btnClear = el('button', {
    style: 'flex-shrink:0;padding:2px 4px;border:none;background:transparent;cursor:pointer;color:var(--muted-foreground);border-radius:4px;display:flex;align-items:center;',
    title: '清空对话'
  })
  btnClear.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'

  const btnClose = el('button', {
    style: 'flex-shrink:0;padding:2px 4px;border:none;background:transparent;cursor:pointer;color:var(--muted-foreground);border-radius:4px;display:flex;align-items:center;',
    title: '关闭'
  })
  btnClose.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'

  header.appendChild(docInfo)
  header.appendChild(btnClear)
  header.appendChild(btnClose)
  container.appendChild(header)

  // 状态条
  const statusBar = el('div', { style: 'padding:4px 8px;font-size:11px;color:var(--muted-foreground);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:6px;flex-shrink:0;' })
  const updateStatusBar = () => {
    statusBar.innerHTML = ''
    if (state.config.isConfigured) {
      const dot = el('div', { style: 'width:6px;height:6px;border-radius:50%;background:#22c55e;flex-shrink:0;' })
      statusBar.appendChild(dot)
      statusBar.appendChild(document.createTextNode(`自定义 · ${state.config.model}`))
      statusBar.style.display = 'flex'
    } else {
      statusBar.style.display = 'none'
    }
  }
  updateStatusBar()
  container.appendChild(statusBar)

  // 消息区域
  const msgArea = el('div', { style: 'flex:1;overflow-y:auto;padding:8px;' })
  container.appendChild(msgArea)

  let currentMessages = []

  const renderMessages = () => {
    msgArea.innerHTML = ''
    const displayMsgs = currentMessages.filter(m => m.role !== 'system')

    if (displayMsgs.length === 0) {
      // 欢迎页
      const welcome = el('div', { style: 'display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;padding:16px;text-align:center;' })
      const icon = el('div', { style: 'width:40px;height:40px;background:var(--muted);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;' })
      icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
      const title = el('h4', { style: 'font-size:13px;font-weight:500;margin:0 0 4px 0;' }, '开始对话')
      welcome.appendChild(icon)
      welcome.appendChild(title)

      if (state.currentDocument) {
        const desc = el('p', { style: 'font-size:11px;color:var(--muted-foreground);margin:0 0 16px 0;max-width:200px;' }, `可以询问关于"${state.currentDocument.fileName}"的问题`)
        welcome.appendChild(desc)
        const sugTitle = el('p', { style: 'font-size:11px;font-weight:500;color:var(--muted-foreground);margin:0 0 6px 0;' }, '建议问题')
        welcome.appendChild(sugTitle)
        const suggestions = ['这篇文档讲了什么？', '帮我总结一下主要内容', '解释一下文档中的关键概念']
        suggestions.forEach(s => {
          const btn = el('button', {
            style: 'display:block;width:100%;text-align:left;padding:4px 8px;font-size:11px;color:var(--muted-foreground);background:transparent;border:none;cursor:pointer;border-radius:4px;margin-bottom:4px;',
            onclick: () => { inputEl.value = s }
          }, s)
          btn.addEventListener('mouseover', () => btn.style.background = 'var(--muted)')
          btn.addEventListener('mouseout', () => btn.style.background = 'transparent')
          welcome.appendChild(btn)
        })
      }

      if (!state.config.isConfigured) {
        const notice = el('p', { style: 'font-size:11px;color:var(--muted-foreground);margin:12px 0 0 0;' }, '请在插件设置中配置 API')
        welcome.appendChild(notice)
      }

      msgArea.appendChild(welcome)
      return
    }

    displayMsgs.forEach(msg => {
      const isUser = msg.role === 'user'
      const row = el('div', {
        style: `display:flex;gap:8px;margin-bottom:8px;justify-content:${isUser ? 'flex-end' : 'flex-start'};`
      })

      if (!isUser) {
        const avatar = el('div', { style: 'width:24px;height:24px;border-radius:6px;background:var(--primary)/0.1;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;' })
        avatar.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
        row.appendChild(avatar)
      }

      const bubble = el('div', { style: 'max-width:80%;' })
      const content = el('div', {
        style: `padding:8px 12px;border-radius:8px;font-size:12px;line-height:1.5;white-space:pre-wrap;word-break:break-word;${
          isUser
            ? 'background:var(--primary);color:var(--primary-foreground);'
            : 'background:var(--background);border:1px solid var(--border);color:var(--foreground);'
        }`
      }, msg.content)

      const meta = el('div', { style: 'font-size:10px;color:var(--muted-foreground);margin-top:4px;' }, formatTime(msg.timestamp))
      bubble.appendChild(content)
      bubble.appendChild(meta)
      row.appendChild(bubble)

      if (isUser) {
        const avatar = el('div', { style: 'width:24px;height:24px;border-radius:6px;background:var(--muted);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;' })
        avatar.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
        row.appendChild(avatar)
      }

      msgArea.appendChild(row)
    })

    // 加载中
    if (state.isLoading) {
      const row = el('div', { style: 'display:flex;gap:8px;margin-bottom:8px;' })
      const avatar = el('div', { style: 'width:24px;height:24px;border-radius:6px;background:var(--muted);display:flex;align-items:center;justify-content:center;flex-shrink:0;' })
      avatar.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
      const bubble = el('div', { style: 'padding:8px 12px;border-radius:8px;background:var(--background);border:1px solid var(--border);' })
      bubble.innerHTML = '<span style="font-size:11px;color:var(--muted-foreground);">思考中</span> <span style="display:inline-flex;gap:2px;margin-left:4px;">' +
        [0,1,2].map(i => `<span style="width:4px;height:4px;border-radius:50%;background:var(--muted-foreground);display:inline-block;animation:bounce 1s ${i*0.15}s infinite;"></span>`).join('') +
        '</span>'
      row.appendChild(avatar)
      row.appendChild(bubble)
      msgArea.appendChild(row)
    }

    msgArea.scrollTop = msgArea.scrollHeight
  }

  const createSystemMessage = () => {
    const role = state.roles.find(r => r.id === state.selectedRoleId) || state.roles.find(r => r.isDefault) || state.roles[0]
    let prompt = role?.systemPrompt || 'You are a helpful assistant.'
    if (state.currentDocument) {
      const docContent = state.currentDocument.content.substring(0, 3000)
      prompt += `\n\n用户正在查看文档"${state.currentDocument.fileName}"。\n\n文档内容：\n${docContent}${state.currentDocument.content.length > 3000 ? '\n\n（文档内容已截断）' : ''}\n\n请根据文档内容回答用户问题。`
    }
    return { id: 'system-init', role: 'system', content: prompt, timestamp: new Date() }
  }

  const loadDocMessages = () => {
    if (state.currentDocument) {
      const saved = getMessagesForDoc(state, state.currentDocument.filePath, state.currentDocument.content)
      currentMessages = saved.length > 0 ? saved : [createSystemMessage()]
    } else {
      currentMessages = [createSystemMessage()]
    }
    renderMessages()
  }

  loadDocMessages()

  // 输入区域
  const inputArea = el('div', { style: 'padding:8px;border-top:1px solid var(--border);flex-shrink:0;background:var(--background);' })

  // 角色选择器
  let showRoleSelector = false
  const roleSelector = el('div', { style: 'position:relative;margin-bottom:6px;' })
  const roleBtn = el('button', {
    style: 'width:100%;display:flex;align-items:center;justify-content:space-between;padding:4px 8px;border:1px solid var(--border);border-radius:6px;background:transparent;cursor:pointer;font-size:11px;',
  })
  const roleSelectorDropdown = el('div', {
    style: 'display:none;position:absolute;bottom:100%;left:0;right:0;background:var(--background);border:1px solid var(--border);border-radius:6px;margin-bottom:4px;max-height:160px;overflow-y:auto;z-index:100;'
  })

  const updateRoleBtn = () => {
    const cur = state.roles.find(r => r.id === state.selectedRoleId) || state.roles[0]
    roleBtn.innerHTML = `<span>${cur?.name || '选择角色'}</span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`
  }
  updateRoleBtn()

  const renderRoleDropdown = () => {
    roleSelectorDropdown.innerHTML = ''
    state.roles.forEach(role => {
      const item = el('button', {
        style: `width:100%;text-align:left;padding:6px 10px;font-size:11px;background:${role.id === state.selectedRoleId ? 'var(--primary)/0.1' : 'transparent'};border:none;cursor:pointer;`,
        onclick: () => {
          state.selectedRoleId = role.id
          showRoleSelector = false
          roleSelectorDropdown.style.display = 'none'
          updateRoleBtn()
          const sysMsg = createSystemMessage()
          currentMessages = [sysMsg, ...currentMessages.filter(m => m.role !== 'system')]
          renderMessages()
        }
      }, role.name)
      item.addEventListener('mouseover', () => item.style.background = 'var(--muted)')
      item.addEventListener('mouseout', () => item.style.background = role.id === state.selectedRoleId ? 'var(--muted)' : 'transparent')
      roleSelectorDropdown.appendChild(item)
    })
  }

  roleBtn.onclick = () => {
    showRoleSelector = !showRoleSelector
    if (showRoleSelector) {
      renderRoleDropdown()
      roleSelectorDropdown.style.display = 'block'
    } else {
      roleSelectorDropdown.style.display = 'none'
    }
  }

  roleSelector.appendChild(roleBtn)
  roleSelector.appendChild(roleSelectorDropdown)
  if (state.roles.length > 0) inputArea.appendChild(roleSelector)

  // 输入行
  const inputRow = el('div', { style: 'display:flex;gap:4px;align-items:center;' })
  const inputEl = el('input', {
    type: 'text',
    placeholder: state.config.isConfigured ? '发送消息...' : '请先配置 API...',
    style: 'flex:1;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;background:var(--background);color:var(--foreground);outline:none;height:28px;',
    disabled: !state.config.isConfigured
  })

  const sendBtn = el('button', {
    style: 'padding:4px 6px;border:none;background:transparent;cursor:pointer;color:var(--muted-foreground);border-radius:4px;display:flex;align-items:center;flex-shrink:0;',
    disabled: !state.config.isConfigured
  })
  sendBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'

  const sendMessage = async () => {
    const text = inputEl.value.trim()
    if (!text || state.isLoading || !state.config.isConfigured) return

    const userMsg = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() }
    currentMessages.push(userMsg)
    inputEl.value = ''
    state.isLoading = true
    renderMessages()

    try {
      const service = new AiService(state.config)
      const apiMessages = currentMessages.map(m => ({ role: m.role, content: m.content }))
      const aiResponse = await service.sendMessage(apiMessages)
      const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiResponse, timestamp: new Date() }
      currentMessages.push(aiMsg)

      if (state.currentDocument) {
        saveMessagesForDoc(state, state.currentDocument.filePath, state.currentDocument.fileName, currentMessages, state.currentDocument.content)
      }
      saveConversations(state)
    } catch (e) {
      const errMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: `错误：${e.message}`, timestamp: new Date() }
      currentMessages.push(errMsg)
    } finally {
      state.isLoading = false
      renderMessages()
    }
  }

  inputEl.addEventListener('keypress', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  })
  sendBtn.addEventListener('click', sendMessage)

  inputRow.appendChild(inputEl)
  inputRow.appendChild(sendBtn)
  inputArea.appendChild(inputRow)

  const hint = el('p', { style: 'font-size:10px;color:var(--muted-foreground);text-align:center;margin:4px 0 0 0;' }, 'Enter 发送 · Shift+Enter 换行')
  if (state.config.isConfigured) inputArea.appendChild(hint)

  container.appendChild(inputArea)

  // 清空按钮事件
  btnClear.addEventListener('click', () => {
    const sysMsg = createSystemMessage()
    currentMessages = [sysMsg]
    if (state.currentDocument) {
      const key = genDocKey(state.currentDocument.filePath)
      delete state.conversations[key]
      saveConversations(state)
    }
    renderMessages()
  })

  // 关闭按钮
  btnClose.addEventListener('click', () => {
    if (state.sidebarHandle) {
      state.sidebarHandle.remove()
      state.sidebarHandle = null
    }
  })

  // 监听文档变化
  const onDocOpen = (fileData) => {
    state.currentDocument = fileData
    updateDocName()
    updateStatusBar()
    loadDocMessages()
  }

  state.api.on('document:open', onDocOpen)

  // 添加 bounce 动画
  const styleEl = document.createElement('style')
  styleEl.textContent = `@keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }`
  document.head.appendChild(styleEl)

  return () => {
    document.head.removeChild(styleEl)
    state.api.off('document:open', onDocOpen)
  }
}

// ===== 设置面板 =====
function renderSettings(container, state) {
  container.style.cssText = 'font-size:13px;color:var(--foreground);'

  let activeTab = 'api'
  const tabs = ['api', 'roles', 'history']
  const tabLabels = { api: 'API 配置', roles: '角色管理', history: '对话历史' }

  // 标签栏
  const tabBar = el('div', { style: 'display:flex;gap:4px;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:8px;' })
  const tabBtns = {}
  tabs.forEach(tab => {
    const btn = el('button', {
      style: `padding:4px 10px;font-size:12px;border:none;border-radius:4px;cursor:pointer;background:${tab === activeTab ? 'var(--primary)' : 'transparent'};color:${tab === activeTab ? 'var(--primary-foreground)' : 'var(--muted-foreground)'};`,
      onclick: () => {
        activeTab = tab
        tabs.forEach(t => {
          tabBtns[t].style.background = t === tab ? 'var(--primary)' : 'transparent'
          tabBtns[t].style.color = t === tab ? 'var(--primary-foreground)' : 'var(--muted-foreground)'
          panels[t].style.display = t === tab ? '' : 'none'
        })
      }
    }, tabLabels[tab])
    tabBtns[tab] = btn
    tabBar.appendChild(btn)
  })
  container.appendChild(tabBar)

  const panels = {}

  // === API 配置面板 ===
  const apiPanel = el('div', {})
  panels.api = apiPanel

  const mkLabel = (text) => el('label', { style: 'display:block;font-size:12px;font-weight:500;margin-bottom:4px;' }, text)
  const mkInput = (type, value, placeholder, style = '') => {
    const inp = el('input', {
      type, value: value || '', placeholder,
      style: `width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;background:var(--background);color:var(--foreground);box-sizing:border-box;outline:none;${style}`
    })
    return inp
  }

  const apiKeyInp = mkInput('password', state.config.apiKey, '输入 API Key')
  const apiUrlInp = mkInput('url', state.config.apiUrl, 'https://api.openai.com/v1/chat/completions')
  const modelInp = mkInput('text', state.config.model, 'gpt-4o')

  const statusMsg = el('div', { style: 'font-size:11px;padding:6px 8px;border-radius:4px;display:none;margin-top:8px;' })

  const setStatus = (type, text) => {
    const styles = {
      success: 'background:#dcfce7;color:#166534;',
      error: 'background:#fee2e2;color:#991b1b;',
      info: 'background:var(--muted);color:var(--muted-foreground);'
    }
    statusMsg.style.cssText = `font-size:11px;padding:6px 8px;border-radius:4px;margin-top:8px;${styles[type] || ''}`
    statusMsg.textContent = text
    statusMsg.style.display = 'block'
  }

  const btnRow = el('div', { style: 'display:flex;gap:8px;margin-top:8px;' })

  const testBtn = el('button', {
    style: 'flex:1;padding:6px;font-size:12px;border:1px solid var(--border);border-radius:6px;background:transparent;cursor:pointer;',
    onclick: async () => {
      const cfg = { provider: 'custom', apiKey: apiKeyInp.value, apiUrl: apiUrlInp.value, model: modelInp.value, isConfigured: true }
      if (!cfg.apiKey || !cfg.model || !cfg.apiUrl) { setStatus('error', '请填写全部字段'); return }
      testBtn.disabled = true
      testBtn.textContent = '测试中...'
      setStatus('info', '正在测试连接...')
      const service = new AiService(cfg)
      const ok = await service.testConnection()
      testBtn.disabled = false
      testBtn.textContent = '测试连接'
      setStatus(ok ? 'success' : 'error', ok ? '✓ 连接成功' : '✗ 连接失败，请检查配置')
    }
  }, '测试连接')

  const saveBtn = el('button', {
    style: 'flex:1;padding:6px;font-size:12px;border:none;border-radius:6px;background:var(--primary);color:var(--primary-foreground);cursor:pointer;',
    onclick: () => {
      state.config = {
        provider: 'custom',
        apiKey: apiKeyInp.value,
        apiUrl: apiUrlInp.value,
        model: modelInp.value,
        isConfigured: !!(apiKeyInp.value && apiUrlInp.value && modelInp.value)
      }
      saveConversations(state)
      setStatus('success', '✓ 配置已保存')
    }
  }, '保存配置')

  btnRow.appendChild(testBtn)
  btnRow.appendChild(saveBtn)

  apiPanel.appendChild(mkLabel('API Key'))
  apiPanel.appendChild(apiKeyInp)
  apiPanel.appendChild(el('div', { style: 'height:8px;' }))
  apiPanel.appendChild(mkLabel('API URL'))
  apiPanel.appendChild(apiUrlInp)
  apiPanel.appendChild(el('div', { style: 'height:8px;' }))
  apiPanel.appendChild(mkLabel('模型名称'))
  apiPanel.appendChild(modelInp)
  apiPanel.appendChild(btnRow)
  apiPanel.appendChild(statusMsg)

  // === 角色管理面板 ===
  const rolesPanel = el('div', {})
  panels.roles = rolesPanel

  const renderRoles = () => {
    rolesPanel.innerHTML = ''
    const roleList = el('div', { style: 'space-y:8px;max-height:300px;overflow-y:auto;' })

    state.roles.forEach(role => {
      const item = el('div', { style: 'padding:10px;border:1px solid var(--border);border-radius:6px;margin-bottom:8px;' })
      let editing = false

      const display = el('div', {})
      const nameRow = el('div', { style: 'display:flex;align-items:center;gap:8px;margin-bottom:4px;' })
      const nameSpan = el('span', { style: 'font-size:13px;font-weight:500;' }, role.name)
      if (role.isDefault) {
        const badge = el('span', { style: 'font-size:10px;padding:1px 6px;background:var(--primary)/0.1;color:var(--primary);border-radius:3px;' }, '默认')
        nameRow.appendChild(nameSpan)
        nameRow.appendChild(badge)
      } else {
        nameRow.appendChild(nameSpan)
      }

      const editBtnRow = el('div', { style: 'display:flex;gap:4px;' })
      const editBtn = el('button', {
        style: 'padding:2px 6px;font-size:11px;border:1px solid var(--border);border-radius:4px;background:transparent;cursor:pointer;',
        onclick: () => {
          editing = !editing
          editForm.style.display = editing ? '' : 'none'
          display.style.display = editing ? 'none' : ''
        }
      }, '编辑')
      editBtnRow.appendChild(editBtn)

      if (!role.isDefault) {
        const delBtn = el('button', {
          style: 'padding:2px 6px;font-size:11px;border:1px solid var(--border);border-radius:4px;background:transparent;cursor:pointer;color:#dc2626;',
          onclick: () => {
            state.roles = state.roles.filter(r => r.id !== role.id)
            saveConversations(state)
            renderRoles()
          }
        }, '删除')
        editBtnRow.appendChild(delBtn)
      }

      if (role.description) {
        display.appendChild(nameRow)
        display.appendChild(el('p', { style: 'font-size:11px;color:var(--muted-foreground);margin:0 0 4px 0;' }, role.description))
        display.appendChild(editBtnRow)
      } else {
        display.appendChild(nameRow)
        display.appendChild(editBtnRow)
      }

      // 编辑表单
      const editForm = el('div', { style: 'display:none;' })
      const nameInp = mkInput('text', role.name, '角色名称')
      const descInp = mkInput('text', role.description || '', '描述（可选）')
      const promptTa = el('textarea', {
        style: 'width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;min-height:80px;resize:vertical;background:var(--background);color:var(--foreground);box-sizing:border-box;margin-top:4px;',
        placeholder: 'System prompt...'
      })
      promptTa.value = role.systemPrompt

      const saveBtnEdit = el('button', {
        style: 'margin-top:6px;padding:4px 10px;font-size:11px;border:none;border-radius:4px;background:var(--primary);color:var(--primary-foreground);cursor:pointer;',
        onclick: () => {
          role.name = nameInp.value
          role.description = descInp.value
          role.systemPrompt = promptTa.value
          saveConversations(state)
          renderRoles()
        }
      }, '保存')

      const cancelBtnEdit = el('button', {
        style: 'margin-top:6px;margin-left:6px;padding:4px 10px;font-size:11px;border:1px solid var(--border);border-radius:4px;background:transparent;cursor:pointer;',
        onclick: () => {
          editing = false
          editForm.style.display = 'none'
          display.style.display = ''
        }
      }, '取消')

      editForm.appendChild(mkLabel('角色名称'))
      editForm.appendChild(nameInp)
      editForm.appendChild(el('div', { style: 'height:6px;' }))
      editForm.appendChild(mkLabel('描述'))
      editForm.appendChild(descInp)
      editForm.appendChild(el('div', { style: 'height:6px;' }))
      editForm.appendChild(mkLabel('System Prompt'))
      editForm.appendChild(promptTa)
      editForm.appendChild(saveBtnEdit)
      editForm.appendChild(cancelBtnEdit)

      item.appendChild(display)
      item.appendChild(editForm)
      roleList.appendChild(item)
    })

    const addBtn = el('button', {
      style: 'width:100%;padding:6px;font-size:12px;border:1px dashed var(--border);border-radius:6px;background:transparent;cursor:pointer;color:var(--muted-foreground);',
      onclick: () => {
        const newRole = { id: `role-${Date.now()}`, name: '新角色', systemPrompt: '', description: '' }
        state.roles.push(newRole)
        saveConversations(state)
        renderRoles()
      }
    }, '+ 添加角色')

    rolesPanel.appendChild(roleList)
    rolesPanel.appendChild(addBtn)
  }
  renderRoles()

  // === 对话历史面板 ===
  const histPanel = el('div', {})
  panels.history = histPanel

  const renderHistory = () => {
    histPanel.innerHTML = ''

    const convs = Object.values(state.conversations)
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 20)

    const info = el('div', { style: 'padding:8px;background:var(--muted)/0.2;border-radius:6px;margin-bottom:10px;font-size:11px;' })
    info.innerHTML = `<b>对话数：</b>${convs.length} / 100`
    histPanel.appendChild(info)

    if (convs.length === 0) {
      const empty = el('div', { style: 'text-align:center;padding:24px;color:var(--muted-foreground);font-size:12px;' }, '暂无对话历史')
      histPanel.appendChild(empty)
    } else {
      const list = el('div', { style: 'max-height:200px;overflow-y:auto;margin-bottom:10px;' })
      convs.forEach(conv => {
        const row = el('div', { style: 'display:flex;align-items:center;padding:6px 8px;border:1px solid var(--border);border-radius:6px;margin-bottom:6px;' })
        const info2 = el('div', { style: 'flex:1;min-width:0;' })
        const fname = el('div', { style: 'font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' }, conv.fileName)
        const meta = el('div', { style: 'font-size:10px;color:var(--muted-foreground);' }, `${conv.messages.filter(m => m.role !== 'system').length} 条消息 · ${new Date(conv.lastUpdated).toLocaleDateString()}`)
        info2.appendChild(fname)
        info2.appendChild(meta)
        const delBtn = el('button', {
          style: 'padding:2px 6px;font-size:10px;border:1px solid var(--border);border-radius:4px;background:transparent;cursor:pointer;color:#dc2626;flex-shrink:0;margin-left:8px;',
          onclick: () => {
            const key = genDocKey(conv.filePath)
            delete state.conversations[key]
            saveConversations(state)
            renderHistory()
          }
        }, '删除')
        row.appendChild(info2)
        row.appendChild(delBtn)
        list.appendChild(row)
      })
      histPanel.appendChild(list)
    }

    const actionRow = el('div', { style: 'display:flex;gap:6px;' })
    const clearAllBtn = el('button', {
      style: 'flex:1;padding:6px;font-size:12px;border:1px solid var(--border);border-radius:6px;background:transparent;cursor:pointer;',
      onclick: () => {
        if (confirm('确定要清空所有对话历史吗？')) {
          state.conversations = {}
          saveConversations(state)
          renderHistory()
        }
      }
    }, '清空全部')

    const exportBtn = el('button', {
      style: 'flex:1;padding:6px;font-size:12px;border:1px solid var(--border);border-radius:6px;background:transparent;cursor:pointer;',
      onclick: () => {
        const data = JSON.stringify(state.conversations, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ai-conversations-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    }, '导出备份')

    actionRow.appendChild(clearAllBtn)
    actionRow.appendChild(exportBtn)
    histPanel.appendChild(actionRow)
  }
  renderHistory()

  // 加入面板
  tabs.forEach(tab => {
    panels[tab].style.display = tab === activeTab ? '' : 'none'
    container.appendChild(panels[tab])
  })
}

// ===== 插件主入口 =====
const plugin = {
  state: null,

  async onload(api) {
    this.state = createState(api)
    await loadConversations(this.state)

    // 注册侧边栏面板
    this.state.sidebarHandle = api.registerSidebarPanel({
      id: 'ai-assistant',
      title: 'AI 助手',
      icon: '🤖',
      render: (container) => {
        return renderSidebar(container, this.state, () => {
          if (this.state.sidebarHandle) {
            this.state.sidebarHandle.remove()
            this.state.sidebarHandle = null
          }
        })
      }
    })

    // 注册设置面板
    this.state.settingsHandle = api.registerSettingsPanel({
      id: 'ai-assistant-settings',
      title: 'AI 助手设置',
      render: (container) => {
        renderSettings(container, this.state)
      }
    })

    // 监听文档打开
    api.on('document:open', (fileData) => {
      this.state.currentDocument = fileData
    })

    // 添加命令
    api.addCommand({
      id: 'toggle-ai-assistant',
      name: '切换 AI 助手侧边栏',
      callback: () => {
        // 由工具栏按钮触发
      }
    })

    api.log('AI 助手插件已加载')
  },

  async onunload() {
    if (this.state) {
      await saveConversations(this.state)
      this.state = null
    }
  }
}

export default plugin
