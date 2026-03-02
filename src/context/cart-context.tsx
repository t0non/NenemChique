"use client"

import React, { createContext, useContext, useState, useMemo } from 'react';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  couponApplied: string | null;
  applyCoupon: (code: string) => boolean;
  discountAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const { toast } = useToast();

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setItems([]);

  const applyCoupon = (code: string) => {
    if (code.toUpperCase() === "PRIMEIRACOMPRA") {
      setCouponApplied(code.toUpperCase());
      import('@/lib/confetti').then(m => m.dispararConfete()).catch(() => {});
      toast({
        title: "Cupom aplicado!",
        description: "Você ganhou 10% de desconto na sua primeira compra. ✨",
      });
      return true;
    }
    toast({
      variant: "destructive",
      title: "Cupom inválido",
      description: "Verifique o código e tente novamente.",
    });
    return false;
  };

  const subtotal = useMemo(() => 
    items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  [items]);

  const discountAmount = useMemo(() => 
    couponApplied === "PRIMEIRACOMPRA" ? subtotal * 0.10 : 0,
  [subtotal, couponApplied]);

  const total = subtotal - discountAmount;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      subtotal,
      total, 
      itemCount,
      isCartOpen,
      setIsCartOpen,
      couponApplied,
      applyCoupon,
      discountAmount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
