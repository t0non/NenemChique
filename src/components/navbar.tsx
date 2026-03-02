
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CartSheet } from './cart-sheet';
import { WhatsAppIcon } from './whatsapp-icon';
import logo from '@/imagens/logo.png';

export function Navbar() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-[44px] z-[999] w-full bg-white/80 backdrop-blur-md border-b border-primary/10 shadow-sm">
      <div className="container-standard h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
             <Image 
              src={logo}
              alt="EnxovalNuvem Logo" 
              fill
              className="object-contain transition-transform group-hover:scale-110"
              priority
            />
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center gap-10">
          <button onClick={() => scrollToSection('checklist')} className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors tracking-wide uppercase">O Essencial</button>
          <button onClick={() => scrollToSection('produtos')} className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors tracking-wide uppercase">Coleções</button>
          <button onClick={() => scrollToSection('depoimentos')} className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors tracking-wide uppercase">Avaliações</button>
        </div>

        <div className="flex items-center gap-4">
          <CartSheet />
          <Button variant="default" className="gap-2 rounded-xl font-bold bg-pink-gradient text-white hover:opacity-90 border-none px-6 shadow-md hidden md:flex h-12" asChild>
            <a href="https://wa.me/5531999384130" target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="w-5 h-5 fill-white" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
