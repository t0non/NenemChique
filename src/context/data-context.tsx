"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Coupon } from '@/lib/types';
import { PRODUCTS, CATEGORIES } from '@/lib/data';
import { supabase } from '@/lib/supabase';

interface SiteSettings {
  marqueeItems: string[];
  promotionText: string;
  promotionCountdown: string;
  heroTitle: string;
  heroDescription: string;
  heroImageUrl: string;
}

interface DataContextType {
  products: Product[];
  categories: Category[];
  coupons: Coupon[];
  settings: SiteSettings;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, product: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: any) => Promise<void>;
  updateCategory: (id: string, category: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addCoupon: (coupon: any) => Promise<void>;
  updateCoupon: (id: string, coupon: any) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  updateSettings: (settings: SiteSettings) => Promise<void>;
  importData: (json: string) => Promise<void>;
  exportData: () => string;
  createSafetyBackup: () => void;
  restoreFromBackup: () => Promise<void>;
  syncInitialData: () => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  marqueeItems: [
    "FRETE GRÁTIS NAS COMPRAS ACIMA DE R$ 299",
    "MONTE O ENXOVAL COMPLETO E GANHE O ENVIO",
    "CONDIÇÃO ESPECIAL POR TEMPO LIMITADO",
    "MAIS DE 2.000 MÃES JÁ APROVARAM"
  ],
  promotionText: "✨ 10% OFF NA SUA ESTREIA! ENTRE NO GRUPO DO WHATSAPP E PEGUE O CUPOM NA DESCRIÇÃO.",
  promotionCountdown: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  heroTitle: "Amor que veste, conforto que abraça.",
  heroDescription: "Tecidos hipoalergênicos e curadoria especializada. Peças escolhidas para a pele mais sensível do mundo.",
  heroImageUrl: "https://picsum.photos/seed/baby1/800/800",
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Inicializamos já com os dados locais para carregamento instantâneo
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false); // NUNCA começa como true para não travar a tela

  // Helper to map DB columns (snake_case) to state (camelCase)
  const mapProductFromDB = (p: any): Product => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    category: p.category,
    images: p.images || [],
    isUpsell: p.is_upsell || false,
    promoPrice: p.promo_price ? Number(p.promo_price) : undefined,
    sizes: p.sizes || [],
  });

  const mapProductToDB = (p: any) => ({
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    images: p.images,
    is_upsell: p.isUpsell,
    promo_price: p.promoPrice,
    sizes: p.sizes,
  });

  const mapCouponFromDB = (c: any): Coupon => ({
    id: c.id,
    code: c.code,
    discountType: c.discount_type,
    discountValue: Number(c.discount_value),
    active: c.active,
    createdAt: c.created_at || undefined,
    expiresAt: c.expires_at || undefined,
  });

  const mapCouponToDB = (c: any) => ({
    code: c.code,
    discount_type: c.discountType,
    discount_value: c.discountValue,
    active: c.active,
  });

  const mapSettingsFromDB = (s: any): SiteSettings => ({
    marqueeItems: s.marquee_items || [],
    promotionText: s.promotion_text,
    promotionCountdown: s.promotion_countdown,
    heroTitle: s.hero_title,
    heroDescription: s.hero_description,
    heroImageUrl: s.hero_image_url,
  });

  const mapSettingsToDB = (s: SiteSettings) => ({
    marquee_items: s.marqueeItems,
    promotion_text: s.promotionText,
    promotion_countdown: s.promotionCountdown,
    hero_title: s.heroTitle,
    hero_description: s.heroDescription,
    hero_image_url: s.heroImageUrl,
  });

  const fetchData = async () => {
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    
    // 1. CARREGAMENTO INSTANTÂNEO (SEM ESPERA)
    // Tenta recuperar cache local imediatamente
    if (typeof window !== 'undefined') {
      try {
        const backupProds = localStorage.getItem('nenem_backup_products');
        const backupCats = localStorage.getItem('nenem_backup_categories');
        const backupSettings = localStorage.getItem('nenem_backup_settings');
        
        if (backupProds) setProducts(JSON.parse(backupProds));
        if (backupCats) setCategories(JSON.parse(backupCats));
        if (backupSettings) setSettings(JSON.parse(backupSettings));
      } catch (e) {
        console.warn("Erro ao ler cache local:", e);
      }
    }

    // 2. SINCRONIZAÇÃO EM SEGUNDO PLANO (NÃO BLOQUEIA)
    // Só mostramos o loader no admin para garantir que ele veja os dados reais
    if (isAdmin) setIsLoading(true);

    try {
      // Timeout de 3 segundos para o Supabase (mais agressivo)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase Timeout')), 3000)
      );

      const fetchPromise = (async () => {
        try {
          // Fetch ultra-rápido: apenas os campos necessários
          const { data: pData, error: pError } = await supabase
            .from('products')
            .select('id, name, description, price, promo_price, category, images, is_upsell, sizes')
            .limit(100);

          if (!pError && pData) {
            const mappedProducts = pData.map(mapProductFromDB);
            setProducts(mappedProducts);
            localStorage.setItem('nenem_backup_products', JSON.stringify(mappedProducts));
          }

          const { data: cData, error: cError } = await supabase.from('categories').select('*');
          if (!cError && cData) {
            setCategories(cData);
            localStorage.setItem('nenem_backup_categories', JSON.stringify(cData));
          }

          const { data: sData, error: sError } = await supabase.from('settings').select('*').eq('id', 1).single();
          if (!sError && sData) {
            const mappedSettings = mapSettingsFromDB(sData);
            setSettings(mappedSettings);
            localStorage.setItem('nenem_backup_settings', JSON.stringify(mappedSettings));
          }
        } catch (innerError) {
          console.error("Erro interno no fetch:", innerError);
        }
      })();

      // Esperamos o fetch ou o timeout, mas não deixamos o site travar
      await Promise.race([fetchPromise, timeoutPromise]);

    } catch (e: any) {
      console.warn("Supabase lento ou inacessível. Usando dados locais.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      // No admin, sempre forçamos o carregamento de tudo, incluindo cupons
      const { data: cpData } = await supabase.from('coupons').select('*');
      if (cpData) setCoupons(cpData.map(mapCouponFromDB));
      
      // Aqui você poderia adicionar fetch de outras tabelas pesadas que só o admin usa
    } catch (e) {
      console.error("Erro ao carregar dados administrativos:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isAdmin) fetchAdminData();
  }, []);

  const addProduct = async (p: any) => {
    const { error } = await supabase.from('products').insert([mapProductToDB(p)]);
    if (error) throw error;
    await fetchData();
  };

  const updateProduct = async (id: string, p: any) => {
    const { error } = await supabase.from('products').update(mapProductToDB(p)).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const addCategory = async (c: any) => {
    const { error } = await supabase.from('categories').insert([c]);
    if (error) throw error;
    await fetchData();
  };

  const updateCategory = async (id: string, c: any) => {
    const { error } = await supabase.from('categories').update(c).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const addCoupon = async (c: any) => {
    const { error } = await supabase.from('coupons').insert([mapCouponToDB(c)]);
    if (error) throw error;
    await fetchData();
  };

  const updateCoupon = async (id: string, c: any) => {
    const { error } = await supabase.from('coupons').update(mapCouponToDB(c)).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const updateSettings = async (s: SiteSettings) => {
    const { error } = await supabase.from('settings').upsert([{ id: 1, ...mapSettingsToDB(s) }]);
    if (error) throw error;
    await fetchData();
  };

  const exportData = () => {
    return JSON.stringify({ products, categories, settings }, null, 2);
  };

  const importData = async (json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.products) {
        await supabase.from('products').delete().neq('id', '0');
        await supabase.from('products').insert(data.products.map(mapProductToDB));
      }
      if (data.categories) {
        await supabase.from('categories').delete().neq('id', '0');
        await supabase.from('categories').insert(data.categories);
      }
      if (data.settings) {
        await supabase.from('settings').upsert([{ id: 1, ...mapSettingsToDB(data.settings) }]);
      }
      await fetchData();
    } catch (e) {
      console.error("Erro ao importar JSON", e);
      throw e;
    }
  };

  const syncInitialData = async () => {
    try {
      setIsLoading(true);
      // Sincronizar Categorias
      const { data: existingCats } = await supabase.from('categories').select('id');
      if (!existingCats || existingCats.length === 0) {
        const catsToInsert = CATEGORIES.map(c => ({
          name: c.name,
          slug: c.slug
        }));
        await supabase.from('categories').insert(catsToInsert);
      }

      // Sincronizar Produtos
      const { data: existingProds } = await supabase.from('products').select('id');
      if (!existingProds || existingProds.length === 0) {
        const prodsToInsert = PRODUCTS.map(mapProductToDB);
        await supabase.from('products').insert(prodsToInsert);
      }

      // Sincronizar Settings
      const { data: existingSettings } = await supabase.from('settings').select('id').eq('id', 1).single();
      if (!existingSettings) {
        await supabase.from('settings').insert([{ id: 1, ...mapSettingsToDB(DEFAULT_SETTINGS) }]);
      }

      await fetchData();
    } catch (e) {
      console.error("Erro ao sincronizar dados iniciais:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const createSafetyBackup = () => {
    localStorage.setItem('nenem_backup_products', JSON.stringify(products));
    localStorage.setItem('nenem_backup_categories', JSON.stringify(categories));
    localStorage.setItem('nenem_backup_settings', JSON.stringify(settings));
    localStorage.setItem('nenem_last_sync', new Date().toISOString());
  };

  const restoreFromBackup = async () => {
    try {
      setIsLoading(true);
      const savedProducts = localStorage.getItem('nenem_backup_products');
      const savedCategories = localStorage.getItem('nenem_backup_categories');
      const savedSettings = localStorage.getItem('nenem_backup_settings');

      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        // Clear and restore in Supabase
        await supabase.from('products').delete().neq('id', '0');
        await supabase.from('products').insert(parsedProducts.map(mapProductToDB));
      }

      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories);
        await supabase.from('categories').delete().neq('id', '0');
        await supabase.from('categories').insert(parsedCategories);
      }

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        await supabase.from('settings').upsert([{ id: 1, ...mapSettingsToDB(parsedSettings) }]);
      }

      await fetchData();
    } catch (e) {
      console.error("Erro ao restaurar backup:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{ 
      products, 
      categories, 
      coupons,
      settings, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      addCategory, 
      updateCategory, 
      deleteCategory,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      updateSettings,
      importData,
      exportData,
      createSafetyBackup,
      restoreFromBackup,
      syncInitialData,
      isLoading 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData deve ser usado dentro de um DataProvider");
  return context;
}
