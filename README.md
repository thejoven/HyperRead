<div align="center">

# HyperRead

<img src="./logo/logo.png" alt="HyperRead Logo" width="200" />

**Read smarter. Read faster.**

一个美观的 macOS 风格 Markdown 阅读器，基于 Electron 构建。

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/thejoven/HyperRead/releases)
[![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://github.com/thejoven/HyperRead)
[![License](https://img.shields.io/badge/license-AGPL--3.0-green.svg)](LICENSE)
[![Downloads](https://img.shields.io/badge/downloads-latest-brightgreen.svg)](https://github.com/thejoven/HyperRead/releases/latest)

</div>

## ✨ 特性

<table>
<tr>
<td width="50%">

- 🎨 **macOS 原生界面** - 完美符合 macOS 设计风格，支持毛玻璃效果
- 📁 **拖拽支持** - 支持拖拽单个 Markdown 文件或整个文件夹
- 🌳 **文件树浏览** - 递归扫描并展示目录结构中的所有 Markdown 文件
- 🎯 **高性能渲染** - 支持 Mermaid 图表、代码高亮、数学公式 (KaTeX)

</td>
<td width="50%">

- ⚙️ **设置中心** - 集中管理字体大小等阅读偏好设置
- 🌓 **主题切换** - 支持明暗主题自动切换
- ℹ️ **关于页面** - 集成版本信息和 GitHub 链接
- ⚡ **纯本地运行** - 不依赖开发服务器，启动更快

</td>
</tr>
</table>

## 🚀 快速开始

### 方式一：下载预编译版本（推荐）

<div align="center">

[![Download](https://img.shields.io/badge/Download-HyperRead%201.1.0-blue?style=for-the-badge&logo=apple)](https://github.com/thejoven/HyperRead/releases/latest)

</div>

1. 下载 `HyperRead-1.1.0-arm64.dmg` 安装包
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
直接将 `.md` 文件或包含 Markdown 文件的文件夹拖拽到应用窗口

</td>
<td width="33%">

**📂 菜单方式**
点击顶部的"打开文件"或"打开文件夹"按钮

</td>
<td width="33%">

**⌨️ 快捷键**
支持常用的文件操作快捷键

</td>
</tr>
</table>

### 支持的功能

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
- react-markdown + remark/rehype
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

### 网络代理设置

如果构建时网络下载缓慢，可以设置代理：

```bash
export https_proxy=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890  
export all_proxy=socks5://127.0.0.1:7890

npm run dist
```

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
## 📋 TODO

[] 自动更新加载
[] 历史记录
[] 多个文件夹同时加载
[] AI辅助
[] 账户系统
[] 网页发布
[] 云同步
[] 多语言支持
[] 快捷键
[] 其他阅读支持

## 📝 更新日志

### v1.1.0 (2025-09-16)

#### 🎯 Mermaid 图表增强
- ✨ **全屏查看模式** - 点击图表右上角按钮进入全屏模式
- 🔍 **缩放控制系统** - 支持按钮放大/缩小，范围 0.1x - 5.0x
- 🖱️ **拖拽手势控制** - 开启拖拽模式后可拖动图表查看不同区域
- 🎮 **智能光标变化** - 拖拽模式下光标自动变为手型/抓取状态
- 📍 **固定控制面板** - 左下角控制台固定位置，滚动时不移动
- ⚡ **性能优化** - 使用 requestAnimationFrame 优化拖拽性能
- 🔄 **一键重置** - 重置按钮可同时重置缩放和位置

#### 🔗 外部链接支持
- ✨ **系统浏览器打开** - Markdown 中的外部链接自动在系统默认浏览器中打开
- 🛠️ **IPC 通信优化** - 使用 Electron IPC 确保链接功能稳定性

#### 🐛 Bug 修复
- 🔧 **拖拽文件夹优化** - 修复只显示第一个文件的问题，现在正确显示所有 Markdown 文件
- 💻 **Windows 安装包** - 修复 Windows 版本路径解析问题
- 🎨 **用户体验** - 消除拖拽时的图表闪烁，提供更流畅的交互体验

### v1.0.0 (2025-09-15)

- ✨ 初始版本发布
- 🎨 macOS 原生界面设计
- 📁 支持文件和文件夹拖拽
- 🌳 文件树浏览功能
- ⚡ 纯本地运行，无需开发服务器
- 🎯 完整的 Markdown 渲染支持
- 🛠️ 大幅性能优化

---

<div align="center">

## 👨‍💻 作者

如果这个项目对你有帮助，请给它一个 ⭐️

[![Star](https://img.shields.io/github/stars/thejoven/HyperRead?style=social)](https://github.com/thejoven/HyperRead)

</div>
