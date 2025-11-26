'use client'

import { FolderOpen } from 'lucide-react'

interface DragOverlayProps {
  visible: boolean
}

export default function DragOverlay({ visible }: DragOverlayProps) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-primary/10 backdrop-blur-lg flex items-center justify-center z-40 pointer-events-none macos-fade-in">
      <div className="text-center glass-effect p-8 rounded-2xl">
        <FolderOpen className="h-24 w-24 mx-auto mb-4 text-primary" />
        <h3 className="text-2xl font-bold text-primary macos-text-title">释放文件</h3>
        <p className="text-sm text-primary/70 mt-2 macos-text">支持 Markdown 文件和文件夹</p>
      </div>
    </div>
  )
}
