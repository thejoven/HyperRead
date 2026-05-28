# HyperRead Plugin Development Guide

Build powerful extensions for HyperRead using a simple, Obsidian-inspired plugin API.

## Table of Contents

- [Quick Start](#quick-start)
- [Plugin Structure](#plugin-structure)
- [Manifest Reference](#manifest-reference)
- [Lifecycle Hooks](#lifecycle-hooks)
- [Events](#events)
- [UI Extensions](#ui-extensions)
  - [Sidebar Panel](#sidebar-panel)
  - [Settings Panel](#settings-panel)
  - [Status Bar](#status-bar)
  - [Custom File View](#custom-file-view)
- [Data Persistence](#data-persistence)
- [npm Dependencies](#npm-dependencies)
- [TypeScript Support](#typescript-support)
- [Hot Reload in Dev Mode](#hot-reload-in-dev-mode)
- [Packaging & Distribution](#packaging--distribution)
- [CSS Variables](#css-variables)
- [FAQ](#faq)

---

## Quick Start

```bash
# Copy the bundled template
cp -r plugin-template my-plugin
cd my-plugin

npm install       # install esbuild
npm run build     # compile src/main.js → main.js

# Symlink for live development
ln -s "$(pwd)" ~/.hyperread/plugins/my-plugin
```

Then in HyperRead: **Settings → Plugins → enable your plugin**.

---

## Plugin Structure

```
my-plugin/
├── manifest.json      # required metadata
├── package.json       # dev dependencies (esbuild)
├── build.js           # esbuild build script
├── src/
│   └── main.js        # your source code
└── main.js            # build output (what HyperRead loads)
```

Installed plugins live in `~/.hyperread/plugins/{id}/`.

---

## Manifest Reference

`manifest.json`:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "apiVersion": 1,
  "author": "Your Name",
  "description": "What this plugin does",
  "main": "main.js",
  "styles": "styles.css",
  "minAppVersion": "5.0.0",
  "permissions": [],
  "settings": [
    {
      "id": "apiKey",
      "type": "string",
      "title": "API Key",
      "description": "Your API key",
      "default": ""
    }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✓ | Unique identifier — lowercase letters, digits, hyphens only |
| `name` | ✓ | Display name shown in the plugin list |
| `version` | ✓ | Semantic version (`1.0.0`) |
| `apiVersion` | ✓ | Plugin API version — use `1` |
| `main` | ✓ | Entry file path (relative to plugin directory) |
| `author` | | Author name |
| `description` | | Short description |
| `styles` | | Optional CSS file to inject |
| `minAppVersion` | | Minimum HyperRead version required |
| `settings` | | Declarative settings definitions |

---

## Lifecycle Hooks

Every plugin exports an object with two lifecycle methods:

```javascript
export default {
  async onload(api) {
    // Called when the plugin is enabled.
    // Register UI, subscribe to events, load persisted data here.
    api.log('Plugin loaded')
  },

  async onunload() {
    // Called when the plugin is disabled or the app closes.
    // UI components are cleaned up automatically.
    // Save any pending data here.
  }
}
```

---

## Events

Subscribe to application events with `api.on(event, handler)`.

| Event | When | Handler data |
|-------|------|--------------|
| `document:open` | A document is opened | `FileData` |
| `document:close` | The document is closed | `void` |
| `tab:activate` | A tab is focused | `string` (file path) |
| `tab:close` | A tab is closed | `string` (file path) |
| `theme:change` | Light/dark theme toggled | `string` (theme name) |
| `app:ready` | Application finished starting | `void` |

```javascript
api.on('document:open', (fileData) => {
  api.log('Opened:', fileData.fileName, '—', fileData.content.length, 'chars')
})

api.on('theme:change', (theme) => {
  console.log('Theme switched to', theme)
})
```

To remove a specific handler, use `api.off(event, handler)` — or simply let cleanup happen automatically on `onunload`.

---

## UI Extensions

### Sidebar Panel

Adds a panel to the right sidebar.

```javascript
api.registerSidebarPanel({
  id: 'my-panel',
  title: 'My Panel',
  icon: '🔧',                        // emoji or short string
  render: (container) => {
    container.innerHTML = `
      <div style="padding: 12px;">
        <p>Hello from my panel!</p>
        <button id="btn">Click me</button>
      </div>
    `
    container.querySelector('#btn').onclick = () => alert('Hi!')

    // Return optional cleanup function
    return () => {
      console.log('panel unmounted')
    }
  }
})
```

### Settings Panel

Appears under **Settings → Plugins → [Your Plugin] → Settings**.

```javascript
api.registerSettingsPanel({
  id: 'my-settings',
  title: 'Plugin Settings',
  render: (container) => {
    const current = api.getSetting('apiKey') || ''

    container.innerHTML = `
      <div style="padding: 12px; font-size: 13px;">
        <label style="display:block; margin-bottom:4px; font-weight:500;">API Key</label>
        <input id="key" type="password" value="${current}"
               style="width:100%; padding:6px; border:1px solid var(--border);
                      border-radius:6px; background:var(--background); color:var(--foreground);" />
        <button id="save" style="margin-top:8px; padding:6px 12px;
               background:var(--primary); color:var(--primary-foreground);
               border:none; border-radius:6px; cursor:pointer;">Save</button>
        <span id="status" style="margin-left:8px; font-size:11px; color:var(--muted-foreground);"></span>
      </div>
    `

    container.querySelector('#save').onclick = () => {
      api.setSetting('apiKey', container.querySelector('#key').value)
      const s = container.querySelector('#status')
      s.textContent = '✓ Saved'
      setTimeout(() => { s.textContent = '' }, 2000)
    }
  }
})
```

### Status Bar

Adds a clickable item to the bottom status bar.

```javascript
const item = api.addStatusBarItem({
  id: 'word-count',
  text: 'Words: —',
  tooltip: 'Word count for current document',
  onClick: () => console.log('status bar clicked')
})

api.on('document:open', (fileData) => {
  const words = fileData.content.trim().split(/\s+/).filter(Boolean).length
  item.update(`Words: ${words.toLocaleString()}`)
})

api.on('document:close', () => {
  item.update('Words: —')
})

// Remove it programmatically if needed
// item.remove()
```

### Custom File View

Register a renderer for custom file extensions.

```javascript
api.registerViewType({
  extensions: ['.json', '.jsonc'],
  render: (fileData, container) => {
    try {
      const pretty = JSON.stringify(JSON.parse(fileData.content), null, 2)
      container.innerHTML = `
        <pre style="padding:20px; font-family:monospace; white-space:pre-wrap;
                    background:var(--muted); color:var(--foreground);">${pretty}</pre>
      `
    } catch (e) {
      container.innerHTML = `<p style="padding:20px;color:#ef4444;">Parse error: ${e.message}</p>`
    }
  }
})
```

---

## Data Persistence

### Plugin data (`loadData` / `saveData`)

Best for large blobs: reading history, caches, etc.
Stored at `~/.hyperread/plugin-data/{id}/data.json`.

```javascript
export default {
  async onload(api) {
    this.api = api
    const data = await api.loadData()
    this.history = data?.history ?? []
  },

  async onunload() {
    await this.api.saveData({ history: this.history })
  }
}
```

### Settings (`getSetting` / `setSetting`)

Best for configuration values. Each key is saved immediately.
Stored at `~/.hyperread/plugin-data/{id}/settings.json`.

```javascript
const apiKey = api.getSetting('apiKey')      // read
api.setSetting('apiKey', 'sk-...')           // write (sync to disk)
```

---

## npm Dependencies

Plugins can use any npm package. Dependencies are bundled into `main.js` by esbuild.

```bash
npm install marked chart.js
```

```javascript
import { marked } from 'marked'
import Chart from 'chart.js/auto'

export default {
  async onload(api) {
    api.registerSidebarPanel({
      id: 'md-preview',
      title: 'Preview',
      icon: '📄',
      render: (container) => {
        const doc = api.getActiveDocument()
        if (doc) container.innerHTML = marked.parse(doc.content)

        const handler = (f) => { container.innerHTML = marked.parse(f.content) }
        api.on('document:open', handler)
        return () => api.off('document:open', handler)
      }
    })
  },
  async onunload() {}
}
```

`build.js` (esbuild config):

```javascript
const esbuild = require('esbuild')
const path = require('path')

esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'esm',
  outfile: 'main.js',
  nodePaths: [path.resolve(__dirname, '../../node_modules')],
  minify: false,
}).catch(() => process.exit(1))
```

---

## TypeScript Support

Rename `src/main.js` → `src/main.ts` and update `build.js`:

```typescript
// src/main.ts
interface PluginAPI {
  on(event: string, handler: (data?: unknown) => void): void
  off(event: string, handler: (data?: unknown) => void): void
  addStatusBarItem(opts: { id: string; text: string; tooltip?: string; onClick?: () => void }): { update(t: string): void; remove(): void }
  registerSidebarPanel(opts: { id: string; title: string; icon?: string; render(el: HTMLElement): (() => void) | void }): void
  loadData(): Promise<Record<string, unknown>>
  saveData(data: Record<string, unknown>): Promise<void>
  getSetting<T = unknown>(key: string): T
  setSetting(key: string, value: unknown): void
  log(...args: unknown[]): void
}

export default {
  async onload(api: PluginAPI) {
    api.log('TypeScript plugin loaded')
  },
  async onunload() {}
}
```

Update `build.js` entryPoints to `['src/main.ts']`.

---

## Hot Reload in Dev Mode

1. Symlink your plugin directory:
   ```bash
   ln -s /path/to/my-plugin ~/.hyperread/plugins/my-plugin
   ```
2. Run the watch build:
   ```bash
   npm run dev    # esbuild --watch
   ```
3. In HyperRead: **Settings → Plugins → enable Developer Mode**.

File changes will automatically reload the plugin without restarting the app.

---

## Packaging & Distribution

```bash
# Build production bundle (enable minification in build.js)
npm run build

# Package only the required files
zip -r my-plugin-v1.0.0.zip manifest.json main.js
# Add styles if present:
# zip -r my-plugin-v1.0.0.zip manifest.json main.js styles.css
```

To install: **Settings → Plugins → Install Plugin → select the .zip file**.

---

## CSS Variables

Use these CSS custom properties to match the app's theme automatically:

```css
.my-element {
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}

.my-button {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: 6px;
}

.my-muted {
  color: var(--muted-foreground);
}

/* Additional tokens */
--card, --card-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
```

---

## FAQ

**Can plugins access Node.js APIs?**
No. Plugins run in the renderer's sandbox and only have access to Web APIs and the `PluginAPI`.

**Can I use `fetch`?**
Yes. Standard `fetch` works normally for HTTP requests.

**Where is plugin data stored?**
`~/.hyperread/plugin-data/{plugin-id}/`

**Can plugins communicate with each other?**
Not directly. You can use shared app events as an indirect bridge.

**Can a plugin modify the app's core UI?**
No. Plugins can only use the defined extension points (`registerSidebarPanel`, `addStatusBarItem`, etc.).

---

## Reference Docs

| Document | Description |
|----------|-------------|
| [Plugin System Overview (中文)](./README.md) | Architecture, features, concepts |
| [Developer Guide (中文)](./developer-guide.md) | Step-by-step tutorial |
| [API Reference (中文)](./api-reference.md) | Full API type definitions |
| [Quick Reference (中文)](./quick-reference.md) | Cheat sheet |
| [Word Count Template](../../plugin-template/) | Minimal starter plugin |
| [AI Assistant Demo](../../demo-plugin/ai-assistant/) | Full-featured example plugin |
