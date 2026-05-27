// demo-plugin/toc-minimap/main.js
// 目录导航插件 — 在 Markdown 文档右侧显示浮动目录导航条
// 逻辑移植自 src/components/TocMinimap.tsx + src/lib/toc-utils.ts

export default {
  async onload(api) {
    let destroyFn = null
    let currentContent = null
    let currentFileType = null

    // ── 事件监听 ────────────────────────────────────────────────
    api.on('document:open', (fileData) => {
      currentContent = fileData?.content ?? null
      currentFileType = fileData?.fileType ?? null
      scheduleInit()
    })

    api.on('tab:activate', (fileData) => {
      currentContent = fileData?.content ?? null
      currentFileType = fileData?.fileType ?? null
      scheduleInit()
    })

    api.on('document:close', () => {
      currentContent = null
      currentFileType = null
      destroy()
    })

    // 如果插件在文档已打开后才被启用
    const activeDoc = api.getActiveDocument?.()
    if (activeDoc) {
      currentContent = activeDoc.content ?? null
      currentFileType = activeDoc.fileType ?? null
      scheduleInit()
    }

    // ── 初始化调度 ───────────────────────────────────────────────
    function scheduleInit() {
      destroy()
      if (!currentContent || (currentFileType !== 'md' && currentFileType !== 'txt')) return
      tryMount(0)
    }

    // 等待 .content-scroll 出现在 DOM 中（最多重试 20 次）
    function tryMount(attempts) {
      const scrollEl = document.querySelector('.content-scroll')
      if (!scrollEl) {
        if (attempts < 20) setTimeout(() => tryMount(attempts + 1), 100)
        return
      }
      destroyFn = mountMinimap(scrollEl, currentContent)
    }

    function destroy() {
      if (destroyFn) {
        destroyFn()
        destroyFn = null
      }
    }

    // ── 核心：挂载浮动导航条 ────────────────────────────────────
    function mountMinimap(scrollEl, content) {
      const headings = extractHeadings(content)
      if (headings.length === 0) return () => {}

      const parent = scrollEl.parentElement
      if (!parent) return () => {}

      // 容器
      const container = document.createElement('div')
      container.style.cssText = [
        'position: absolute',
        'right: 12px',
        'top: 50%',
        'transform: translateY(-50%)',
        'z-index: 30',
        'display: flex',
        'flex-direction: column',
        'align-items: flex-end',
        'gap: 3px',
        'pointer-events: auto',
        'opacity: 0.3',
        'transition: opacity 0.2s',
      ].join(';')
      parent.appendChild(container)

      let activeId = ''
      let segments = []
      let measureTimer = null
      let scrollTimer = null

      // ── 比例计算 ──────────────────────────────────────────────
      function measureSegments() {
        const domHeadings = Array.from(scrollEl.querySelectorAll('h1,h2,h3,h4,h5,h6'))
        const totalHeight = scrollEl.scrollHeight
        if (totalHeight === 0) return

        const positions = headings.map((_, i) => {
          const el = domHeadings[i]
          if (!el) return 0
          const containerRect = scrollEl.getBoundingClientRect()
          const elRect = el.getBoundingClientRect()
          return scrollEl.scrollTop + elRect.top - containerRect.top
        })

        segments = headings.map((h, i) => {
          const start = positions[i]
          const end = i + 1 < headings.length ? positions[i + 1] : totalHeight
          return { ...h, proportion: Math.max(0, end - start) / totalHeight }
        })

        render()
      }

      function getBarWidth(proportion) {
        const MAX = 56, MIN = 6
        if (segments.length === 0) return MIN
        const avg = segments.reduce((s, seg) => s + seg.proportion, 0) / segments.length
        const lo = avg * 0.2, hi = avg * 4
        const clamped = Math.max(lo, Math.min(hi, proportion))
        const t = hi > lo ? (clamped - lo) / (hi - lo) : 0.5
        return Math.max(MIN, Math.round(MIN + t * (MAX - MIN)))
      }

      // ── 活跃标题跟踪 ──────────────────────────────────────────
      function updateActive() {
        if (headings.length === 0) return
        const domHeadings = Array.from(scrollEl.querySelectorAll('h1,h2,h3,h4,h5,h6'))
        const vh = window.innerHeight
        const zoneTop = vh * 0.2, zoneBottom = vh * 0.8
        let bestId = '', closestDist = Infinity

        headings.forEach((h, i) => {
          const el = domHeadings[i]
          if (!el) return
          const rect = el.getBoundingClientRect()
          if (rect.top <= zoneBottom && rect.bottom >= zoneTop) {
            const dist = Math.abs(rect.top - vh / 2)
            if (dist < closestDist) { closestDist = dist; bestId = h.id }
          } else if (rect.top <= zoneTop) {
            bestId = h.id
          }
        })

        if (bestId && bestId !== activeId) {
          activeId = bestId
          render()
        }
      }

      // ── DOM 渲染 ───────────────────────────────────────────────
      function render() {
        container.innerHTML = ''

        for (let i = 0; i < segments.length; i++) {
          const seg = segments[i]
          const isActive = seg.id === activeId
          const barWidth = getBarWidth(seg.proportion)

          const row = document.createElement('div')
          row.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:flex-end;pointer-events:auto'

          // Tooltip
          const tooltip = document.createElement('div')
          tooltip.textContent = seg.text
          tooltip.style.cssText = [
            'position: absolute',
            'right: 100%',
            'margin-right: 8px',
            'padding: 2px 8px',
            'border-radius: 9999px',
            'font-size: 12px',
            'white-space: nowrap',
            'pointer-events: none',
            'background: hsl(var(--background))',
            'border: 1px solid hsl(var(--border))',
            'color: hsl(var(--foreground))',
            'box-shadow: 0 2px 8px rgba(0,0,0,0.15)',
            'max-width: 200px',
            'overflow: hidden',
            'text-overflow: ellipsis',
            'display: none',
          ].join(';')
          row.appendChild(tooltip)

          // Bar capsule
          const bar = document.createElement('div')
          bar.style.cssText = [
            `width: ${barWidth}px`,
            'height: 4px',
            'border-radius: 9999px',
            'cursor: pointer',
            'transition: background 0.15s, width 0.15s',
            `background: ${isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.25)'}`,
          ].join(';')

          bar.addEventListener('mouseenter', () => {
            tooltip.style.display = 'block'
            bar.style.background = seg.id === activeId
              ? 'hsl(var(--primary))'
              : 'hsl(var(--primary) / 0.6)'
          })
          bar.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none'
            bar.style.background = seg.id === activeId
              ? 'hsl(var(--primary))'
              : 'hsl(var(--foreground) / 0.25)'
          })

          const capturedIndex = i
          const capturedId = seg.id
          bar.addEventListener('click', () => {
            scrollToHeadingByIndex(scrollEl, capturedIndex)
            activeId = capturedId
            render()
          })

          row.appendChild(bar)
          container.appendChild(row)
        }
      }

      // ── 滚动到标题 ────────────────────────────────────────────
      function scrollToHeadingByIndex(scrollContainer, index) {
        const allHeadings = scrollContainer.querySelectorAll('h1,h2,h3,h4,h5,h6')
        const el = allHeadings[index]
        if (!el) return
        const offsetTop = window.innerHeight * 0.15
        const containerRect = scrollContainer.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        const target = scrollContainer.scrollTop + elRect.top - containerRect.top - offsetTop
        scrollContainer.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
      }

      // ── 事件绑定 ──────────────────────────────────────────────
      const handleScroll = () => {
        updateActive()
        if (scrollTimer) clearTimeout(scrollTimer)
        scrollTimer = setTimeout(updateActive, 100)
      }
      scrollEl.addEventListener('scroll', handleScroll, { passive: true })
      setTimeout(updateActive, 250)

      const resizeObserver = new ResizeObserver(() => {
        if (measureTimer) clearTimeout(measureTimer)
        measureTimer = setTimeout(measureSegments, 150)
      })
      resizeObserver.observe(scrollEl)

      container.addEventListener('mouseenter', () => { container.style.opacity = '0.9' })
      container.addEventListener('mouseleave', () => { container.style.opacity = '0.3' })

      // Initial measurement
      measureTimer = setTimeout(measureSegments, 300)

      return () => {
        if (measureTimer) clearTimeout(measureTimer)
        if (scrollTimer) clearTimeout(scrollTimer)
        scrollEl.removeEventListener('scroll', handleScroll)
        resizeObserver.disconnect()
        container.remove()
      }
    }

    // ── 标题提取（移植自 toc-utils.ts）──────────────────────────
    function generateHeadingId(text) {
      if (typeof text !== 'string') return ''
      return text
        .toLowerCase()
        .replace(/[^\w\s\u4e00-\u9fff-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }

    function extractHeadings(content) {
      // Strip fenced code blocks to avoid treating # comments as headings
      const stripped = content.replace(
        /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1[ \t]*$/gm,
        (match) => match.replace(/^(?!`|~).+$/gm, '')
      )
      const headingRegex = /^(#{1,6})\s+(.+)$/gm
      const headings = []
      const usedIds = new Set()
      let match

      while ((match = headingRegex.exec(stripped)) !== null) {
        const level = match[1].length
        const text = match[2].trim()
        let id = generateHeadingId(text)
        let counter = 1
        let uniqueId = id
        while (usedIds.has(uniqueId)) {
          uniqueId = `${id}-${counter}`
          counter++
        }
        usedIds.add(uniqueId)
        headings.push({ id: uniqueId, text, level })
      }

      return headings
    }
  },

  async onunload() {}
}
