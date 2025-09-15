import fs from 'fs'
import path from 'path'
import { DocMeta, DocStructure, DocCategory, DocSubcategory } from './docs'

const DOCS_BASE_PATH = path.join(process.cwd(), 'public', 'docs')

export function getAllDocs(): DocStructure {
  if (!fs.existsSync(DOCS_BASE_PATH)) {
    return { title: 'BSC 文档中心', categories: [] }
  }

  const categories: DocCategory[] = []
  const categoryDirs = fs.readdirSync(DOCS_BASE_PATH, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  categoryDirs.forEach(categoryDir => {
    const categoryPath = path.join(DOCS_BASE_PATH, categoryDir)
    const docs: DocMeta[] = []
    const subcategories: DocSubcategory[] = []
    
    try {
      const items = fs.readdirSync(categoryPath, { withFileTypes: true })
      
      // 处理直接在分类下的文档
      items.forEach(item => {
        if (item.isFile() && item.name.endsWith('.md')) {
          const filePath = path.join(categoryPath, item.name)
          const filename = item.name.replace('.md', '')
          const slug = `${categoryDir}/${filename}`
          
          let title = filename
          try {
            const content = fs.readFileSync(filePath, 'utf8')
            const titleMatch = content.match(/^#\s+(.+)$/m)
            if (titleMatch) {
              title = titleMatch[1]
            }
          } catch (error) {
            console.warn(`Error reading file ${item.name}:`, error)
          }

          docs.push({
            slug,
            title,
            path: item.name,
            category: categoryDir
          })
        }
        
        // 处理子文件夹
        else if (item.isDirectory()) {
          const subcategoryPath = path.join(categoryPath, item.name)
          const subcategoryDocs: DocMeta[] = []
          
          try {
            const subFiles = fs.readdirSync(subcategoryPath)
            
            subFiles.forEach(subFile => {
              if (subFile.endsWith('.md')) {
                const subFilePath = path.join(subcategoryPath, subFile)
                const subFilename = subFile.replace('.md', '')
                const subSlug = `${categoryDir}/${item.name}/${subFilename}`
                
                let subTitle = subFilename
                try {
                  const subContent = fs.readFileSync(subFilePath, 'utf8')
                  const subTitleMatch = subContent.match(/^#\s+(.+)$/m)
                  if (subTitleMatch) {
                    subTitle = subTitleMatch[1]
                  }
                } catch (error) {
                  console.warn(`Error reading sub file ${subFile}:`, error)
                }

                subcategoryDocs.push({
                  slug: subSlug,
                  title: subTitle,
                  path: subFile,
                  category: categoryDir,
                  subcategory: item.name
                })
              }
            })

            if (subcategoryDocs.length > 0) {
              // 按文件名排序
              subcategoryDocs.sort((a, b) => a.path.localeCompare(b.path, 'zh'))
              
              subcategories.push({
                name: getSubcategoryDisplayName(item.name),
                slug: item.name,
                description: getSubcategoryDescription(item.name),
                docs: subcategoryDocs
              })
            }
          } catch (error) {
            console.warn(`Error reading subcategory ${item.name}:`, error)
          }
        }
      })

      // 按文件名排序
      docs.sort((a, b) => a.path.localeCompare(b.path, 'zh'))
      subcategories.sort((a, b) => a.name.localeCompare(b.name, 'zh'))

      // 生成分类信息
      const categoryName = getCategoryDisplayName(categoryDir)
      const categoryDescription = getCategoryDescription(categoryDir)

      categories.push({
        name: categoryName,
        slug: categoryDir,
        description: categoryDescription,
        docs,
        subcategories: subcategories.length > 0 ? subcategories : undefined
      })
    } catch (error) {
      console.warn(`Error reading category ${categoryDir}:`, error)
    }
  })

  // 按分类名排序
  categories.sort((a, b) => a.name.localeCompare(b.name, 'zh'))

  return {
    title: 'BSC 文档中心',
    categories
  }
}

function getCategoryDisplayName(categorySlug: string): string {
  const categoryNames: { [key: string]: string } = {
    'bsc-geth-learn': 'BSC Geth 学习文档',
    'bsc-contract': 'BSC 系统合约',
    // 'api-docs': 'API 文档',
    // 'examples': '示例代码',
    // 'guides': '操作指南'
  }
  return categoryNames[categorySlug] || categorySlug
}

function getCategoryDescription(categorySlug: string): string {
  const categoryDescriptions: { [key: string]: string } = {
    'bsc-geth-learn': 'BNB Smart Chain (BSC) 代码库深度分析文档',
    'bsc-contract': 'BSC 系统合约深度分析与部署指南',
    'tutorials': '详细的教程和学习资源',
    'api-docs': 'API 接口文档和参考',
    'examples': '代码示例和最佳实践',
    'guides': '操作指南和常见问题解答'
  }
  return categoryDescriptions[categorySlug] || ''
}

function getSubcategoryDisplayName(subcategorySlug: string): string {
  const subcategoryNames: { [key: string]: string } = {
    // 'learn': '🎓 学习文档',
    // 'deployment': '🚀 部署指南',
    // 'architecture': '🏗️ 架构设计',
    // 'contracts': '📝 合约详解',
    // 'guides': '📖 操作指南',
    // 'examples': '💡 代码示例'
  }
  return subcategoryNames[subcategorySlug] || subcategorySlug
}

function getSubcategoryDescription(subcategorySlug: string): string {
  const subcategoryDescriptions: { [key: string]: string } = {
    'learn': '系统合约的原理、架构和核心机制解析',
    'deployment': '系统合约的部署流程、配置和运维指南',
    'architecture': '技术架构图表和设计文档',
    'contracts': '各个合约的详细代码分析',
    'guides': '实用的操作和配置指导',
    'examples': '实际的代码示例和用法演示'
  }
  return subcategoryDescriptions[subcategorySlug] || ''
}

export function getDocContent(slug: string): string | null {
  // Parse category and filename from slug
  let categoryDir = ''
  let filename = ''
  
  if (slug.includes('/')) {
    const parts = slug.split('/')
    categoryDir = parts[0]
    filename = parts.slice(1).join('/')
  } else {
    // Legacy support: assume bsc-geth-learn category
    categoryDir = 'bsc-geth-learn'
    filename = slug
  }
  
  let filePath = path.join(DOCS_BASE_PATH, categoryDir, `${filename}.md`)
  
  // If file doesn't exist, try URL decoding (backward compatibility)
  if (!fs.existsSync(filePath)) {
    const decodedFilename = decodeURIComponent(filename)
    filePath = path.join(DOCS_BASE_PATH, categoryDir, `${decodedFilename}.md`)
  }
  
  if (!fs.existsSync(filePath)) {
    return null
  }

  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    console.error(`Error reading doc ${slug}:`, error)
    return null
  }
}