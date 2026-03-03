'use client'

import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { ShoppingCart } from 'lucide-react';

export function FloatingCartButton() {
  const { itemCount, setIsCartOpen } = useCart();
  return (
    <div
      className="fixed z-[1000] right-4 bottom-24 md:right-8 md:bottom-10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Button
        size="lg"
        aria-label="Abrir carrinho"
        className="bg-primary hover:bg-primary/90 text-white rounded-full h-14 w-14 shadow-2xl p-0 border-none relative"
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-gradient text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-md">
            {itemCount}
          </span>
        )}
      </Button>
    </div>
  );
}
