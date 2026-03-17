'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Github, Copy, Check, BookOpen, FolderTree, BarChart2, Palette, Globe, Apple } from 'lucide-react'
import { useT } from '@/lib/i18n'
import packageJson from '../../package.json'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const t = useT()
  const [copiedGithub, setCopiedGithub] = useState(false)
  const [copiedX, setCopiedX] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleGithubClick = async () => {
    const url = 'https://github.com/thejoven/hyperread'
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopiedGithub(true)
    setTimeout(() => setCopiedGithub(false), 2000)
  }

  const handleXClick = async () => {
    const url = 'https://x.com/thejoven_com'
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopiedX(true)
    setTimeout(() => setCopiedX(false), 2000)
  }

  const features = [
    { icon: BookOpen,   label: t('about.featureList.dragDrop') },
    { icon: FolderTree, label: t('about.featureList.fileTree') },
    { icon: BarChart2,  label: t('about.featureList.charts') },
    { icon: Palette,    label: t('about.featureList.themes') },
    { icon: Globe,      label: t('about.featureList.multiLang') },
    { icon: Apple,      label: t('about.featureList.macOS') },
  ]

  const platform = window.electronAPI?.platform === 'darwin' ? 'macOS' : window.electronAPI?.platform || 'Web'

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 macos-fade-in p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-[480px] max-w-[95vw] glass-effect rounded-2xl shadow-2xl overflow-hidden border border-border/20 macos-scale-in">

        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-7 w-7 p-0 hover:bg-muted/60 rounded-full transition-colors"
          title={t('ui.buttons.close')}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Hero header */}
        <div className="px-8 pt-10 pb-7 text-center bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-b border-border/10">
          {/* App icon */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-[22px] shadow-lg bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center overflow-hidden ring-1 ring-primary/20">
            <img
              src="./logo.png"
              alt="HyperRead Logo"
              className="w-16 h-16 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.parentElement!.innerHTML = '<span class="text-4xl">📚</span>'
              }}
            />
          </div>

          <h2 className="text-2xl font-bold macos-text-title tracking-tight">HyperRead</h2>
          <p className="text-sm text-muted-foreground mt-1 macos-text">{t('app.subtitle')}</p>

          {/* Version + platform badges */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              v{packageJson.version}
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/30">
              {platform}
            </span>
          </div>
        </div>

        {/* Features grid */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t('about.features')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {features.map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs text-muted-foreground leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social links + copyright */}
        <div className="px-6 pb-6 space-y-2.5 border-t border-border/10 pt-4">
          <Button
            onClick={handleGithubClick}
            variant="outline"
            className="w-full h-9 macos-button justify-between group"
          >
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              <span className="text-sm font-medium">github.com/thejoven/hyperread</span>
            </div>
            {copiedGithub
              ? <Check className="w-3.5 h-3.5 text-green-500" />
              : <Copy className="w-3.5 h-3.5 opacity-40 group-hover:opacity-70 transition-opacity" />
            }
          </Button>

          <Button
            onClick={handleXClick}
            variant="outline"
            className="w-full h-9 macos-button justify-between group"
          >
            <div className="flex items-center gap-2">
              {/* X (Twitter) logo — simple SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.766l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-sm font-medium">x.com/thejoven_com</span>
            </div>
            {copiedX
              ? <Check className="w-3.5 h-3.5 text-green-500" />
              : <Copy className="w-3.5 h-3.5 opacity-40 group-hover:opacity-70 transition-opacity" />
            }
          </Button>

          <p className="text-center text-xs text-muted-foreground/50 pt-1">
            © 2025 theJoven. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
