'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Folder } from 'lucide-react'
import { useT } from '@/lib/i18n'

interface WelcomeScreenProps {
  isDragOver: boolean
  onOpenFile: () => void
  onOpenDirectory: () => void
}

export default function WelcomeScreen({
  isDragOver,
  onOpenFile,
  onOpenDirectory
}: WelcomeScreenProps) {
  const t = useT()

  return (
    <div className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
      <Card className={`max-w-lg w-full transition-all duration-300 macos-scale-in ${
        isDragOver
          ? 'macos-drop-zone shadow-lg scale-105'
          : 'border-dashed border-2 border-muted-foreground/30 hover:border-muted-foreground/50 hover:shadow-md'
      }`}>
        <CardContent className="p-8 text-center">
          <div className={`inline-flex items-center justify-center w-30 h-30 rounded-xl transition-all duration-300 ${
            isDragOver
              ? 'bg-primary/20 text-primary'
              : 'bg-muted/30 text-muted-foreground'
          }`}>
            <img
              src="./logo.png"
              alt="HyperRead Logo"
              className="w-30 h-30 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.parentElement!.innerHTML = isDragOver
                  ? '<div class="h-8 w-8 text-2xl">📁</div>'
                  : '<div class="h-8 w-8 text-2xl">📄</div>'
              }}
            />
          </div>
          <div className="text-4xl font-bold mb-3 text-foreground">
            HyperRead
          </div>
          <div className="text-xl font-semibold mb-2 text-foreground/80">
            {isDragOver ? t('ui.messages.releaseToOpen') : t('ui.messages.readSmarter')}
          </div>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {isDragOver
              ? t('ui.messages.releaseToOpen')
              : t('ui.messages.dragDropSupport')
            }
          </p>
          {!isDragOver && (
            <div className="space-y-4">
              <div className="flex gap-2 justify-center">
                <Button onClick={onOpenFile} className="min-w-24 macos-button">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="macos-text">{t('ui.buttons.openFile')}</span>
                </Button>
                <Button onClick={onOpenDirectory} variant="outline" className="min-w-24 macos-button">
                  <Folder className="h-4 w-4 mr-2" />
                  <span className="macos-text">{t('ui.buttons.openFolder')}</span>
                </Button>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs px-2">or</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('ui.messages.dragDropHint')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
