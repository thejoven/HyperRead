<div align="center">

# HyperRead

<img src="./logo/logo.png" alt="HyperRead Logo" width="200" />

**Read smarter. Read faster.**

A beautiful macOS-style document reader supporting Markdown, PDF, and EPUB, built with Electron.


<a href="https://www.producthunt.com/products/hyperread?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-hyperread" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1032883&theme=light&t=1761980700711" alt="HyperRead - HyperRead&#0032;Read&#0032;smarter&#0046;&#0032;Read&#0032;faster&#0046; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

[![Version](https://img.shields.io/badge/version-5.2.1-blue.svg)](https://github.com/thejoven/HyperRead/releases)
[![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://github.com/thejoven/HyperRead)
[![License](https://img.shields.io/badge/license-AGPL--3.0-green.svg)](LICENSE)
[![Downloads](https://img.shields.io/badge/downloads-latest-brightgreen.svg)](https://github.com/thejoven/HyperRead/releases/latest)
[![Twitter](https://img.shields.io/badge/Twitter-@thejoven_com-1DA1F2.svg?logo=twitter)](https://x.com/thejoven_com)

English | [简体中文](./README-zh.md)

</div>

## ✨ Features

<table>
<tr>
<td width="50%">

- 🎨 **Native macOS Interface** - Perfect macOS design with blur effects and smooth animations
- 📁 **Multi-Format Support** - Supports Markdown (.md/.markdown), PDF (.pdf), EPUB (.epub) files
- 📖 **Professional EPUB Reader** - Apple Books-style reading experience with accurate pagination
- 🌳 **File Tree Explorer** - Recursively scan and display all document files in directory structure with drag & drop
- 🎯 **High Performance Rendering** - Support for Mermaid charts, code highlighting, math formulas (KaTeX)

</td>
<td width="50%">

- ⚙️ **Settings Center** - Centralized management of font size, multi-language, AI assistant, and shortcuts
- 🤖 **AI Assistant** - Built-in AI assistant for document analysis and Q&A with conversation history
- 🔍 **Advanced Search** - Full-text search with highlighting across all markdown elements
- ⌨️ **Keyboard Shortcuts** - Customizable shortcuts system with double-press support
- 🖼️ **Image Preview & Zoom** - Click to zoom images with pan and drag controls
- 🌓 **Theme Toggle** - Support for automatic light/dark theme switching

</td>
</tr>
</table>

## 🚀 Quick Start

### Option 1: Download Pre-compiled Version (Recommended)

<div align="center">

[![Download](https://img.shields.io/badge/Download-HyperRead%205.2.1-blue?style=for-the-badge&logo=apple)](https://github.com/thejoven/HyperRead/releases/latest)

</div>

1. Download `HyperRead-5.2.1-arm64.dmg` installer
2. Double-click the DMG file
3. Drag HyperRead to Applications folder
4. First run may require permission in "System Preferences > Security & Privacy"

### Option 2: Build from Source

```bash
# Clone repository
git clone https://github.com/thejoven/HyperRead.git
cd HyperRead

# Install dependencies
npm install

# Run in development mode (recommended)
npm run start-dev    # With developer tools
npm run start        # Production mode
```

## 📖 Usage

### Opening Files

<table>
<tr>
<td width="33%">

**🖱️ Drag & Drop**
Directly drag `.md`, `.pdf`, or `.epub` files, or folders to the application window

</td>
<td width="33%">

**📂 Menu Method**
Click "Open File" or "Open Folder" buttons at the top to browse files

</td>
<td width="33%">

**⌨️ Keyboard Shortcuts**
Support for common file operations and navigation shortcuts

</td>
</tr>
</table>

### Supported Features

#### 📝 Markdown
<table>
<tr>
<td width="50%">

- ✅ **Standard Markdown** - Support for all standard Markdown syntax
- ✅ **Code Highlighting** - Based on highlight.js, supporting multiple programming languages
- ✅ **Math Formulas** - Support for LaTeX format math formula rendering

</td>
<td width="50%">

- ✅ **Mermaid Charts** - Support for flowcharts, sequence diagrams, Gantt charts, etc., with fullscreen zoom and drag functionality
- ✅ **Tables and Lists** - Full support for GFM (GitHub Flavored Markdown)
- ✅ **Image Display** - Support for local and remote images

</td>
</tr>
</table>

#### 📖 EPUB Reader
<table>
<tr>
<td width="50%">

- ✅ **Apple Books Style** - Professional typography with justified text and hyphenation
- ✅ **Accurate Pagination** - CFI-based location tracking for precise page numbers
- ✅ **Reading Progress Memory** - Auto-save reading position with resume dialog on reopen
- ✅ **Keyboard Navigation** - Arrow keys, J/K, Space, Page Up/Down for smooth navigation

</td>
<td width="50%">

- ✅ **Responsive Layout** - Optimized padding and margins for comfortable reading
- ✅ **Theme Integration** - Seamless light/dark theme switching
- ✅ **Interactive Content** - Support for EPUB with embedded scripts and media
- ✅ **In-iframe Shortcuts** - Keyboard shortcuts work even after clicking content

</td>
</tr>
</table>

#### 📄 PDF Viewer
- ✅ **High-Quality Rendering** - Powered by PDF.js for accurate document display
- ✅ **Page Navigation** - Easy navigation with page controls and keyboard shortcuts

## 🛠️ Development

### Tech Stack

<table>
<tr>
<td width="50%">

**🎨 Frontend Technologies**
- React 19 + TypeScript
- Vite 7 (Build tool)
- Tailwind CSS 4 (Styling)

**📱 Desktop Framework**
- Electron 38

</td>
<td width="50%">

**📝 Content Rendering**
- react-markdown + remark/rehype (Markdown)
- epub.js (EPUB rendering)
- PDF.js (PDF rendering)
- Mermaid (Charts)
- KaTeX (Math formulas)
- highlight.js (Code highlighting)

</td>
</tr>
</table>

### Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── styles/            # Style files
│   └── electron-app.tsx   # Main application entry
├── electron/              # Electron main process
│   ├── main.js           # Main process entry
│   └── preload.js        # Preload script
├── dist/                  # Build output
├── release/               # Package output
└── package.json          # Project configuration
```

### Development Commands

```bash
# Development
npm run dev                # Vite development server
npm run start-dev         # Build + Electron development mode
npm run start             # Build + Electron production mode

# Build
npm run build             # Build frontend resources

# Package
npm run dist              # Package macOS app
npm run dist-all          # Package all platforms (macOS + Windows + Linux)

# Code check
npm run lint              # ESLint check
```

### Performance Optimization

The project employs multiple performance optimization measures:

- **Code Splitting**: On-demand loading of large libraries like Mermaid, KaTeX
- **Tree Shaking**: Removal of unused code
- **Bundle Analysis**: 81% total size reduction after optimization
- **Memory Optimization**: React memo, useMemo, useCallback
- **Lazy Loading**: On-demand loading of large components

## 📋 System Requirements

- **Operating System**: macOS 10.15+ (Catalina or higher)
- **Architecture**: Apple Silicon (M1/M2) or Intel x64
- **Memory**: 4GB+ recommended
- **Storage**: ~150MB installation space

## 🤝 Contributing

We welcome contributions of any kind! Please follow these steps:

1. 🍴 Fork this repository
2. 🌿 Create feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔄 Create a Pull Request

## 📄 License

This project is open source under the [GNU Affero General Public License v3.0](LICENSE).

## 🔗 Related Links

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/thejoven/HyperRead)
[![Twitter](https://img.shields.io/badge/Twitter-@thejoven_com-1DA1F2?style=for-the-badge&logo=twitter)](https://x.com/thejoven_com)
[![Issues](https://img.shields.io/badge/Issues-Bug_Reports-red?style=for-the-badge&logo=github)](https://github.com/thejoven/HyperRead/issues)
[![Releases](https://img.shields.io/badge/Releases-Latest-blue?style=for-the-badge&logo=github)](https://github.com/thejoven/HyperRead/releases)

</div>

## 📝 What's New

### 🎉 Version 5.2.1 (Latest)

**Critical Fixes:**
- 📁 **Native Directory Refresh** - Implemented robust system path tracking for dragged folders, enabling native "Refresh" functionality without re-dragging.
- 📚 **EPUB Association Crash Fix** - Resolved a main process crash when opening large EPUB files via "Open With" by optimizing IPC data transfer.
- 🎯 **Reliable File Reading** - Consistently use absolute system paths for all file operations to ensure document content loads correctly after external modifications.

### Version 5.1.0

**Major Updates:**
- 📖 **EPUB Reading Progress Memory** - Auto-save reading position with elegant resume dialog when reopening books
- ⌨️ **Enhanced EPUB Shortcuts** - Keyboard navigation now works seamlessly even after clicking inside EPUB content
- 🏗️ **Major Code Refactoring** - electron-app.tsx reduced from 2065 lines to 475 lines (77% reduction)
- 🎨 **Modular Architecture** - New hooks (use-settings, use-directory, use-drag-drop) and components for better maintainability
- 🔧 **Improved Type Safety** - Enhanced TypeScript definitions and better code organization

👀 **[View Full Changelog](./CHANGELOG.md)** - Detailed release notes and version history

---

<div align="center">

## 👨‍💻 Author

If this project helps you, please give it a ⭐️

[![Star](https://img.shields.io/github/stars/thejoven/HyperRead?style=social)](https://github.com/thejoven/HyperRead)

</div>
