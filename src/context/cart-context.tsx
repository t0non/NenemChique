"use client"

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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
  syncCartWithDB: () => Promise<void>;
  orderCode: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const { toast } = useToast();

  const subtotalAmount = useMemo(() => 
    items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  [items]);

  const discountAmount = useMemo(() => 
    couponApplied === "PRIMEIRACOMPRA" ? subtotalAmount * 0.10 : 0,
  [subtotalAmount, couponApplied]);

  const totalAmount = useMemo(() => subtotalAmount - discountAmount, [subtotalAmount, discountAmount]);
  const itemCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  // Função para gerar um código de pedido único
  const generateOrderCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'NC-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Sincronizar carrinho com o banco de dados (Tabela de Orders)
  const syncCartWithDB = async () => {
    const isLogged = typeof window !== 'undefined' && localStorage.getItem('nenem_is_logged') === 'true';
    if (!isLogged || items.length === 0) return;

    const userId = localStorage.getItem('nenem_user_id');
    const userName = localStorage.getItem('nenem_user_name');
    const userPhone = localStorage.getItem('nenem_user_phone');
    
    let currentOrderCode = orderCode;
    if (!currentOrderCode) {
      currentOrderCode = generateOrderCode();
      setOrderCode(currentOrderCode);
    }

    try {
      // Tentar atualizar ou inserir o pedido (upsert por order_code)
      const { error } = await supabase
        .from('orders')
        .upsert({
          order_code: currentOrderCode,
          customer_id: userId,
          customer_name: userName,
          customer_whatsapp: userPhone,
          items: items,
          total: totalAmount,
          status: 'cart_open',
          updated_at: new Date().toISOString()
        }, { onConflict: 'order_code' });

      if (error) console.error('Erro ao sincronizar carrinho:', error);
    } catch (e) {
      console.error('Erro na sincronização:', e);
    }
  };

  // Sincronizar sempre que o carrinho mudar
  useEffect(() => {
    const timeout = setTimeout(() => {
      syncCartWithDB();
    }, 2000); // Delay para não sobrecarregar o banco a cada clique
    return () => clearTimeout(timeout);
  }, [items, totalAmount]);

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
      title: "CUPOM INVALIDO",
      description: "Verifique o código e tente novamente.",
    });
    return false;
  };

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      subtotal: subtotalAmount,
      total: totalAmount, 
      itemCount,
      isCartOpen,
      setIsCartOpen,
      couponApplied,
      applyCoupon,
      discountAmount,
      syncCartWithDB,
      orderCode
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
