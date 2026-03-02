
"use client"

import { useCart } from '@/context/cart-context';
import { PRODUCTS } from '@/lib/data';
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
import { ShoppingCart, Trash2, ArrowRight, CheckCircle2, ChevronLeft, Sparkles, Tag, RotateCcw, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { WhatsAppIcon } from './whatsapp-icon';
import { cn } from '@/lib/utils';

export function CartSheet() {
  const { items, removeFromCart, subtotal, total, itemCount, addToCart, isCartOpen, setIsCartOpen, couponApplied, applyCoupon, discountAmount } = useCart();
  const [couponInput, setCouponInput] = useState("");
  
  const SHIPPING_THRESHOLD = 300;
  const remainingForFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  const progressPercentage = Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100);

  const upsellProduct = PRODUCTS.find(p => p.id === 'p4') || PRODUCTS[3];
  const isUpsellInCart = useMemo(() => items.some(item => item.id === upsellProduct.id), [items, upsellProduct.id]);

  const handleAddUpsell = () => {
    addToCart(upsellProduct);
  };

  const handleApplyCoupon = () => {
    applyCoupon(couponInput);
    setCouponInput("");
  };

  const finalizeOrder = () => {
    const telefoneLoja = "5531999384130";
    
    // Início da Mensagem com tom acolhedor
    let message = "✨ *NOVO PEDIDO - ENXOVAL NUVEM* ✨\n\n";
    message += "Olá! Gostaria de finalizar meu enxoval com vocês. ☁️🍼\n\n";
    
    message += "🛍️ *ITENS DO MEU CARRINHO:*\n";
    message += "__________________________\n\n";

    // Itens principais e Upsell juntos na mesma lista clara
    items.forEach(item => {
      let subtotalItem = item.price * item.quantity;
      let precoFormatado = subtotalItem.toFixed(2).replace('.', ',');
      message += `✅ ${item.quantity}x ${item.name.toUpperCase()}\n`;
      message += `   └─ R$ ${precoFormatado}\n\n`;
    });

    message += "__________________________\n\n";

    // Seção de Descontos e Ofertas
    if (couponApplied) {
      let descontoFormatado = discountAmount.toFixed(2).replace('.', ',');
      message += `🎟️ *CUPOM APLICADO:* (${couponApplied})\n`;
      message += `   └─ - R$ ${descontoFormatado}\n\n`;
    }

    // Fechamento com Destaque
    let totalFormatado = total.toFixed(2).replace('.', ',');
    message += `💰 *TOTAL A PAGAR: R$ ${totalFormatado}*\n\n`;
    message += "📍 *Próximo passo:*\n";
    message += "Aguardo o link para pagamento e a previsão de entrega! 🥰";
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${telefoneLoja}?text=${encodedMessage}`, '_blank');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/5">
          <ShoppingCart className="w-6 h-6 text-primary" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-gradient text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-md">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l-primary/10">
        <SheetHeader className="p-4 border-b bg-white flex flex-row items-center gap-4 space-y-0">
          <SheetClose asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground gap-1">
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>
          </SheetClose>
          <SheetTitle className="text-lg font-bold text-foreground">
            Meu Carrinho
          </SheetTitle>
        </SheetHeader>

        {/* Frete Grátis */}
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex justify-between items-end mb-2">
            <p className="text-xs font-medium text-foreground">
              {remainingForFreeShipping > 0 ? (
                <>Faltam apenas <span className="text-primary font-bold">R$ {remainingForFreeShipping.toFixed(2).replace('.', ',')}</span> para <b>frete grátis</b></>
              ) : (
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Parabéns! Você ganhou frete grátis
                </span>
              )}
            </p>
            <span className="text-[10px] font-bold text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-muted rounded-full" />
        </div>

        {/* Itens */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20">
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
                <div key={item.id} className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-primary/5">
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border border-muted">
                    <Image src={item.images[0]} alt={item.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-primary font-bold mt-1">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">Qtd: {item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé e Cupom */}
        <div className="p-6 bg-white border-t flex flex-col gap-4">
          {/* Campo de Cupom */}
          {items.length > 0 && !couponApplied && (
            <div className="flex gap-2 w-full">
              <Input 
                placeholder="Tem um cupom?" 
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="h-10 rounded-xl text-xs flex-1"
              />
              <Button onClick={handleApplyCoupon} className="h-10 px-4 rounded-xl text-xs font-bold shrink-0">Aplicar</Button>
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

          {!isUpsellInCart && items.length > 0 && (
            <div className="mb-2 bg-[#F9FBFF] border-2 border-dashed border-primary/20 rounded-3xl p-4 relative overflow-hidden w-full">
               <div className="mb-3 flex items-center gap-2">
                 <Sparkles className="w-3 h-3 text-primary" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Mães também levam:</p>
               </div>
               <div className="flex gap-4 items-center">
                 <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-white">
                   <Image src={upsellProduct.images[0]} alt={upsellProduct.name} fill className="object-cover" />
                 </div>
                 <div className="flex-grow">
                    <h5 className="font-bold text-xs leading-tight mb-1">{upsellProduct.name}</h5>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-primary">R$ {upsellProduct.price.toFixed(2).replace('.', ',')}</p>
                      <Button 
                        onClick={handleAddUpsell}
                        size="sm"
                        className="h-8 px-4 bg-pink-gradient text-white hover:opacity-90 rounded-full text-[10px] font-bold shadow-md"
                      >
                        + ADICIONAR
                      </Button>
                    </div>
                 </div>
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
          
          <Button 
            disabled={items.length === 0}
            onClick={finalizeOrder}
            className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-base gap-3 shadow-xl shadow-green-100 transition-all border-none"
          >
            <WhatsAppIcon className="w-5 h-5 fill-white" />
            FINALIZAR NO WHATSAPP
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex justify-around items-center py-4 border-t border-muted gap-2 w-full">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              <RotateCcw className="w-4 h-4 text-primary/40" />
              <span>7 dias para <b className="text-foreground">troca grátis</b></span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              <ShieldCheck className="w-4 h-4 text-primary/40" />
              <span>Garantia de <b className="text-foreground">Maciez</b></span>
            </div>
          </div>

          <SheetClose asChild>
            <Button variant="ghost" className="w-full h-8 text-[10px] font-bold text-muted-foreground hover:bg-transparent tracking-widest uppercase">
              Continuar Explorando
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
