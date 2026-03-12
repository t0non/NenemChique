
"use client"

import { useCart } from '@/context/cart-context';
import { useData } from '@/context/data-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, CheckCircle2, Tag, RotateCcw, ShieldCheck, X as CloseIcon } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { WhatsAppIcon } from './whatsapp-icon';

export function CartSheet() {
  const { items, removeFromCart, subtotal, total, itemCount, addToCart, updateQuantity, ensureOrderCode, isCartOpen, setIsCartOpen, couponApplied, applyCoupon, discountAmount } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const { products: allProducts } = useData();

  // Mini lead capture removido para uma UI mais minimalista

  const SHIPPING_THRESHOLD = 299;
  const remainingForFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  const progressPercentage = Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100);

  // Dynamic Upsell: find a product marked as isUpsell that is not in cart
  const upsellProduct = useMemo(() => {
    // Primeiro tenta achar um produto marcado como upsell no banco de dados
    const dbUpsell = allProducts.find(p => p.isUpsell && !items.some(item => item.id === p.id));
    if (dbUpsell) return dbUpsell;
    
    // Se não houver nenhum marcado, não retorna nada (evita produtos aleatórios)
    return null;
  }, [allProducts, items]);

  const isUpsellInCart = useMemo(() => {
    if (!upsellProduct) return true; // Se não tem produto, finge que já está no carrinho para esconder a seção
    return items.some(item => item.id === upsellProduct.id);
  }, [items, upsellProduct]);

  const handleAddUpsell = () => {
    if (upsellProduct) addToCart(upsellProduct);
  };

  const handleApplyCoupon = async () => {
    const ok = await applyCoupon(couponInput);
    if (ok) setCouponInput("");
  };

  const finalizeOrder = async () => {
    const telefoneLoja = "5531999384130";
    const code = await ensureOrderCode();

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const useEmoji = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    let message = useEmoji ? "🎀 *NOVO PEDIDO - NENÉM CHIQUE* 🎀\n" : "*NOVO PEDIDO - NENÉM CHIQUE*\n";
    message += useEmoji ? `📦 Pedido: *${code}*\n` : `Pedido: *${code}*\n`;
    message += "------------------------------------\n";
    message += useEmoji
      ? "Olá! Quero finalizar minha compra pelo WhatsApp. 🍼✨\n\n"
      : "Olá! Quero finalizar minha compra pelo WhatsApp.\n\n";
    message += useEmoji ? "🛍️ *Itens do carrinho*\n" : "*ITENS DO CARRINHO*\n";
    message += "------------------------------------\n";

    // Itens principais e Upsell juntos na mesma lista clara
    items.forEach(item => {
      let subtotalItem = item.price * item.quantity;
      let precoFormatado = subtotalItem.toFixed(2).replace('.', ',');
      const parts = item.name.split(' · ');
      const base = parts[0];
      const variants = parts.slice(1).join(' • ');
      message += useEmoji ? `• ${item.quantity}x *${base}*\n` : `- ${item.quantity}x ${base}\n`;
      if (variants) {
        message += `   ├ Cor/Tamanho: ${variants}\n`;
      }
      message += `   └ Subtotal: R$ ${precoFormatado}\n`;
    });

    message += "------------------------------------\n\n";

    // Seção de Descontos e Ofertas
    if (couponApplied) {
      let descontoFormatado = discountAmount.toFixed(2).replace('.', ',');
      message += useEmoji ? `🎟️ Cupom aplicado: *${couponApplied}*\n` : `Cupom aplicado: ${couponApplied}\n`;
      message += `   └ Desconto: - R$ ${descontoFormatado}\n\n`;
    }

    // Fechamento com Destaque
    let totalFormatado = total.toFixed(2).replace('.', ',');
    message += useEmoji ? `💰 *Total:* R$ ${totalFormatado}\n\n` : `TOTAL: R$ ${totalFormatado}\n\n`;
    message += useEmoji
      ? "📨 Aguardo o link para pagamento e previsão de entrega. Obrigado! 💗"
      : "Aguardo o link para pagamento e previsão de entrega. Obrigado!";
    
    const encodedMessage = encodeURIComponent(message.normalize('NFC'));
    const url = `https://wa.me/${telefoneLoja}?text=${encodedMessage}`;
    window.location.href = url;
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen} modal>
      <SheetTrigger asChild>
        <Button aria-label="Abrir carrinho" variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/5">
          <ShoppingCart className="w-6 h-6 text-primary" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-gradient text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-md">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[360px] sm:w-[380px] md:w-[420px] max-w-[95vw] h-[100svh] md:h-screen grid grid-rows-[auto_auto_1fr_auto] overflow-hidden p-0 border-l border-primary/10 rounded-l-2xl">
        <SheetHeader className="sticky top-0 z-20 p-3 md:p-4 border-b bg-white flex items-center justify-center space-y-0">
          <SheetTitle className="text-xs font-bold text-foreground uppercase tracking-[0.25em]">
            CARRINHO DE COMPRAS
          </SheetTitle>
          <SheetClose asChild>
            <Button aria-label="Fechar carrinho" variant="ghost" size="icon" className="absolute right-2.5 top-2.5 h-8 w-8 rounded-full hover:bg-muted">
              <CloseIcon className="w-4 h-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        {/* Frete Grátis */}
        <div className="p-2 md:p-3 bg-blue-50/70 border-b">
          <p className="text-[11px] font-medium text-foreground mb-1 leading-tight">
            {remainingForFreeShipping > 0 ? (
              <>Falta apenas <span className="text-primary font-bold">R$ {remainingForFreeShipping.toFixed(2).replace('.', ',')}</span> para obter <b>frete grátis</b></>
            ) : (
              <span className="text-green-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Parabéns! Você ganhou frete grátis
              </span>
            )}
          </p>
          <Progress value={progressPercentage} className="h-1 bg-muted rounded-full" />
        </div>

        {/* Itens */}
        <div className="overflow-y-auto p-3 md:p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-primary/30" />
              </div>
              <p className="text-muted-foreground font-medium">Seu carrinho está vazio.</p>
              <SheetClose asChild>
                <Button variant="link" className="text-primary font-bold mt-2">
                  Explorar Coleções
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="relative grid grid-cols-[64px_1fr_auto] gap-3 bg-white p-3 md:p-3.5 rounded-2xl border border-muted/10 items-center">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted/10">
                    <Image src={item.images[0]} alt={item.name} fill className="object-contain" sizes="64px" loading="lazy" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-medium text-sm leading-tight text-foreground line-clamp-2">{item.name}</h4>
                    <p className="text-sm md:text-base text-foreground font-bold mt-1">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="flex items-center gap-2 self-center justify-self-end">
                    <div className="flex items-center rounded-full bg-muted px-2 py-1 shadow-sm">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>−</Button>
                      <span className="mx-1 text-sm font-bold min-w-6 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full"
                      onClick={() => setConfirmingDelete(item.id)}
                      aria-label="Remover item"
                    >
                      <CloseIcon className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  {confirmingDelete === item.id && (
                    <div className="absolute right-3 top-3 flex items-center gap-1.5 bg-red-50/70 p-1.5 rounded-lg shadow">
                      <span className="text-[10px] font-bold text-red-600 ml-1">Excluir?</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-[10px] font-bold hover:bg-white text-muted-foreground"
                        onClick={() => setConfirmingDelete(null)}
                      >
                        Não
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-6 px-2 text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white border-none"
                        onClick={() => {
                          removeFromCart(item.id);
                          setConfirmingDelete(null);
                        }}
                      >
                        Sim
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé e Cupom */}
        <div className="p-3 md:p-4 bg-white border-t flex flex-col gap-3 shrink-0 pb-[env(safe-area-inset-bottom)]">
          {!couponApplied && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Quer 10% na primeira compra?{" "}
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('openLeadPopup'));
                    }
                  }}
                  className="ml-2 text-primary underline decoration-dotted hover:opacity-80"
                >
                  Pegar cupom
                </button>
              </div>
              {items.length > 0 && (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Tem um cupom?" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="h-10 rounded-2xl text-sm flex-1"
                  />
                  <Button onClick={handleApplyCoupon} className="h-10 px-5 rounded-2xl text-sm font-bold shrink-0">
                    Aplicar
                  </Button>
                </div>
              )}
            </div>
          )}

          {couponApplied && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Tag className="w-3 h-3 text-primary" />
                <span className="text-[11px] font-bold text-primary">CUPOM: {couponApplied}</span>
              </div>
              <span className="text-[11px] font-bold text-green-600">- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
            </div>
          )}

          {!isUpsellInCart && items.length > 0 && upsellProduct && (
            <div className="mb-2 bg-white border rounded-2xl p-3 w-full shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Complemento seu Pedido</p>
              <div className="flex gap-3 items-center">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted/20">
                  <Image src={upsellProduct.images[0]} alt={upsellProduct.name} fill className="object-contain" />
                </div>
                <div className="flex-grow">
                  <h5 className="font-medium text-xs leading-tight line-clamp-2">{upsellProduct.name}</h5>
                  <p className="text-xs font-bold text-primary mt-1">R$ {upsellProduct.price.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
              <div className="mt-2">
                <Button 
                  onClick={handleAddUpsell}
                  size="sm"
                  className="h-9 w-full rounded-full text-[11px] font-bold"
                >
                  Comprar
                </Button>
              </div>
            </div>
          )}

          <div className="w-full space-y-2">
             <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
               <span>Subtotal</span>
               <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
             </div>
             {discountAmount > 0 && (
                <div className="flex justify-between items-center text-xs text-green-600 font-bold">
                  <span>Desconto aplicado</span>
                  <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                </div>
             )}
             <div className="flex justify-between items-center pt-2 border-t border-muted">
                <span className="text-muted-foreground font-bold text-sm">Total do Pedido</span>
                <span className="text-2xl font-black text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
             </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              disabled={items.length === 0}
              onClick={finalizeOrder}
              className="w-full h-11 rounded-full text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white border-none gap-2"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              FINALIZAR NO WHATSAPP
            </Button>
            <SheetClose asChild>
              <Button variant="outline" className="w-full h-10 rounded-full text-sm font-bold">
                CONTINUAR COMPRANDO
              </Button>
            </SheetClose>
          </div>

          <div className="flex justify-center items-center py-3 border-t border-muted gap-6 w-full">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              <RotateCcw className="w-4 h-4 text-primary/40" />
              <span>7 dias para <b className="text-foreground">troca grátis</b></span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              <ShieldCheck className="w-4 h-4 text-primary/40" />
              <span>Garantia de <b className="text-foreground">Maciez</b></span>
            </div>
          </div>

          
        </div>
      </SheetContent>
    </Sheet>
  );
}
