'use client'

import { useParams } from 'next/navigation'
import { ChevronRight, Home, Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { DocStructure } from '@/lib/docs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

interface ClientLayoutProps {
  docStructure: DocStructure
  children: React.ReactNode
}

export default function ClientLayout({ docStructure, children }: ClientLayoutProps) {
  const params = useParams()
  const currentSlug = params?.slug as string
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const currentDoc = docStructure.categories.flatMap(category => category.docs).find(
    doc => doc.slug === currentSlug || decodeURIComponent(doc.slug) === currentSlug
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out w-96",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar 
          docStructure={docStructure} 
          currentSlug={currentSlug}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Breadcrumb */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-4 lg:px-6 gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden px-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground flex-1">
              <Link href="/" className="hover:text-foreground">
                <Button variant="ghost" size="sm" className="px-2">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground truncate">
                {currentDoc?.title || '文档'}
              </span>
            </nav>
            
            {/* Theme Toggle */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="w-full py-4 lg:py-8 px-4 lg:px-6">
              <div className="max-w-4xl mx-auto">
                <Card className="border-0 shadow-none bg-transparent">
                  <div className="p-0">
                    {children}
                  </div>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </div>
      </main>
    </div>
  )
}