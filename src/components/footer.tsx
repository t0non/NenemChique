
"use client"

import { Instagram, Facebook, MessageCircle, Send, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import logo from '@/imagens/logo.png';

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedTop, setCopiedTop] = useState(false);

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
  
  const handleCopyTopSite = async () => {
    try {
      await navigator.clipboard.writeText('https://topmarketingbh.com.br/');
      setCopiedTop(true);
      setTimeout(() => setCopiedTop(false), 2000);
    } catch {}
  };

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
                loading="lazy"
              />
              <span className="text-2xl font-bold text-primary tracking-tight">Neném Chique</span>
            </Link>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 font-medium">
              Sua loja especializada em enxovais delicados e de alta qualidade. Cuidado e confiança para o primeiro dia de vida.
            </p>
            <div className="flex items-center gap-5">
              <a href="https://www.instagram.com/nenemchiquee/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-3 bg-primary/5 rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://www.facebook.com/nenemchiquee" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-3 bg-primary/5 rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://wa.me/5531999384130" aria-label="WhatsApp" className="p-3 bg-primary/5 rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
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
          <div className="mt-2 flex items-center justify-center gap-2 text-xs">
            <span className="text-muted-foreground">Feito pela</span>
            <a href="https://topmarketingbh.com.br/" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">
              Top Marketing BH
            </a>
            <button onClick={handleCopyTopSite} className="px-2 py-1 rounded-full border text-primary hover:bg-primary/5 transition-colors">
              {copiedTop ? 'Copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
