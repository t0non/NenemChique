 "use client"
 
 import Image from 'next/image'
 import Link from 'next/link'
 import { useEffect, useMemo, useState } from 'react'
 import { useParams, useRouter } from 'next/navigation'
import { useData } from '@/context/data-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/components/product-card'
import { WhatsAppIcon } from "@/components/whatsapp-icon"
import { buildWhatsAppUrl } from "@/lib/whatsapp"
import { Star, Truck, ShieldCheck, Clock, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { pushGTMEvent } from '@/lib/gtm'
import { Product } from '@/lib/types'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { products } = useData()
  const { settings } = useData()
  const showInstallments = settings.showInstallments ?? true
  const installmentCount = settings.installmentCount ?? 12
  const cashDiscountPct = settings.cashDiscountPercent ?? 5
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [reviews, setReviews] = useState<{ name: string; rating: number; comment: string; createdAt: string }[]>([])
  const [reviewsShown, setReviewsShown] = useState(10)

  // Fallback: busca direta no Supabase para produtos novos que não estão no contexto/cache
  const [fallbackProduct, setFallbackProduct] = useState<Product | null>(null)
  const [fallbackLoading, setFallbackLoading] = useState(false)
  const [fallbackAttempted, setFallbackAttempted] = useState(false)
 
   const contextProduct = useMemo(() => {
     const id = String(params?.id || '')
     return products.find(p => String(p.id) === id)
   }, [params, products])

  const product = contextProduct || fallbackProduct

  // Se não encontrou no contexto, busca direto no Supabase
  useEffect(() => {
    const id = String(params?.id || '')
    if (!id || contextProduct || fallbackAttempted) return

    setFallbackLoading(true)
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()

        if (!error && data) {
          const mapped: Product = {
            id: data.id,
            name: data.name,
            description: data.description,
            price: Number(data.price),
            category: data.category,
            images: data.images || [],
            isUpsell: data.is_upsell || false,
            isBestSeller: data.is_best_seller || false,
            bestSellerRank: data.best_seller_rank != null ? Number(data.best_seller_rank) : undefined,
            promoPrice: data.promo_price ? Number(data.promo_price) : undefined,
            sizes: data.sizes || [],
            gender: data.gender || 'unisex',
            colors: data.colors || [],
            createdAt: data.created_at || undefined,
          }
          setFallbackProduct(mapped)
        }
      } catch {}
      setFallbackLoading(false)
      setFallbackAttempted(true)
    })()
  }, [params?.id, contextProduct, fallbackAttempted])

  // Quando o contexto atualiza e encontra o produto, limpa o fallback
  useEffect(() => {
    if (contextProduct && fallbackProduct) {
      setFallbackProduct(null)
    }
  }, [contextProduct, fallbackProduct])
 
  const { reviewsByProduct, addProductReview } = useData()
  useEffect(() => {
    if (product && product.images && product.images.length > 0) setSelectedImage(product.images[0])
    if (product) {
      const list = reviewsByProduct[String(product.id)] || []
      setReviews(list as any)
      ;(async () => {
        try {
          const { data } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', product.id)
            .order('created_at', { ascending: false })
          if (data && Array.isArray(data)) {
            const fresh = data.map((r: any) => ({
              name: r.name,
              rating: Number(r.rating),
              comment: r.comment,
              createdAt: r.created_at,
            }))
            setReviews(fresh)
          } else {
            try {
              const raw = localStorage.getItem('nenem_backup_reviews')
              if (raw) {
                const store = JSON.parse(raw)
                const list = store[String(product.id)] || []
                if (Array.isArray(list) && list.length > 0) setReviews(list)
              }
            } catch {}
          }
        } catch {}
      })()
    }
  }, [product, reviewsByProduct])
  
  useEffect(() => {}, [])
 
   if (fallbackLoading || (!product && !fallbackAttempted && products.length === 0)) {
     return (
       <div className="py-16 bg-background min-h-[60vh] flex items-center justify-center">
         <div className="flex flex-col items-center gap-3 text-muted-foreground">
           <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
           <p className="text-sm">Carregando produto...</p>
         </div>
       </div>
     )
   }

   if (!product) {
     return (
       <div className="py-16 bg-background min-h-[60vh] flex items-center justify-center">
         <div className="flex flex-col items-center gap-3 text-muted-foreground">
           <p className="text-sm">Produto não encontrado</p>
           <Button asChild className="rounded-full">
             <Link href="/catalog" prefetch={false}>Voltar ao catálogo</Link>
           </Button>
         </div>
       </div>
     )
   }
 
   const readLocalSizePricing = () => {
     try {
       const raw = typeof window !== 'undefined' ? localStorage.getItem('nenem_size_pricing') : null
       const store = raw ? JSON.parse(raw) : {}
       return store[product.id] || store[product.name] || null
     } catch {
       return null
     }
   }
 
   const getEffectivePrice = (size: string | null) => {
     if (product.category === 'conjuntos-fleece' && size) {
       if (['4', '6', '8'].includes(size)) return { price: 109.9, promo: 78.0 }
       if (['1', '2', '3'].includes(size)) return { price: 99.0, promo: 68.0 }
     }
     const map = product.sizePricing || readLocalSizePricing()
     if (size && map) {
       const entry = map[size]
       if (entry && typeof entry.price === 'number') return { price: entry.price, promo: entry.promo }
     }
     return { price: product.price, promo: product.promoPrice }
   }
 
   const effective = getEffectivePrice(selectedSize)
   const baseShown = (effective.promo ?? effective.price)
   const installmentPrice = (baseShown / installmentCount).toFixed(2).replace('.', ',')
   const cashPrice = (baseShown * (1 - cashDiscountPct / 100)).toFixed(2).replace('.', ',')
 
  const mainImage = selectedImage ?? (product?.images?.[0] ?? null)

   const finalizeAdd = () => {
     const withVariant = {
       ...product,
       name: [product.name, selectedColor || undefined, selectedSize || undefined].filter(Boolean).join(' · ')
     }
     addToCart(withVariant, qty)
     router.push('/catalog')
   }
 
   const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
  const generateConversionDescription = () => {
    const base = product.name
    const cat = product.category
    const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0
    const hasColors = Array.isArray(product.colors) && product.colors.length > 0
    const sizes = hasSizes ? `Tamanhos disponíveis: ${product.sizes!.join(', ')}.` : ''
    const colors = hasColors ? `Cores: ${product.colors!.join(', ')}.` : ''
    if (cat === 'saida-maternidade') {
      return `A Saída de Maternidade não é só uma roupa — é a peça que vai estar em cada foto do momento mais especial da sua vida. Nosso kit ${base} foi desenvolvido para que seu bebê chegue ao mundo com o aconchego e a delicadeza que ele merece. Tecido 100% hipoalergênico, aprovado para a pele mais sensível. Toque macio que não irrita. Modelagem pensada para facilitar a troca e os cuidados de enfermagem. Acabamento impecável para fotos inesquecíveis. ${sizes} ${colors}`
    }
    if (cat === 'bodies') {
      return `Todo mundo quer o melhor para o bebê, mas encontrar um body que seja macio, durável e fácil de vestir é mais difícil do que parece. O ${base} resolve isso de uma vez: tecido respirável ideal para dias quentes e noites frias, abertura que facilita a troca sem despertar o bebê, não encolhe depois da lavagem e combina com qualquer macacão do enxoval. ${sizes} ${colors}`
    }
    if (cat === 'macacoes') {
      return `${base}: aconchego do pescoço aos pezinhos. Modelagem que garante movimentos livres e noites tranquilas — sem apertar, sem desconforto. Tecido macio e respirável, perfeito para o dia a dia e para fotos especiais. Combina facilmente com mantas e acessórios do enxoval. ${sizes} ${colors}`
    }
    if (cat === 'kits-higiene') {
      return `${base}: organização e praticidade para a rotina do bebê. Kit completo com peças que se complementam, do banho ao cuidado diário. Presente útil, elegante e que toda mãe vai adorar receber — porque organização faz toda a diferença nos primeiros meses. ${colors}`
    }
    if (cat === 'kits') {
      return `O presente que toda grávida quer receber — e que nenhuma vai encontrar no mesmo lugar. O ${base} já vem com tudo selecionado por quem entende: peças que combinam entre si, embalagem presenteável e curadoria de uma especialista em enxoval premium. Quer personalizar? Nossa equipe monta um kit na cor e no estilo que a mamãe prefere. ${sizes} ${colors}`
    }
    if (cat === 'conjuntos-fleece') {
      return `${base}: maciez e aquecimento para dias frios. Tecido aconchegante que abraça sem pesar, perfeito para passeios e fotos. Está em dúvida sobre o tamanho certo? Nossa consultora te ajuda pelo WhatsApp — é só mandar a idade e o peso do bebê. ${sizes} ${colors}`
    }
    return `${base}: qualidade, conforto e estilo pensados para o bebê. Peça versátil que combina com o enxoval e acompanha diferentes fases. Está em dúvida sobre tamanho ou cor? Fale com nossa equipe — respondemos em até 5 minutos. ${sizes} ${colors}`
  }
  const conversionText = generateConversionDescription()
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0
 
  const whatsAppBuyUrl = buildWhatsAppUrl({
    productName: product.name,
    size: selectedSize,
    color: selectedColor,
    price: baseShown.toFixed(2).replace('.', ','),
    mode: 'buy',
  })
  const whatsAppDoubtUrl = buildWhatsAppUrl({
    productName: product.name,
    mode: 'doubt',
  })

  // Schema JSON-LD Product para rich snippets no Google
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: conversionText,
    brand: { '@type': 'Brand', name: 'Neném Chique' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: baseShown.toFixed(2),
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Neném Chique' },
    },
    ...(reviews.length > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
      }
    } : {}),
  }

  const categoryLabel: Record<string, string> = {
    'saida-maternidade': 'Saída de Maternidade',
    'bodies': 'Bodies',
    'macacoes': 'Macacões',
    'kits-higiene': 'Kits de Higiene',
    'kits': 'Kits Enxoval',
    'conjuntos-fleece': 'Conjuntos Fleece',
    'sapatinhos': 'Sapatinhos',
  }

  return (
     <div className="py-6 bg-background">
       {/* JSON-LD Schema Product */}
       <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
       />
       <div className="container-standard">
         {/* Breadcrumb */}
         <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
           <Link href="/" className="hover:text-primary transition-colors">Início</Link>
           <ChevronRight className="w-3 h-3" />
           <Link href={`/catalog?category=${product.category}`} className="hover:text-primary transition-colors">
             {categoryLabel[product.category] || 'Catálogo'}
           </Link>
           <ChevronRight className="w-3 h-3" />
           <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
         </nav>

         <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-row items-start gap-4 sticky top-8 h-max">
            <div className="flex flex-col gap-2 w-16 shrink-0">
               {(product.images || []).map((img) => (
                 <button
                   key={img}
                   onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-20 rounded-xl overflow-hidden border ${mainImage === img ? 'border-primary' : 'border-muted'} bg-white`}
                 >
                  <Image src={img} alt={`Foto de ${product.name} — Neném Chique`} fill className="object-cover" loading="lazy" />
                 </button>
               ))}
             </div>
            <div className="flex-1 min-w-0">
              {mainImage && (
                <Image
                  src={mainImage}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-auto rounded-xl border bg-white shadow-sm"
                  quality={80}
                  priority
                />
              )}
            </div>
           </div>
 
           <div className="space-y-4">
             <div className="flex items-center gap-2">
               <Badge className="bg-primary/10 text-primary border-none px-3 py-1">Disponível</Badge>
             </div>
             <h1 className="text-2xl md:text-3xl font-light">{product.name}</h1>
             <div className="space-y-1">
               {effective.promo ? (
                 <div>
                   <p className="text-2xl font-black text-secondary">R$ {effective.promo.toFixed(2).replace('.', ',')}</p>
                   <p className="text-sm text-muted-foreground line-through">R$ {effective.price.toFixed(2).replace('.', ',')}</p>
                 </div>
               ) : (
                 <p className="text-2xl font-bold text-foreground">R$ {effective.price.toFixed(2).replace('.', ',')}</p>
               )}
               {showInstallments && (
                 <p className="text-sm text-muted-foreground">
                   <span className="font-bold text-foreground">R$ {cashPrice}</span> à vista • {installmentCount}x de <span className="font-bold">R$ {installmentPrice}</span>
                 </p>
               )}
             </div>
 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                 <div className="space-y-1">
                   <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Tamanho</div>
                   <Select value={selectedSize ?? ''} onValueChange={(v) => setSelectedSize(v)}>
                     <SelectTrigger className="rounded-xl h-11 border border-primary/30 bg-white text-foreground focus-visible:ring-2 focus-visible:ring-primary/40">
                       <SelectValue placeholder="Selecione" />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl border border-primary/20 bg-white text-foreground shadow-lg z-[1600]">
                       {product.sizes!.map((s) => (
                         <SelectItem key={s} value={s}>{s}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               )}
               {Array.isArray(product.colors) && product.colors.length > 0 && (
                 <div className="space-y-1">
                   <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Cor</div>
                   <Select value={selectedColor ?? ''} onValueChange={(v) => setSelectedColor(v)}>
                     <SelectTrigger className="rounded-xl h-11 border border-primary/30 bg-white text-foreground focus-visible:ring-2 focus-visible:ring-primary/40">
                       <SelectValue placeholder="Selecione" />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl border border-primary/20 bg-white text-foreground shadow-lg z-[1600]">
                       {product.colors!.map((c) => (
                         <SelectItem key={c} value={c}>{c}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               )}
             </div>
 
             {/* CTA Principal — WhatsApp */}
             <div className="space-y-3">
               <a
                 href={whatsAppBuyUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 onClick={() => pushGTMEvent('click_whatsapp', { product_name: product.name, product_id: product.id, price: baseShown })}
                 className="flex items-center justify-center gap-3 w-full h-14 rounded-full font-bold bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/30 transition-all duration-200 track-btn-whatsapp" data-gtm="whatsapp"
               >
                 <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
                 Quero Comprar pelo WhatsApp
               </a>
               <p className="text-center text-xs text-muted-foreground">
                 💬 Respondemos em até <strong>5 minutos</strong> · Entregamos para todo o Brasil
               </p>
               <a
                 href={whatsAppDoubtUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 onClick={() => pushGTMEvent('click_whatsapp_doubt', { product_name: product.name, product_id: product.id })}
                 className="flex items-center justify-center gap-2 w-full h-10 rounded-full font-medium border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px] uppercase tracking-widest transition-colors track-btn-whatsapp" data-gtm="whatsapp"
               >
                 <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600 shrink-0" />
                 Tirar uma dúvida antes
               </a>
             </div>

             {/* Bloco de Confiança / Urgência */}
             <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-primary/10">
               <div className="flex flex-col items-center gap-1 text-center">
                 <Truck className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">Frete Grátis</span>
                 <span className="text-[9px] text-muted-foreground">acima de R$ 299</span>
               </div>
               <div className="flex flex-col items-center gap-1 text-center">
                 <ShieldCheck className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">Troca Garantida</span>
                 <span className="text-[9px] text-muted-foreground">em até 30 dias</span>
               </div>
               <div className="flex flex-col items-center gap-1 text-center">
                 <Clock className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">Consultoria</span>
                 <span className="text-[9px] text-muted-foreground">100% gratuita</span>
               </div>
             </div>
 
            <Tabs defaultValue="descricao" className="mt-6">
               <TabsList className="bg-white p-1 rounded-xl border">
                 <TabsTrigger value="descricao" className="rounded-lg">Descrição Geral</TabsTrigger>
                 <TabsTrigger value="itens" className="rounded-lg">Itens Inclusos</TabsTrigger>
               </TabsList>
               <TabsContent value="descricao" className="bg-white rounded-2xl border p-4 mt-2 text-sm text-muted-foreground leading-relaxed">
                 <p className="mb-2">{conversionText}</p>
                 <p>{product.description || ''}</p>
               </TabsContent>
               <TabsContent value="itens" className="bg-white rounded-2xl border p-4 mt-2 text-sm text-muted-foreground leading-relaxed">
                 Conteúdo do kit conforme variação selecionada.
               </TabsContent>
             </Tabs>
            
            <div className="bg-white rounded-2xl border p-4 mt-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const active = reviews.length === 0 ? true : i < Math.round(avgRating);
                    return (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${active ? 'text-yellow-500' : 'text-muted-foreground'}`}
                        fill={active ? 'currentColor' : 'none'}
                      />
                    );
                  })}
                </div>
                <span className="text-xs">{reviews.length > 0 ? `${avgRating.toFixed(1)} de 5 (${reviews.length} avaliações)` : 'Seja o primeiro a avaliar'}</span>
              </div>
              <div className="space-y-3">
                {reviews.slice(0, reviewsShown).map((r, idx) => (
                  <div key={idx} className="flex items-start gap-3 border-t pt-3 first:pt-0 first:border-t-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                      {r.name.substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{r.name}</span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const active = i < r.rating;
                            return (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${active ? 'text-yellow-500' : 'text-muted-foreground'}`}
                                fill={active ? 'currentColor' : 'none'}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="inline-block bg-muted/30 rounded-2xl px-3 py-2 mt-1">
                        <p className="text-sm text-foreground leading-relaxed">{r.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {reviewsShown < reviews.length && (
                <div className="pt-3">
                  <Button className="rounded-full h-9 px-5 text-xs font-bold" onClick={() => setReviewsShown(s => Math.min(s + 10, reviews.length))}>
                    Ver mais 10
                  </Button>
                </div>
              )}
            </div>
           </div>
         </div>
 

         {related.length > 0 && (
           <div className="mt-10">
             <h2 className="text-xl md:text-2xl font-light mb-3">Produtos relacionados</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {related.map(p => <ProductCard key={p.id} product={p} />)}
             </div>
           </div>
         )}
       </div>
     </div>
   )
 }
