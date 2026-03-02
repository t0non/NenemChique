"use client"

import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { WhatsAppIcon } from './whatsapp-icon';
import { ViewCounter } from './view-counter';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const installmentPrice = (product.price / 12).toFixed(2).replace('.', ',');
  const cashPrice = (product.price * 0.95).toFixed(2).replace('.', ',');

  return (
    <div className="flex flex-col text-center group w-full card-flat snap-start">
      {/* Imagem com Arredondamento Suave e Tag */}
      <div 
        className="relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-6 cursor-pointer bg-muted/20" 
        onClick={() => addToCart(product)}
      >
        {product.limitedStock && (
          <Badge className="absolute top-3 left-3 z-10 bg-secondary text-white rounded-full px-3 py-1 font-medium text-[9px] uppercase tracking-widest border-none">
            Produção Limitada
          </Badge>
        )}
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
        />
      </div>
      
      {/* Informações: Tipografia Leve e Cores Sóbrias */}
      <div className="flex flex-col items-center w-full px-2">
        <h3 className="text-[14px] font-light text-foreground/80 mb-2 min-h-[2.5rem] flex items-center justify-center leading-snug">
          {product.name}
        </h3>
        
        {/* Gatilho de Escassez */}
        <ViewCounter />

        <div className="mb-6">
          <p className="text-xl font-bold text-foreground">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[12px] text-muted-foreground mt-1">
            <span className="font-bold text-foreground">R$ {cashPrice}</span> à vista
          </p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
            ou 12x de <span className="font-bold">R$ {installmentPrice}</span> com juros
          </p>
        </div>

        {/* Botões Empilhados: Sólido + Outline */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Button 
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setQty(q => Math.max(1, q - 1))}
            >
              −
            </Button>
            <span className="min-w-8 text-sm font-bold">{qty}</span>
            <Button 
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setQty(q => Math.min(99, q + 1))}
            >
              +
            </Button>
          </div>
          <Button 
            onClick={() => addToCart(product, qty)}
            className="w-full h-11 rounded-full font-bold bg-secondary hover:bg-secondary/90 text-white border-none text-[11px] uppercase tracking-widest shadow-lg shadow-secondary/20"
          >
            Comprar
          </Button>
          
          <Button 
            variant="outline"
            asChild
            className="w-full h-11 rounded-full font-medium border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 bg-transparent text-[10px] uppercase tracking-widest"
          >
            <a href={`https://wa.me/5531999384130?text=Olá! Tenho uma dúvida sobre: ${product.name}`} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="w-3.5 h-3.5 mr-2 fill-emerald-600" />
              Tirar dúvida pelo Whats
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
