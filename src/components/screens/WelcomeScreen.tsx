'use client'

import { FileText, Folder, File, BookOpen, Image as ImageIcon, Box, Plus } from 'lucide-react'
import { useT } from '@/lib/i18n'
import type { RecentItem } from '@/lib/recent-items'

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getFileIcon(fileName: string, type: 'file' | 'directory') {
  if (type === 'directory') return <Folder className="h-[18px] w-[18px] text-blue-400/80 dark:text-blue-400/60 stroke-[1.5]" />
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf': return <FileText className="h-[18px] w-[18px] text-red-400/80 dark:text-red-400/60 stroke-[1.5]" />
    case 'epub': return <BookOpen className="h-[18px] w-[18px] text-orange-400/80 dark:text-orange-400/60 stroke-[1.5]" />
    case 'md':
    case 'markdown': return <FileText className="h-[18px] w-[18px] text-emerald-400/80 dark:text-emerald-400/60 stroke-[1.5]" />
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp': return <ImageIcon className="h-[18px] w-[18px] text-purple-400/80 dark:text-purple-400/60 stroke-[1.5]" />
    default: return <File className="h-[18px] w-[18px] text-muted-foreground/40 stroke-[1.5]" />
  }
}

interface WelcomeScreenProps {
  isDragOver: boolean
  onOpenFile: () => void
  onOpenDirectory: () => void
  recentItems: RecentItem[]
  onOpenRecent: (item: RecentItem) => void
  onClearRecent: () => void
}

export default function WelcomeScreen({
  isDragOver,
  onOpenFile,
  onOpenDirectory,
  recentItems,
  onOpenRecent,
  onClearRecent
}: WelcomeScreenProps) {
  const t = useT()
  const displayItems = recentItems.slice(0, 8)

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background text-foreground h-full relative selection:bg-primary/20 font-sans p-6 overflow-hidden">
      
      <div className={`w-full max-w-[540px] flex flex-col transition-opacity duration-300 ${isDragOver ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Header Section: Logo, Title, Subtitle */}
        <div className="flex flex-col items-center gap-4 mb-12 select-none text-center">
          {/* Logo */}
          <div className="relative flex items-center justify-center w-[72px] h-[72px] drop-shadow-sm mb-2">
            <img 
              src="./logo.png" 
              alt="HyperRead Logo" 
              className="w-full h-full object-contain" 
              draggable={false}
              onError={(e) => {
                const el = e.target as HTMLImageElement
                el.style.display = 'none'
                el.parentElement!.innerHTML = '<div class="text-[56px] opacity-80 leading-none">📖</div>'
              }}
            />
          </div>
          
          <div className="flex flex-col items-center">
            {/* 覆盖全局样式对 h1 添加的 margin，使用 !m-0 和 !p-0 强制清空 */}
            <h1 className="text-[28px] font-semibold tracking-[-0.015em] text-foreground/90 !leading-none !m-0 !mb-2 !p-0">
              HyperRead
            </h1>
            <p className="text-[14px] text-muted-foreground/50 font-medium tracking-wide !m-0 !p-0">
              {t('ui.messages.readSmarter')}
            </p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3 w-full mb-12 select-none px-2">
           <button 
             onClick={onOpenFile} 
             className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-[10px] bg-muted/30 hover:bg-muted/60 text-foreground/70 hover:text-foreground text-[13px] font-medium transition-colors border border-transparent hover:border-border/30 flex-1"
           >
              <FileText className="w-4 h-4 stroke-[1.5] text-muted-foreground/70" />
              {t('ui.buttons.openFile')}
           </button>
           <button 
             onClick={onOpenDirectory} 
             className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-[10px] bg-muted/30 hover:bg-muted/60 text-foreground/70 hover:text-foreground text-[13px] font-medium transition-colors border border-transparent hover:border-border/30 flex-1"
           >
              <Folder className="w-4 h-4 stroke-[1.5] text-muted-foreground/70" />
              {t('ui.buttons.openFolder')}
           </button>
        </div>

        {/* Recent Items Section */}
        <div className="w-full flex flex-col">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/40 select-none">
              <Box className="w-8 h-8 mb-5 opacity-20 stroke-[1]" />
              <p className="text-[13px] font-medium tracking-wide !m-0">{t('ui.messages.noRecentItems')}</p>
              <p className="text-[12px] mt-2 opacity-50 !m-0">{t('ui.messages.dragDropHint')}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 px-3 select-none">
                <span className="text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-[0.1em]">
                  {t('ui.messages.recentItems')}
                </span>
                <button onClick={onClearRecent} className="text-[11px] font-medium text-muted-foreground/30 hover:text-foreground/70 transition-colors">
                  {t('ui.messages.clearRecent')}
                </button>
              </div>

              <div className="flex flex-col gap-0.5">
                {displayItems.map((item) => (
                  <button
                    key={item.filePath}
                    onClick={() => onOpenRecent(item)}
                    className="group flex items-center gap-4 w-full px-3 py-2.5 rounded-xl hover:bg-muted/40 active:bg-muted/60 transition-all text-left outline-none"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center w-6 opacity-70 group-hover:opacity-100 transition-opacity">
                      {getFileIcon(item.fileName, item.type as 'file' | 'directory')}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex items-baseline gap-3">
                      <span className="text-[13px] font-medium text-foreground/70 group-hover:text-foreground/90 truncate flex-shrink-0 max-w-[45%] transition-colors">
                        {item.fileName}
                      </span>
                      <span className="text-[12px] text-muted-foreground/30 group-hover:text-muted-foreground/50 truncate flex-1 min-w-0 transition-colors" dir="ltr">
                        {item.filePath.replace(new RegExp(`^/Users/[^/]+`), '~')}
                      </span>
                    </div>

                    <div className="flex-shrink-0 text-[11px] text-muted-foreground/20 font-medium w-12 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatRelativeTime(item.openedAt)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none bg-background/60 backdrop-blur-md transition-all duration-300">
          <div className="w-16 h-16 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center mb-4 shadow-sm">
            <Plus className="w-8 h-8 text-foreground/60 stroke-[1.5]" />
          </div>
          <p className="text-[13px] font-medium text-foreground/80 tracking-wide !m-0">{t('ui.messages.releaseToOpen')}</p>
        </div>
      )}
    </div>
  )
}
