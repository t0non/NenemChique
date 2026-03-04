
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
import { ShoppingCart, Trash2, ArrowRight, CheckCircle2, ChevronLeft, Sparkles, Tag, RotateCcw, ShieldCheck, X as CloseIcon } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { WhatsAppIcon } from './whatsapp-icon';
import { cn, formatPhoneBR, digitsOnlyPhone } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function CartSheet() {
  const { items, removeFromCart, subtotal, total, itemCount, addToCart, isCartOpen, setIsCartOpen, couponApplied, applyCoupon, discountAmount } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const { products: allProducts, coupons } = useData();

  // Mini lead capture (no carrinho)
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [copyOk, setCopyOk] = useState(false);

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

  const handleApplyCoupon = async () => {
    const ok = await applyCoupon(couponInput);
    if (ok) setCouponInput("");
  };

  const { orderCode } = useCart();

  // Seleciona o melhor cupom ativo (não expirado)
  const activeCouponCode = useMemo(() => {
    if (!coupons || coupons.length === 0) return null;
    const now = Date.now();
    const valid = coupons.filter(c => !c.expiresAt || new Date(c.expiresAt).getTime() >= now);
    if (valid.length === 0) return null;
    // Mais recente primeiro (se createdAt existir)
    return valid
      .sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      })[0].code;
  }, [coupons]);

  const submitLeadFromCart = async () => {
    if (!leadName || !leadPhone) return;
    setLeadLoading(true);
    try {
      await supabase.from('leads').insert({
        name: leadName,
        whatsapp: digitsOnlyPhone(leadPhone),
        source: 'cart_popup_discount',
        data: { coupon: activeCouponCode || null }
      });
      setLeadSubmitted(true);
    } catch (e) {
      setLeadSubmitted(true); // mesmo com erro, não travar UX
    } finally {
      setLeadLoading(false);
    }
  };

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
    let message = "🎀 *NOVO PEDIDO - NENÉM CHIQUE* 🎀\n";
    message += `📦 Pedido: *${orderCode || 'S/N'}*\n`;
    message += "------------------------------------\n";
    message += "Olá! Quero finalizar minha compra pelo WhatsApp. 🍼✨\n\n";
    message += "🛍️ *Itens do carrinho*\n";
    message += "------------------------------------\n";

    // Itens principais e Upsell juntos na mesma lista clara
    items.forEach(item => {
      let subtotalItem = item.price * item.quantity;
      let precoFormatado = subtotalItem.toFixed(2).replace('.', ',');
      const parts = item.name.split(' · ');
      const base = parts[0];
      const variants = parts.slice(1).join(' • ');
      message += `• ${item.quantity}x *${base}*\n`;
      if (variants) {
        message += `   ├ Cor/Tamanho: ${variants}\n`;
      }
      message += `   └ Subtotal: R$ ${precoFormatado}\n`;
    });

    message += "------------------------------------\n\n";

    // Seção de Descontos e Ofertas
    if (couponApplied) {
      let descontoFormatado = discountAmount.toFixed(2).replace('.', ',');
      message += `🎟️ Cupom aplicado: *${couponApplied}*\n`;
      message += `   └ Desconto: - R$ ${descontoFormatado}\n\n`;
    }

    // Fechamento com Destaque
    let totalFormatado = total.toFixed(2).replace('.', ',');
    message += `💰 *Total:* R$ ${totalFormatado}\n\n`;
    message += "📨 Aguardo o link para pagamento e previsão de entrega. Obrigado! 💗";
    
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
      <SheetContent side="right" className="w-[380px] max-w-[92vw] h-[100dvh] md:h-screen flex flex-col p-0 border-l-primary/10 rounded-l-2xl z-[1002]">
        <SheetHeader className="p-4 border-b bg-white flex items-center justify-between space-y-0">
          <SheetClose asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground gap-1">
              <ChevronLeft className="w-4 h-4" />
              Fechar
            </Button>
          </SheetClose>
          <SheetTitle className="text-sm font-bold text-foreground uppercase tracking-widest">
            Carrinho de Compras
          </SheetTitle>
          <div className="w-8" />
        </SheetHeader>

        {/* Frete Grátis */}
        <div className="p-4 bg-blue-50 border-b">
          <p className="text-[11px] font-medium text-foreground mb-1">
            {remainingForFreeShipping > 0 ? (
              <>Falta apenas <span className="text-primary font-bold">R$ {remainingForFreeShipping.toFixed(2).replace('.', ',')}</span> para obter <b>frete grátis</b></>
            ) : (
              <span className="text-green-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Parabéns! Você ganhou frete grátis
              </span>
            )}
          </p>
          <Progress value={progressPercentage} className="h-1.5 bg-muted rounded-full" />
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
                <div key={item.id} className="flex gap-3 bg-white p-3 rounded-2xl shadow-sm border border-primary/5 items-start">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-muted bg-muted/10">
                    <Image src={item.images[0]} alt={item.name} fill className="object-contain" sizes="64px" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-primary font-bold mt-1">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="h-6 w-6 rounded-full bg-muted/70 text-foreground/80 text-[11px] flex items-center justify-center font-bold">
                      {item.quantity}
                    </div>
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
                        className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full"
                        onClick={() => setConfirmingDelete(item.id)}
                        aria-label="Remover item"
                      >
                        <CloseIcon className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé e Cupom */}
        <div className="p-6 bg-white border-t flex flex-col gap-4 shrink-0">
          {/* Oferta de Cupom (sempre visível se não houver cupom aplicado) */}
          {!couponApplied && (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <div className="text-[11px] font-bold text-foreground/70 uppercase tracking-widest">
                  Quer 10% na primeira compra?
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 group px-3 py-1.5 rounded-full bg-primary text-white shadow hover:opacity-90">
                      <Sparkles className="w-3 h-3 group-hover:animate-pulse" />
                      Cupom Aqui
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-[92vw] max-w-[360px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl z-[1002]">
                    <div className="bg-pink-gradient p-6 text-white text-center space-y-2">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black text-white leading-tight">
                          Cupom de 10% 🎁
                        </DialogTitle>
                      </DialogHeader>
                      <p className="text-white/90 text-xs font-medium leading-relaxed">
                        Preencha seus dados e libere seu código exclusivo.
                      </p>
                    </div>
                    <div className="p-5 bg-white space-y-3">
                      {!leadSubmitted ? (
                        <>
                          <Input 
                            placeholder="Seu nome"
                            value={leadName}
                            onChange={(e) => setLeadName(e.target.value)}
                            className="h-11 rounded-xl text-sm"
                          />
                          <Input 
                            type="tel"
                            placeholder="Seu WhatsApp"
                            value={leadPhone}
                            onChange={(e) => setLeadPhone(formatPhoneBR(e.target.value))}
                            className="h-11 rounded-xl text-sm"
                          />
                          <Button 
                            onClick={submitLeadFromCart}
                            disabled={leadLoading}
                            className="w-full h-11 rounded-xl bg-pink-gradient text-white font-black text-sm gap-2 shadow-lg shadow-pink-100 border-none"
                          >
                            {leadLoading ? 'Enviando...' : 'Liberar meu cupom'}
                          </Button>
                          <p className="text-[9px] text-center text-muted-foreground font-medium uppercase tracking-widest">
                            Não enviamos spam
                          </p>
                        </>
                      ) : (
                        <div className="space-y-3 text-center">
                          {activeCouponCode ? (
                            <>
                              <p className="text-sm font-medium text-foreground">Parabéns! Seu cupom:</p>
                              <div className="flex items-center justify-between gap-2 bg-muted/30 border border-dashed border-primary/20 rounded-xl px-3 py-2">
                                <span className="text-lg font-black text-primary tracking-widest uppercase">{activeCouponCode}</span>
                                <Button 
                                  variant="default"
                                  className="h-9 px-3 rounded-lg text-xs font-bold"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(activeCouponCode);
                                      setCopyOk(true);
                                      setTimeout(() => setCopyOk(false), 2000);
                                    } catch {}
                                  }}
                                >
                                  {copyOk ? 'Copiado!' : 'Copiar'}
                                </Button>
                              </div>
                              <p className="text-[10px] text-muted-foreground">Use no campo de cupom do carrinho.</p>
                            </>
                          ) : (
                            <p className="text-sm font-medium text-foreground">Cadastro realizado. Assim que liberarmos um cupom, você verá aqui.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {items.length > 0 && (
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
              className="w-full h-12 rounded-full text-sm font-bold bg-gradient-to-br from-emerald-500 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white border-none gap-2"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              FINALIZAR NO WHATSAPP
            </Button>
            <SheetClose asChild>
              <Button variant="outline" className="w-full h-11 rounded-full text-xs font-bold uppercase tracking-widest">
                CONTINUAR COMPRANDO
              </Button>
            </SheetClose>
          </div>

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

          
        </div>
      </SheetContent>
    </Sheet>
  );
}
