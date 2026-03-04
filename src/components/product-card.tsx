"use client"

import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { WhatsAppIcon } from './whatsapp-icon';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [openVariants, setOpenVariants] = useState(false);
  const { toast } = useToast();
  const basePrice = product.promoPrice ?? product.price;
  const installmentPrice = (basePrice / 12).toFixed(2).replace('.', ',');
  const cashPrice = (basePrice * 0.95).toFixed(2).replace('.', ',');
  const BLUR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=';
  const needsColor = Array.isArray(product.colors) && product.colors.length > 0;
  const needsSize = Array.isArray(product.sizes) && product.sizes.length > 0;

  const requireVariants = needsColor || needsSize;

  const finalizeAdd = (q: number) => {
    const withVariant: Product = {
      ...product,
      name: [product.name, selectedColor || undefined, selectedSize || undefined].filter(Boolean).join(' · '),
    };
    addToCart(withVariant, q);
  };

  const handleBuy = () => {
    if (requireVariants && (!selectedColor && needsColor || !selectedSize && needsSize)) {
      setOpenVariants(true);
      return;
    }
    finalizeAdd(qty);
  };

  return (
    <div className="flex flex-col text-center group w-full card-flat snap-start">
      {/* Imagem com Arredondamento Suave e Tag */}
      <div 
        className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 cursor-pointer bg-muted/20" 
        onClick={() => {
          if (requireVariants) {
            setOpenVariants(true);
          } else {
            finalizeAdd(1);
          }
        }}
      >
        {/* Badge de estoque removida conforme solicitação */}
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-700 group-hover:scale-105"
          quality={60}
          loading="lazy"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
          placeholder="blur"
          blurDataURL={BLUR}
        />
      </div>
      
      {/* Informações: Tipografia Leve e Cores Sóbrias */}
      <div className="flex flex-col items-center w-full px-2">
        <h3 className="text-[14px] font-light text-foreground/80 mb-2 h-[44px] md:h-[40px] flex items-center justify-center leading-snug clamp-2">
          {product.name}
        </h3>
        
        <div className="mb-6 min-h-[100px] md:min-h-[88px] flex flex-col items-center justify-between">
          {product.promoPrice ? (
            <div className="flex flex-col items-center">
              <p className="text-xl font-black text-secondary">
                R$ {product.promoPrice.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-muted-foreground line-through">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
            </div>
          ) : (
            <p className="text-xl font-bold text-foreground">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
          )}
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
            onClick={handleBuy}
            className="w-full h-11 rounded-full font-bold bg-secondary hover:bg-secondary/90 text-white border-none text-[11px] uppercase tracking-widest shadow-lg shadow-secondary/20"
          >
            Comprar
          </Button>
          
          <Button 
            variant="outline"
            asChild
            className="w-full h-11 rounded-full font-medium border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 bg-transparent px-4 text-[9px] md:text-[10px] uppercase tracking-[0.12em] md:tracking-widest"
          >
            <a
              href={`https://wa.me/5531999384130?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre: ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full h-full gap-2"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600 shrink-0" />
              <span>Tirar dúvida</span>
            </a>
          </Button>
        </div>
        <Dialog open={openVariants} onOpenChange={setOpenVariants}>
          <DialogContent className="rounded-2xl w-[92vw] max-w-[380px]">
            <DialogHeader>
              <DialogTitle className="text-base">Selecione as opções</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              {needsColor && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Cor</div>
                  <Select value={selectedColor ?? ''} onValueChange={(v) => setSelectedColor(v)}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Escolha a cor" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {product.colors!.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {needsSize && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Tamanho</div>
                  <Select value={selectedSize ?? ''} onValueChange={(v) => setSelectedSize(v)}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Escolha o tamanho" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {product.sizes!.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="mt-3">
              <Button
                className="w-full rounded-full"
                onClick={() => {
                  if (needsColor && !selectedColor) {
                    toast({ title: 'Selecione a cor', description: 'Escolha uma cor antes de continuar.' });
                    return;
                  }
                  if (needsSize && !selectedSize) {
                    toast({ title: 'Selecione o tamanho', description: 'Escolha um tamanho antes de continuar.' });
                    return;
                  }
                  finalizeAdd(qty);
                  setOpenVariants(false);
                }}
              >
                Adicionar ao carrinho
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
