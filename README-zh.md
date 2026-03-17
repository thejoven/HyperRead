<div align="center">

# HyperRead

<img src="./logo/logo.png" alt="HyperRead Logo" width="200" />

**Read smarter. Read faster.**

一个美观的 macOS 风格文档阅读器，支持 Markdown、PDF、EPUB，基于 Electron 构建。

[![Version](https://img.shields.io/badge/version-5.6.0-blue.svg)](https://github.com/thejoven/HyperRead/releases)
[![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://github.com/thejoven/HyperRead)
[![License](https://img.shields.io/badge/license-AGPL--3.0-green.svg)](LICENSE)
[![Downloads](https://img.shields.io/badge/downloads-latest-brightgreen.svg)](https://github.com/thejoven/HyperRead/releases/latest)
[![Twitter](https://img.shields.io/badge/Twitter-@thejoven_com-1DA1F2.svg?logo=twitter)](https://x.com/thejoven_com)

[English](./README.md) | 简体中文

</div>

## ✨ 特性

<table>
<tr>
<td width="50%">

- 🎨 **macOS 原生界面** - 完美符合 macOS 设计风格，支持毛玻璃效果和流畅动画
- 📁 **多格式支持** - 支持 Markdown (.md/.markdown)、PDF (.pdf)、EPUB (.epub) 文件
- 📖 **专业 EPUB 阅读器** - Apple Books 风格的阅读体验，支持精确分页
- 🌳 **文件树浏览** - 递归扫描并展示目录结构中的所有文档文件，支持拖拽加载
- 🎯 **高性能渲染** - 支持 Mermaid 图表、代码高亮、数学公式 (KaTeX)

</td>
<td width="50%">

- ⚙️ **设置中心** - 集中管理字体大小、多语言、AI 助手和快捷键等设置
- 🔌 **插件系统** - Obsidian 风格的插件 API，支持侧边栏面板、状态栏、自定义视图和 npm 依赖
- 🔍 **高级搜索** - 全文搜索，支持高亮显示和所有 Markdown 元素
- ⌨️ **快捷键系统** - 可自定义快捷键系统，支持双击触发
- 🖼️ **图片预览缩放** - 点击图片可放大预览，支持平移和拖拽控制
- 🌓 **主题切换** - 支持明暗主题自动切换

</td>
</tr>
</table>

## 🚀 快速开始

### 方式一：下载预编译版本（推荐）

<div align="center">

[![Download](https://img.shields.io/badge/Download-HyperRead%205.6.0-blue?style=for-the-badge&logo=apple)](https://github.com/thejoven/HyperRead/releases/latest)

</div>

1. 下载 `HyperRead-5.6.0-arm64.dmg` 安装包
2. 双击 DMG 文件
3. 将 HyperRead 拖拽到 Applications 文件夹
4. 首次运行可能需要在"系统偏好设置 > 安全性与隐私"中允许

### 方式二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/thejoven/HyperRead.git
cd HyperRead

# 安装依赖
npm install

# 开发模式运行（推荐）
npm run start-dev    # 带开发者工具
npm run start        # 生产模式
```

## 📖 使用方法

### 打开文件

<table>
<tr>
<td width="33%">

**🖱️ 拖拽方式**
直接将 `.md`、`.pdf` 或 `.epub` 文件，或文件夹拖拽到应用窗口

</td>
<td width="33%">

**📂 菜单方式**
点击顶部的"打开文件"或"打开文件夹"按钮浏览文件

</td>
<td width="33%">

**⌨️ 快捷键**
支持常用的文件操作和导航快捷键

</td>
</tr>
</table>

### 支持的功能

#### 📝 Markdown
<table>
<tr>
<td width="50%">

- ✅ **标准 Markdown** - 支持所有标准 Markdown 语法
- ✅ **代码高亮** - 基于 highlight.js，支持多种编程语言
- ✅ **数学公式** - 支持 LaTeX 格式的数学公式渲染

</td>
<td width="50%">

- ✅ **Mermaid 图表** - 支持流程图、时序图、甘特图等，带全屏缩放和拖拽功能
- ✅ **表格和列表** - 完整支持 GFM (GitHub Flavored Markdown)
- ✅ **图片显示** - 支持本地和远程图片

</td>
</tr>
</table>

#### 📖 EPUB 阅读器
<table>
<tr>
<td width="50%">

- ✅ **Apple Books 风格** - 专业的排版，支持两端对齐和自动连字符
- ✅ **精确分页** - 基于 CFI 的位置追踪，实现精确页码显示
- ✅ **阅读进度记忆** - 自动保存阅读位置，重新打开时弹窗询问是否继续
- ✅ **键盘导航** - 支持方向键、J/K、空格、Page Up/Down 流畅翻页

</td>
<td width="50%">

- ✅ **响应式布局** - 优化的内边距和边距，舒适的阅读体验
- ✅ **主题集成** - 无缝的明暗主题切换
- ✅ **交互内容** - 支持带有嵌入式脚本和媒体的 EPUB
- ✅ **iframe 内快捷键** - 点击内容区域后快捷键依然有效

</td>
</tr>
</table>

#### 📄 PDF 查看器
- ✅ **高质量渲染** - 基于 PDF.js，精确显示文档内容
- ✅ **页面导航** - 便捷的页面控制和键盘快捷键

## 🛠️ 开发

### 技术栈

<table>
<tr>
<td width="50%">

**🎨 前端技术**
- React 19 + TypeScript
- Vite 7 (构建工具)
- Tailwind CSS 4 (样式)

**📱 桌面框架**
- Electron 38

</td>
<td width="50%">

**📝 内容渲染**
- react-markdown + remark/rehype (Markdown)
- epub.js (EPUB 渲染)
- PDF.js (PDF 渲染)
- Mermaid (图表)
- KaTeX (数学公式)
- highlight.js (代码高亮)

</td>
</tr>
</table>

### 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── styles/            # 样式文件
│   └── electron-app.tsx   # 主应用入口
├── electron/              # Electron 主进程
│   ├── main.js           # 主进程入口
│   └── preload.js        # 预加载脚本
├── dist/                  # 构建输出
├── release/               # 打包输出
└── package.json          # 项目配置
```

### 开发命令

```bash
# 开发
npm run dev                # Vite 开发服务器
npm run start-dev         # 构建 + Electron 开发模式
npm run start             # 构建 + Electron 生产模式

# 构建
npm run build             # 构建前端资源

# 打包
npm run dist              # 打包 macOS 应用
npm run dist-all          # 打包全平台（macOS + Windows + Linux）

# 代码检查
npm run lint              # ESLint 检查
```

### 性能优化

项目采用了多项性能优化措施：

- **代码分割**: 按需加载 Mermaid、KaTeX 等大型库
- **Tree Shaking**: 移除未使用的代码
- **Bundle 分析**: 优化后总体积减少 81%
- **内存优化**: React memo、useMemo、useCallback
- **懒加载**: 大型组件按需加载

## 📋 系统要求

- **操作系统**: macOS 10.15+ (Catalina 或更高版本)
- **架构**: Apple Silicon (M1/M2) 或 Intel x64
- **内存**: 建议 4GB 以上
- **存储**: 约 150MB 安装空间

## 🔌 插件开发

HyperRead 提供 Obsidian 风格的插件系统，插件可以添加侧边栏面板、状态栏项、设置页、自定义文件渲染器，并监听应用事件。

### 快速开始

```bash
cp -r plugin-template my-plugin
cd my-plugin
npm install
npm run build
# 软链接用于实时开发
ln -s "$(pwd)" ~/.hyperread/plugins/my-plugin
```

### 最小插件示例

```javascript
// src/main.js
export default {
  async onload(api) {
    api.addStatusBarItem({ id: 'hello', text: '👋 Hello' })

    api.on('document:open', (file) => {
      const words = file.content.trim().split(/\s+/).length
      api.addStatusBarItem({ id: 'wc', text: `字数: ${words}` })
    })
  },
  async onunload() {}
}
```

### 扩展点一览

| API | 说明 |
|-----|------|
| `api.registerSidebarPanel(opts)` | 在右侧边栏添加面板 |
| `api.registerSettingsPanel(opts)` | 在设置 → 插件中添加标签页 |
| `api.addStatusBarItem(opts)` | 在底部状态栏添加项目 |
| `api.registerViewType(opts)` | 为文件扩展名注册自定义渲染器 |
| `api.on(event, handler)` | 订阅应用事件（`document:open`、`theme:change` 等） |
| `api.loadData() / saveData()` | 持久化任意 JSON 数据 |
| `api.getSetting() / setSetting()` | 读写插件设置 |

### 插件开发文档

| 链接 | 说明 |
|------|------|
| [**Plugin Development Guide (English)**](./DOCS/plugin-system/plugin-development-en.md) | 完整英文指南 |
| [**插件系统概览**](./DOCS/plugin-system/README.md) | 架构、特性与核心概念 |
| [**开发者指南**](./DOCS/plugin-system/developer-guide.md) | 从零创建插件的完整教程 |
| [**API 参考手册**](./DOCS/plugin-system/api-reference.md) | 完整 API 类型定义 |
| [**快速参考**](./DOCS/plugin-system/quick-reference.md) | API 速查表 |
| [Word Count 模板](./plugin-template/) | 最小示例插件 |
| [AI 助手示例](./demo-plugin/ai-assistant/) | 功能完整的示例插件 |

### 安装插件

1. 打开 HyperRead → **设置 → 插件**
2. 点击 **安装插件**
3. 选择插件 `.zip` 文件
4. 启用插件

---

## 🤝 贡献

我们欢迎任何形式的贡献！请遵循以下步骤：

1. 🍴 Fork 本仓库
2. 🌿 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 💾 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 📤 推送到分支 (`git push origin feature/AmazingFeature`)
5. 🔄 创建 Pull Request

## 📄 许可证

本项目基于 [GNU Affero General Public License v3.0](LICENSE) 开源。

## 🔗 相关链接

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-仓库-black?style=for-the-badge&logo=github)](https://github.com/thejoven/HyperRead)
[![Twitter](https://img.shields.io/badge/Twitter-@thejoven_com-1DA1F2?style=for-the-badge&logo=twitter)](https://x.com/thejoven_com)
[![Issues](https://img.shields.io/badge/Issues-问题反馈-red?style=for-the-badge&logo=github)](https://github.com/thejoven/HyperRead/issues)
[![Releases](https://img.shields.io/badge/Releases-版本发布-blue?style=for-the-badge&logo=github)](https://github.com/thejoven/HyperRead/releases)

</div>

## 📝 最新更新

### 🎉 版本 5.6.0（最新）

**改进：**
- 🔌 **插件系统文档** - 新增完整英文插件开发指南，涵盖完整 API 参考、UI 扩展示例、npm 依赖、TypeScript 支持和热重载工作流
- 📖 **README 插件章节** - 新增插件开发章节，包含快速开始、扩展点一览和文档链接
- 🎨 **关于弹窗重设计** - 精致的 macOS 风格关于对话框，带渐变 Hero 头部、版本徽章、图标网格特性列表和优化的社交链接

### 版本 5.2.1

**关键修复：**
- 📁 **原生目录刷新** - 为拖拽的文件夹实现了健壮的系统路径追踪，支持原生"刷新"功能而无需重新拖拽。
- 📚 **EPUB 关联崩溃修复** - 通过优化 IPC 数据传输，解决了通过"打开方式"打开大型 EPUB 文件时的主进程崩溃问题。
- 🎯 **可靠的文件读取** - 在所有文件操作中一致使用绝对系统路径，确保在外部修改后能正确加载文档内容。

### 版本 5.1.0

**主要更新：**
- 📖 **EPUB 阅读进度记忆** - 自动保存阅读位置，重新打开书籍时显示优雅的恢复对话框
- ⌨️ **增强 EPUB 快捷键** - 点击 EPUB 内容区域后键盘导航依然流畅工作
- 🏗️ **重大代码重构** - electron-app.tsx 从 2065 行减少到 475 行（减少 77%）
- 🎨 **模块化架构** - 新增 hooks（use-settings、use-directory、use-drag-drop）和组件，提高可维护性
- 🔧 **改进类型安全** - 增强 TypeScript 类型定义和更好的代码组织

👀 **[查看完整更新日志](./CHANGELOG.md)** - 详细的发布说明和版本历史

---

<div align="center">

## 👨‍💻 作者

如果这个项目对你有帮助，请给它一个 ⭐️

[![Star](https://img.shields.io/github/stars/thejoven/HyperRead?style=social)](https://github.com/thejoven/HyperRead)

</div>
