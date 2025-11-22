import { useCallback, useRef, useEffect } from 'react'

interface UseResizeOptions {
  minWidth: number
  maxWidth: number
  initialWidth: number
  onWidthChange?: (width: number) => void
  direction?: 'left' | 'right' // 拖动方向：left 表示向左拖动增加宽度（AI侧边栏），right 表示向右拖动增加宽度（文件列表）
}

/**
 * 高性能的宽度调整 Hook
 *
 * 优化策略：
 * 1. 使用 requestAnimationFrame 同步浏览器刷新
 * 2. 拖动过程中直接操作 DOM，避免 React 状态更新
 * 3. 只在拖动结束时更新 React 状态
 * 4. 使用 CSS transform 实现硬件加速
 */
export function useResize({
  minWidth,
  maxWidth,
  initialWidth,
  onWidthChange,
  direction = 'right'
}: UseResizeOptions) {
  const elementRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const currentWidthRef = useRef(initialWidth)

  // 取消待处理的动画帧
  const cancelAnimationFrame = useCallback(() => {
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
  }, [])

  // 清理函数
  useEffect(() => {
    return () => {
      cancelAnimationFrame()
      // 恢复 body 样式
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [cancelAnimationFrame])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!elementRef.current || !onWidthChange) return

    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startWidth = currentWidthRef.current
    isDraggingRef.current = true

    // 设置拖动状态
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    // 为元素添加优化提示
    if (elementRef.current) {
      elementRef.current.style.willChange = 'width'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !elementRef.current) return

      // 取消之前的动画帧
      cancelAnimationFrame()

      // 使用 requestAnimationFrame 优化渲染
      rafIdRef.current = requestAnimationFrame(() => {
        if (!elementRef.current) return

        // 根据方向计算宽度变化
        const deltaX = direction === 'left'
          ? startX - e.clientX  // AI侧边栏：向左拖动增加宽度
          : e.clientX - startX  // 文件列表：向右拖动增加宽度

        const newWidth = Math.min(Math.max(startWidth + deltaX, minWidth), maxWidth)

        // 直接更新 DOM，避免 React 重渲染
        elementRef.current.style.width = `${newWidth}px`
        currentWidthRef.current = newWidth
      })
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false

      // 清理动画帧
      cancelAnimationFrame()

      // 恢复样式
      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      if (elementRef.current) {
        elementRef.current.style.willChange = 'auto'
      }

      // 只在拖动结束时更新 React 状态
      if (onWidthChange && currentWidthRef.current !== startWidth) {
        onWidthChange(currentWidthRef.current)
      }

      // 移除事件监听
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [minWidth, maxWidth, direction, onWidthChange, cancelAnimationFrame])

  // 当外部宽度变化时更新引用
  useEffect(() => {
    currentWidthRef.current = initialWidth
    if (elementRef.current) {
      elementRef.current.style.width = `${initialWidth}px`
    }
  }, [initialWidth])

  return {
    elementRef,
    handleMouseDown,
    currentWidth: currentWidthRef.current
  }
}
