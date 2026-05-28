# HyperRead 插件 API 参考手册

本文档详细描述了 HyperRead 插件系统的所有 API、接口和类型定义。

## 目录

- [核心接口](#核心接口)
- [PluginAPI](#pluginapi)
- [事件系统](#事件系统)
- [UI 扩展 API](#ui-扩展-api)
- [数据和设置](#数据和设置)
- [类型定义](#类型定义)

---

## 核心接口

### HyperReadPlugin

插件的主入口接口。每个插件必须导出一个实现此接口的对象。

```typescript
interface HyperReadPlugin {
  onload(api: PluginAPI): void | Promise<void>
  onunload(): void | Promise<void>
}
```

**示例**：
```javascript
export default {
  async onload(api) {
    // 插件初始化逻辑
    this.statusItem = api.addStatusBarItem({
      id: 'my-item',
      text: 'Ready'
    })
  },

  async onunload() {
    // 清理逻辑（UI 组件会自动清理）
    await this.saveData()
  }
}
```

---

## PluginAPI

插件 API 是插件与 HyperRead 应用交互的主要接口。每个插件在 `onload` 时会收到一个独立的 API 实例。

### 事件方法

#### `on(event, handler)`

订阅应用事件。

```typescript
on(event: PluginEvent, handler: (data?: unknown) => void): void
```

**参数**：
- `event`: 事件名称（见[事件类型](#事件类型)）
- `handler`: 事件处理函数

**示例**：
```javascript
api.on('document:open', (fileData) => {
  console.log('Document opened:', fileData.fileName)
})
```

#### `off(event, handler)`

取消订阅事件。

```typescript
off(event: PluginEvent, handler: (data?: unknown) => void): void
```

**注意**：必须传入与 `on()` 时相同的函数引用。

**示例**：
```javascript
const handler = (data) => console.log(data)
api.on('document:open', handler)
// 稍后取消订阅
api.off('document:open', handler)
```

### UI 注册方法

#### `registerSidebarPanel(panel)`

在右侧栏注册一个侧边栏面板。

```typescript
registerSidebarPanel(panel: SidebarPanelDef): SidebarHandle
```

**参数**：
```typescript
interface SidebarPanelDef {
  id: string                    // 面板唯一 ID
  title: string                 // 显示标题
  icon?: string                 // 图标（emoji 或单字符）
  render: (container: HTMLElement) => (() => void) | void
}
```

**返回**：
```typescript
interface SidebarHandle {
  remove(): void  // 移除面板
}
```

**示例**：
```javascript
const handle = api.registerSidebarPanel({
  id: 'my-panel',
  title: '我的面板',
  icon: '🔧',
  render: (container) => {
    // 渲染 UI
    const div = document.createElement('div')
    div.textContent = 'Hello from panel'
    container.appendChild(div)

    // 返回清理函数（可选）
    return () => {
      console.log('Panel cleanup')
    }
  }
})

// 移除面板
handle.remove()
```

#### `registerSettingsPanel(panel)`

在设置页面注册自定义设置面板。

```typescript
registerSettingsPanel(panel: SettingsPanelDef): SettingsHandle
```

**参数**：
```typescript
interface SettingsPanelDef {
  id: string
  title: string
  icon?: string
  render: (container: HTMLElement) => (() => void) | void
}
```

**示例**：
```javascript
api.registerSettingsPanel({
  id: 'my-settings',
  title: '插件设置',
  render: (container) => {
    container.innerHTML = `
      <div>
        <label>API Key:</label>
        <input type="text" id="api-key" />
        <button id="save">保存</button>
      </div>
    `

    const input = container.querySelector('#api-key')
    const btn = container.querySelector('#save')

    input.value = api.getSetting('apiKey') || ''

    btn.onclick = () => {
      api.setSetting('apiKey', input.value)
      alert('已保存')
    }
  }
})
```

#### `addStatusBarItem(item)`

在底部状态栏添加项目。

```typescript
addStatusBarItem(item: StatusBarItem): StatusBarHandle
```

**参数**：
```typescript
interface StatusBarItem {
  id: string
  text: string
  tooltip?: string
  onClick?: () => void
}
```

**返回**：
```typescript
interface StatusBarHandle {
  update(text: string): void  // 更新文本
  remove(): void              // 移除项目
}
```

**示例**：
```javascript
const item = api.addStatusBarItem({
  id: 'word-count',
  text: 'Words: 0',
  tooltip: 'Word count',
  onClick: () => {
    console.log('Status bar item clicked')
  }
})

// 更新文本
item.update('Words: 1234')

// 移除
item.remove()
```

#### `addToolbarButton(button)`

在工具栏添加按钮（预留功能）。

```typescript
addToolbarButton(btn: ToolbarButton): ToolbarHandle
```

**参数**：
```typescript
interface ToolbarButton {
  id: string
  icon: string      // SVG 或 emoji
  tooltip?: string
  onClick: () => void
}
```

#### `registerViewType(view)`

为特定文件扩展名注册自定义视图渲染器。

```typescript
registerViewType(view: ViewTypeDef): ViewTypeHandle
```

**参数**：
```typescript
interface ViewTypeDef {
  extensions: string[]  // 文件扩展名列表，如 ['.custom', '.xyz']
  render: (fileData: FileData, container: HTMLElement) => void | (() => void)
}
```

**示例**：
```javascript
api.registerViewType({
  extensions: ['.json'],
  render: (fileData, container) => {
    try {
      const data = JSON.parse(fileData.content)
      container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`
    } catch (e) {
      container.innerHTML = `<div>Invalid JSON: ${e.message}</div>`
    }
  }
})
```

#### `addCommand(cmd)`

注册命令（可绑定快捷键）。

```typescript
addCommand(cmd: CommandDef): void
```

**参数**：
```typescript
interface CommandDef {
  id: string
  name: string
  shortcut?: string  // 如 'Ctrl+Shift+P'
  callback: () => void
}
```

**示例**：
```javascript
api.addCommand({
  id: 'toggle-panel',
  name: '切换面板',
  shortcut: 'Ctrl+Shift+T',
  callback: () => {
    // 执行命令
  }
})
```

#### `removeCommand(id)`

移除命令。

```typescript
removeCommand(id: string): void
```

### 数据和设置

#### `loadData()`

加载插件持久化数据。

```typescript
loadData(): Promise<Record<string, unknown>>
```

**返回**：插件数据对象（如果不存在则返回空对象 `{}`）

**示例**：
```javascript
const data = await api.loadData()
console.log(data.conversations)
console.log(data.lastSync)
```

#### `saveData(data)`

保存插件数据。

```typescript
saveData(data: Record<string, unknown>): Promise<void>
```

**参数**：
- `data`: 要保存的数据对象（会完全覆盖现有数据）

**示例**：
```javascript
await api.saveData({
  conversations: [...],
  lastSync: Date.now(),
  settings: { ... }
})
```

**注意**：
- 数据存储在 `~/.hyperread/plugin-data/{plugin-id}/data.json`
- 数据会被序列化为 JSON，不支持函数、循环引用等
- 建议定期保存，避免数据丢失

#### `getSetting(key)`

读取插件设置。

```typescript
getSetting<T>(key: string): T | undefined
```

**返回**：设置值，如果不存在则返回 `undefined`

**示例**：
```javascript
const apiKey = api.getSetting<string>('apiKey')
const maxItems = api.getSetting<number>('maxItems') || 10
const enabled = api.getSetting<boolean>('enabled') ?? true
```

#### `setSetting(key, value)`

保存插件设置。

```typescript
setSetting<T>(key: string, value: T): void
```

**参数**：
- `key`: 设置键名
- `value`: 设置值（会自动持久化到磁盘）

**示例**：
```javascript
api.setSetting('apiKey', 'sk-...')
api.setSetting('maxItems', 20)
api.setSetting('enabled', false)
```

**注意**：
- 设置存储在 `~/.hyperread/plugin-data/{plugin-id}/settings.json`
- 设置会立即保存到磁盘
- 支持的类型：string, number, boolean, object, array

### 文档访问

#### `getActiveDocument()`

获取当前激活的文档。

```typescript
getActiveDocument(): FileData | null
```

**返回**：
```typescript
interface FileData {
  content: string    // 文档内容
  fileName: string   // 文件名
  filePath: string   // 完整路径
  fileType: string   // 文件类型（扩展名）
}
```

**示例**：
```javascript
const doc = api.getActiveDocument()
if (doc) {
  console.log('Current file:', doc.fileName)
  console.log('Content length:', doc.content.length)
}
```

#### `readFile(path)`

读取指定路径的文件。

```typescript
readFile(path: string): Promise<FileData>
```

**参数**：
- `path`: 文件绝对路径

**示例**：
```javascript
try {
  const file = await api.readFile('/path/to/file.md')
  console.log(file.content)
} catch (e) {
  console.error('Failed to read file:', e)
}
```

### 工具方法

#### `log(...args)`

输出日志到控制台（带插件 ID 前缀）。

```typescript
log(...args: unknown[]): void
```

**示例**：
```javascript
api.log('Plugin initialized')
api.log('Data loaded:', data)
// 输出: [Plugin:my-plugin] Plugin initialized
// 输出: [Plugin:my-plugin] Data loaded: {...}
```

---

## 事件系统

### 事件类型

```typescript
type PluginEvent =
  | 'document:open'
  | 'document:close'
  | 'tab:activate'
  | 'tab:close'
  | 'theme:change'
  | 'app:ready'
```

### 事件详情

#### `document:open`

文档打开时触发。

**数据类型**：`FileData`

```javascript
api.on('document:open', (fileData) => {
  console.log('Opened:', fileData.fileName)
  console.log('Type:', fileData.fileType)
  console.log('Path:', fileData.filePath)
  console.log('Content:', fileData.content)
})
```

#### `document:close`

文档关闭时触发。

**数据类型**：`void`

```javascript
api.on('document:close', () => {
  console.log('Document closed')
})
```

#### `tab:activate`

标签页激活时触发。

**数据类型**：`string` (文件路径)

```javascript
api.on('tab:activate', (filePath) => {
  console.log('Tab activated:', filePath)
})
```

#### `tab:close`

标签页关闭时触发。

**数据类型**：`string` (文件路径)

```javascript
api.on('tab:close', (filePath) => {
  console.log('Tab closed:', filePath)
})
```

#### `theme:change`

主题切换时触发。

**数据类型**：`string` (主题名称)

```javascript
api.on('theme:change', (themeName) => {
  console.log('Theme changed to:', themeName)
})
```

#### `app:ready`

应用初始化完成时触发。

**数据类型**：`void`

```javascript
api.on('app:ready', () => {
  console.log('App is ready')
  // 执行初始化逻辑
})
```

---

## 类型定义

### PluginManifest

```typescript
interface PluginManifest {
  id: string                    // 插件 ID（必需）
  name: string                  // 显示名称（必需）
  version: string               // 版本号（必需）
  apiVersion: number            // API 版本（必需，当前为 1）
  main: string                  // 入口文件（必需）
  author?: string               // 作者
  description?: string          // 描述
  styles?: string               // CSS 文件路径
  minAppVersion?: string        // 最低应用版本
  permissions?: string[]        // 权限列表
  settings?: PluginSettingDef[] // 声明式设置
}
```

### PluginSettingDef

```typescript
interface PluginSettingDef {
  id: string
  type: 'string' | 'number' | 'boolean' | 'select'
  title: string
  description?: string
  options?: string[]  // type 为 'select' 时使用
  default?: unknown
}
```

**示例**：
```json
{
  "settings": [
    {
      "id": "apiKey",
      "type": "string",
      "title": "API Key",
      "description": "Your API key"
    },
    {
      "id": "maxResults",
      "type": "number",
      "title": "Max Results",
      "default": 10
    },
    {
      "id": "enabled",
      "type": "boolean",
      "title": "Enable Feature",
      "default": true
    },
    {
      "id": "theme",
      "type": "select",
      "title": "Theme",
      "options": ["light", "dark", "auto"],
      "default": "auto"
    }
  ]
}
```

### FileData

```typescript
interface FileData {
  content: string    // 文件内容
  fileName: string   // 文件名（不含路径）
  filePath: string   // 完整路径
  fileType: string   // 文件扩展名（如 '.md'）
}
```

### PluginState

```typescript
type PluginState =
  | 'DISCOVERED'  // 已发现
  | 'LOADING'     // 加载中
  | 'ACTIVE'      // 运行中
  | 'UNLOADING'   // 卸载中
  | 'DISABLED'    // 已禁用
  | 'ERRORED'     // 错误
```

---

## 完整示例

### 字数统计插件

```javascript
export default {
  async onload(api) {
    let statusItem = null

    const updateCount = () => {
      const doc = api.getActiveDocument()
      if (doc) {
        const words = doc.content.trim().split(/\s+/).filter(Boolean).length
        const chars = doc.content.replace(/\s/g, '').length
        statusItem.update(`W: ${words.toLocaleString()} | C: ${chars.toLocaleString()}`)
      } else {
        statusItem.update('W: —')
      }
    }

    statusItem = api.addStatusBarItem({
      id: 'word-count',
      text: 'W: —',
      tooltip: 'Word count'
    })

    api.on('document:open', updateCount)
    api.on('document:close', () => statusItem.update('W: —'))

    updateCount()
    api.log('Word Count plugin loaded')
  },

  async onunload() {
    // 清理由插件管理器自动处理
  }
}
```

### 带设置的插件

```javascript
export default {
  async onload(api) {
    // 加载设置
    const apiKey = api.getSetting('apiKey')
    const enabled = api.getSetting('enabled') ?? true

    // 注册设置面板
    api.registerSettingsPanel({
      id: 'my-settings',
      title: '插件设置',
      render: (container) => {
        container.innerHTML = `
          <div style="padding: 12px;">
            <label style="display: block; margin-bottom: 8px;">
              <input type="checkbox" id="enabled" ${enabled ? 'checked' : ''} />
              启用功能
            </label>
            <label style="display: block; margin-bottom: 4px;">API Key:</label>
            <input type="password" id="apiKey" value="${apiKey || ''}"
                   style="width: 100%; padding: 6px; margin-bottom: 8px;" />
            <button id="save" style="padding: 6px 12px;">保存</button>
          </div>
        `

        container.querySelector('#save').onclick = () => {
          const newKey = container.querySelector('#apiKey').value
          const newEnabled = container.querySelector('#enabled').checked
          api.setSetting('apiKey', newKey)
          api.setSetting('enabled', newEnabled)
          alert('设置已保存')
        }
      }
    })

    api.log('Plugin loaded with settings')
  },

  async onunload() {}
}
```

---

## 最佳实践

### 错误处理

```javascript
api.on('document:open', async (fileData) => {
  try {
    await processDocument(fileData)
  } catch (e) {
    api.log('Error processing document:', e)
    // 显示用户友好的错误提示
  }
})
```

### 清理资源

```javascript
export default {
  async onload(api) {
    this.interval = setInterval(() => {
      // 定期任务
    }, 5000)

    this.handler = (data) => console.log(data)
    api.on('document:open', this.handler)
  },

  async onunload() {
    // 清理定时器
    if (this.interval) clearInterval(this.interval)

    // 事件监听器会自动清理，但也可以手动清理
    // api.off('document:open', this.handler)
  }
}
```

### 性能优化

```javascript
// 使用防抖避免频繁更新
function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const updateUI = debounce(() => {
  // 更新 UI
}, 300)

api.on('document:open', updateUI)
```

---

**版本**: 1.0.0
**最后更新**: 2026-03-15
