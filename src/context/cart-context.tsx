"use client"

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { errToString } from '@/lib/utils';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  ensureOrderCode: () => Promise<string>;
  subtotal: number;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  couponApplied: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  discountAmount: number;
  syncCartWithDB: () => Promise<void>;
  orderCode: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [appliedCouponMeta, setAppliedCouponMeta] = useState<{ type: 'percentage'|'fixed', value: number } | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const { toast } = useToast();

  const subtotalAmount = useMemo(() => 
    items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  [items]);

  const discountAmount = useMemo(() => {
    if (!appliedCouponMeta) return 0;
    if (appliedCouponMeta.type === 'percentage') {
      return subtotalAmount * (appliedCouponMeta.value / 100);
    }
    return Math.min(appliedCouponMeta.value, subtotalAmount);
  }, [subtotalAmount, appliedCouponMeta]);

  const totalAmount = useMemo(() => subtotalAmount - discountAmount, [subtotalAmount, discountAmount]);
  const itemCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  // Função para gerar um código de pedido único
  const generateOrderCodeLocal = () => {
    if (typeof window === 'undefined') {
      return `NC-${Date.now()}`;
    }
    const now = new Date();
    const y = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const current = parseInt(localStorage.getItem('nenem_order_counter') || '0', 10) + 1;
    localStorage.setItem('nenem_order_counter', String(current));
    const code = `NC-${y}${mm}${dd}-${String(current).padStart(4, '0')}`;
    localStorage.setItem('nenem_order_code', code);
    return code;
  };

  const ensureOrderCode = async () => {
    if (orderCode) return orderCode;
    try {
      const now = new Date();
      const y = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const base = `NC-${y}${mm}${dd}`;
      let idx = 1;
      for (; idx <= 10; idx++) {
        const candidate = `${base}-${String(idx).padStart(4, '0')}`;
        const payload: any = {
          order_code: candidate,
          customer_id: null,
          customer_name: '',
          customer_whatsapp: '',
          items: items || [],
          total: 0,
          status: 'cart_open',
          updated_at: new Date().toISOString()
        };
        const { error } = await supabase.from('orders').insert([payload]);
        if (!error) {
          setOrderCode(candidate);
          if (typeof window !== 'undefined') localStorage.setItem('nenem_order_code', candidate);
          return candidate;
        }
        const msg = String(error.message || '').toLowerCase();
        if (!(msg.includes('duplicate') || msg.includes('unique'))) break;
      }
    } catch {}
    const local = generateOrderCodeLocal();
    setOrderCode(local);
    return local;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nenem_order_code');
      if (saved) setOrderCode(saved);
    }
  }, []);

  // Sincronizar carrinho com o banco de dados (Tabela de Orders)
  const syncCartWithDB = async () => {
    const isLogged = typeof window !== 'undefined' && localStorage.getItem('nenem_is_logged') === 'true';
    if (items.length === 0) return;

    const userId = isLogged ? localStorage.getItem('nenem_user_id') : null;
    const userName = isLogged ? (localStorage.getItem('nenem_user_name') || '') : 'SEM LOGIN';
    const userPhone = isLogged ? (localStorage.getItem('nenem_user_phone') || '') : '';
    
    let currentOrderCode = orderCode;
    if (!currentOrderCode) {
      currentOrderCode = generateOrderCodeLocal();
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

      if (error) console.error('Erro ao sincronizar carrinho:', errToString(error));
    } catch (e) {
      console.error('Erro na sincronização:', errToString(e));
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
      const unitPrice = product.promoPrice ?? product.price;
      return [...prev, { ...product, price: unitPrice, quantity }];
    });
    
    setIsCartOpen(true);
    if (!orderCode) {
      const code = generateOrderCodeLocal();
      setOrderCode(code);
    }
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setOrderCode(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nenem_order_code');
    }
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    setItems(prev => {
      if (quantity <= 0) return prev.filter(i => i.id !== productId);
      return prev.map(i => i.id === productId ? { ...i, quantity } : i);
    });
  };

  const applyCoupon = async (code: string) => {
    const up = (code || '').trim().toUpperCase();
    if (!up) return false;
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', up)
        .eq('active', true)
        .limit(1);
      if (error) throw error;
      const found = data && data[0];
      if (!found) {
        toast({ variant: "destructive", title: "CUPOM INVÁLIDO", description: "Verifique o código e tente novamente." });
        return false;
      }
      const exp = found.expires_at ? new Date(found.expires_at).getTime() : null;
      const now = Date.now();
      if (exp && exp < now) {
        toast({ variant: "destructive", title: "CUPOM VENCIDO", description: "Este cupom não é mais válido." });
        return false;
      }
      setCouponApplied(up);
      setAppliedCouponMeta({ type: found.discount_type, value: Number(found.discount_value) });
      import('@/lib/confetti').then(m => m.dispararConfete()).catch(() => {});
      toast({ title: "Cupom aplicado!", description: "Desconto aplicado ao total do pedido." });
      return true;
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao aplicar", description: "Não foi possível validar o cupom agora." });
      return false;
    }
  };

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      ensureOrderCode,
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
