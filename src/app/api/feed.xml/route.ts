import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-static';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return new NextResponse('Supabase config missing', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Fetch active products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true);

  if (error || !products) {
    return new NextResponse('Error fetching products', { status: 500 });
  }

  const baseUrl = 'https://nenemchique.com.br';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Neném Chique</title>
    <link>${baseUrl}</link>
    <description>Roupas de Bebê Hipoalergênicas e Enxovais</description>
`;

  for (const product of products) {
    // Generate description
    const description = product.description 
      ? product.description.replace(/<[^>]+>/g, '').substring(0, 500) 
      : `Compre ${product.name} na Neném Chique. Qualidade premium para bebês.`;

    const imageUrl = product.images?.[0] || `${baseUrl}/imagens/logo.png`;
    const price = typeof product.price === 'number' ? product.price.toFixed(2) : '0.00';
    const salePrice = product.promoPrice && typeof product.promoPrice === 'number' 
      ? product.promoPrice.toFixed(2) 
      : price;

    xml += `
    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${baseUrl}/product/${product.id}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${price} BRL</g:price>
      ${product.promoPrice ? `<g:sale_price>${salePrice} BRL</g:sale_price>` : ''}
      <g:brand>Neném Chique</g:brand>
      <g:google_product_category>Clothing &amp; Accessories &gt; Clothing &gt; Baby &amp; Toddler Clothing</g:google_product_category>
    </item>`;
  }

  xml += `
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  });
}
