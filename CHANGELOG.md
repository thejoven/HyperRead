# Changelog

All notable changes to HyperRead will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.1.1] - 2025-12-29

### 🐛 Bug Fixes
- 📁 **Enhanced Directory Refresh** - Fixed "Need to reload files" error by implementing robust system path deduction for dragged folders in Electron.
- 📚 **EPUB Association Fix** - Resolved a main process crash when opening large EPUB files via system file association by passing file paths instead of full content.
- 🎯 **Path Consistency** - Ensured absolute system paths are used throughout the application for reliable file reading and monitoring.

## [5.1.0] - 2025-12-20

### ✨ New Features
- 🚀 **Major Version Update** - Optimized performance and stability for Markdown, PDF, and EPUB reading.
- 🎨 **UI Refinements** - Further polished the macOS-style interface and transitions.

## [2.2.0] - 2025-09-30

### 🎨 UI/UX Major Improvements

#### Color Scheme Overhaul
- ✨ **New Cyan Brand Color** - Changed primary color from blue (#007AFF) to optimized cyan (#1aafb8)
- 🎨 **Complete Theme System** - Designed comprehensive color palette with light/dark mode variations
- 📄 **Color Scheme Documentation** - Added detailed COLOR_SCHEME.md with 3 alternative color schemes
- 🌈 **Consistent Branding** - Updated all UI elements (file list, TOC, settings) to use new cyan theme

#### Settings Interface Redesign
- 📐 **Hierarchical Categories** - Introduced two-level category system (General, AI Assistant)
- 📏 **Wider Sidebar** - Increased settings sidebar width from 8rem to 12rem for better navigation
- 🎯 **Collapsible Categories** - Added expand/collapse functionality for category groups
- 🔄 **Better Organization** - Grouped related settings: General (Font/Language/Shortcuts), AI Assistant (API/Roles/History)

#### Dark Mode Enhancements
- 🌙 **Code Block Optimization** - Complete syntax highlighting color scheme for dark mode
- 🎨 **8 Syntax Token Types** - Distinct colors for keywords, strings, numbers, comments, etc.
- 📊 **Mermaid Diagram Support** - Auto-switching between light/dark themes with proper text visibility
- 🔍 **Enhanced Readability** - Improved contrast for all code and diagram elements in dark mode

### 🤖 AI Assistant Features

#### Multi-Role System
- ✨ **Role Management** - Create, edit, and delete custom AI assistant roles
- 👥 **Default Roles** - Pre-configured roles: Document Assistant, Translation Expert, Summarization Expert
- 🔄 **Dynamic Role Switching** - Change AI persona during conversation with instant effect
- 💾 **Persistent Configuration** - Roles saved in localStorage with full customization support
- 🌍 **Bilingual Support** - Complete i18n for role management interface (EN/ZH)

#### System Improvements
- 🗑️ **Removed Long Document Processing** - Simplified AI service by removing complex chunking system
- 🎯 **Streamlined API** - Cleaner codebase with unified message processing
- 📝 **Better System Prompts** - Role-based prompts that adapt to document context

### 🛠️ Technical Improvements
- 🎨 **CSS Variables Migration** - Converted hardcoded colors to CSS custom properties
- 🔧 **Type Safety** - Added AiRole interface with proper TypeScript typing
- 🌐 **I18n Expansion** - Added 30+ new translation keys for roles and color descriptions
- 📦 **Storage Format** - Standardized role storage format in localStorage

### 🐛 Bug Fixes
- 🔧 **Dark Mode Code Visibility** - Fixed unreadable code blocks in dark mode
- 🔧 **Mermaid Text Color** - Fixed black text on dark background in diagrams
- 🔧 **Settings Modal Height** - Proper scrolling for role management with many entries
- 🔧 **Theme Consistency** - All UI elements now respect the new cyan color scheme

## [2.1.0] - 2025-09-30

### 🎯 Search & Highlighting Enhancements
- ✨ **Complete Markdown Search Highlighting** - Extended search highlighting to all markdown elements (headings, tables, emphasis, inline code, etc.)
- 🔍 **100% Text Coverage** - Search now highlights keywords in all text-containing elements, up from 20% coverage
- 🎨 **Improved Search UX** - Better visual feedback with consistent highlighting across all content types

### ⌨️ Keyboard Shortcuts System
- ✨ **Customizable Shortcuts** - Full keyboard shortcuts management system with customization support
- 🔄 **Double-Press Detection** - Support for double-press shortcuts (e.g., Shift Shift) with 500ms time window
- 💾 **Persistent Configuration** - User-defined shortcuts saved and restored across sessions
- 🎯 **Real-time Activation** - Shortcuts take effect immediately after modification without restart
- ⚙️ **Shortcuts Settings Panel** - Dedicated settings interface for managing keyboard shortcuts
- 🔧 **Conflict Detection** - Automatic detection and resolution of shortcut conflicts

### ⚙️ Settings Interface Improvements
- 📐 **Fixed Modal Dimensions** - Settings modal now has fixed 800×600px size for consistent layout
- 📋 **Scrollable Content Area** - Right-side settings panel with independent scrolling
- 🎨 **Improved Layout** - Better organization with left sidebar navigation and content separation
- 🌍 **Complete Translations** - Added 22+ missing translation keys for settings interface

### 🛠️ Technical Improvements
- 🔧 **Dynamic Shortcut Listeners** - Keyboard event handlers now read from user configuration
- 📦 **Storage Format Optimization** - Unified storage format for double-press (`'shift shift'`) and combo keys (`'ctrl+f'`)
- 🎯 **Component Refactoring** - Enhanced ShortcutRecorder and ShortcutSettings components
- ✨ **Zero TypeScript Errors** - All changes fully typed and validated

### 🐛 Bug Fixes
- 🔧 **Shortcut Recorder Fixed** - Double-press modifier keys (Shift, Alt, Ctrl, Cmd) now properly detected
- 🔧 **Settings Shortcuts Active** - Fixed issue where customized shortcuts weren't working after configuration
- 🔧 **Markdown Highlighting** - Fixed incomplete search highlighting in markdown rendered content

## [2.0.0] - 2025-09-28

### 🚀 Major Release - AI Assistant & Modern UX

### 🤖 AI Assistant System
- ✨ **Complete AI Assistant Integration** - Full-featured AI chat sidebar with document analysis capabilities
- 🔧 **Multi-provider Support** - Support for OpenAI, Anthropic, and custom API endpoints (Now simplified to custom-only in v2.0.0)
- 📄 **Long Document Processing** - Intelligent document chunking with parallel processing for large files
- 💬 **Conversation History Management** - Persistent conversation storage with import/export functionality
- 🎯 **Document-aware Chat** - AI can analyze and answer questions about the current document content
- 📊 **Processing Progress Indicators** - Real-time feedback during document analysis

### 🎨 Modern User Experience
- 🍞 **Toast Notifications System** - Replaced all popup alerts with elegant Sonner toast notifications
- ✨ **Non-blocking Confirmations** - Confirmation dialogs now use toast with action buttons instead of blocking modals
- 🎭 **Improved Error Handling** - Better user feedback with categorized success/error/info toasts
- 📱 **Responsive Notifications** - Toast notifications automatically adapt to system theme

### 🛠️ Technical Architecture Improvements
- 🔒 **Enhanced Security** - Removed built-in AI providers, now only supports user-configured custom APIs
- 🧹 **Code Modernization** - Updated all alert/confirm usages to modern toast patterns
- 📦 **Dependency Updates** - Added Sonner for toast notifications, enhanced React 19 compatibility
- 🎯 **Type Safety** - Improved TypeScript definitions for AI services and conversation management

### ⚙️ Settings & Configuration
- 🔧 **Streamlined AI Configuration** - Simplified setup process with custom API endpoint focus
- 📝 **Enhanced Validation** - Better form validation with real-time feedback
- 💾 **Persistent Storage** - Conversation history automatically saved and restored
- 🗃️ **Data Management** - Export/import functionality for conversation backups

### 🐛 Bug Fixes
- 🔧 **Configuration Loading** - Fixed AI service configuration persistence across sessions
- 🔄 **State Management** - Improved conversation state handling during document switches
- 🎨 **UI Consistency** - Standardized notification patterns throughout the application

## [1.2.1] - 2025-09-19

### 🐛 Bug Fixes
- **Windows 兼容性修复** - 修复 Windows 环境下启动时的路径解析错误，解决 "ERR_INVALID_ARG_TYPE" 异常

## [1.2.0] - 2025-09-19

### 🌍 Multi-language Support System
- ✨ **Complete i18n Architecture** - Type-safe multi-language system based on React Context
- 🇺🇸 **English Default Interface** - Changed default language to English for internationalization
- 🇨🇳 **Chinese Interface Support** - Complete Chinese translation, switchable in settings
- ⚙️ **Language Settings Panel** - Added language selection functionality in settings
- 💾 **Persistent Memory** - Language preferences automatically saved to local storage

### 🔄 Smart Refresh System
- ✨ **Drag File Refresh** - Solved critical issue of documents disappearing after renaming
- 🔍 **Multi-strategy Validation** - FileSystemDirectoryEntry validity detection
- 🛠️ **Force File Rebuilding** - Create fresh File objects to avoid browser caching
- 🔁 **Smart Retry Mechanism** - Up to 3 retries with incremental intervals
- 📊 **Detailed Logging System** - Emoji-marked debugging information
- 🎯 **Dual Fallback Strategy** - Automatic backup file validation when main refresh fails

### 📚 Example Documentation System
- ✨ **Demo Document Collection** - Created complete Markdown usage tutorials
- 🧠 **Deep Thinking Analysis** - Document design principles based on cognitive science
- 📊 **Categorized Learning Structure** - Progressive tutorials from basic syntax to advanced features
- 🎨 **Mermaid Chart Gallery** - Examples covering all chart types
- 🔗 **Best Practice Guide** - Professional advice for document writing and organization

### 🛠️ Technical Architecture Optimization
- 📁 **TypeScript Type Safety** - Complete type definitions and interfaces
- ⚡ **Performance Optimization** - Component-level rendering optimization
- 🔧 **Enhanced Error Handling** - More user-friendly error messages
- 🎮 **User Experience Improvement** - Smoother interaction feedback

## [1.1.0] - 2025-09-16

### 🎯 Mermaid Chart Enhancement
- ✨ **Fullscreen View Mode** - Click top-right button on charts to enter fullscreen mode
- 🔍 **Zoom Control System** - Support button zoom in/out, range 0.1x - 5.0x
- 🖱️ **Drag Gesture Control** - Drag charts to view different areas after enabling drag mode
- 🎮 **Smart Cursor Change** - Cursor automatically changes to hand/grab state in drag mode
- 📍 **Fixed Control Panel** - Bottom-left control panel stays fixed when scrolling
- ⚡ **Performance Optimization** - Using requestAnimationFrame to optimize drag performance
- 🔄 **One-click Reset** - Reset button can reset both zoom and position simultaneously

### 🔗 External Link Support
- ✨ **System Browser Opening** - External links in Markdown automatically open in system default browser
- 🛠️ **IPC Communication Optimization** - Using Electron IPC to ensure link functionality stability

### 🐛 Bug Fixes
- 🔧 **Drag Folder Optimization** - Fixed issue showing only first file, now correctly displays all Markdown files
- 💻 **Windows Installer** - Fixed Windows version path resolution issues
- 🎨 **User Experience** - Eliminated chart flickering during drag, providing smoother interaction experience

## [1.0.0] - 2025-09-15

### Added
- ✨ Initial version release
- 🎨 Native macOS interface design
- 📁 Support for file and folder drag & drop
- 🌳 File tree browsing functionality
- ⚡ Pure local runtime, no development server required
- 🎯 Complete Markdown rendering support
- 🛠️ Significant performance optimization

---

**Legend:**
- ✨ New Features
- 🔧 Improvements
- 🐛 Bug Fixes
- 🎨 UI/UX
- ⚡ Performance
- 🛠️ Technical