"use client"

import { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { useData } from '@/context/data-context';

export function TopBanner() {
  const [remaining, setRemaining] = useState(0);
  const { settings } = useData();

  const handleOpenDiscount = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('openLeadPopup'));
    }
  };
  
  const items = settings?.marqueeItems || [];
  const displayItems = useMemo(() => [...items, ...items, ...items], [items]);

  // Contagem regressiva baseada na data ou 2h padrão
  useEffect(() => {
    const promotionEnd = settings?.promotionCountdown ? new Date(settings.promotionCountdown).getTime() : Date.now() + 2 * 60 * 60 * 1000;
    
    const tick = () => {
      const now = Date.now();
      setRemaining(Math.max(0, promotionEnd - now));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [settings?.promotionCountdown]);

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');

  return (
    <div className="sticky top-0 z-[1000] w-full shadow-sm overflow-hidden">
      {/* Marquee Principal */}
      <div className="bg-pink-gradient border-b border-white/10 py-2 md:py-3 overflow-hidden whitespace-nowrap">
        <div className="flex items-center animate-marquee">
          {displayItems.map((item, index) => (
            <div key={index} className="flex items-center">
              <span className="text-[11px] md:text-[13px] font-light uppercase tracking-[2px] text-white">
                {item}
              </span>
              <span className="mx-8 md:mx-12 text-[14px] md:text-[18px] font-bold text-primary opacity-40">
                •
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Barra de Oferta + Contagem regressiva */}
      <div className="bg-[#FDF2F4] border-b border-[#F7C1CD] py-1.5 md:py-2.5">
        <div className="container-standard flex flex-wrap items-center justify-center gap-2 md:gap-4 text-center">
          <span className="text-[11px] md:text-[12px] font-light tracking-[1px] text-foreground/70 uppercase">
            {settings?.promotionText || "✨ 10% OFF NA SUA ESTREIA! REGISTRE-SE E LIBERE SEU CUPOM AGORA."}
          </span>
          <button
            onClick={handleOpenDiscount}
            className="px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] font-bold transition-all duration-300 bg-[#6CA0CF] text-white hover:opacity-90"
          >
            Ganhar 10%
          </button>

          <div className="hidden md:flex items-center gap-2 ml-4 text-primary">
            <Clock className="w-4 h-4" />
            <span className="text-[12px] font-bold tracking-[0.1em]">
              Termina em {hh}:{mm}:{ss}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
