"use client"

import { useState, useEffect } from 'react';
import { X, Gift, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

export function LeadCapturePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    
    // Salvar no Supabase
    try {
      await supabase.from('leads').insert({
        email: email,
        source: 'popup_discount',
        data: { coupon: 'BEMVINDA10' }
      });
    } catch (dbError) {
      // Silently fail or handle error gracefully
    }
    
    localStorage.setItem('hasSeenLeadPopup', 'true');
    setSubmitted(true);
    setLoading(false);
    
    // Fechar após 3 segundos se tiver sucesso
    setTimeout(() => {
      setIsOpen(false);
    }, 3000);
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
                    type="email" 
                    placeholder="Seu melhor e-mail" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
              <div className="text-center py-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Cupom Enviado!</h3>
                <p className="text-muted-foreground">Verifique seu e-mail em instantes. Boas compras!</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
