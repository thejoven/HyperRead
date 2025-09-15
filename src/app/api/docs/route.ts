import { NextResponse } from 'next/server'
import { getAllDocs } from '@/lib/docs-server'

export async function GET() {
  const docStructure = getAllDocs()
  return NextResponse.json(docStructure)
}