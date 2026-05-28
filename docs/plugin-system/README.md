# HyperRead 插件系统

HyperRead 提供了一个强大且灵活的插件系统，允许开发者通过插件扩展应用功能。插件系统采用类似 Obsidian 的架构设计，支持完整的生命周期管理、事件系统、UI 扩展和数据持久化。

## 核心特性

### 🎯 完整的 API 体系
- **事件系统**：监听文档打开、关闭、标签切换等应用事件
- **UI 扩展**：注册侧边栏面板、设置面板、状态栏项、工具栏按钮
- **自定义视图**：为特定文件类型注册自定义渲染器
- **命令系统**：注册可通过快捷键触发的命令
- **数据持久化**：插件专属的数据存储和设置管理

### 📦 npm 依赖支持
插件可以使用任何 npm 包。通过 esbuild 打包，所有依赖会被捆绑进单个 `main.js` 文件：

```javascript
// 在插件源码中直接 import npm 包
import { marked } from 'marked'
import hljs from 'highlight.js'

// esbuild 会将所有依赖打包进最终的 main.js
```

### 🔄 热重载开发模式
开发模式下，插件文件变化会自动重新加载，无需重启应用。

### 🎨 纯 DOM 渲染
插件 UI 使用原生 DOM API 渲染，不依赖 React，保持轻量和灵活。

## 架构概览

```
HyperRead 应用
├── Plugin Manager (插件管理器)
│   ├── 插件发现和加载
│   ├── 生命周期管理
│   └── 状态追踪
├── Plugin API Factory (API 工厂)
│   ├── 为每个插件创建隔离的 API 实例
│   ├── 事件订阅管理
│   └── UI 注册表
├── Event Bus (事件总线)
│   └── 全局事件分发
├── Plugin Loader (加载器)
│   ├── 动态 import (Blob URL)
│   ├── CSS 注入
│   └── 模块解析
└── UI Registry (UI 注册表)
    ├── Sidebar Panels
    ├── Settings Panels
    ├── Status Bar Items
    ├── Toolbar Buttons
    ├── View Types
    └── Commands
```

## 插件目录结构

### 安装位置
```
~/.hyperread/
├── plugins/              # 已安装的插件
│   ├── word-count/
│   │   ├── manifest.json
│   │   └── main.js
│   └── ai-assistant/
│       ├── manifest.json
│       └── main.js
└── plugin-data/          # 插件数据存储
    ├── word-count/
    │   └── data.json
    └── ai-assistant/
        ├── data.json
        └── settings.json
```

### 开发目录结构
```
my-plugin/
├── manifest.json         # 插件清单
├── package.json          # npm 依赖声明
├── build.js              # esbuild 构建脚本
├── src/
│   └── main.js          # 插件源码
└── main.js              # 构建产物（打包后的代码）
```

