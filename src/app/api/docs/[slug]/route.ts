import { NextResponse } from 'next/server'
import { getDocContent } from '@/lib/docs-server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const content = getDocContent(slug)
  
  if (!content) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  return NextResponse.json({ content })
}