export interface DocMeta {
  slug: string
  title: string
  path: string
  category?: string
  subcategory?: string
}

export interface DocSubcategory {
  name: string
  slug: string
  description?: string
  docs: DocMeta[]
}

export interface DocCategory {
  name: string
  slug: string
  description?: string
  docs: DocMeta[]
  subcategories?: DocSubcategory[]
}

export interface DocStructure {
  title: string
  categories: DocCategory[]
}