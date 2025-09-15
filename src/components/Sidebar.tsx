'use client'

import Link from 'next/link'
import { Search, FileText, X, Home, ChevronDown, ChevronRight, Folder } from 'lucide-react'
import { DocStructure } from '@/lib/docs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SidebarProps {
  docStructure: DocStructure
  currentSlug?: string
  onClose?: () => void
}

export default function Sidebar({ docStructure, currentSlug, onClose }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['bsc-geth-learn']))
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())
  
  // Filter across all categories and subcategories
  const filteredCategories = docStructure.categories.map(category => {
    const filteredDocs = category.docs.filter(doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    const filteredSubcategories = (category.subcategories || []).map(subcategory => ({
      ...subcategory,
      docs: subcategory.docs.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subcategory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(subcategory => subcategory.docs.length > 0)

    return {
      ...category,
      docs: filteredDocs,
      subcategories: filteredSubcategories
    }
  }).filter(category => 
    category.docs.length > 0 || 
    (category.subcategories && category.subcategories.length > 0) ||
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const decodedCurrentSlug = currentSlug ? decodeURIComponent(currentSlug) : ''

  const toggleCategory = (categorySlug: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categorySlug)) {
      newExpanded.delete(categorySlug)
    } else {
      newExpanded.add(categorySlug)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleSubcategory = (subcategoryKey: string) => {
    const newExpanded = new Set(expandedSubcategories)
    if (newExpanded.has(subcategoryKey)) {
      newExpanded.delete(subcategoryKey)
    } else {
      newExpanded.add(subcategoryKey)
    }
    setExpandedSubcategories(newExpanded)
  }

  return (
    <div className="w-full h-screen bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        {onClose && (
          <div className="flex justify-end mb-4 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="px-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索文档..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          <div className="space-y-1">
            {/* Homepage option */}
            <Link href="/" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-2 text-left font-normal mb-1"
              >
                <div className="flex items-start gap-2 w-full">
                  <Home className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-snug text-foreground">
                      首页
                    </div>
                  </div>
                </div>
              </Button>
            </Link>

            {filteredCategories.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">未找到匹配的文档</p>
              </div>
            ) : (
              filteredCategories.map((category) => {
                const isExpanded = expandedCategories.has(category.slug)
                
                return (
                  <div key={category.slug} className="mb-1">
                    {/* Category Header */}
                    <Button
                      variant="ghost"
                      onClick={() => toggleCategory(category.slug)}
                      className="w-full justify-start h-auto p-2 text-left font-normal hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2 w-full">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {category.docs.length + (category.subcategories?.reduce((acc, sub) => acc + sub.docs.length, 0) || 0)} 个文档
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>

                    {/* Category Documents */}
                    {isExpanded && (
                      <div className="ml-6 border-l border-border pl-2">
                        {category.docs.map((doc) => {
                          const isActive = decodedCurrentSlug === doc.slug || currentSlug === doc.slug
                          
                          return (
                            <Link key={doc.slug} href={`/docs/${doc.slug}`} onClick={onClose}>
                              <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                  "w-full justify-start h-auto p-1.5 text-left font-normal mb-0.5",
                                  isActive && "bg-accent text-accent-foreground border border-border shadow-sm"
                                )}
                              >
                                <div className="flex items-start gap-2 w-full">
                                  <FileText className={cn(
                                    "h-3 w-3 mt-0.5 flex-shrink-0",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                  )} />
                                  <div className="flex-1 min-w-0">
                                    <div className={cn(
                                      "text-sm font-medium leading-snug",
                                      isActive ? "text-accent-foreground" : "text-foreground"
                                    )}>
                                      {doc.title}
                                    </div>
                                    {isActive && (
                                      <div className="text-xs text-muted-foreground mt-0.5">
                                        当前阅读
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Button>
                            </Link>
                          )
                        })}
                        
                        {/* 渲染子分类 */}
                        {category.subcategories?.map((subcategory) => {
                          const subcategoryKey = `${category.slug}/${subcategory.slug}`
                          const isSubExpanded = expandedSubcategories.has(subcategoryKey)
                          
                          return (
                            <div key={subcategoryKey} className="mb-1">
                              {/* 子分类标题 */}
                              <Button
                                variant="ghost"
                                onClick={() => toggleSubcategory(subcategoryKey)}
                                className="w-full justify-start h-auto p-1.5 text-left font-normal hover:bg-muted/30 mb-0.5"
                              >
                                <div className="flex items-center gap-2 w-full">
                                  {isSubExpanded ? (
                                    <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3 text-muted-foreground ml-1" />
                                  )}
                                  <Folder className="h-3 w-3 text-muted-foreground" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-foreground">
                                      {subcategory.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      {subcategory.docs.length} 个文档
                                    </div>
                                  </div>
                                </div>
                              </Button>
                              
                              {/* 子分类文档列表 */}
                              {isSubExpanded && (
                                <div className="ml-4 border-l border-border pl-2">
                                  {subcategory.docs.map((doc) => {
                                    const isActive = decodedCurrentSlug === doc.slug || currentSlug === doc.slug
                                    
                                    return (
                                      <Link key={doc.slug} href={`/docs/${doc.slug}`} onClick={onClose}>
                                        <Button
                                          variant={isActive ? "secondary" : "ghost"}
                                          className={cn(
                                            "w-full justify-start h-auto p-1.5 text-left font-normal mb-0.5",
                                            isActive && "bg-accent text-accent-foreground border border-border shadow-sm"
                                          )}
                                        >
                                          <div className="flex items-start gap-2 w-full">
                                            <FileText className={cn(
                                              "h-2.5 w-2.5 mt-0.5 flex-shrink-0",
                                              isActive ? "text-primary" : "text-muted-foreground"
                                            )} />
                                            <div className="flex-1 min-w-0">
                                              <div className={cn(
                                                "text-xs font-medium leading-snug",
                                                isActive ? "text-accent-foreground" : "text-foreground"
                                              )}>
                                                {doc.title}
                                              </div>
                                              {isActive && (
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                  当前阅读
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </Button>
                                      </Link>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}