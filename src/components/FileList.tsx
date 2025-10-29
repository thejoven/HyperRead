'use client'

import { useState, useMemo, memo, useRef, useCallback, useEffect } from 'react'

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => func(...args), wait)
  }
}
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FileText, Folder, FolderOpen, ChevronRight, ChevronDown, Search, RefreshCw } from 'lucide-react'
import { useT } from '@/lib/i18n'

interface FileInfo {
  name: string
  fileName: string
  fullPath: string
  relativePath: string
  directory: string
}

interface FileListProps {
  files: FileInfo[]
  rootPath?: string
  currentFile?: string
  onFileSelect: (file: FileInfo) => void
  isCollapsed?: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
  width?: number
  onWidthChange?: (width: number) => void
}

interface TreeNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: TreeNode[]
  file?: FileInfo
}

// 搜索缓存
let searchCache: { term: string; tree: TreeNode[]; result: TreeNode[] } | null = null

function filterTree(tree: TreeNode[], searchTerm: string): TreeNode[] {
  const trimmedTerm = searchTerm.trim()
  if (!trimmedTerm) return tree

  // 检查缓存
  if (searchCache &&
      searchCache.term === trimmedTerm &&
      searchCache.tree === tree) {
    return searchCache.result
  }

  const filtered: TreeNode[] = []
  const lowerSearchTerm = trimmedTerm.toLowerCase()

  for (const node of tree) {
    if (node.type === 'file') {
      if (node.name.toLowerCase().includes(lowerSearchTerm)) {
        filtered.push(node)
      }
    } else if (node.type === 'directory' && node.children) {
      const filteredChildren = filterTree(node.children, trimmedTerm)
      if (filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren
        })
      }
    }
  }

  // 更新缓存
  searchCache = { term: trimmedTerm, tree, result: filtered }

  return filtered
}

function buildTree(files: FileInfo[]): TreeNode[] {
  if (files.length === 0) return []

  const nodeMap = new Map<string, TreeNode>()

  // 创建根节点
  nodeMap.set('.', {
    name: '.',
    path: '.',
    type: 'directory',
    children: []
  })

  // 处理所有文件 - 使用更高效的算法
  for (const file of files) {
    const pathParts = file.relativePath.split('/')
    let currentPath = '.'

    // 确保所有父目录存在
    for (let i = 0; i < pathParts.length - 1; i++) {
      const dirName = pathParts[i]
      const parentPath = currentPath
      currentPath = currentPath === '.' ? dirName : `${currentPath}/${dirName}`

      if (!nodeMap.has(currentPath)) {
        const dirNode: TreeNode = {
          name: dirName,
          path: currentPath,
          type: 'directory',
          children: []
        }
        nodeMap.set(currentPath, dirNode)

        // 添加到父目录
        const parentNode = nodeMap.get(parentPath)
        if (parentNode && parentNode.children) {
          parentNode.children.push(dirNode)
        }
      }
    }

    // 添加文件
    const fileName = pathParts[pathParts.length - 1]
    const filePath = file.relativePath
    const parentPath = file.directory === '.' ? '.' : file.directory

    const fileNode: TreeNode = {
      name: fileName,
      path: filePath,
      type: 'file',
      file: file
    }

    const parentNode = nodeMap.get(parentPath)
    if (parentNode && parentNode.children) {
      parentNode.children.push(fileNode)
    }
  }

  // 优化排序函数 - 避免不必要的递归
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    // 只对包含子节点的目录进行递归排序
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children)
      }
    }
  }

  const rootNode = nodeMap.get('.')
  if (rootNode && rootNode.children) {
    sortNodes(rootNode.children)
    return rootNode.children
  }

  return []
}

