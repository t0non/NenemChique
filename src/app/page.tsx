
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product-card';
import dynamic from 'next/dynamic';
import { useCart } from '@/context/cart-context';
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { WhatsAppIcon } from '@/components/whatsapp-icon';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Product } from '@/lib/types';
import varal from '@/imagens/Varalzinho.png';
import { PRODUCTS } from '@/lib/data';

const Testimonials = dynamic(() => import('@/components/testimonials').then(m => m.Testimonials), { ssr: false });

// Componente do Varalzinho utilizando a imagem real
// IMPORTANTE: Mover a pasta 'imagens' para a pasta 'public' na raiz do projeto
const VaralzinhoDivider = () => (
  <div className="w-full bg-[#FDF8FB] py-4 overflow-hidden border-y border-primary/5">
    <div className="relative mx-auto w-[120vw] md:w-[140vw] h-24 md:h-32">
      <Image 
        src={varal}
        alt="Varalzinho decorativo" 
        fill 
        className="object-contain"
        priority
      />
    </div>
  </div>
);

export default function Home() {
  const { items, addToCart, removeFromCart } = useCart();
  const db = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: fetchedProducts = [] } = useCollection<Product>(productsQuery as any);
  const products: Product[] = fetchedProducts.length ? fetchedProducts : PRODUCTS;

  const bestSellers = products.slice(0, 4);
  const saidasMaternidade = products.filter(p => p.category === 'saida-maternidade');
  const bodies = products.filter(p => p.category === 'bodies');
  const sapatinhos = products.filter(p => p.category === 'sapatinhos');
  const kits = products.filter(p => p.category === 'kits');

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-baby');
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
              {products.map((p) => (
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
      <section className="relative min-h-[50vh] flex items-center bg-[#FDF8FB] overflow-hidden py-8 md:py-12">
        <div className="container-standard z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div className="max-w-xl animate-in fade-in duration-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
              </div>
              <span className="text-[10px] font-bold text-primary/80 uppercase tracking-[0.2em]">+2.000 Mamães felizes</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-light mb-3 text-foreground leading-tight tracking-tight">
              Amor que veste, <br /><span className="text-secondary font-normal">conforto</span> que abraça.
            </h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed font-light">
              Tecidos hipoalergênicos e curadoria especializada. Peças escolhidas para a pele mais sensível do mundo.
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
                src={heroImage?.imageUrl || "https://picsum.photos/seed/baby1/800/800"} 
                alt="Bebê com roupinha delicada" 
                fill 
                className="object-cover"
                priority
                data-ai-hint={heroImage?.imageHint}
              />
          </div>
        </div>
      </section>

      <VaralzinhoDivider />

      {bestSellers.length > 0 && (
        <Section 
          id="produtos"
          title="Mais Vendidos" 
          description="As peças que as mamães mais amam na Nuvem." 
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
