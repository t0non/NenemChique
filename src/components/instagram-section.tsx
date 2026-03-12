"use client"

import Image from 'next/image';
import { Instagram, Heart, MessageCircle, Send, Bookmark, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import instagramPrint from '@/imagens/instagram.png';

export function InstagramSection() {
  return (
    <section className="py-20 bg-[#FDF8FB] overflow-hidden">
      <div className="container-standard">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Lado Esquerdo: Texto e Chamada */}
          <div className="space-y-6 animate-in fade-in slide-in-from-left duration-1000">
            <Badge className="bg-primary/10 text-primary border-none px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Nossa Comunidade
            </Badge>
            <h2 className="text-3xl md:text-5xl font-light text-foreground leading-tight">
              Acompanhe nossa loja e <br />
              <span className="font-bold text-primary">viva a experiência Neném Chique</span>
            </h2>
            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-lg">
              No nosso Instagram, compartilhamos dicas de enxoval, novidades em primeira mão e o dia a dia da nossa curadoria feita com todo amor para o seu bebê.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="h-14 px-8 rounded-full bg-pink-gradient hover:opacity-90 text-white font-bold border-none shadow-xl shadow-primary/20 group">
                <a href="https://www.instagram.com/nenemchiquee/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Seguir no Instagram
                </a>
              </Button>
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-primary/5 shadow-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-muted overflow-hidden">
                      <Image src={`https://picsum.photos/seed/baby${i}/100/100`} alt="Seguidor" width={32} height={32} loading="lazy" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  +20k Seguidoras
                </p>
              </div>
            </div>
          </div>

          {/* Lado Direito: Mockup iPhone */}
          <div className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-right duration-1000">
            {/* Círculos Decorativos */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10" />
            
            {/* iPhone XR Mockup */}
            <div className="relative w-[300px] h-[610px] bg-black rounded-[3.5rem] border-[12px] border-[#1a1a1a] shadow-[0_0_50px_rgba(0,0,0,0.15)] overflow-hidden">
              {/* Conteúdo do Instagram em Tela Cheia */}
              <div className="absolute inset-0 bg-white overflow-hidden">
                <Image 
                  src={instagramPrint} 
                  alt="Instagram Neném Chique" 
                  fill 
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Elemento flutuante */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-primary/5 hidden md:block animate-bounce [animation-duration:3000ms]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                   <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground">Novo Lançamento!</p>
                  <p className="text-[9px] text-muted-foreground italic">Acabamos de postar ✨</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
