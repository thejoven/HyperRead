'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BookOpen, Clock, RotateCcw } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { ReadingProgress, epubReadingProgress } from '@/lib/epub-reading-progress'

interface ResumeReadingDialogProps {
  isOpen: boolean
  onResume: () => void        // 继续阅读（跳转到上次位置）
  onStartOver: () => void     // 从头开始
  progress: ReadingProgress | null
}

export default function ResumeReadingDialog({
  isOpen,
  onResume,
  onStartOver,
  progress
}: ResumeReadingDialogProps) {
  const { t } = useTranslation()

  if (!isOpen || !progress) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    // 点击背景不关闭，必须选择一个选项
  }

  const lastReadTimeText = epubReadingProgress.formatLastReadTime(progress.lastReadAt)

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[70] macos-fade-in p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-[420px] max-w-[90vw] glass-effect border border-border/30 shadow-2xl macos-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/20 bg-primary/5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {t('epub.resumeReading.title')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('epub.resumeReading.subtitle')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* 文件名 */}
          <div className="text-sm text-center text-muted-foreground truncate px-2" title={progress.fileName}>
            {progress.fileName}
          </div>

          {/* 阅读进度信息 */}
          <div className="grid grid-cols-3 gap-3">
            {/* 页码 */}
            <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/20">
              <div className="text-lg font-bold text-primary">
                {progress.currentPage}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                / {progress.totalPages} {t('epub.resumeReading.pages')}
              </div>
            </div>

            {/* 百分比 */}
            <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/20">
              <div className="text-lg font-bold text-primary">
                {progress.percentage}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t('epub.resumeReading.progress')}
              </div>
            </div>

            {/* 时间 */}
            <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/20">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {lastReadTimeText}
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          {/* 提示文本 */}
          <p className="text-sm text-center text-muted-foreground">
            {t('epub.resumeReading.message')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-border/20 bg-muted/10">
          <Button
            variant="outline"
            size="sm"
            onClick={onStartOver}
            className="flex-1 h-10 macos-button"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('epub.resumeReading.startOver')}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onResume}
            className="flex-1 h-10 macos-button"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {t('epub.resumeReading.continue')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
