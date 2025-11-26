'use client'

import { Button } from '@/components/ui/button'

interface RefreshHintModalProps {
  visible: boolean
  directoryNames: string[]
  onClose: () => void
  onOpenDirectory: () => void
}

export default function RefreshHintModal({
  visible,
  directoryNames,
  onClose,
  onOpenDirectory
}: RefreshHintModalProps) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 m-4 max-w-md w-full glass-effect">
        <h3 className="text-lg font-semibold mb-4 text-center">
          需要重新加载文件
        </h3>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            文件系统发生了变化，需要重新拖拽文件夹来获取最新的文件列表。
          </p>

          {directoryNames.length > 0 && (
            <div className="bg-muted p-3 rounded text-center">
              <p className="text-xs text-muted-foreground mb-2">原拖拽的文件夹：</p>
              <p className="font-mono text-sm">{directoryNames.join(', ')}</p>
            </div>
          )}

          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-background/50">
            <div className="text-2xl mb-2">📁</div>
            <p className="text-sm font-medium mb-1">重新拖拽文件夹到此处</p>
            <p className="text-xs text-muted-foreground">或使用"打开文件夹"按钮</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1"
            >
              稍后处理
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onOpenDirectory}
              className="flex-1"
            >
              打开文件夹
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
