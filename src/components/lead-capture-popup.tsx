"use client"

import { useState, useEffect } from 'react';
import { X, Gift, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { formatPhoneBR, digitsOnlyPhone } from '@/lib/utils';

export function LeadCapturePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  useEffect(() => {
    // Mostrar o popup após 15 segundos
    const timer = setTimeout(() => {
      const hasSeenPopup = localStorage.getItem('hasSeenLeadPopup');
      if (!hasSeenPopup) {
        setIsOpen(true);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  // Buscar um cupom ativo e não expirado
  useEffect(() => {
    const loadActiveCoupon = async () => {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('active', true);
        if (!error && data && data.length > 0) {
          const now = Date.now();
          const valid = data
            .filter((c: any) => !c.expires_at || new Date(c.expires_at).getTime() >= now)
            .sort((a: any, b: any) => {
              const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
              const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
              return bd - ad;
            });
          if (valid.length > 0) {
            setCouponCode(valid[0].code);
          } else {
            setCouponCode(null);
          }
        } else {
          setCouponCode(null);
        }
      } catch {
        setCouponCode(null);
      }
    };
    loadActiveCoupon();
  }, []);

  useEffect(() => {
    const openHandler = () => {
      setIsOpen(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('openLeadPopup', openHandler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('openLeadPopup', openHandler as EventListener);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    setLoading(true);
    
    // Salvar no Supabase
    try {
      await supabase.from('leads').insert({
        name: name,
        whatsapp: digitsOnlyPhone(phone),
        source: 'popup_discount',
        data: { coupon: couponCode || null }
      });
    } catch (dbError) {
      // Silently fail or handle error gracefully
    }
    
    localStorage.setItem('hasSeenLeadPopup', 'true');
    setSubmitted(true);
    setLoading(false);
    
    // Removido o fechamento automático para a pessoa poder copiar o cupom
  };

  const closePopup = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenLeadPopup', 'true');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-[32px] bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Presente para o seu Bebê!</DialogTitle>
          <DialogDescription>Receba um cupom de desconto de 10% para sua primeira compra.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <button 
            onClick={closePopup}
            className="absolute right-4 top-4 z-20 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="bg-pink-gradient p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Gift className="w-64 h-64 -ml-20 -mt-20 rotate-12" />
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Presente para o seu Bebê!</h2>
              <p className="text-white/80 text-lg">Ganhe 10% de desconto na sua primeira compra em nossa nuvem.</p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center mb-4">Onde enviamos seu cupom?</p>
                  <Input 
                    type="text" 
                    placeholder="Seu nome" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 rounded-2xl border-muted bg-muted/20 px-6 text-lg focus:ring-primary"
                  />
                  <Input 
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    required
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneBR(e.target.value))}
                    className="h-14 rounded-2xl border-muted bg-muted/20 px-6 text-lg focus:ring-primary"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 rounded-full text-lg font-bold gap-3 shadow-xl shadow-primary/20 bg-pink-gradient border-none text-white hover:scale-[1.02] transition-transform"
                >
                  {loading ? 'Enviando...' : (
                    <>
                      Quero meu Desconto
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground opacity-60">
                  Fique tranquila, não enviamos spam. Apenas carinho e promoções.
                </p>
              </form>
            ) : (
              <div className="text-center py-4 animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">Parabéns! 🎉</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {couponCode ? 'Seu cupom de 10% foi liberado:' : 'Cadastro realizado com sucesso.'}
                </p>
                
                {couponCode ? (
                  <div className="bg-muted/30 border-2 border-dashed border-primary/20 rounded-2xl p-3 md:p-4 mb-6 relative group flex items-center justify-between gap-3">
                    <span className="text-xl md:text-2xl font-black text-primary tracking-widest uppercase">{couponCode}</span>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(couponCode);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch (_) {}
                      }}
                      className="px-3 py-2 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90"
                    >
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                ) : null}

                <Button 
                  onClick={() => setIsOpen(false)}
                  className="w-full h-12 rounded-full font-bold bg-pink-gradient border-none text-white"
                >
                  Começar a Comprar
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
