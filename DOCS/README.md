# HyperRead 文档

欢迎来到 HyperRead 文档中心。

## 📚 文档目录

### 插件系统

HyperRead 提供了强大的插件系统，允许开发者扩展应用功能。

- **[插件系统概览](./plugin-system/README.md)** - 插件系统架构、特性和核心概念
- **[API 参考手册](./plugin-system/api-reference.md)** - 完整的 API 文档和类型定义
- **[开发者指南](./plugin-system/developer-guide.md)** - 从零开始创建插件的完整教程

### 快速链接

#### 新手入门
1. [什么是插件系统？](./plugin-system/README.md#核心特性)
2. [创建第一个插件](./plugin-system/developer-guide.md#创建第一个插件)
3. [使用 npm 依赖](./plugin-system/developer-guide.md#使用-npm-依赖)

#### API 文档
- [PluginAPI 接口](./plugin-system/api-reference.md#pluginapi)
- [事件系统](./plugin-system/api-reference.md#事件系统)
- [UI 扩展 API](./plugin-system/api-reference.md#ui-扩展-api)
- [数据持久化](./plugin-system/api-reference.md#数据和设置)

#### 示例和最佳实践
- [完整示例](./plugin-system/api-reference.md#完整示例)
- [UI 开发](./plugin-system/developer-guide.md#ui-开发)
- [高级主题](./plugin-system/developer-guide.md#高级主题)

## 🚀 快速开始

### 安装插件

1. 打开 HyperRead
2. 进入 **设置 → 插件**
3. 点击 **安装插件**
4. 选择插件 zip 文件
5. 启用插件

### 开发插件

```bash
# 1. 复制模板
cp -r plugin-template my-plugin
cd my-plugin

# 2. 编辑代码
# 修改 src/main.js

# 3. 构建
npm run build

# 4. 打包
zip -r my-plugin.zip manifest.json main.js

# 5. 安装测试
```

详细步骤请参考 [开发者指南](./plugin-system/developer-guide.md)。

## 📦 示例插件

### Word Count（字数统计）
位置：`plugin-template/`

简单的状态栏插件，显示当前文档的字数和字符数。

**特性**：
- 状态栏项
- 事件监听
- 实时更新

### AI Assistant（AI 助手）
位置：`demo-plugin/ai-assistant/`

功能完整的 AI 聊天助手插件，展示了插件系统的所有高级特性。

**特性**：
- npm 依赖（marked）
- 侧边栏面板
- 设置面板
- 数据持久化
- Markdown 渲染
- 完整的聊天 UI

## 🛠 开发工具

### esbuild
插件使用 esbuild 打包，支持：
- ES6+ 语法
- TypeScript
- npm 依赖捆绑
- 快速构建

### 热重载
开发模式下，插件文件变化会自动重新加载。

### 开发者工具
按 `Cmd+Option+I` (macOS) 或 `Ctrl+Shift+I` (Windows/Linux) 打开。

## 📖 其他文档

### 功能文档
- [拖拽文件夹功能修复](./拖拽文件夹功能修复详细过程.md)
- [键盘快捷键系统](./keyboard-shortcuts-system-design.md)
- [Markdown 搜索高亮](./markdown-search-highlight-enhancement.md)
- [搜索 UI 优化](./search-ui-optimization-summary.md)
- [设置改进](./settings-improvements-summary.md)

## 🤝 贡献

欢迎贡献文档改进和插件示例！

## 📝 许可证

MIT

---

**最后更新**: 2026-03-15
