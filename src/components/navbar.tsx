
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CartSheet } from './cart-sheet';
import { WhatsAppIcon } from './whatsapp-icon';
import { User } from 'lucide-react';
import logo from '@/imagens/logo.png';
import { useEffect, useState } from 'react';

export function Navbar() {
  const [isLogged, setIsLogged] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const logged = localStorage.getItem('nenem_is_logged') === 'true';
    const name = localStorage.getItem('nenem_user_name') || '';
    setIsLogged(logged);
    setUserName(name);
  }, []);
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-[44px] z-[999] w-full bg-white/80 backdrop-blur-md border-b border-primary/10 shadow-sm">
      <div className="container-standard h-[72px] sm:h-[88px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-[72px] h-[72px] sm:w-[104px] sm:h-[104px] flex items-center justify-center">
             <Image 
              src={logo}
              alt="Neném Chique Logo" 
              fill
              className="object-contain"
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
          <Link href="/login" className="flex items-center gap-2 group">
            <div className="hidden sm:flex flex-col items-end">
              {isLogged && (
                <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Olá, {userName.split(' ')[0]}</span>
              )}
              <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">{isLogged ? 'Minha Conta' : 'Entrar'}</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5">
              <User className={`w-6 h-6 ${isLogged ? 'text-primary' : 'text-foreground/70'}`} />
            </Button>
          </Link>
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