## 插件清单 (manifest.json)

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "apiVersion": 1,
  "author": "Your Name",
  "description": "Plugin description",
  "main": "main.js",
  "styles": "styles.css",
  "minAppVersion": "1.0.0",
  "permissions": [],
  "settings": [
    {
      "id": "setting-key",
      "type": "string",
      "title": "Setting Title",
      "description": "Setting description",
      "default": "default value"
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | ✓ | 插件唯一标识符（小写字母、数字、连字符） |
| `name` | string | ✓ | 插件显示名称 |
| `version` | string | ✓ | 插件版本（语义化版本） |
| `apiVersion` | number | ✓ | 插件 API 版本（当前为 1） |
| `main` | string | ✓ | 入口文件路径（相对于插件目录） |
| `author` | string | | 作者名称 |
| `description` | string | | 插件描述 |
| `styles` | string | | CSS 文件路径 |
| `minAppVersion` | string | | 最低应用版本要求 |
| `permissions` | string[] | | 权限列表（预留） |
| `settings` | PluginSettingDef[] | | 声明式设置定义 |

## 插件生命周期

```javascript
export default {
  // 插件加载时调用
  async onload(api) {
    // 注册 UI 组件
    const handle = api.registerSidebarPanel({...})

    // 监听事件
    api.on('document:open', (fileData) => {
      console.log('Document opened:', fileData.fileName)
    })

    // 加载持久化数据
    const data = await api.loadData()

    // 初始化插件逻辑
    // ...
  },

  // 插件卸载时调用
  async onunload() {
    // 保存数据
    await this.saveData()

    // 清理资源（UI 组件会自动清理）
  }
}
```

## 事件系统

插件可以监听以下应用事件：

| 事件 | 触发时机 | 数据类型 |
|------|---------|---------|
| `document:open` | 文档打开 | `FileData` |
| `document:close` | 文档关闭 | `void` |
| `tab:activate` | 标签激活 | `string` (filePath) |
| `tab:close` | 标签关闭 | `string` (filePath) |
| `theme:change` | 主题切换 | `string` (theme name) |
| `app:ready` | 应用就绪 | `void` |

```javascript
api.on('document:open', (fileData) => {
  console.log('Opened:', fileData.fileName)
  console.log('Content:', fileData.content)
})
```

## UI 扩展

### 侧边栏面板
在右侧栏注册自定义面板：

```javascript
api.registerSidebarPanel({
  id: 'my-panel',
  title: '我的面板',
  icon: '🔧',
  render: (container) => {
    container.innerHTML = '<div>Panel content</div>'
    // 返回清理函数（可选）
    return () => {
      // cleanup
    }
  }
})
```

### 设置面板
在设置页面注册自定义设置 UI：

```javascript
api.registerSettingsPanel({
  id: 'my-settings',
  title: '插件设置',
  render: (container) => {
    // 渲染设置界面
  }
})
```

### 状态栏项
在底部状态栏添加项目：

```javascript
const item = api.addStatusBarItem({
  id: 'word-count',
  text: 'Words: 1234',
  tooltip: 'Word count',
  onClick: () => console.log('Clicked')
})

// 更新文本
item.update('Words: 5678')

// 移除
item.remove()
```

### 自定义文件视图
为特定文件类型注册自定义渲染器：

```javascript
api.registerViewType({
  extensions: ['.custom', '.xyz'],
  render: (fileData, container) => {
    container.innerHTML = `<div>Custom view for ${fileData.fileName}</div>`
  }
})
```

## 数据持久化

### 插件数据存储
```javascript
// 加载数据
const data = await api.loadData()
console.log(data.myKey)

// 保存数据
await api.saveData({
  myKey: 'value',
  settings: { ... }
})
```

数据存储在 `~/.hyperread/plugin-data/{plugin-id}/data.json`

### 插件设置
```javascript
// 读取设置
const apiKey = api.getSetting<string>('apiKey')

// 保存设置
api.setSetting('apiKey', 'sk-...')
```

设置存储在 `~/.hyperread/plugin-data/{plugin-id}/settings.json`

## 开发工作流

### 1. 创建插件
```bash
# 复制模板
cp -r plugin-template my-plugin
cd my-plugin

# 修改 manifest.json
# 编辑 src/main.js
```

### 2. 安装依赖（如需要）
```bash
npm install marked highlight.js
```

### 3. 构建
```bash
# 单次构建
npm run build

# 监听模式（开发时）
npm run dev
```

### 4. 打包安装
```bash
# 打包
zip -r my-plugin.zip manifest.json main.js

# 在 HyperRead 中：设置 → 插件 → 安装插件 → 选择 zip 文件
```

### 5. 开发模式热重载
将插件目录软链接到 `~/.hyperread/plugins/`：

```bash
ln -s /path/to/my-plugin ~/.hyperread/plugins/my-plugin
```

文件变化会自动重新加载插件（需在设置中启用开发模式）。

## 示例插件

### 最小示例
```javascript
export default {
  async onload(api) {
    api.log('Hello from my plugin!')

    api.addStatusBarItem({
      id: 'hello',
      text: '👋 Hello'
    })
  },

  async onunload() {}
}
```

### 完整示例
参考 `demo-plugin/ai-assistant/` 目录，包含：
- npm 依赖使用（marked）
- 侧边栏面板
- 设置面板
- 事件监听
- 数据持久化
- 完整的 UI 实现

## 最佳实践

### 性能
- 避免在 `document:open` 事件中执行耗时操作
- 大量 DOM 操作使用 `requestAnimationFrame`
- 及时清理事件监听器和定时器

### 安全
- 不要在插件中硬编码敏感信息
- 使用 `api.getSetting()` 存储 API 密钥等
- 验证用户输入

### 用户体验
- 提供清晰的错误提示
- 使用 `api.log()` 输出调试信息
- 在设置面板提供配置选项
- 遵循应用的设计语言（使用 CSS 变量）

### CSS 变量
```css
/* 使用应用主题变量 */
.my-element {
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}

/* 主要颜色 */
var(--primary)
var(--primary-foreground)

/* 中性色 */
var(--muted)
var(--muted-foreground)

/* 边框 */
var(--border)
```

## 调试

### 控制台日志
```javascript
api.log('Debug message', data)
// 输出: [Plugin:my-plugin] Debug message {...}
```

### 开发者工具
按 `Cmd+Option+I` (macOS) 或 `Ctrl+Shift+I` (Windows/Linux) 打开开发者工具。

### 插件状态
在设置 → 插件中查看插件状态：
- ✓ ACTIVE - 运行中
- ⏸ DISABLED - 已禁用
- ⚠ ERRORED - 错误（查看错误信息）

## 常见问题

### Q: 插件可以访问 Node.js API 吗？
A: 不能。插件运行在渲染进程的沙箱环境中，只能使用 Web API 和 PluginAPI。

### Q: 如何使用 npm 包？
A: 在插件目录运行 `npm install package-name`，然后在源码中 `import`，最后用 esbuild 打包。所有依赖会被捆绑进 `main.js`。

### Q: 插件可以修改应用核心功能吗？
A: 不能。插件只能通过 PluginAPI 扩展功能，不能修改应用核心代码。

### Q: 如何分发插件？
A: 将 `manifest.json` 和 `main.js`（以及可选的 `styles.css`）打包成 zip 文件分发。

### Q: 插件数据存储在哪里？
A: `~/.hyperread/plugin-data/{plugin-id}/`

## 相关文档

- [插件开发手册](./development-guide.md) - 详细的 API 参考和开发指南
- [插件开发者指南](./developer-guide.md) - 从零开始创建插件的完整教程
- [AI 助手插件源码](../../demo-plugin/ai-assistant/) - 完整的插件示例

## 社区

- GitHub Issues: 报告 bug 和功能请求
- 插件市场: 即将推出

---

**版本**: 1.0.0
**最后更新**: 2026-03-15
