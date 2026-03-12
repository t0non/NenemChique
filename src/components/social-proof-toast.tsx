"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { PRODUCTS } from '@/lib/data';

const PURCHASES = [
  { name: "Mariana", city: "São Paulo, SP", productId: "p1" },
  { name: "Camila", city: "Belo Horizonte, MG", productId: "p4" },
  { name: "Fernanda", city: "Curitiba, PR", productId: "p2" },
  { name: "Beatriz", city: "Rio de Janeiro, RJ", productId: "p3" },
  { name: "Juliana", city: "Porto Alegre, RS", productId: "p7" },
  { name: "Letícia", city: "Fortaleza, CE", productId: "p1-alt" },
  { name: "Roberta", city: "Brasília, DF", productId: "p5" }
];

export function SocialProofToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState(PURCHASES[0]);

  useEffect(() => {
    const showToast = () => {
      const randomPurchase = PURCHASES[Math.floor(Math.random() * PURCHASES.length)];
      setCurrentPurchase(randomPurchase);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Primeiro toast após 10 segundos
    const initialTimeout = setTimeout(showToast, 10000);
    
    // Intervalos regulares de 30 segundos
    const interval = setInterval(showToast, 35000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const product = PRODUCTS.find(p => p.id === currentPurchase.productId) || PRODUCTS[0];

  return (
    <div 
      className={`fixed bottom-24 left-4 md:left-8 z-[1001] transition-all duration-700 ease-in-out pointer-events-none md:pointer-events-auto ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border border-primary/10 rounded-2xl md:rounded-full py-3 px-5 shadow-2xl flex items-center gap-4 max-w-[320px] md:max-w-md">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/5 shrink-0 flex items-center justify-center border border-primary/5">
          <Image 
            src={product.images[0]} 
            alt={product.name} 
            fill 
            className="object-contain"
            loading="lazy"
          />
        </div>
        <div className="overflow-hidden">
          <p className="text-[12px] leading-snug text-muted-foreground italic">
            <span className="font-bold text-foreground not-italic">{currentPurchase.name}</span> de {currentPurchase.city} acabou de garantir um(a) <span className="font-bold text-primary not-italic">{product.name}</span>!
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Compra confirmada ✨</p>
          </div>
        </div>
      </div>
    </div>
  );
}
