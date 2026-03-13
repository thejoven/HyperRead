// Example Word Count plugin for HyperRead
// Build: esbuild src/main.ts --bundle --format=esm --outfile=main.js

interface PluginAPI {
  on(event: string, handler: (data?: any) => void): void
  addStatusBarItem(item: { id: string; text: string; tooltip?: string }): { update(text: string): void; remove(): void }
  getActiveDocument(): { content: string; fileName: string } | null
  log(...args: unknown[]): void
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function countChars(text: string): number {
  return text.replace(/\s/g, '').length
}

export default {
  async onload(api: PluginAPI) {
    const statusItem = api.addStatusBarItem({
      id: 'word-count',
      text: 'W: —',
      tooltip: 'Word count'
    })

    function updateCount() {
      const doc = api.getActiveDocument()
      if (doc) {
        const words = countWords(doc.content)
        const chars = countChars(doc.content)
        statusItem.update(`W: ${words.toLocaleString()} | C: ${chars.toLocaleString()}`)
      } else {
        statusItem.update('W: —')
      }
    }

    api.on('document:open', updateCount)
    api.on('document:close', () => statusItem.update('W: —'))
    api.on('app:ready', updateCount)

    updateCount()
    api.log('Word Count plugin loaded')
  },

  async onunload() {
    // Cleanup is handled automatically by the plugin manager
  }
}
