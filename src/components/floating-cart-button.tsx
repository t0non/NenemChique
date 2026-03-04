'use client'

import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { ShoppingCart } from 'lucide-react';

export function FloatingCartButton() {
  const { itemCount, setIsCartOpen } = useCart();
  return (
    <div
      className="fixed z-[40] right-2 bottom-24 md:right-2 md:bottom-24"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Button
        size="lg"
        aria-label="Abrir carrinho"
        className={`bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white rounded-full h-14 w-14 shadow-xl shadow-rose-300/40 ring-1 ring-white/40 ring-offset-2 ring-offset-rose-100 transition-transform duration-200 ease-out hover:scale-105 active:scale-95 p-0 relative`}
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingCart className="w-8 h-8" />
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center justify-center shadow-lg ring-2 ring-white">
            {itemCount}
          </span>
        )}
      </Button>
    </div>
  );
}
