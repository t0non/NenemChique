"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ShoppingBag, MessageCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface QuickViewModalProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize('');
      setSelectedColor('');
      setCurrentImageIndex(0);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const currentPrice = product.promoPrice || product.price;

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast({ variant: "destructive", title: "Atenção", description: "Por favor, selecione um tamanho." });
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast({ variant: "destructive", title: "Atenção", description: "Por favor, selecione uma cor." });
      return;
    }

    addToCart({
      ...product,
      price: currentPrice,
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
    } as any, 1);

    toast({
      title: "Adicionado ao carrinho!",
      description: "Você pode continuar comprando ou finalizar o pedido.",
    });
    
    // Close modal after adding to cart
    onClose();
  };

  const handleBuyNowWhatsapp = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast({ variant: "destructive", title: "Atenção", description: "Por favor, selecione um tamanho." });
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast({ variant: "destructive", title: "Atenção", description: "Por favor, selecione uma cor." });
      return;
    }

    const sizeText = selectedSize ? ` (Tamanho: ${selectedSize})` : '';
    const colorText = selectedColor ? ` (Cor: ${selectedColor})` : '';
    const message = `Olá! Gostaria de comprar o produto:\n*${product.name}*${sizeText}${colorText}\nValor: R$ ${currentPrice.toFixed(2)}`;
    
    // Track GTM event for conversion
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'click_whatsapp_quickview',
        product_name: product.name,
        price: currentPrice,
        product_id: product.id,
      });
    }

    const whatsappUrl = `https://wa.me/5531996244487?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const nextImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-3xl max-h-[92vh] md:max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-200 flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar Mobile (flutuante) */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full text-muted-foreground hover:text-black shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Galeria de Imagens (Esquerda) */}
        <div className="w-full md:w-1/2 relative bg-secondary/5 shrink-0">
          <div className="relative w-full aspect-[4/3] md:aspect-square md:h-full">
            <Image 
              src={product.images?.[currentImageIndex] || 'https://picsum.photos/seed/baby/400/400'} 
              alt={product.name} 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          
          {product.images && product.images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.images.map((_: any, idx: number) => (
                  <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-primary w-4' : 'bg-white/60'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Detalhes do Produto (Direita) */}
        <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col">
          <div className="mb-4">
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block">
              {product.category?.replace('-', ' ')}
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{product.name}</h2>
            
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-bold text-primary">R$ {currentPrice.toFixed(2)}</span>
              {product.promoPrice && (
                <span className="text-sm line-through text-muted-foreground">R$ {product.price.toFixed(2)}</span>
              )}
            </div>
          </div>

          <div className="flex-grow space-y-5">
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s: string) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`h-10 px-4 rounded-xl font-bold text-sm transition-all border ${
                        selectedSize === s 
                          ? 'bg-primary text-white border-primary shadow-md' 
                          : 'bg-white text-foreground hover:border-primary/50 border-secondary/20 hover:bg-secondary/5'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Cor</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c: string) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`h-10 px-4 rounded-xl font-medium text-sm transition-all border ${
                        selectedColor === c 
                          ? 'bg-foreground text-white border-foreground shadow-md' 
                          : 'bg-white text-foreground hover:border-foreground/50 border-secondary/20 hover:bg-secondary/5'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 pt-6 border-t border-secondary/10">
            <Button 
              onClick={handleAddToCart}
              variant="outline"
              className="w-full h-12 md:h-14 rounded-2xl font-bold text-sm md:text-base border-primary/20 hover:bg-primary/5 hover:border-primary"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Adicionar ao Carrinho
            </Button>
            
            <Button 
              onClick={handleBuyNowWhatsapp}
              className="w-full h-12 md:h-14 rounded-2xl font-bold text-sm md:text-base bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02] track-btn-whatsapp"
              data-gtm="whatsapp"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Comprar via WhatsApp
            </Button>
            <p className="text-center text-[10px] text-muted-foreground mt-2">Dúvidas? Compre direto com uma vendedora real.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
