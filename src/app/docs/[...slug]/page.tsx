import { notFound } from 'next/navigation'
import DocumentViewer from '@/components/DocumentViewer'
import { getAllDocs, getDocContent } from '@/lib/docs-server'

interface DocPageProps {
  params: Promise<{ slug: string[] }>
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params
  
  // Join slug segments for nested paths
  const rawSlug = slug.join('/')
  
  // Handle both URL formats: with and without .md extension
  let actualSlug = decodeURIComponent(rawSlug)
  let content = getDocContent(actualSlug)
  
  // If not found and doesn't end with .md, try adding .md
  if (!content && !actualSlug.endsWith('.md')) {
    const slugWithExtension = actualSlug + '.md'
    content = getDocContent(slugWithExtension)
    if (content) {
      actualSlug = slugWithExtension
    }
  }
  
  // If still not found and ends with .md, try removing .md
  if (!content && actualSlug.endsWith('.md')) {
    const slugWithoutExtension = actualSlug.replace(/\.md$/, '')
    content = getDocContent(slugWithoutExtension)
    if (content) {
      actualSlug = slugWithoutExtension
    }
  }

  if (!content) {
    notFound()
  }

  return (
    <DocumentViewer 
      content={content} 
      className="w-full"
    />
  )
}

export async function generateStaticParams() {
  const docStructure = getAllDocs()
  
  const allDocs = docStructure.categories.flatMap(category => [
    // 分类下直接的文档
    ...category.docs.map((doc) => ({
      slug: doc.slug.split('/'),
    })),
    // 子分类中的文档
    ...(category.subcategories || []).flatMap(subcategory =>
      subcategory.docs.map((doc) => ({
        slug: doc.slug.split('/'),
      }))
    )
  ])
  
  return allDocs
}