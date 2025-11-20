'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo, memo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Maximize,
  Download,
  Printer
} from 'lucide-react'
import { useT } from '@/lib/i18n'

// 配置 PDF.js worker - 使用本地文件 (Electron环境)
pdfjs.GlobalWorkerOptions.workerSrc = './pdf.worker.min.mjs'

// 错误边界组件
class PdfErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('PDF Error Boundary caught error:', error, errorInfo)
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <div className="text-red-500 text-lg mb-2">PDF 渲染错误</div>
            <div className="text-muted-foreground text-sm">{this.state.error?.message}</div>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="mt-4"
            >
              重新加载
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 使用 memo 优化 Page 组件，防止不必要的重渲染
const MemoizedPage = memo(Page)

interface PdfViewerProps {
  data: string  // PDF file path (in Electron)
  fileName: string
  filePath: string
  className?: string
}

export default function PdfViewer({ data, fileName, filePath, className }: PdfViewerProps) {
  const t = useT()
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [pageInputValue, setPageInputValue] = useState<string>('1')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const documentRef = useRef<any>(null)
  const loadingTaskRef = useRef<any>(null)

  // 在 Electron 中，data 直接是文件路径，转换为 file:// URL
  const pdfUrl = useMemo(() => {
    try {
      // 检查是否是文件路径（Electron 环境）
      if (data.startsWith('/') || data.match(/^[A-Z]:\\/)) {
        // 转换为 file:// URL
        const fileUrl = `file://${data.replace(/\\/g, '/')}`
        console.log('PDF file URL:', fileUrl)
        return fileUrl
      }

      setError('无效的 PDF 路径')
      return null
    } catch (err) {
      console.error('PDF URL creation error:', err)
      setError('无法创建 PDF URL')
      return null
    }
  }, [data])

  const onDocumentLoadSuccess = useCallback((pdf: any) => {
    console.log('PDF loaded successfully, pages:', pdf.numPages)
    setNumPages(pdf.numPages)
    setIsLoading(false)
    setError(null)
    setRenderError(null)
    loadingTaskRef.current = pdf
  }, [])

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error('PDF load error:', err)
    console.error('Error stack:', err.stack)
    setError(`PDF 加载失败: ${err.message}`)
    setIsLoading(false)
  }, [])

  const onPageLoadError = useCallback((err: Error) => {
    console.error('Page load error:', err)
    console.error('Error stack:', err.stack)
    console.error('Current page:', pageNumber)
    setRenderError(`页面 ${pageNumber} 加载失败: ${err.message}`)
  }, [pageNumber])

  const onPageRenderError = useCallback((err: Error) => {
    console.error('Page render error:', err)
    console.error('Error stack:', err.stack)
    console.error('Current page:', pageNumber)
    setRenderError(`页面 ${pageNumber} 渲染失败: ${err.message}`)
  }, [pageNumber])

  const handlePdfError = useCallback((err: Error) => {
    console.error('PDF Error Boundary:', err)
    setError(`PDF 组件错误: ${err.message}`)
  }, [])

  // 重置页码当文件改变时
  useEffect(() => {
    console.log('PDF URL changed:', pdfUrl)
    setPageNumber(1)
    setPageInputValue('1')
    setScale(1.0)
    setRotation(0)
    setNumPages(0)
    setIsLoading(true)
    setError(null)
    setRenderError(null)

    // 清理之前的加载任务
    return () => {
      if (loadingTaskRef.current) {
        console.log('Cleaning up loading task')
        loadingTaskRef.current = null
      }
    }
  }, [pdfUrl])

  // 页面导航 - 添加节流
  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => {
      const newPage = Math.max(prev - 1, 1)
      console.log('Navigate to previous page:', newPage)
      setRenderError(null) // 清除渲染错误
      return newPage
    })
  }, [])

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => {
      const newPage = Math.min(prev + 1, numPages)
      console.log('Navigate to next page:', newPage)
      setRenderError(null) // 清除渲染错误
      return newPage
    })
  }, [numPages])

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value)
  }

  const handlePageInputBlur = () => {
    const page = parseInt(pageInputValue, 10)
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      setPageNumber(page)
    } else {
      setPageInputValue(pageNumber.toString())
    }
  }

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputBlur()
    }
  }

  // 缩放控制
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const resetZoom = () => {
    setScale(1.0)
  }

  // 旋转
  const rotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // 更新页码输入值
  useEffect(() => {
    setPageInputValue(pageNumber.toString())
  }, [pageNumber])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          goToPrevPage()
          break
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault()
          goToNextPage()
          break
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            zoomIn()
          }
          break
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            zoomOut()
          }
          break
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            resetZoom()
          }
          break
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            rotate()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [numPages])

  // 下载 PDF - 创建下载链接
  const handleDownload = () => {
    try {
      // 创建隐藏的下载链接
      const a = document.createElement('a')
      a.href = pdfUrl || ''
      a.download = `${fileName}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  if (error || !pdfUrl) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 text-lg mb-2">PDF 加载错误</div>
          <div className="text-muted-foreground text-sm">{error || '无效的 PDF 数据'}</div>
        </div>
      </div>
    )
  }

  return (
    <PdfErrorBoundary onError={handlePdfError}>
      <div className={`flex flex-col h-full ${className}`}>
        {/* 渲染错误提示 */}
        {renderError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-sm">
            <p>{renderError}</p>
            <Button
              size="sm"
              onClick={() => {
                setRenderError(null)
                setPageNumber(1)
              }}
              className="mt-1"
            >
              返回第一页
            </Button>
          </div>
        )}
        {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        {/* 左侧：页面导航 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            <Input
              type="text"
              value={pageInputValue}
              onChange={handlePageInputChange}
              onBlur={handlePageInputBlur}
              onKeyDown={handlePageInputKeyDown}
              className="w-12 h-7 text-center text-xs"
            />
            <span className="text-xs text-muted-foreground">/ {numPages}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 中间：缩放控制 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="h-7 w-7 p-0"
            title="缩小 (Ctrl+-)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetZoom}
            className="h-7 px-2 text-xs"
            title="重置缩放 (Ctrl+0)"
          >
            {Math.round(scale * 100)}%
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="h-7 w-7 p-0"
            title="放大 (Ctrl++)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* 右侧：其他操作 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={rotate}
            className="h-7 w-7 p-0"
            title="旋转 (Ctrl+R)"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 w-7 p-0"
            title="下载 PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF 内容区域 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/30 flex justify-center"
      >
        <div className="py-4">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-sm text-muted-foreground">加载 PDF 中...</p>
              </div>
            </div>
          )}

          <Document
            key={pdfUrl}
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="flex flex-col items-center gap-4"
            inputRef={documentRef}
            options={{
              // 禁用字体缓存，避免内存问题
              disableFontFace: false,
              // 启用标准字体
              standardFontDataUrl: undefined,
              // 使用 fetch 获取 PDF，避免 ArrayBuffer 传递
              isEvalSupported: false,
              // 增加 worker 端口消息队列限制
              maxImageSize: -1,
              // 禁用自动 fetch
              disableAutoFetch: false,
              // 禁用流式传输
              disableStream: false,
            }}
          >
            <MemoizedPage
              key={`page-${pageNumber}`}
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-lg"
              onLoadError={onPageLoadError}
              onRenderError={onPageRenderError}
              loading={
                <div className="flex items-center justify-center h-64 w-96 bg-background rounded-lg">
                  <div className="animate-pulse text-muted-foreground">加载页面 {pageNumber}...</div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-64 w-96 bg-background rounded-lg border-2 border-red-500">
                  <div className="text-red-500 text-sm">页面 {pageNumber} 加载失败</div>
                  <Button
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="mt-2"
                  >
                    重新加载
                  </Button>
                </div>
              }
            />
          </Document>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-background/95 text-xs text-muted-foreground">
        <span className="truncate max-w-[200px]" title={fileName}>{fileName}</span>
        <span>第 {pageNumber} 页，共 {numPages} 页</span>
      </div>
      </div>
    </PdfErrorBoundary>
  )
}
