
"use client"

import Image from 'next/image';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

export function Testimonials() {
  return (
    <section className="py-12 bg-[#F8FBFF]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-light mb-2 text-primary">Feedback das Mamães ☁️</h2>
          <p className="text-muted-foreground text-base font-light italic leading-relaxed">
            Mais do que roupas, entregamos memórias para o primeiro dia de vida.
          </p>
        </div>
        <div className="md:hidden -mx-6 px-6">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 no-scrollbar pb-2">
            {TESTIMONIALS.map((t) => (
              <Card key={t.id} className="flex-0 basis-[85%] snap-start border-none shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 relative group">
                <div className="absolute top-6 right-8 text-primary/5 transition-transform group-hover:scale-110">
                  <Quote className="w-16 h-16" />
                </div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < t.rating ? 'fill-secondary text-secondary' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <p className="text-foreground font-light italic mb-6 leading-relaxed text-sm">
                    "{t.comment}"
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-primary/5">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/5 shadow-inner">
                      <Image src={t.imageUrl} alt={t.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-base leading-tight">{t.name}</h4>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-[0.15em] mt-1">Mãe do {t.babyName || 'bebê'} • {t.location || 'Brasil'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <Card key={t.id} className="border-none shadow-lg bg-white rounded-[24px] overflow-hidden hover:shadow-xl transition-all duration-500 relative group">
              <div className="absolute top-6 right-8 text-primary/5 transition-transform group-hover:scale-110">
                <Quote className="w-16 h-16" />
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < t.rating ? 'fill-secondary text-secondary' : 'text-muted'}`} 
                    />
                  ))}
                </div>
                <p className="text-foreground font-light italic mb-8 leading-relaxed text-base">
                  "{t.comment}"
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-primary/5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/5 shadow-inner">
                    <Image src={t.imageUrl} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-base leading-tight">{t.name}</h4>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-[0.15em] mt-1">Mãe do {t.babyName || 'bebê'} • {t.location || 'Brasil'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
