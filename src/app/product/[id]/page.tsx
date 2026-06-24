import { Metadata } from 'next';
import ProductClient from '@/components/product-client';
import { createClient } from '@supabase/supabase-js';

// We need to provide all possible paths at build time for next export
export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseAnonKey) return [];

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: products } = await supabase.from('products').select('id');
  
  if (!products) return [];

  return products.map((product) => ({
    id: String(product.id),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  let title = 'Produto | Neném Chique';
  let description = 'Roupas de bebê hipoalergênicas e confortáveis.';
  let images = ['/imagens/logo.png'];

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    // Extract real ID if slug is present (e.g., slug-id)
    const segments = String(id).split('-');
    // Tenta pegar o último segmento que pode ser o ID real do Supabase
    // Caso contrário, usa a string inteira como ID.
    let realId = String(id);
    if (segments.length > 1) {
      // Se for um UUID (tem hifens), o array.length não reflete uma separação simples.
      // Neste projeto, como os slugs serão montados posteriormente e os IDs são string, usamos o ID completo.
    }

    const { data: product } = await supabase
      .from('products')
      .select('name, description, images')
      .eq('id', realId)
      .single();

    if (product) {
      title = `${product.name} | Neném Chique`;
      // Removemos HTML tags se houver na descrição para SEO limpo
      description = product.description 
        ? product.description.substring(0, 160).replace(/<[^>]+>/g, '') 
        : `Compre ${product.name} na Neném Chique. Qualidade e conforto garantidos.`;
      
      if (product.images && product.images.length > 0) {
        images = [product.images[0]];
      }
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    }
  };
}

export default function ProductPage() {
  return <ProductClient />;
}
