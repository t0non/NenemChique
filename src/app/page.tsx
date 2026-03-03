
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Star, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product-card';
import dynamic from 'next/dynamic';
import { useCart } from '@/context/cart-context';
import { useData } from '@/context/data-context';
import { WhatsAppIcon } from '@/components/whatsapp-icon';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Product } from '@/lib/types';
import varal from '@/imagens/Varalzinho.png';
import { Progress } from '@/components/ui/progress';

const Testimonials = dynamic(() => import('@/components/testimonials').then(m => m.Testimonials), { ssr: false });
const InstagramSection = dynamic(() => import('@/components/instagram-section').then(m => m.InstagramSection), { ssr: false });
const VaralzinhoDivider = dynamic(() => Promise.resolve(() => (
  <div className="w-full bg-[#FDF8FB] py-4 overflow-hidden border-y border-primary/5">
    <div className="relative w-full h-36 md:h-48 overflow-hidden">
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[180vw] md:w-[240vw] h-full">
        <Image
          src={varal}
          alt="Varalzinho decorativo"
          fill
          className="object-contain object-center"
          priority={false}
          loading="lazy"
        />
      </div>
    </div>
  </div>
)), { ssr: false });

export default function Home() {
  const { items, addToCart, removeFromCart, subtotal } = useCart();
  const { products, settings } = useData();

  const bestSellers = products.slice(0, 4);
  const saidasMaternidade = products.filter(p => p.category === 'saida-maternidade');
  const bodies = products.filter(p => p.category === 'bodies');
  const sapatinhos = products.filter(p => p.category === 'sapatinhos');
  const kits = products.filter(p => p.category === 'kits');

  const heroImage = settings?.heroImageUrl || PlaceHolderImages.find(img => img.id === 'hero-baby')?.imageUrl;
  const checklistImage = PlaceHolderImages.find(img => img.id === 'checklist-layette');

  const Section = ({ title, description, products, id, badgeText }: { title: string, description: string, products: any[], id?: string, badgeText?: string }) => (
    <section id={id} className="py-8 bg-white first-of-type:bg-[#FDF8FB] even:bg-[#FDF8FB]">
      <div className="container-standard">
        <div className="max-w-2xl mx-auto mb-6 text-center">
          {badgeText && <Badge className="bg-primary/10 text-primary border-none mb-2 px-4 py-1">{badgeText}</Badge>}
          <h2 className="text-2xl md:text-4xl font-light mb-1">{title}</h2>
          <p className="text-muted-foreground font-light text-sm italic">{description}</p>
        </div>
        <div className="relative">
          <Carousel
            opts={{ align: 'start', loop: false }}
            className="w-full"
          >
            <CarouselContent>
              {products.map((p, idx) => (
                <CarouselItem key={p.id} className="basis-[80%] sm:basis-1/2 lg:basis-1/4">
                  <ProductCard product={p} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-white text-primary border-primary/20 hover:bg-primary hover:text-white shadow-md" />
            <CarouselNext className="bg-white text-primary border-primary/20 hover:bg-primary hover:text-white shadow-md" />
          </Carousel>
        </div>
      </div>
    </section>
  );

  return (
    <div className="flex flex-col font-sans">
      <section className="relative min-h-[50vh] flex items-center bg-[#FDF8FB] overflow-hidden py-4 md:py-10">
        <div className="container-standard z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div className="max-w-xl animate-in fade-in duration-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37] star-glow" />)}
              </div>
              <span className="text-[10px] font-bold text-primary/80 uppercase tracking-[0.2em]">+2.000 Mamães felizes</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3 text-[10px] font-bold uppercase tracking-[0.15em]">
              <div className="flex items-center gap-1 text-foreground/70"><Truck className="w-3 h-3 text-primary" /> Frete Grátis 299+</div>
              <div className="flex items-center gap-1 text-foreground/70"><RotateCcw className="w-3 h-3 text-primary" /> Troca 30 dias</div>
              <div className="flex items-center gap-1 text-foreground/70"><ShieldCheck className="w-3 h-3 text-primary" /> Pagamento Seguro</div>
            </div>
            <h1 className="text-3xl md:text-5xl font-light mb-3 text-foreground leading-tight tracking-tight">
              {settings?.heroTitle || "Amor que veste, conforto que abraça."}
            </h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed font-light">
              {settings?.heroDescription || "Tecidos hipoalergênicos e curadoria especializada. Peças escolhidas para a pele mais sensível do mundo."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="h-12 px-8 rounded-full text-xs font-bold bg-pink-gradient hover:opacity-90 text-white border-none uppercase tracking-widest">
                <Link href="/catalog">
                  Ver Coleção Completa
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted/10 hidden lg:block max-w-[450px] justify-self-center border-4 border-white shadow-xl">
             <Image 
                src={heroImage || "https://picsum.photos/seed/baby1/800/800"} 
                alt="Bebê com roupinha delicada" 
                fill 
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4="
                priority
              />
          </div>
        </div>
      </section>

      <VaralzinhoDivider />

      {bestSellers.length > 0 && (
        <Section 
          id="produtos"
          title="Mais Vendidos" 
          description="As peças que as mamães mais amam na Neném Chique." 
          products={bestSellers} 
          badgeText="Favoritos das Mamães"
        />
      )}

      {saidasMaternidade.length > 0 && (
        <Section 
          title="Saídas de Maternidade" 
          description="O primeiro abraço em forma de roupa. Tricot antialérgico e delicado." 
          products={saidasMaternidade} 
        />
      )}

      {bodies.length > 0 && (
        <Section 
          title="Bodies & Macacões" 
          description="Essenciais em algodão premium para o conforto do dia a dia." 
          products={bodies} 
        />
      )}

      {sapatinhos.length > 0 && (
        <Section 
          title="Sapatinhos & Pantufas" 
          description="Proteção e maciez para os pezinhos mais sensíveis." 
          products={sapatinhos} 
        />
      )}

      {kits.length > 0 && (
        <Section 
          title="Kits Enxoval" 
          description="Curadoria exclusiva para montar o enxoval dos sonhos em um clique." 
          products={kits} 
        />
      )}

      <Testimonials />

      <InstagramSection />

      <section id="pickup" className="py-10 bg-white border-t border-primary/5">
        <div className="container-standard">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border-4 border-white">
              <iframe
                title="Mapa - Retirada em Loja"
                src="https://www.google.com/maps?q=Av.%20Visc.%20de%20Ibituruna,%20370A%20-%20Barreiro,%20Belo%20Horizonte%20-%20MG,%2030640-080&output=embed"
                className="absolute inset-0 w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div>
              <Badge className="bg-primary/10 text-primary border-none mb-3 px-4 py-1">Retirada em Loja</Badge>
              <h2 className="text-2xl md:text-4xl font-light mb-2 leading-tight">Retire seu pedido com comodidade</h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed font-light">
                Endereço: Av. Visc. de Ibituruna, 370A - Barreiro, Belo Horizonte - MG, 30640-080
              </p>
              <ul className="text-sm text-foreground/80 space-y-2 font-light">
                <li>• Retirada em loja: disponível 1h após confirmação do pagamento</li>
                <li>• Agendar retirada pelo WhatsApp para evitar filas</li>
                <li>• Horários: Seg–Sex 9h–18h • Sáb 9h–13h</li>
              </ul>
              <div className="mt-4">
                <Button asChild className="rounded-full">
                  <a href="https://wa.me/5531999384130" target="_blank" rel="noopener noreferrer">Agendar retirada</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-10 bg-white">
        <div className="container-standard">
          <div className="bg-primary rounded-2xl p-6 md:p-12 text-center text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <Badge className="bg-white/20 text-white border-none mb-4 px-6 py-1.5 rounded-full font-bold uppercase tracking-widest text-[9px]">Consultoria Gratuita</Badge>
              <h2 className="text-2xl md:text-4xl font-light mb-4 leading-tight text-white">Falta algo no seu enxoval?</h2>
              <p className="text-base opacity-90 mb-6 font-light italic">
                Nossas especialistas montam uma lista personalizada para você.
              </p>
              <Button size="lg" className="bg-white text-primary hover:bg-white/95 h-12 px-10 rounded-full text-xs font-bold uppercase tracking-widest group border-none">
                <a href="https://wa.me/5531999384130" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <WhatsAppIcon className="w-4 h-4 fill-primary" />
                  Chamar no WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
