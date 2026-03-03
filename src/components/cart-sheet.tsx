
"use client"

import { useCart } from '@/context/cart-context';
import { useData } from '@/context/data-context';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, Trash2, ArrowRight, CheckCircle2, ChevronLeft, Sparkles, Tag, RotateCcw, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { WhatsAppIcon } from './whatsapp-icon';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function CartSheet() {
  const { items, removeFromCart, subtotal, total, itemCount, addToCart, isCartOpen, setIsCartOpen, couponApplied, applyCoupon, discountAmount } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const { products: allProducts } = useData();

  const SHIPPING_THRESHOLD = 300;
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

  const handleApplyCoupon = () => {
    applyCoupon(couponInput);
    setCouponInput("");
  };

  const { orderCode } = useCart();

  const finalizeOrder = async () => {
    const telefoneLoja = "5531999384130";
    
    // 1. Atualizar status para 'pending_payment' no banco antes de enviar pro WhatsApp
    try {
      if (orderCode) {
        await supabase
          .from('orders')
          .update({ status: 'pending_payment', updated_at: new Date().toISOString() })
          .eq('order_code', orderCode);
      }
    } catch (e) {
      console.error('Erro ao atualizar status do pedido:', e);
    }

    // Início da Mensagem com tom acolhedor
    let message = "✨ *NOVO PEDIDO - NENÉM CHIQUE* ✨\n\n";
    message += `🆔 *CÓDIGO: ${orderCode || 'S/N'}*\n`;
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
      <SheetContent side="right" className="w-[80vw] sm:max-w-md flex flex-col p-0 border-l-primary/10 rounded-l-2xl">
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
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border border-muted bg-muted/10">
                    <Image src={item.images[0]} alt={item.name} fill className="object-contain" sizes="64px" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-primary font-bold mt-1">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">Qtd: {item.quantity}</span>
                      
                      {confirmingDelete === item.id ? (
                        <div className="flex items-center gap-1.5 bg-red-50/50 p-1 rounded-lg animate-in fade-in slide-in-from-right-2">
                          <span className="text-[10px] font-bold text-red-500 ml-1">Excluir?</span>
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
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg"
                          onClick={() => setConfirmingDelete(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé e Cupom */}
        <div className="p-6 bg-white border-t flex flex-col gap-4 shrink-0">
          {/* Campo de Cupom */}
          {items.length > 0 && !couponApplied && (
            <div className="space-y-3">
              <div className="flex justify-end px-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1.5 group">
                      <Sparkles className="w-3 h-3 group-hover:animate-pulse" />
                      Cupom Aqui?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-[90vw] max-w-[380px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl z-[1002]">
                    <div className="bg-pink-gradient p-8 text-white text-center space-y-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                        <Tag className="w-8 h-8 text-white" />
                      </div>
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white leading-tight">
                          QUER UM CUPOM <br/> EXCLUSIVO? 🎁
                        </DialogTitle>
                      </DialogHeader>
                      <p className="text-white/90 text-sm font-medium leading-relaxed">
                        Participe do nosso grupo VIP de mamães! O cupom de primeira compra está fixado na <b>descrição do grupo</b>.
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-blue-600 font-bold text-xs">1</span>
                          </div>
                          <p className="text-[11px] font-bold text-blue-900">Clique no botão abaixo</p>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-2xl border border-pink-100">
                          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-pink-600 font-bold text-xs">2</span>
                          </div>
                          <p className="text-[11px] font-bold text-pink-900">Leia a descrição do grupo</p>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-2xl border border-green-100">
                          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-green-600 font-bold text-xs">3</span>
                          </div>
                          <p className="text-[11px] font-bold text-green-900">Copie o código e use aqui!</p>
                        </div>
                      </div>

                      <Button asChild className="w-full h-12 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-sm gap-2 shadow-lg shadow-green-100 border-none">
                        <a href="https://chat.whatsapp.com/SEU_LINK_AQUI" target="_blank" rel="noopener noreferrer">
                          <WhatsAppIcon className="w-4 h-4 fill-white" />
                          ENTRAR NO GRUPO VIP
                        </a>
                      </Button>
                      
                      <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest">
                        Ofertas exclusivas todos os dias ☁️
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex gap-2 w-full">
                <Input 
                  placeholder="Tem um cupom?" 
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="h-10 rounded-xl text-xs flex-1"
                />
                <Button onClick={handleApplyCoupon} className="h-10 px-4 rounded-xl text-xs font-bold shrink-0">Aplicar</Button>
              </div>
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
            <div className="mb-2 bg-[#F9FBFF] border-2 border-dashed border-primary/20 rounded-3xl p-4 relative overflow-hidden w-full">
               <div className="mb-3 flex items-center gap-2">
                 <Sparkles className="w-3 h-3 text-primary" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Mães também levam:</p>
               </div>
               <div className="flex gap-4 items-center">
                 <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-white bg-white/50">
                   <Image src={upsellProduct.images[0]} alt={upsellProduct.name} fill className="object-contain" />
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
