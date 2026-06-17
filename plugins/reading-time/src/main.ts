// Reading Time Estimator for HyperRead
interface PluginAPI {
  on(event: string, handler: (data?: any) => void): void
  off(event: string, handler: (data?: any) => void): void
  addStatusBarItem(item: { id: string; text: string; tooltip?: string }): { update(text: string): void; remove(): void }
  getActiveDocument(): { content: string; fileName: string } | null
  getSetting<T>(key: string): T | undefined
  log(...args: unknown[]): void
}

function estimateReadingTime(text: string, cnSpeed: number, enSpeed: number): string {
  const chineseChars = (text.match(/[一-鿿]/g) || []).length
  const nonChineseText = text.replace(/[一-鿿　-〿＀-￯]/g, ' ')
  const enWordCount = nonChineseText.trim().split(/\s+/).filter(w => /[a-zA-Z]/.test(w)).length

  const cnMinutes = chineseChars / cnSpeed
  const enMinutes = enWordCount / enSpeed
  const totalMinutes = cnMinutes + enMinutes

  if (totalMinutes < 1) return '不到 1 分钟'
  if (totalMinutes < 60) return Math.ceil(totalMinutes) + ' 分钟'
  const hours = Math.floor(totalMinutes / 60)
  const mins = Math.ceil(totalMinutes % 60)
  return hours + ' 小时 ' + mins + ' 分钟'
}

export default {
  async onload(api: PluginAPI) {
    const statusItem = api.addStatusBarItem({
      id: 'reading-time',
      text: '⏱ —',
      tooltip: '预计阅读时间'
    })

    function updateTime() {
      const doc = api.getActiveDocument()
      if (doc) {
        const cnSpeed = api.getSetting<number>('chineseCharsPerMin') || 400
        const enSpeed = api.getSetting<number>('englishWordsPerMin') || 200
        const time = estimateReadingTime(doc.content, cnSpeed, enSpeed)
        statusItem.update('⏱ ' + time)
      } else {
        statusItem.update('⏱ —')
      }
    }

    api.on('document:open', updateTime)
    api.on('document:close', () => statusItem.update('⏱ —'))
    api.on('app:ready', updateTime)
    updateTime()
    api.log('Reading Time plugin loaded')
  },
  async onunload() {}
}
