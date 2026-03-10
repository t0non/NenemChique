 "use client"
 
 import Image from 'next/image'
 import Link from 'next/link'
 import { useEffect, useMemo, useState } from 'react'
 import { useParams, useRouter } from 'next/navigation'
import { useData } from '@/context/data-context'
 import { useCart } from '@/context/cart-context'
 import { Button } from '@/components/ui/button'
 import { Badge } from '@/components/ui/badge'
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
 import { ProductCard } from '@/components/product-card'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
 
 export default function ProductDetailPage() {
   const params = useParams()
   const router = useRouter()
   const { products } = useData()
   const { addToCart } = useCart()
   const [selectedImage, setSelectedImage] = useState<string | null>(null)
   const [selectedColor, setSelectedColor] = useState<string | null>(null)
   const [selectedSize, setSelectedSize] = useState<string | null>(null)
   const [qty, setQty] = useState(1)
  const [reviews, setReviews] = useState<{ name: string; rating: number; comment: string; createdAt: string }[]>([])
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [showAllCompactReviews, setShowAllCompactReviews] = useState(false)
  const [isLogged, setIsLogged] = useState(false)
  const [currentUserName, setCurrentUserName] = useState('')
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
 
   const product = useMemo(() => {
     const id = String(params?.id || '')
     return products.find(p => String(p.id) === id)
   }, [params, products])
 
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
  
  useEffect(() => {
    const logged = typeof window !== 'undefined' && localStorage.getItem('nenem_is_logged') === 'true'
    const name = typeof window !== 'undefined' ? (localStorage.getItem('nenem_user_name') || '') : ''
    setIsLogged(!!logged)
    setCurrentUserName(name)
    if (logged && !reviewName) setReviewName(name)
  }, [])
 
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
   const installmentPrice = (baseShown / 12).toFixed(2).replace('.', ',')
   const cashPrice = (baseShown * 0.95).toFixed(2).replace('.', ',')
 
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
      return `${base}: conforto e delicadeza para o primeiro dia. Toque macio e hipoalergênico, ideal para fotos e momentos especiais. Ajuste pensado para o bebê e praticidade para os pais. ${sizes} ${colors}`
    }
    if (cat === 'bodies') {
      return `${base}: essencial para o dia a dia com tecido macio e respirável. Facilita a troca, não irrita a pele e acompanha o crescimento. Combine com macacões e mantas para um enxoval completo. ${sizes} ${colors}`
    }
    if (cat === 'macacoes') {
      return `${base}: aconchego do pescoço aos pezinhos. Modelagem confortável para movimentos livres e noites tranquilas. Perfeito para compor looks com mantas e acessórios. ${sizes} ${colors}`
    }
    if (cat === 'kits-higiene') {
      return `${base}: organização e praticidade para a rotina do bebê. Kit com duas peças por cor para manter tudo no lugar, do banho ao cuidado diário. Presente útil e elegante. ${colors}`
    }
    if (cat === 'kits') {
      return `${base}: monte o enxoval com curadoria pronta. Peças que combinam entre si, otimizam o investimento e garantem looks lindos em qualquer ocasião. ${sizes} ${colors}`
    }
    if (cat === 'conjuntos-fleece') {
      return `${base}: maciez e aquecimento para dias frios. Tecido aconchegante que abraça sem pesar, ideal para passeios e fotos. Escolha o tamanho e garanta o melhor preço. ${sizes} ${colors}`
    }
    return `${base}: qualidade, conforto e estilo pensados para o bebê. Peça versátil que combina com o enxoval e acompanha diferentes fases. ${sizes} ${colors}`
  }
  const conversionText = generateConversionDescription()
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0
  const handleSubmitReview = async () => {
    if (!isLogged) {
      setLoginDialogOpen(true)
      return
    }
    if (!reviewName.trim() || !reviewComment.trim()) return
    const entry = { name: reviewName.trim(), rating: reviewRating, comment: reviewComment.trim(), createdAt: new Date().toISOString() }
    await addProductReview(String(product.id), { productId: String(product.id), name: entry.name, rating: entry.rating, comment: entry.comment })
    setReviewName('')
    setReviewRating(5)
    setReviewComment('')
  }
 
   return (
     <div className="py-8 bg-background">
       <div className="container-standard">
         <div className="grid lg:grid-cols-2 gap-8">
           <div className="flex gap-3">
             <div className="flex flex-col gap-2">
               {(product.images || []).map((img) => (
                 <button
                   key={img}
                   onClick={() => setSelectedImage(img)}
                   className={`relative w-16 h-20 rounded-xl overflow-hidden border ${selectedImage === img ? 'border-primary' : 'border-muted'} bg-white`}
                 >
                   <Image src={img} alt={product.name} fill className="object-cover" />
                 </button>
               ))}
             </div>
             <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-white border border-muted">
               {selectedImage && (
                 <Image src={selectedImage} alt={product.name} fill className="object-contain" />
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
               <p className="text-sm text-muted-foreground">
                 <span className="font-bold text-foreground">R$ {cashPrice}</span> à vista • 12x de <span className="font-bold">R$ {installmentPrice}</span>
               </p>
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
 
             <div className="flex items-center gap-2">
               <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => setQty(q => Math.max(1, q - 1))}>−</Button>
               <span className="min-w-8 text-sm font-bold">{qty}</span>
               <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => setQty(q => Math.min(99, q + 1))}>+</Button>
             </div>
 
             <div className="flex flex-col sm:flex-row gap-2">
               <Button className="rounded-full h-11 px-8 font-bold" onClick={finalizeAdd}>Comprar</Button>
               <Button variant="outline" asChild className="rounded-full h-11 px-8 font-bold">
                 <a href={`https://wa.me/5531999384130?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre: ${product.name}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                   <WhatsAppIcon className="w-4 h-4 fill-emerald-600" />
                   Tirar dúvida pelo Whats
                 </a>
               </Button>
             </div>
 
             <Tabs defaultValue="descricao" className="mt-6">
               <TabsList className="bg-white p-1 rounded-xl border">
                 <TabsTrigger value="descricao" className="rounded-lg">Descrição Geral</TabsTrigger>
                 <TabsTrigger value="itens" className="rounded-lg">Itens Inclusos</TabsTrigger>
                 <TabsTrigger value="avaliacoes" className="rounded-lg">Avaliações</TabsTrigger>
               </TabsList>
               <TabsContent value="descricao" className="bg-white rounded-2xl border p-4 mt-2 text-sm text-muted-foreground leading-relaxed">
                 <p className="mb-2">{conversionText}</p>
                 <p>{product.description || ''}</p>
               </TabsContent>
               <TabsContent value="itens" className="bg-white rounded-2xl border p-4 mt-2 text-sm text-muted-foreground leading-relaxed">
                 Conteúdo do kit conforme variação selecionada.
               </TabsContent>
               <TabsContent value="avaliacoes" className="bg-white rounded-2xl border p-4 mt-2 text-sm text-muted-foreground leading-relaxed">
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
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Seu nome</span>
                    <input className="rounded-xl border h-11 px-3" placeholder="Digite seu nome" value={reviewName} onChange={(e) => setReviewName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Sua avaliação</span>
                    <textarea className="rounded-xl border px-3 py-2 h-24" placeholder="Escreva sua opinião" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Quantas estrelas?</span>
                    <div className="flex items-center gap-2 h-11">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const idx = i + 1;
                        const active = idx <= reviewRating;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setReviewRating(idx)}
                            className="p-0 m-0 bg-transparent border-none cursor-pointer"
                            aria-label={`Marcar ${idx} estrelas`}
                            title={`${idx} estrelas`}
                          >
                            <Star className={`w-5 h-5 ${active ? 'text-yellow-500' : 'text-muted-foreground'}`} fill={active ? 'currentColor' : 'none'} />
                          </button>
                        );
                      })}
                      <span className="text-[11px] text-muted-foreground ml-2">{reviewRating} de 5</span>
                    </div>
                  </div>
                </div>
                 <Button className="rounded-full h-10 px-6" onClick={handleSubmitReview}>Enviar avaliação</Button>
                 <div className="mt-6 space-y-3">
                   {reviews.map((r, idx) => (
                     <div key={idx} className="flex items-start gap-3">
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
               </TabsContent>
             </Tabs>
           </div>
         </div>
 
        <div className="mt-6 bg-white rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
              <span className="text-xs text-muted-foreground">
                {reviews.length > 0 ? `${avgRating.toFixed(1)} de 5 • ${reviews.length} avaliações` : 'Seja o primeiro a avaliar'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <input className="rounded-xl border h-10 px-3 text-sm" placeholder="Seu nome" value={reviewName} onChange={(e) => setReviewName(e.target.value)} />
            <div className="flex items-center gap-2 h-10">
              {Array.from({ length: 5 }).map((_, i) => {
                const idx = i + 1;
                const active = idx <= reviewRating;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReviewRating(idx)}
                    className="p-0 m-0 bg-transparent border-none cursor-pointer"
                    aria-label={`Marcar ${idx} estrelas`}
                    title={`${idx} estrelas`}
                  >
                    <Star className={`w-4 h-4 ${active ? 'text-yellow-500' : 'text-muted-foreground'}`} fill={active ? 'currentColor' : 'none'} />
                  </button>
                );
              })}
              <span className="text-[11px] text-muted-foreground ml-1">{reviewRating} de 5</span>
            </div>
            <textarea className="rounded-xl border px-3 py-2 md:col-span-2 h-16 text-sm" placeholder="Escreva sua avaliação" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <Button className="rounded-full h-9 px-5 text-xs font-bold" onClick={handleSubmitReview}>Enviar avaliação</Button>
            {reviews.length > 3 && (
              <button className="text-xs font-bold text-primary underline-offset-2 hover:underline" onClick={() => setShowAllCompactReviews(s => !s)}>
                {showAllCompactReviews ? 'Mostrar menos' : 'Ver mais avaliações'}
              </button>
            )}
          </div>
          
          <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Entrar para enviar a avaliação</DialogTitle>
                <DialogDescription className="text-sm">
                  Você pode escrever sua avaliação agora. Para enviar, faça login rapidamente.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button asChild className="rounded-full h-9 px-5 text-xs font-bold">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button variant="ghost" className="rounded-full h-9 px-5 text-xs font-bold" onClick={() => setLoginDialogOpen(false)}>
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="mt-3 space-y-2">
            {(showAllCompactReviews ? reviews : reviews.slice(0, 5)).map((r, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] uppercase shrink-0">
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
                            className={`w-3 h-3 ${active ? 'text-yellow-500' : 'text-muted-foreground'}`}
                            fill={active ? 'currentColor' : 'none'}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed line-clamp-2">{r.comment}</p>
                </div>
              </div>
            ))}
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
