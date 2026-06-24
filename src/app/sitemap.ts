import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nenemchique.com.br'

  // Fetch products from Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  let products: any[] = []
  
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data } = await supabase.from('products').select('id, updated_at, category').eq('active', true)
    if (data) {
      products = data
    }
  }

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productUrls,
  ]
}
