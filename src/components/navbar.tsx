
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { WhatsAppIcon } from "@/components/whatsapp-icon"
import { WHATSAPP_URL } from "@/lib/whatsapp";
import { User } from 'lucide-react';
import logo from '@/imagens/logo.png';
import { useEffect, useState } from 'react';

// Lazy load: o carrinho só é necessário após interação do usuário
const CartSheet = dynamic(
  () => import('./cart-sheet').then(m => m.CartSheet),
  { ssr: false }
);

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
    <nav className="sticky top-[44px] z-[999] w-full bg-white transition-all duration-300">
      <div className="container-standard h-[60px] sm:h-[72px] md:h-[88px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-[52px] h-[52px] sm:w-[72px] sm:h-[72px] md:w-[104px] md:h-[104px] flex items-center justify-center">
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

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
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
          <Button variant="default" className="gap-2 rounded-full font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-6 hidden md:flex h-11 transition-colors" asChild>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="track-btn-whatsapp" data-gtm="whatsapp">
              <WhatsAppIcon className="w-5 h-5 fill-white" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
