"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/cart-context';
import { useData } from '@/context/data-context';

export function ProductCard({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [openVariants, setOpenVariants] = useState(false);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { settings } = useData();
  const showInstallments = settings.showInstallments ?? true;
  const installmentCount = settings.installmentCount ?? 12;
  const cashDiscountPct = settings.cashDiscountPercent ?? 5;
  const BLUR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=';
  const needsColor = Array.isArray(product.colors) && product.colors.length > 0;
  const needsSize = Array.isArray(product.sizes) && product.sizes.length > 0;
  const requireVariants = needsColor || needsSize;

  const readLocalSizePricing = (p: Product) => {
    try {
      const raw = localStorage.getItem('nenem_size_pricing');
      const store = raw ? JSON.parse(raw) : {};
      return store[p.id] || store[p.name] || null;
    } catch {
      return null;
    }
  };

  const getSizePricingMap = (p: Product) => p.sizePricing || readLocalSizePricing(p) || null;
  const hasDynamicPricing = (p: Product) => {
    const map = getSizePricingMap(p);
    if (map && typeof map === 'object' && Object.keys(map).length > 0) return true;
    return p.category === 'conjuntos-fleece' && Array.isArray(p.sizes) && p.sizes.length > 0;
  };

  const getEffectivePrice = (p: Product, size: string | null) => {
    if (p.category === 'conjuntos-fleece' && size) {
      if (['4', '6', '8'].includes(size)) {
        return { price: 109.9, promo: 78.0 };
      }
      if (['1', '2', '3'].includes(size)) {
        return { price: 99.0, promo: 68.0 };
      }
    }
    if (size && (p.sizePricing || readLocalSizePricing(p))) {
      const map = p.sizePricing || readLocalSizePricing(p);
      const entry = map?.[size];
      if (entry && typeof entry.price === 'number') {
        return { price: entry.price, promo: entry.promo };
      }
    }
    return { price: p.price, promo: p.promoPrice };
  };

  const getMinEffectivePrice = (p: Product) => {
    const sizes = Array.isArray(p.sizes) ? p.sizes : [];
    let min: { price: number; promo?: number } | null = null;
    for (const s of sizes) {
      const eff = getEffectivePrice(p, s);
      const effBase = eff.promo ?? eff.price;
      const curBase = min ? (min.promo ?? min.price) : Infinity;
      if (effBase < curBase) {
        min = eff;
      }
    }
    return min || { price: p.price, promo: p.promoPrice };
  };

  const effective = getEffectivePrice(product, selectedSize);
  const selectedEffective = getEffectivePrice(product, selectedSize);
  const selectedBase = selectedEffective.promo ?? selectedEffective.price;
  const defaultEffective = hasDynamicPricing(product) ? getMinEffectivePrice(product) : { price: product.price, promo: product.promoPrice };
  const defaultBase = defaultEffective.promo ?? defaultEffective.price;
  const showingSelected = !!selectedSize;
  const showing = showingSelected ? selectedEffective : defaultEffective;
  const baseShown = showingSelected ? selectedBase : defaultBase;
  const installmentPrice = (baseShown / installmentCount).toFixed(2).replace('.', ',');
  const cashPrice = (baseShown * (1 - cashDiscountPct / 100)).toFixed(2).replace('.', ',');

  const handleAddToCartDirect = () => {
    if (requireVariants) {
      // Abre seletor de variantes antes de adicionar
      setSelectedColor(null);
      setSelectedSize(null);
      setOpenVariants(true);
      return;
    }
    // Sem variantes: adiciona direto
    const price = product.promoPrice || product.price;
    addToCart({ ...product, price } as any, 1);
    toast({ title: "Adicionado ao carrinho! 🛒", description: product.name });
  };

  const handleAddFromVariantDialog = () => {
    if (needsColor && !selectedColor) {
      toast({ title: 'Selecione a cor', description: 'Escolha uma cor antes de continuar.' });
      return;
    }
    if (needsSize && !selectedSize) {
      toast({ title: 'Selecione o tamanho', description: 'Escolha um tamanho antes de continuar.' });
      return;
    }
    const eff = getEffectivePrice(product, selectedSize);
    const price = eff.promo ?? eff.price;
    addToCart({
      ...product,
      price,
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
    } as any, 1);
    setOpenVariants(false);
    toast({ title: "Adicionado ao carrinho! 🛒", description: product.name });
  };

  return (
    <div className="flex flex-col text-center group w-full card-flat snap-start">
      {/* Imagem — clique leva para a página do produto */}
      <Link 
        href={`/product/${product.id}`}
        prefetch={false}
        aria-label={`Ver detalhes de ${product.name}`}
        className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-white block cursor-pointer"
      >
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
          draggable={false}
        />
      </Link>
      
      {/* Informações */}
      <div className="flex flex-col items-center w-full px-2">
        <h3
          className="text-[12px] md:text-[14px] font-light text-foreground/80 mb-2 h-[44px] md:h-[60px] flex items-center justify-center leading-4 md:leading-5 text-center clamp-3 overflow-hidden whitespace-normal"
          title={product.name}
        >
          {product.name}
        </h3>
        
        <div className="mb-4 md:mb-6 min-h-[80px] md:min-h-[88px] flex flex-col items-center justify-between">
          {showing.promo ? (
            <div className="flex flex-col items-center">
              <p className="text-lg md:text-xl font-black text-secondary">
                {showingSelected ? '' : 'A partir de ' }R$ {showing.promo.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-muted-foreground line-through">
                R$ {showing.price.toFixed(2).replace('.', ',')}
              </p>
            </div>
          ) : (
            <p className="text-lg md:text-xl font-bold text-foreground">
              {showingSelected ? '' : 'A partir de ' }R$ {showing.price.toFixed(2).replace('.', ',')}
            </p>
          )}
          {showInstallments && (
            <>
              <p className="text-[12px] text-muted-foreground mt-1">
                <span className="font-bold text-foreground">R$ {cashPrice}</span> à vista
              </p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                ou {installmentCount}x de <span className="font-bold">R$ {installmentPrice}</span> com juros
              </p>
            </>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 w-full">
          {/* Botão primário: Adicionar ao Carrinho */}
          <button
            onClick={handleAddToCartDirect}
            className="w-full h-10 md:h-11 rounded-full font-semibold bg-primary hover:bg-primary/90 active:scale-95 text-white border-none text-[9px] md:text-[10px] uppercase tracking-widest transition-all duration-200 flex items-center justify-between px-4 md:px-5"
          >
            <span className="flex-1 text-center">Adicionar ao Carrinho</span>
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
          </button>

          {/* Botão secundário: ver detalhes na página do produto */}
          <Link
            href={`/product/${product.id}`}
            prefetch={false}
            className="w-full h-8 rounded-full font-medium border border-primary/10 text-foreground/60 hover:bg-secondary/5 bg-transparent text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center cursor-pointer"
          >
            Ver Detalhes
          </Link>
        </div>

        {/* Dialog simples para selecionar cor/tamanho antes de adicionar ao carrinho */}
        <Dialog open={openVariants} onOpenChange={setOpenVariants}>
          <DialogContent className="rounded-2xl w-[92vw] max-w-[380px]">
            <DialogHeader>
              <DialogTitle className="text-base">Selecione as opções</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="mb-3 flex flex-col items-center">
                {effective.promo ? (
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-black text-secondary">
                      R$ {effective.promo.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-muted-foreground line-through">
                      R$ {effective.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-foreground">
                    R$ {effective.price.toFixed(2).replace('.', ',')}
                  </p>
                )}
                {showInstallments && (
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-bold text-foreground">R$ {cashPrice}</span> à vista • {installmentCount}x de <span className="font-bold">R$ {installmentPrice}</span>
                  </p>
                )}
              </div>
              {needsColor && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Cor</div>
                  <Select value={selectedColor ?? ''} onValueChange={(v) => setSelectedColor(v)}>
                    <SelectTrigger className="rounded-xl h-11 border border-primary/30 bg-white text-foreground focus-visible:ring-2 focus-visible:ring-primary/40">
                      <SelectValue placeholder="Escolha a cor" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-primary/20 bg-white text-foreground shadow-lg z-[1600]">
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
                    <SelectTrigger className="rounded-xl h-11 border border-primary/30 bg-white text-foreground focus-visible:ring-2 focus-visible:ring-primary/40">
                      <SelectValue placeholder="Escolha o tamanho" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-primary/20 bg-white text-foreground shadow-lg z-[1600]">
                      {product.sizes!.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="mt-3">
              <button
                className="w-full h-12 rounded-full font-bold bg-primary hover:bg-primary/90 active:scale-95 text-white text-[11px] uppercase tracking-widest shadow-lg shadow-primary/30 transition-all duration-200 flex items-center justify-center gap-2"
                onClick={handleAddFromVariantDialog}
              >
                <ShoppingCart className="w-4 h-4 shrink-0" />
                Adicionar ao Carrinho
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
