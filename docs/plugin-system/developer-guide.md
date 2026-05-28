# HyperRead 插件开发者指南

本指南将带你从零开始创建一个完整的 HyperRead 插件，涵盖从基础到高级的所有开发技巧。

## 目录

- [快速开始](#快速开始)
- [创建第一个插件](#创建第一个插件)
- [使用 npm 依赖](#使用-npm-依赖)
- [UI 开发](#ui-开发)
- [数据持久化](#数据持久化)
- [高级主题](#高级主题)
- [发布插件](#发布插件)

---

## 快速开始

### 环境准备

1. **安装 HyperRead**（如果还没有）
2. **安装 Node.js** (v18+)
3. **准备开发工具**：任何文本编辑器或 IDE

### 插件开发流程

```
创建插件 → 编写代码 → 构建 → 打包 → 安装测试 → 迭代
```

---

## 创建第一个插件

### 步骤 1：复制模板

```bash
# 进入 HyperRead 项目目录
cd /path/to/electron-docs-viewer

# 复制插件模板
cp -r plugin-template my-first-plugin
cd my-first-plugin
```

### 步骤 2：修改 manifest.json

```json
{
  "id": "my-first-plugin",
  "name": "我的第一个插件",
  "version": "1.0.0",
  "apiVersion": 1,
  "author": "你的名字",
  "description": "这是我的第一个 HyperRead 插件",
  "main": "main.js"
}
```

**重要字段**：
- `id`: 必须唯一，只能包含小写字母、数字和连字符
- `name`: 显示在插件列表中的名称
- `version`: 遵循语义化版本（如 1.0.0）
- `main`: 入口文件，通常是 `main.js`

### 步骤 3：编写插件代码

编辑 `src/main.js`（或 `src/main.ts`）：

```javascript
export default {
  async onload(api) {
    // 插件加载时执行
    api.log('Hello from my first plugin!')

    // 添加状态栏项
    api.addStatusBarItem({
      id: 'hello',
      text: '👋 Hello',
      tooltip: '我的第一个插件',
      onClick: () => {
        alert('Hello from plugin!')
      }
    })
  },

  async onunload() {
    // 插件卸载时执行
    api.log('Plugin unloaded')
  }
}
```

### 步骤 4：构建插件

```bash
npm run build
```

这会将 `src/main.js` 编译为 `main.js`。

### 步骤 5：打包

```bash
zip -r my-first-plugin.zip manifest.json main.js
```

### 步骤 6：安装测试

1. 打开 HyperRead
2. 进入 **设置 → 插件**
3. 点击 **安装插件**
4. 选择 `my-first-plugin.zip`
5. 启用插件

你应该能在底部状态栏看到 "👋 Hello"。

---

## 使用 npm 依赖

HyperRead 插件支持使用任何 npm 包。依赖会通过 esbuild 打包进最终的 `main.js`。

### 示例：使用 marked 渲染 Markdown

#### 1. 安装依赖

```bash
npm install marked
```

#### 2. 在代码中使用

```javascript
import { marked } from 'marked'

export default {
  async onload(api) {
    api.registerSidebarPanel({
      id: 'markdown-preview',
      title: 'Markdown 预览',
      icon: '📝',
      render: (container) => {
        const doc = api.getActiveDocument()
        if (doc && doc.fileType === '.md') {
          const html = marked.parse(doc.content)
          container.innerHTML = html
        } else {
          container.innerHTML = '<p>请打开一个 Markdown 文件</p>'
        }

        // 监听文档变化
        const handler = (fileData) => {
          if (fileData.fileType === '.md') {
            container.innerHTML = marked.parse(fileData.content)
          }
        }
        api.on('document:open', handler)

        // 返回清理函数
        return () => {
          api.off('document:open', handler)
        }
      }
    })
  },

  async onunload() {}
}
```

#### 3. 构建

```bash
npm run build
```

esbuild 会自动将 `marked` 打包进 `main.js`。

### 配置 esbuild

编辑 `build.js`：

```javascript
const esbuild = require('esbuild')
const path = require('path')

const PARENT_NODE_MODULES = path.resolve(__dirname, '../../node_modules')

esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'esm',
  outfile: 'main.js',
  nodePaths: [PARENT_NODE_MODULES],
  minify: false,  // 开发时设为 false，发布时设为 true
  sourcemap: false,
}).then(() => {
  console.log('Build complete')
}).catch(e => {
  console.error(e)
  process.exit(1)
})
```

---

## UI 开发

### 侧边栏面板

侧边栏面板显示在应用右侧，适合展示持久化的 UI。

```javascript
api.registerSidebarPanel({
  id: 'my-panel',
  title: '我的面板',
  icon: '🎨',
  render: (container) => {
    // 创建 UI
    container.innerHTML = `
      <div style="padding: 12px;">
        <h3>我的面板</h3>
        <button id="action-btn">执行操作</button>
        <div id="output"></div>
      </div>
    `

    // 绑定事件
    const btn = container.querySelector('#action-btn')
    const output = container.querySelector('#output')

    btn.onclick = () => {
      output.textContent = '操作已执行！'
    }

    // 返回清理函数
    return () => {
      console.log('Panel cleanup')
    }
  }
})
```

### 设置面板

设置面板显示在 **设置 → 插件 → [你的插件] → 设置** 中。

```javascript
api.registerSettingsPanel({
  id: 'my-settings',
  title: '插件设置',
  render: (container) => {
    // 加载当前设置
    const apiKey = api.getSetting('apiKey') || ''
    const enabled = api.getSetting('enabled') ?? true

    container.innerHTML = `
      <div style="padding: 12px; font-size: 13px;">
        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500;">
            API Key
          </label>
          <input type="password" id="api-key" value="${apiKey}"
                 style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 6px;" />
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="enabled" ${enabled ? 'checked' : ''} />
            <span>启用功能</span>
          </label>
        </div>

        <button id="save" style="padding: 6px 12px; background: var(--primary); color: var(--primary-foreground); border: none; border-radius: 6px; cursor: pointer;">
          保存设置
        </button>
        <div id="status" style="margin-top: 8px; font-size: 11px; color: var(--muted-foreground);"></div>
      </div>
    `

    const saveBtn = container.querySelector('#save')
    const status = container.querySelector('#status')

    saveBtn.onclick = () => {
      const newKey = container.querySelector('#api-key').value
      const newEnabled = container.querySelector('#enabled').checked

      api.setSetting('apiKey', newKey)
      api.setSetting('enabled', newEnabled)

      status.textContent = '✓ 设置已保存'
      status.style.color = '#22c55e'

      setTimeout(() => {
        status.textContent = ''
      }, 2000)
    }
  }
})
```

### 使用 CSS 变量

HyperRead 提供了一套 CSS 变量，确保插件 UI 与应用主题一致：

```css
/* 背景和前景色 */
var(--background)
var(--foreground)

/* 主色调 */
var(--primary)
var(--primary-foreground)

/* 中性色 */
var(--muted)
var(--muted-foreground)

/* 边框 */
var(--border)

/* 卡片 */
var(--card)
var(--card-foreground)
```

**示例**：
```javascript
container.innerHTML = `
  <div style="
    background: var(--background);
    color: var(--foreground);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px;
  ">
    <button style="
      background: var(--primary);
      color: var(--primary-foreground);
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
    ">
      点击我
    </button>
  </div>
`
```

### 状态栏项

状态栏项显示在应用底部，适合展示简短信息。

```javascript
const item = api.addStatusBarItem({
  id: 'status',
  text: '就绪',
  tooltip: '插件状态',
  onClick: () => {
    console.log('Status bar clicked')
  }
})

// 动态更新
api.on('document:open', (fileData) => {
  const words = fileData.content.split(/\s+/).length
  item.update(`字数: ${words}`)
})
```

---

## 数据持久化

### 使用 loadData / saveData

插件可以持久化任意 JSON 数据。

```javascript
export default {
  async onload(api) {
    // 加载数据
    const data = await api.loadData()
    this.history = data.history || []
    this.settings = data.settings || {}

    api.log('Loaded history:', this.history.length, 'items')

    // 添加新记录
    api.on('document:open', (fileData) => {
      this.history.push({
        fileName: fileData.fileName,
        timestamp: Date.now()
      })

      // 限制历史记录数量
      if (this.history.length > 100) {
        this.history = this.history.slice(-100)
      }

      // 保存
      this.saveData()
    })
  },

  async saveData() {
    await this.api.saveData({
      history: this.history,
      settings: this.settings
    })
  },

  async onunload() {
    await this.saveData()
  }
}
```

### 使用 getSetting / setSetting

设置是一种特殊的持久化数据，专门用于配置项。

```javascript
// 读取设置
const theme = api.getSetting('theme') || 'auto'
const maxItems = api.getSetting('maxItems') || 10

// 保存设置
api.setSetting('theme', 'dark')
api.setSetting('maxItems', 20)

// 设置会立即保存到磁盘
```

**区别**：
- `loadData/saveData`: 适合存储大量数据（如历史记录、缓存）
- `getSetting/setSetting`: 适合存储配置项（如 API 密钥、偏好设置）

---

## 高级主题

### 监听多个事件

```javascript
export default {
  async onload(api) {
    this.handlers = {
      onDocOpen: (fileData) => {
        console.log('Document opened:', fileData.fileName)
      },
      onDocClose: () => {
        console.log('Document closed')
      },
      onTabActivate: (filePath) => {
        console.log('Tab activated:', filePath)
      }
    }

    api.on('document:open', this.handlers.onDocOpen)
    api.on('document:close', this.handlers.onDocClose)
    api.on('tab:activate', this.handlers.onTabActivate)
  },

  async onunload() {
    // 事件监听器会自动清理
  }
}
```

### 自定义文件视图

为特定文件类型注册自定义渲染器：

```javascript
api.registerViewType({
  extensions: ['.json'],
  render: (fileData, container) => {
    try {
      const data = JSON.parse(fileData.content)

      container.innerHTML = `
        <div style="padding: 20px; font-family: monospace;">
          <h3>${fileData.fileName}</h3>
          <pre style="background: var(--muted); padding: 12px; border-radius: 6px; overflow-x: auto;">
${JSON.stringify(data, null, 2)}
          </pre>
        </div>
      `
    } catch (e) {
      container.innerHTML = `
        <div style="padding: 20px; color: #ef4444;">
          <h3>JSON 解析错误</h3>
          <p>${e.message}</p>
        </div>
      `
    }
  }
})
```

### 异步操作

```javascript
api.on('document:open', async (fileData) => {
  try {
    // 异步处理
    const result = await processDocument(fileData)

    // 更新 UI
    updateUI(result)
  } catch (e) {
    api.log('Error:', e)
    showError(e.message)
  }
})
```

### 防抖和节流

```javascript
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

### 使用 TypeScript

插件可以用 TypeScript 编写：

```typescript
// src/main.ts
interface PluginAPI {
  on(event: string, handler: (data?: any) => void): void
  addStatusBarItem(item: { id: string; text: string }): { update(text: string): void }
  // ... 其他方法
}

interface MyPluginData {
  history: Array<{ fileName: string; timestamp: number }>
  settings: Record<string, unknown>
}

export default {
  async onload(api: PluginAPI) {
    const data = await api.loadData() as MyPluginData
    // ...
  },

  async onunload() {}
}
```

构建配置（`build.js`）：

```javascript
esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'main.js',
  // ...
})
```

---

## 发布插件

### 1. 准备发布

```bash
# 确保版本号正确
# 编辑 manifest.json，更新 version

# 构建生产版本
npm run build

# 测试插件
# 在 HyperRead 中安装并测试所有功能
```

### 2. 打包

```bash
# 只打包必要文件
zip -r my-plugin-v1.0.0.zip manifest.json main.js

# 如果有 CSS
zip -r my-plugin-v1.0.0.zip manifest.json main.js styles.css
```

### 3. 编写 README

创建 `README.md`：

```markdown
# My Plugin

简短描述插件功能。

## 功能

- 功能 1
- 功能 2
- 功能 3

## 安装

1. 下载 `my-plugin-v1.0.0.zip`
2. 在 HyperRead 中：设置 → 插件 → 安装插件
3. 选择下载的 zip 文件
4. 启用插件

## 使用

...

## 配置

...

## 许可证

MIT
```

### 4. 发布渠道

- **GitHub Releases**: 创建 GitHub 仓库，发布 Release
- **插件市场**: 即将推出
- **个人网站**: 提供下载链接

---

## 调试技巧

### 使用 console.log

```javascript
api.log('Debug info:', data)
// 输出: [Plugin:my-plugin] Debug info: {...}
```

### 开发者工具

按 `Cmd+Option+I` (macOS) 或 `Ctrl+Shift+I` (Windows/Linux) 打开开发者工具。

### 热重载

开发模式下，插件文件变化会自动重新加载：

```bash
# 软链接插件目录
ln -s /path/to/my-plugin ~/.hyperread/plugins/my-plugin

# 监听模式构建
npm run dev
```

文件保存后，插件会自动重新加载。

### 错误处理

```javascript
try {
  // 可能出错的代码
  const result = await riskyOperation()
} catch (e) {
  api.log('Error:', e.message)
  // 显示用户友好的错误提示
  showErrorNotification(e.message)
}
```

---

## 常见问题

### Q: 如何访问文件系统？

A: 使用 `api.readFile(path)` 读取文件。插件不能直接访问 Node.js 的 `fs` 模块。

### Q: 如何发起网络请求？

A: 使用标准的 `fetch` API：

```javascript
const response = await fetch('https://api.example.com/data')
const data = await response.json()
```

### Q: 如何使用第三方 UI 库？

A: 安装 npm 包并 import：

```bash
npm install chart.js
```

```javascript
import Chart from 'chart.js/auto'

// 在 render 函数中使用
render: (container) => {
  const canvas = document.createElement('canvas')
  container.appendChild(canvas)

  new Chart(canvas, {
    type: 'bar',
    data: { ... }
  })
}
```

### Q: 插件可以修改应用核心功能吗？

A: 不能。插件只能通过 PluginAPI 扩展功能。

### Q: 如何在插件间通信？

A: 目前不支持直接的插件间通信。可以通过共享的应用事件间接通信。

---

## 示例项目

### 完整示例：AI 助手插件

查看 `demo-plugin/ai-assistant/` 目录，这是一个功能完整的插件，包含：

- npm 依赖使用（marked）
- 侧边栏面板（聊天界面）
- 设置面板（API 配置、角色管理、历史记录）
- 数据持久化（对话历史）
- 事件监听（文档打开）
- 完整的 UI 实现

**源码结构**：
```
demo-plugin/ai-assistant/
├── manifest.json
├── package.json
├── build.js
├── src/
│   └── main.js (1000+ 行)
└── main.js (构建产物)
```

---

## 下一步

- 阅读 [API 参考手册](./api-reference.md) 了解所有 API 细节
- 查看 [插件系统概览](./README.md) 了解架构设计
- 加入社区，分享你的插件

---

**版本**: 1.0.0
**最后更新**: 2026-03-15
