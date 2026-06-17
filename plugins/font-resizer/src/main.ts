// Font Resizer for HyperRead
interface PluginAPI {
  on(event: string, handler: (data?: any) => void): void
  addToolbarButton(btn: { id: string; icon: string; tooltip?: string; onClick: () => void }): { remove(): void }
  addCommand(cmd: { id: string; name: string; shortcut?: string; callback: () => void }): void
  addStatusBarItem(item: { id: string; text: string; tooltip?: string }): { update(text: string): void; remove(): void }
  getSetting<T>(key: string): T | undefined
  log(...args: unknown[]): void
}

let currentSize = 16

function applyFontSize(size: number) {
  // Target common document viewer containers
  const selectors = '[class*="viewer"], [class*="content"], [class*="document"], article, .markdown-body, [class*="markdown"], [class*="epub"], [class*="reader"]'
  const containers = document.querySelectorAll(selectors)
  containers.forEach(el => {
    (el as HTMLElement).style.fontSize = size + 'px'
  })
  // Set CSS variable as fallback
  document.documentElement.style.setProperty('--hyperread-doc-font-size', size + 'px')
}

export default {
  async onload(api: PluginAPI) {
    const defaultSize = api.getSetting<number>('defaultSize') || 16
    const step = api.getSetting<number>('step') || 2
    const minSize = api.getSetting<number>('minSize') || 10
    const maxSize = api.getSetting<number>('maxSize') || 32
    currentSize = defaultSize

    const statusItem = api.addStatusBarItem({
      id: 'font-size',
      text: '🔤 ' + currentSize + 'px',
      tooltip: '当前字号'
    })

    function setSize(s: number) {
      currentSize = Math.max(minSize, Math.min(maxSize, s))
      applyFontSize(currentSize)
      statusItem.update('🔤 ' + currentSize + 'px')
    }

    // Toolbar buttons
    api.addToolbarButton({
      id: 'font-decrease',
      icon: 'A−',
      tooltip: '缩小字号',
      onClick: () => setSize(currentSize - step)
    })
    api.addToolbarButton({
      id: 'font-increase',
      icon: 'A+',
      tooltip: '放大字号',
      onClick: () => setSize(currentSize + step)
    })
    api.addToolbarButton({
      id: 'font-reset',
      icon: '↺',
      tooltip: '重置字号',
      onClick: () => setSize(defaultSize)
    })

    // Keyboard shortcuts
    api.addCommand({
      id: 'font-increase',
      name: '放大字号',
      shortcut: 'CmdOrCtrl+=',
      callback: () => setSize(currentSize + step)
    })
    api.addCommand({
      id: 'font-decrease',
      name: '缩小字号',
      shortcut: 'CmdOrCtrl+-',
      callback: () => setSize(currentSize - step)
    })
    api.addCommand({
      id: 'font-reset',
      name: '重置字号',
      shortcut: 'CmdOrCtrl+0',
      callback: () => setSize(defaultSize)
    })

    // Reset on new document
    api.on('document:open', () => setSize(defaultSize))

    applyFontSize(currentSize)
    api.log('Font Resizer plugin loaded')
  },
  async onunload() {}
}
