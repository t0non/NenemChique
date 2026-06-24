import { ReactNode } from 'react'
import { PRODUCTS } from '@/lib/data'

export const dynamicParams = false

export async function generateStaticParams() {
  // Em build estático tentamos incluir também IDs do Supabase para evitar 404 no hosting estático
  const params: { id: string }[] = []
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase.from('products').select('id').limit(500)
    if (!error && Array.isArray(data)) {
      data.forEach((row: any) => {
        if (row && row.id) params.push({ id: String(row.id) })
      })
    }
  } catch {
    // Ignora e cai no fallback local abaixo
  }
  if (params.length === 0) {
    PRODUCTS.forEach(p => params.push({ id: String(p.id) }))
  } else {
    // Garante também os produtos locais (caso o Supabase não tenha todos)
    PRODUCTS.forEach(p => {
      const id = String(p.id)
      if (!params.find(x => x.id === id)) params.push({ id })
    })
  }
  return params
}

export default function ProductLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
