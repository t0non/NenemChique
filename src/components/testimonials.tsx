 
"use client"

import Image from 'next/image';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import logo from '@/imagens/logo.png';
import googleIcon from '@/imagens/icone google.png';
import { useEffect, useState } from 'react';

const Avatar = ({ name }: { name: string }) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const COLORS = ['#FFC1CC', '#FFD700', '#ADD8E6', '#90EE90', '#FFA07A', '#B0E0E6', '#FFB6C1'];
  const color = COLORS[name.length % COLORS.length];

  return (
    <div 
      className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/5 shadow-inner flex items-center justify-center font-bold text-white text-lg"
      style={{ backgroundColor: color }}
    >
      {getInitials(name)}
    </div>
  );
};

const GoogleIcon = () => (
  <div className="relative w-4 h-4 shrink-0">
    <Image src={googleIcon} alt="Google" fill className="object-contain" />
  </div>
);

export function Testimonials() {
  const count = TESTIMONIALS.length;
  const avg = Math.round((TESTIMONIALS.reduce((a, b) => a + b.rating, 0) / Math.max(1, count)) * 10) / 10;
  const [api, setApi] = useState<CarouselApi | undefined>(undefined);

  useEffect(() => {
    if (!api) return;
    let timer: any;
    const DELAY = 3500;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          api.scrollNext();
        } catch {}
      }, DELAY);
    };
    const onSettle = () => schedule();
    const onPointerDown = () => clearTimeout(timer);
    const onPointerUp = () => schedule();
    schedule();
    api.on('settle', onSettle);
    api.on('pointerDown', onPointerDown);
    api.on('pointerUp', onPointerUp);
    return () => {
      clearTimeout(timer);
      api.off('settle', onSettle);
      api.off('pointerDown', onPointerDown);
      api.off('pointerUp', onPointerUp);
    };
  }, [api]);
  return (
    <section className="py-12 bg-[#F8FBFF]">
      <div className="container mx-auto px-4 relative">
        <div className="absolute -top-6 left-6 opacity-70 hidden md:block">
          <Image src={logo} alt="Neném Chique Logo" width={64} height={64} className="object-contain" />
        </div>
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-light mb-2 text-primary">Feedback das Mamães ☁️</h2>
          <p className="text-muted-foreground text-base font-light italic leading-relaxed">
            Mais do que roupas, entregamos memórias para o primeiro dia de vida.
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-primary/5">
              <GoogleIcon />
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < 5 ? 'fill-[#D4AF37] text-[#D4AF37] star-glow' : ''}`} />
                ))}
              </div>
            </div>
            <span className="text-xs font-bold text-foreground/70">{avg} • {count} avaliações</span>
          </div>
        </div>
        <div className="md:hidden -mx-6 px-6">
          <Carousel opts={{ align: 'start', loop: true }} setApi={setApi}>
            <CarouselContent>
              {TESTIMONIALS.map((t) => (
                <CarouselItem key={t.id} className="basis-[85%]">
                  <Card className="border-none shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 relative group h-full">
                    <div className="absolute top-6 right-8 text-primary/5 transition-transform group-hover:scale-110">
                      <Quote className="w-16 h-16" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < t.rating ? 'fill-[#D4AF37] text-[#D4AF37] star-glow' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                      <p className="text-foreground font-light italic mb-6 leading-relaxed text-sm">
                        "{t.comment}"
                      </p>
                        <div className="flex items-center gap-4 pt-4 border-t border-primary/5">
                          <Avatar name={t.name} />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-foreground text-base leading-tight">{t.name}</h4>
                              <GoogleIcon />
                            </div>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.15em] mt-1">{t.location || 'Brasil'}</p>
                          </div>
                        </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-white text-primary border-primary/20 hover:bg-primary hover:text-white shadow-md" />
            <CarouselNext className="bg-white text-primary border-primary/20 hover:bg-primary hover:text-white shadow-md" />
          </Carousel>
        </div>
        <div className="hidden md:block max-w-7xl mx-auto">
          <Carousel opts={{ align: 'start', loop: true }} setApi={setApi}>
            <CarouselContent>
              {TESTIMONIALS.map((t) => (
                <CarouselItem key={t.id} className="md:basis-1/3">
                  <Card className="border-none shadow-lg bg-white rounded-[24px] overflow-hidden hover:shadow-xl transition-all duration-500 relative group h-full">
                    <div className="absolute top-6 right-8 text-primary/5 transition-transform group-hover:scale-110">
                      <Quote className="w-16 h-16" />
                    </div>
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-center gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i} 
                            className={`w-4 h-4 ${i < t.rating ? 'fill-[#D4AF37] text-[#D4AF37] star-glow' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                      <p className="text-foreground font-light italic mb-8 leading-relaxed text-base">
                        "{t.comment}"
                      </p>
                      <div className="flex items-center gap-4 pt-6 border-t border-primary/5">
                        <Avatar name={t.name} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground text-base leading-tight">{t.name}</h4>
                            <GoogleIcon />
                          </div>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-[0.15em] mt-1">{t.location || 'Brasil'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
