# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (Vite dev server only, no Electron)
npm run dev

# Full Electron dev mode (builds first, then launches Electron)
npm run dev:electron        # Vite + Electron concurrently
npm run start-dev           # build + electron-dev (NODE_ENV=development)

# Production build
npm run build               # Vite build → dist/
npm run start               # build + electron (production)

# Package for distribution
npm run dist                # macOS DMG (arm64)
npm run dist-all            # mac + win + linux

# Lint
npm run lint
```

No test suite is configured.

## Architecture Overview

HyperRead is an Electron 38 + React 19 + Vite 7 + TypeScript desktop document reader. The app runs with `contextIsolation: true` — the renderer has **no direct Node.js access** and communicates with the main process exclusively through `window.electronAPI`.

### Process Boundary

```
electron/main.js          ← Node.js / Electron main process (CommonJS)
electron/preload.js       ← contextBridge: exposes window.electronAPI
electron/enhanced-drag-drop.js  ← drag-and-drop IPC logic
src/                      ← React renderer (Vite, ESM, TypeScript)
```

`src/types/electron.ts` holds the TypeScript interface for `window.electronAPI`. Any new IPC channel needs a handler in `main.js`, a bridge in `preload.js`, and a type addition in `electron.ts`.

### Renderer Entry & State

```
src/main.tsx              ← ReactDOM.createRoot; wraps with ThemeProvider, LanguageProvider,
                             ShortcutProvider, PluginProvider
src/electron-app.tsx      ← Root component; owns all top-level state and orchestrates hooks
```

All major state slices live in custom hooks called from `electron-app.tsx`:
- `useSettings` – font size, content width, primary color, sidebar widths (localStorage)
- `useTabs` – open tab list and file content cache
- `useDirectory` – directory-mode state and file loading
- `useDragDrop` – drag-and-drop for files/directories
- `useFileNavigation` – cross-file link navigation
- `useFullscreen` – fullscreen state via IPC

### Routing / View Selection

There is no router. `electron-app.tsx` renders one of three modes based on state:
1. **Welcome screen** (`WelcomeScreen`) — no file open
2. **Directory mode** — `FileList` sidebar + `DocumentContent`
3. **Single file mode** — `DocumentContent` only

`DocumentContent` (`src/components/viewers/DocumentContent.tsx`) dispatches on `fileData.fileType` to lazy-load `PdfViewerSimple`, `EpubViewer`, or `MarkdownContentWrapper` (the default for `.md`/`.txt`).

### Markdown Rendering Pipeline

```
MarkdownContentWrapper → DocumentViewer → MarkdownContent
                       ↘ TocMinimap (floating right-side minimap)
```

`MarkdownContent` uses `react-markdown` + `remark-gfm` + `rehype-highlight` + `rehype-raw`. Mermaid diagrams are handled by `MermaidDiagram.tsx` (lazy, keyed by content hash). Local images resolve through `LocalImage.tsx` which calls `window.electronAPI.readImage`.

### Theme System

- `next-themes` controls the `.dark` class on `<html>`
- CSS variables in `src/app/globals.css` define both light and dark token sets
- `src/utils/theme.ts` exports `colorMap` (6 primary colors × light/dark) and `applyPrimaryColor()`, which sets CSS variables directly on `document.documentElement`
- `useSettings` watches for `.dark` class changes via `MutationObserver` and re-calls `applyPrimaryColor` on every toggle
- macOS-style glass/blur effects live in `src/styles/macos.css` (`.macos-toolbar`, `.macos-sidebar`, `.macos-button`, etc.)

### Plugin System

Plugins are Obsidian-style: installed to `~/.hyperread/plugins/{id}/`, loaded at runtime via Blob URL dynamic import.

Key files:
- `src/lib/plugins/types.ts` – all interfaces (`PluginAPI`, `PluginManifest`, UI handles)
- `src/lib/plugins/api-factory.ts` – `createPluginAPI()` returns a scoped API per plugin
- `src/lib/plugins/manager.ts` – `PluginManager` lifecycle (load/enable/disable/uninstall)
- `src/lib/plugins/event-bus.ts` – `PluginEventBus` singleton (document:open, tab:activate, theme:change, …)
- `src/lib/plugins/loader.ts` – Blob URL dynamic import + CSS injection
- `src/lib/plugins/dev-watcher.ts` – polling-based hot reload for dev mode
- `src/contexts/PluginContext.tsx` – `PluginProvider` + `usePlugins()` hook; bridges plugin UI registrations into React state

Plugin UI extension points: status bar (`StatusBar.tsx`), right sidebar panels (`RightSidebar.tsx` / `PluginSidebarPanel.tsx`), settings panels (`PluginSettingsRenderer.tsx`).

Plugin data is persisted to `~/.hyperread/plugin-data/{id}/` via IPC. See `DOCS/plugin-system/` for the full API reference and `plugin-template/` for a starter.

### i18n

`src/lib/i18n/` — supports Chinese (zh) and English (en). Use `useT()` to get a typed translation function. Locales live in `src/lib/i18n/locales/`.

### Keyboard Shortcuts

`src/contexts/ShortcutContext.tsx` + `src/lib/shortcuts/` provide a full shortcut management system with conflict detection, key recording, and localStorage persistence. Default shortcuts in `src/lib/shortcuts/default-shortcuts.ts`.

## Key Constraints

- `electron/main.js` and `electron/preload.js` are **CommonJS** (`require`/`module.exports`). Do not use ESM syntax there.
- The renderer cannot access Node.js APIs directly — always go through `window.electronAPI`.
- shadcn/ui components available: `button`, `card`, `input`, `scroll-area`, `sonner`. There is **no Switch component** in `src/components/ui/`.
- Pre-existing TypeScript errors exist in `EpubViewer.tsx`, `PdfViewer.tsx`, and `src/lib/i18n/locales/` — these are unrelated to plugin system or theme work and should not be treated as regressions.
- Vite dev server runs on port 3000; Electron loads from `http://localhost:3000` in dev and from `dist/index.html` in production.
