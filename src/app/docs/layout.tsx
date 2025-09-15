import { getAllDocs } from '@/lib/docs-server'
import ClientLayout from '@/components/ClientLayout'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const docStructure = getAllDocs()

  return <ClientLayout docStructure={docStructure}>{children}</ClientLayout>
}