const TreeNodeComponent = memo(({ 
  node, 
  currentFile, 
  onFileSelect, 
  level = 0 
}: { 
  node: TreeNode
  currentFile?: string
  onFileSelect: (file: FileInfo) => void
  level?: number 
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2) // 默认展开前两级

  if (node.type === 'file' && node.file) {
    const isActive = currentFile === node.file.fullPath

    return (
      <div className="flex items-center group">
        <div style={{ width: `${level * 12}px` }} className="flex-shrink-0" />
        <Button
          variant="ghost"
          size="sm"
          className={`justify-start h-7 px-2 py-1 w-full text-left transition-all duration-150 macos-file-item ${
            isActive 
              ? 'active text-white' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onFileSelect(node.file!)}
        >
          <FileText className={`h-3.5 w-3.5 mr-2 flex-shrink-0 ${
            isActive ? 'text-white' : 'text-muted-foreground'
          }`} />
          <span className="truncate text-xs macos-text">{node.file.name}</span>
        </Button>
      </div>
    )
  }

  if (node.type === 'directory' && node.children) {
    return (
      <div>
        <div className="flex items-center group">
          <div style={{ width: `${level * 12}px` }} className="flex-shrink-0" />
          <Button
            variant="ghost"
            size="sm"
            className="justify-start h-7 px-2 py-1 w-full text-left transition-all duration-150 macos-file-item text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 mr-1 flex-shrink-0 transition-transform duration-150" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 mr-1 flex-shrink-0 transition-transform duration-150" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-primary" />
            ) : (
              <Folder className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-primary" />
            )}
            <span className="truncate text-xs font-medium macos-text">{node.name}</span>
            <span className="text-xs text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-mono">
              {node.children.length}
            </span>
          </Button>
        </div>
        {isExpanded && (
          <div className="space-y-1 mt-1 macos-fade-in">
            {node.children.map((child, index) => (
              <TreeNodeComponent
                key={child.path}
                node={child}
                currentFile={currentFile}
                onFileSelect={onFileSelect}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
})

export default function FileList({
  files,
  rootPath,
  currentFile,
  onFileSelect,
  isCollapsed = false,
  onRefresh,
  isRefreshing = false,
  width = 288,
  onWidthChange
}: FileListProps) {
  const t = useT()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const tree = useMemo(() => buildTree(files), [files])
  const filteredTree = useMemo(() => filterTree(tree, debouncedSearchTerm), [tree, debouncedSearchTerm])

  // 搜索防抖
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 150) // 150ms 防抖延迟

    return () => {
      clearTimeout(timeoutId)
    }
  }, [searchTerm])

  // 使用 useRef 存储防抖函数实例
  const debouncedWidthChangeRef = useRef<((width: number) => void) | null>(null)

  // 初始化防抖函数
  useEffect(() => {
    if (onWidthChange) {
      debouncedWidthChangeRef.current = debounce(onWidthChange, 16) // 约60fps
    }
  }, [onWidthChange])

  // Handle resizer drag - 优化版本
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onWidthChange) return

    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startWidth = width
    let lastWidth = width

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const newWidth = Math.min(Math.max(startWidth + deltaX, 200), 600)

      // 只有当宽度实际变化时才更新
      if (newWidth !== lastWidth) {
        lastWidth = newWidth

        // 立即更新本地状态用于视觉反馈
        if (debouncedWidthChangeRef.current) {
          debouncedWidthChangeRef.current(newWidth)
        } else {
          onWidthChange(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      // 恢复默认样式
      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      // 确保最终宽度被正确设置
      if (lastWidth !== width && onWidthChange) {
        onWidthChange(lastWidth)
      }
    }

    // 立即设置拖动状态
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [width, onWidthChange])

  // 确保组件卸载时恢复文本选择
  useEffect(() => {
    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [])



  if (files.length === 0) {
    return (
      <div className="relative h-full macos-sidebar border-r border-border flex">
        <div className="flex-1 flex flex-col" style={{ width: `${width}px` }}>
          {/* 搜索栏区域 - 融入目录栏设计 */}
          <div className="px-3 py-3 border-b border-r border-border/50 bg-background/40 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <Input
                  placeholder={t('ui.placeholders.searchFiles')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-7 text-xs bg-background/60 border-border/40 focus:border-primary/40 focus:bg-background/80 rounded-md transition-all shadow-sm"
                />
              </div>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="h-7 w-7 p-0 macos-button flex-shrink-0 rounded-md"
                  title={t('ui.buttons.refreshFiles')}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>
          <div className="p-3">
            <p className="text-xs text-muted-foreground text-center py-6 macos-text">
              {t('ui.messages.noMarkdownFiles')}
            </p>
          </div>
        </div>
        {/* Resize handle */}
        {onWidthChange && (
          <div
            className="resize-handle"
            onMouseDown={handleMouseDown}
            style={{ cursor: 'col-resize' }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="relative h-full macos-sidebar border-r border-border flex">
      <div className="flex-1 flex flex-col" style={{ width: `${width}px` }}>
        {/* 搜索栏区域 - 融入目录栏设计 */}
        <div className="px-3 py-3 border-b border-r border-border/50 flex-shrink-0 bg-background/40 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              <Input
                placeholder={t('ui.placeholders.searchFiles')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-7 text-xs bg-background/60 border-border/40 focus:border-primary/40 focus:bg-background/80 rounded-md transition-all shadow-sm"
              />
            </div>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="h-7 w-7 p-0 macos-button flex-shrink-0 rounded-md"
                title={t('ui.buttons.refreshFiles')}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          <div className="p-2 space-y-1">
            {filteredTree.length > 0 ? (
              filteredTree.map((node) => (
                <TreeNodeComponent
                  key={node.path}
                  node={node}
                  currentFile={currentFile}
                  onFileSelect={onFileSelect}
                />
              ))
            ) : searchTerm ? (
              <div className="text-xs text-muted-foreground text-center py-6 macos-text">
                {t('ui.messages.noMatchingFiles')}
              </div>
            ) : (
              tree.map((node) => (
                <TreeNodeComponent
                  key={node.path}
                  node={node}
                  currentFile={currentFile}
                  onFileSelect={onFileSelect}
                />
              ))
            )}
          </div>
        </div>
      </div>
      {/* Resize handle */}
      {onWidthChange && (
        <div
          className="resize-handle"
          onMouseDown={handleMouseDown}
          style={{ cursor: 'col-resize' }}
        />
      )}
    </div>
  )
}