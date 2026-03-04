
"use client"

import { Instagram, Facebook, MessageCircle, Send, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import logo from '@/imagens/logo.png';
import { WhatsAppIcon } from '@/components/whatsapp-icon';

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showTyping2, setShowTyping2] = useState(false);
  const [showMessage2, setShowMessage2] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await supabase.from('leads').insert({
        email,
        source: 'newsletter_footer'
      });
      setSubmitted(true);
      setEmail('');
    } catch (error) {
      // Silently fail or handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const t1 = setTimeout(() => {
      if (!dismissed) setShowTyping(true);
    }, 3000);
    const t2 = setTimeout(() => {
      if (!dismissed) {
        setShowTyping(false);
        setShowMessage(true);
      }
    }, 4300);
    const t3 = setTimeout(() => {
      if (!dismissed) setShowTyping2(true);
    }, 6000);
    const t4 = setTimeout(() => {
      if (!dismissed) {
        setShowTyping2(false);
        setShowMessage2(true);
      }
    }, 7600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [dismissed]);

  return (
    <footer className="bg-white border-t border-primary/5 py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-10">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-8 group cursor-pointer">
              <Image 
                src={logo} 
                alt="Neném Chique Logo" 
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="text-2xl font-bold text-primary tracking-tight">Neném Chique</span>
            </Link>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 font-medium">
              Sua loja especializada em enxovais delicados e de alta qualidade. Cuidado e confiança para o primeiro dia de vida.
            </p>
            <div className="flex items-center gap-5">
              <a href="#" className="p-3 bg-primary/5 rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <title>Instagram</title>
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="p-3 bg-primary/5 rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <title>Facebook</title>
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://wa.me/5531999384130" className="p-3 bg-primary/5 rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <title>WhatsApp</title>
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-8 text-foreground tracking-tight uppercase tracking-widest text-xs">Mapa do Site</h4>
            <ul className="space-y-5">
              <li><button onClick={() => scrollToSection('checklist')} className="text-base text-muted-foreground hover:text-primary font-medium transition-colors">O Essencial</button></li>
              <li><button onClick={() => scrollToSection('produtos')} className="text-base text-muted-foreground hover:text-primary font-medium transition-colors">Coleções Favoritas</button></li>
              <li><button onClick={() => scrollToSection('depoimentos')} className="text-base text-muted-foreground hover:text-primary font-medium transition-colors">Depoimentos</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-8 text-foreground tracking-tight uppercase tracking-widest text-xs">Categorias</h4>
            <ul className="space-y-5">
              <li><Link href="/catalog?category=saida-maternidade" className="text-base text-muted-foreground hover:text-primary font-medium transition-colors">Saída de Maternidade</Link></li>
              <li><Link href="/catalog?category=kits" className="text-base text-muted-foreground hover:text-primary font-medium transition-colors">Kits Enxoval</Link></li>
              <li><Link href="/catalog?category=bodies" className="text-base text-muted-foreground hover:text-primary font-medium transition-colors">Bodies & Macacões</Link></li>
              <li><Link href="/catalog?category=acessorios" className="text-base text-muted-foreground hover:text-primary font-medium transition-colors">Acessórios</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-8 text-foreground tracking-tight uppercase tracking-widest text-xs">Newsletter</h4>
            <p className="text-base text-muted-foreground mb-6 font-medium leading-relaxed">Receba novidades e promoções exclusivas da Neném Chique.</p>
            {!submitted ? (
              <form onSubmit={handleNewsletter} className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="Seu melhor e-mail" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/30 border border-primary/10 rounded-2xl px-5 py-4 text-base w-full focus:ring-2 ring-primary outline-none transition-all"
                />
                <button 
                  disabled={loading}
                  className="bg-primary text-white rounded-2xl px-6 py-4 text-base font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Cadastrar Agora
                </button>
              </form>
            ) : (
              <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold">Bem-vinda à Neném Chique!</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-20 pt-10 border-t border-primary/5 text-center">
          <p className="text-sm text-muted-foreground font-medium opacity-70">
            © {new Date().getFullYear()} Neném Chique. Todos os direitos reservados.
          </p>
        </div>
      </div>
      <div className="fixed bottom-4 right-2 z-50">
        {!dismissed && (
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1.5 pointer-events-none">
            {showTyping && !showMessage && (
              <div className="relative bg-white px-2 py-1 rounded-xl shadow-xl border border-primary/10 w-12 flex items-center justify-center pointer-events-auto">
                <div className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '120ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '240ms' }} />
                </div>
                <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-t border-r border-primary/10 rotate-45" />
              </div>
            )}
            {showMessage && (
              <div className="relative inline-block w-fit bg-white p-2 rounded-xl shadow-xl border border-primary/10 animate-in fade-in duration-200 pointer-events-auto">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-[8px] font-black text-foreground/60 uppercase tracking-[0.18em] leading-none mb-1">Taynara</div>
                    <p className="text-[11px] text-foreground/90 leading-snug">Olá! Tudo bem?</p>
                  </div>
                  <button
                    aria-label="Fechar"
                    onClick={() => setDismissed(true)}
                    className="text-muted-foreground/60 hover:text-foreground transition-colors text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-primary/10 rotate-45" />
              </div>
            )}
            {showTyping2 && !showMessage2 && (
              <div className="relative bg-white px-2 py-1 rounded-xl shadow-xl border border-primary/10 w-12 flex items-center justify-center pointer-events-auto">
                <div className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '120ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '240ms' }} />
                </div>
                <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-t border-r border-primary/10 rotate-45" />
              </div>
            )}
            {showMessage2 && (
              <div className="relative inline-block w-fit bg-white p-2 rounded-xl shadow-xl border border-primary/10 animate-in fade-in duration-200 pointer-events-auto">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-[8px] font-black text-foreground/60 uppercase tracking-[0.18em] leading-none mb-1">Taynara</div>
                    <p className="text-[11px] text-foreground/90 leading-snug mb-2">Posso ajudar a montar seu enxoval? 💗</p>
                    <a
                      href="https://wa.me/5531999384130?text=Ol%C3%A1%2C%20quero%20ver%20a%20cole%C3%A7%C3%A3o%20:%29"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1.5 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap"
                    >
                      Quero ver coleção <Send className="w-3 h-3" />
                    </a>
                  </div>
                  <button
                    aria-label="Fechar"
                    onClick={() => setDismissed(true)}
                    className="text-muted-foreground/60 hover:text-foreground transition-colors text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-primary/10 rotate-45" />
              </div>
            )}
          </div>
        )}
        <a
          href="https://wa.me/5531999384130"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white rounded-full h-14 w-14 shadow-xl shadow-emerald-300/40 ring-1 ring-white/40 ring-offset-2 ring-offset-emerald-100 transition-transform duration-200 ease-out hover:scale-105 active:scale-95"
        >
          <WhatsAppIcon className="w-8 h-8 fill-white" />
        </a>
      </div>
    </footer>
  );
}
