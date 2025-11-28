<div align="center">

# HyperRead

<img src="./logo/logo.png" alt="HyperRead Logo" width="200" />

**Read smarter. Read faster.**

一个美观的 macOS 风格文档阅读器，支持 Markdown、PDF、EPUB，基于 Electron 构建。

[![Version](https://img.shields.io/badge/version-5.1.0-blue.svg)](https://github.com/thejoven/HyperRead/releases)
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

[![Download](https://img.shields.io/badge/Download-HyperRead%205.1.0-blue?style=for-the-badge&logo=apple)](https://github.com/thejoven/HyperRead/releases/latest)

</div>

1. 下载 `HyperRead-5.1.0-arm64.dmg` 安装包
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

### 🎉 版本 5.1.0（最新）

**主要更新：**
- 📚 **EPUB 拖拽支持** - 直接拖拽 EPUB 和 PDF 文件到应用即可即时查看
- 📏 **自适应 EPUB 宽度** - EPUB 内容现在支持响应内容宽度设置（窄/中等/宽/全宽）
- ⌨️ **修复键盘快捷键** - 解决 EPUB 阅读器中的 passive 事件监听器警告
- 🔄 **智能布局重排** - 修改宽度或字体大小时 EPUB 自动调整布局并保持阅读位置

**EPUB 阅读器增强：**
- 内容宽度设置现在应用于 EPUB 文件，具有正确的容器尺寸
- 基于 CFI 的位置恢复，自动重新计算布局
- 布局调整期间显示加载指示器，提升用户体验
- 根据内容宽度优化内边距，实现舒适阅读

**文件处理改进：**
- 增强 drag-drop.js 以支持 EPUB (.epub) 和 PDF (.pdf) 文件
- 为二进制文件（PDF/EPUB）生成 Blob URL 用于拖拽操作
- 正确的文件类型检测和所有支持格式的缓存
- 修复多文件场景下的文件路径处理

**技术改进：**
- 为键盘事件监听器添加 `{ passive: false }` 以启用 preventDefault
- 从 passive 的 epub.js iframe 监听器中移除 preventDefault
- 实现带初始加载检测的智能 resize 逻辑
- 在宽度/字体大小改变期间使用 CFI 保持位置

### 版本 5.0.0

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
