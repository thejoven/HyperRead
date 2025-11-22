<div align="center">

# HyperRead

<img src="./logo/logo.png" alt="HyperRead Logo" width="200" />

**Read smarter. Read faster.**

一个美观的 macOS 风格文档阅读器，支持 Markdown、PDF、EPUB，基于 Electron 构建。

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/thejoven/HyperRead/releases)
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
- 🤖 **AI 助手** - 内置 AI 助手，支持文档分析和问答，保存对话历史
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

[![Download](https://img.shields.io/badge/Download-HyperRead%204.0.0-blue?style=for-the-badge&logo=apple)](https://github.com/thejoven/HyperRead/releases/latest)

</div>

1. 下载 `HyperRead-4.0.0-arm64.dmg` 安装包
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
- ✅ **键盘导航** - 支持方向键和 Page Up/Down 进行流畅翻页

</td>
<td width="50%">

- ✅ **响应式布局** - 优化的内边距和边距，舒适的阅读体验
- ✅ **主题集成** - 无缝的明暗主题切换
- ✅ **交互内容** - 支持带有嵌入式脚本和媒体的 EPUB

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

### 🎉 版本 4.0.0（最新）

**主要更新：**
- 🚀 **侧边栏拖动性能优化** - 使用 requestAnimationFrame 和直接 DOM 操作优化拖动性能
- 🎯 **修复 PDF/EPUB 拖动问题** - 通过全屏遮罩层解决 PDF 和 EPUB 查看器中的侧边栏拖动问题
- 📚 **内置帮助系统** - 完整的使用指南，支持中英文双语
- 🎨 **UI 改进** - 优化帮助对话框设计，提供更清晰的布局和更好的可读性
- ⚡ **性能提升** - 侧边栏拖动期间减少 99% 的 React 重渲染

**技术改进：**
- 实现高性能的 resize hook，使用 RAF 优化
- 添加全屏透明遮罩层以拦截 iframe 事件
- 创建 HelpDialog 组件，包含 6 个详细的帮助章节
- 增强 i18n 支持，完整的帮助文档翻译
- 改进拖动操作期间的文本选择保留

👀 **[查看完整更新日志](./CHANGELOG.md)** - 详细的发布说明和版本历史

---

<div align="center">

## 👨‍💻 作者

如果这个项目对你有帮助，请给它一个 ⭐️

[![Star](https://img.shields.io/github/stars/thejoven/HyperRead?style=social)](https://github.com/thejoven/HyperRead)

</div>
