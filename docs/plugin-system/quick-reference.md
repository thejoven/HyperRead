# HyperRead 插件 API 快速参考

## 插件结构

```javascript
export default {
  async onload(api) {
    // 初始化
  },
  async onunload() {
    // 清理
  }
}
```

## 事件监听

```javascript
api.on('document:open', (fileData) => {})
api.on('document:close', () => {})
api.on('tab:activate', (filePath) => {})
api.on('tab:close', (filePath) => {})
api.on('theme:change', (theme) => {})
api.on('app:ready', () => {})
```

## UI 注册

### 侧边栏面板
```javascript
api.registerSidebarPanel({
  id: 'my-panel',
  title: '标题',
  icon: '🔧',
  render: (container) => {
    container.innerHTML = '<div>内容</div>'
    return () => { /* cleanup */ }
  }
})
```

### 设置面板
```javascript
api.registerSettingsPanel({
  id: 'settings',
  title: '设置',
  render: (container) => { /* ... */ }
})
```

### 状态栏
```javascript
const item = api.addStatusBarItem({
  id: 'status',
  text: '文本',
  tooltip: '提示',
  onClick: () => {}
})
item.update('新文本')
item.remove()
```

### 自定义视图
```javascript
api.registerViewType({
  extensions: ['.custom'],
  render: (fileData, container) => { /* ... */ }
})
```

### 命令
```javascript
api.addCommand({
  id: 'cmd',
  name: '命令名',
  shortcut: 'Ctrl+Shift+P',
  callback: () => {}
})
```

## 数据和设置

```javascript
// 数据
const data = await api.loadData()
await api.saveData({ key: 'value' })

// 设置
const value = api.getSetting('key')
api.setSetting('key', 'value')
```

## 文档访问

```javascript
const doc = api.getActiveDocument()
// { content, fileName, filePath, fileType }

const file = await api.readFile('/path/to/file')
```

## 工具

```javascript
api.log('消息', data)
// 输出: [Plugin:id] 消息 {...}
```

## CSS 变量

```css
var(--background)
var(--foreground)
var(--primary)
var(--primary-foreground)
var(--muted)
var(--muted-foreground)
var(--border)
```

## manifest.json

```json
{
  "id": "plugin-id",
  "name": "插件名",
  "version": "1.0.0",
  "apiVersion": 1,
  "main": "main.js",
  "author": "作者",
  "description": "描述"
}
```

## 构建和打包

```bash
# 构建
npm run build

# 打包
zip -r plugin.zip manifest.json main.js

# 开发模式
npm run dev
```

## 常用模式

### 防抖
```javascript
function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
```

### 错误处理
```javascript
try {
  await operation()
} catch (e) {
  api.log('Error:', e)
}
```

### 清理资源
```javascript
export default {
  async onload(api) {
    this.interval = setInterval(() => {}, 1000)
    this.handler = () => {}
    api.on('event', this.handler)
  },
  async onunload() {
    clearInterval(this.interval)
    // 事件监听器自动清理
  }
}
```

---

完整文档：[插件系统文档](./README.md)
