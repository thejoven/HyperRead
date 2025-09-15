'use client'

import { useState, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FileText, Folder, FolderOpen, ChevronRight, ChevronDown, Search } from 'lucide-react'

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
}

interface TreeNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: TreeNode[]
  file?: FileInfo
}

function filterTree(tree: TreeNode[], searchTerm: string): TreeNode[] {
  if (!searchTerm.trim()) return tree
  
  const filtered: TreeNode[] = []
  
  for (const node of tree) {
    if (node.type === 'file') {
      if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        filtered.push(node)
      }
    } else if (node.type === 'directory' && node.children) {
      const filteredChildren = filterTree(node.children, searchTerm)
      if (filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren
        })
      }
    }
  }
  
  return filtered
}

function buildTree(files: FileInfo[]): TreeNode[] {
  const tree: TreeNode[] = []
  const nodeMap = new Map<string, TreeNode>()

  // 创建根节点
  nodeMap.set('.', {
    name: '.',
    path: '.',
    type: 'directory',
    children: []
  })

  // 处理所有文件
  files.forEach(file => {
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
  })

  // 排序并返回根目录的子节点
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
    nodes.forEach(node => {
      if (node.children) {
        sortNodes(node.children)
      }
    })
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
              <FolderOpen className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            ) : (
              <Folder className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400" />
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

export default function FileList({ files, rootPath, currentFile, onFileSelect }: FileListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const tree = useMemo(() => buildTree(files), [files])
  const filteredTree = useMemo(() => filterTree(tree, searchTerm), [tree, searchTerm])

  if (files.length === 0) {
    return (
      <div className="w-72 min-w-72 h-full macos-sidebar border-r border-border">
        <div className="px-2 py-2 border-b border-border/50 bg-background/80">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="搜索文件名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-6 text-xs bg-background/50 border-border/30 focus:border-border/60"
            />
          </div>
        </div>
        <div className="p-3">
          <p className="text-xs text-muted-foreground text-center py-6 macos-text">
            没有找到 Markdown 文件
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-72 min-w-72 h-full macos-sidebar flex flex-col">
      <div className="px-2 py-2 border-b border-border/50 flex-shrink-0 bg-background/80">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="搜索文件名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-6 text-xs bg-background/50 border-border/30 focus:border-border/60"
          />
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
              未找到匹配的文件
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
  )
}