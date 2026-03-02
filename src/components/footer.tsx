
"use client"

import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white border-t border-primary/5 py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-10">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-8 group cursor-pointer">
              <Image 
                src="/imagens/logo.png" 
                alt="EnxovalNuvem Logo" 
                width={36}
                height={36}
                className="object-contain"
                unoptimized
              />
              <span className="text-2xl font-bold text-primary tracking-tight">EnxovalNuvem</span>
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
            <p className="text-base text-muted-foreground mb-6 font-medium leading-relaxed">Receba novidades e promoções exclusivas da nossa nuvem.</p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Seu melhor e-mail" 
                className="bg-muted/30 border border-primary/10 rounded-2xl px-5 py-4 text-base w-full focus:ring-2 ring-primary outline-none transition-all"
              />
              <button className="bg-primary text-white rounded-2xl px-6 py-4 text-base font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10">Cadastrar Agora</button>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-10 border-t border-primary/5 text-center">
          <p className="text-sm text-muted-foreground font-medium opacity-70">
            © {new Date().getFullYear()} EnxovalNuvem. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
