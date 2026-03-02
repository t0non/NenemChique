"use client"

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function TopBanner() {
  const [copied, setCopied] = useState(false);
  
  const items = [
    "FRETE GRÁTIS NAS COMPRAS ACIMA DE R$ 299",
    "MONTE O ENXOVAL COMPLETO E GANHE O ENVIO",
    "CONDIÇÃO ESPECIAL POR TEMPO LIMITADO",
    "MAIS DE 2.000 MÃES JÁ APROVARAM"
  ];

  const displayItems = [...items, ...items, ...items];

  const copyCoupon = () => {
    navigator.clipboard.writeText("PRIMEIRACOMPRA");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sticky top-0 z-[1000] w-full shadow-sm">
      {/* Marquee Principal */}
      <div className="bg-pink-gradient border-b border-white/10 py-3 overflow-hidden whitespace-nowrap">
        <div className="flex items-center animate-marquee">
          {displayItems.map((item, index) => (
            <div key={index} className="flex items-center">
              <span className="text-[13px] font-light uppercase tracking-[2px] text-white">
                {item}
              </span>
              <span className="mx-12 text-[18px] font-bold text-primary opacity-40">
                •
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Barra de Cupom */}
      <div className="bg-[#FDF2F4] border-b border-[#F7C1CD] py-2.5">
        <div className="container-standard flex flex-wrap items-center justify-center gap-4 text-center">
          <span className="text-[12px] font-light tracking-[1px] text-foreground/70 uppercase">
            ✨ 10% OFF NA SUA ESTREIA! USE O CUPOM:
          </span>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-dashed border-primary px-3 py-1 text-primary font-bold rounded-md text-[13px] tracking-wider">
              PRIMEIRACOMPRA
            </div>
            <button 
              onClick={copyCoupon}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold transition-all duration-300 ${
                copied ? 'bg-green-500 text-white' : 'bg-[#6CA0CF] text-white hover:opacity-90'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  COPIADO!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  COPIAR
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
