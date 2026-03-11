"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Coupon, Review } from '@/lib/types';
import { PRODUCTS, CATEGORIES } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { errToString } from '@/lib/utils';

interface SiteSettings {
  marqueeItems: string[];
  promotionText: string;
  promotionCountdown: string;
  heroTitle: string;
  heroDescription: string;
  heroImageUrl: string;
  showCouponCTA?: boolean;
}

interface DataContextType {
  products: Product[];
  categories: Category[];
  coupons: Coupon[];
  settings: SiteSettings;
  reviewsByProduct: Record<string, Review[]>;
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
  addProductReview: (productId: string, review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  importData: (json: string) => Promise<void>;
  exportData: () => string;
  createSafetyBackup: () => void;
  restoreFromBackup: () => Promise<void>;
  syncInitialData: () => Promise<void>;
  migrateProductCategories: () => Promise<{ movedToMacacoes: number; keptInBodies: number }>;
  standardizeBodiesPrices: () => Promise<number>;
  isLoading: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  marqueeItems: [
    "FRETE GRÁTIS NAS COMPRAS ACIMA DE R$ 299",
    "MONTE O ENXOVAL COMPLETO E GANHE O ENVIO",
    "CONDIÇÃO ESPECIAL POR TEMPO LIMITADO",
    "MAIS DE 2.000 MÃES JÁ APROVARAM"
  ],
  promotionText: "✨ 10% OFF NA SUA PRIMEIRA COMPRA! REGISTRE-SE AGORA E GANHE SEU CUPOM.",
  promotionCountdown: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  heroTitle: "Amor que veste, conforto que abraça.",
  heroDescription: "Tecidos hipoalergênicos e curadoria especializada. Peças escolhidas para a pele mais sensível do mundo.",
  heroImageUrl: "https://picsum.photos/seed/baby1/800/800",
  showCouponCTA: true,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Inicializamos já com os dados locais para carregamento instantâneo
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false); // NUNCA começa como true para não travar a tela
  const [reviewsByProduct, setReviewsByProduct] = useState<Record<string, Review[]>>({});

  // Helper to map DB columns (snake_case) to state (camelCase)
  const mapProductFromDB = (p: any): Product => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    category: p.category,
    images: p.images || [],
    isUpsell: p.is_upsell || false,
    isBestSeller: p.is_best_seller || false,
    bestSellerRank: p.best_seller_rank != null ? Number(p.best_seller_rank) : undefined,
    promoPrice: p.promo_price ? Number(p.promo_price) : undefined,
    sizes: p.sizes || [],
    gender: p.gender || 'unisex',
    colors: p.colors || [],
    createdAt: p.created_at || undefined,
  });

  const mapProductToDB = (p: any) => ({
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    images: p.images,
    is_upsell: p.isUpsell,
    is_best_seller: p.isBestSeller,
    best_seller_rank: p.bestSellerRank ?? null,
    promo_price: p.promoPrice,
    sizes: p.sizes,
    gender: p.gender,
    colors: p.colors || [],
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
    expires_at: c.expiresAt || null,
  });

  const mapSettingsFromDB = (s: any): SiteSettings => ({
    marqueeItems: s.marquee_items || [],
    promotionText: s.promotion_text,
    promotionCountdown: s.promotion_countdown,
    heroTitle: s.hero_title,
    heroDescription: s.hero_description,
    heroImageUrl: s.hero_image_url,
    showCouponCTA: s.show_coupon_cta ?? true,
  });

  const mapSettingsToDB = (s: SiteSettings) => ({
    marquee_items: s.marqueeItems,
    promotion_text: s.promotionText,
    promotion_countdown: s.promotionCountdown,
    hero_title: s.heroTitle,
    hero_description: s.heroDescription,
    hero_image_url: s.heroImageUrl,
    // show_coupon_cta removido do payload para compatibilidade com bancos que não possuem essa coluna
  });
  
  const mapReviewFromDB = (r: any): Review => ({
    id: r.id,
    productId: r.product_id,
    name: r.name,
    rating: Number(r.rating),
    comment: r.comment,
    createdAt: r.created_at || undefined,
  });
  const mapReviewToDB = (r: Omit<Review, 'id' | 'createdAt'>) => ({
    product_id: r.productId,
    name: r.name,
    rating: r.rating,
    comment: r.comment,
  });

  const fetchData = async () => {
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const hasSupabase =
      (typeof window !== 'undefined' && (window as any).__NENEM_ENV?.SUPABASE_URL) ||
      (process.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
      '';
    
    // 1. CARREGAMENTO INSTANTÂNEO (SEM ESPERA) + FALLBACK LOCAL
    // Tenta recuperar cache local imediatamente
    if (typeof window !== 'undefined') {
      try {
        const backupProds = localStorage.getItem('nenem_backup_products');
        const backupCats = localStorage.getItem('nenem_backup_categories');
        const backupSettings = localStorage.getItem('nenem_backup_settings');
        const backupCoupons = localStorage.getItem('nenem_backup_coupons');
        const backupReviews = localStorage.getItem('nenem_backup_reviews');
        
        if (backupProds) setProducts(JSON.parse(backupProds));
        if (backupCats) setCategories(JSON.parse(backupCats));
        if (backupSettings) setSettings(JSON.parse(backupSettings));
        if (backupCoupons) setCoupons(JSON.parse(backupCoupons));
        if (backupReviews) setReviewsByProduct(JSON.parse(backupReviews));
      } catch (e) {
        console.warn("Erro ao ler cache local:", e);
      }
    }

    // 2. SINCRONIZAÇÃO EM SEGUNDO PLANO (NÃO BLOQUEIA)
    // Só mostramos o loader no admin para garantir que ele veja os dados reais
    if (isAdmin) setIsLoading(true);

    try {
      if (!hasSupabase) {
        setProducts((prev) => (prev.length > 0 ? prev : PRODUCTS));
        setCategories((prev) => (prev.length > 0 ? prev : CATEGORIES));
        setIsLoading(false);
        return;
      }
      // Timeout de 3 segundos para o Supabase (mais agressivo)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase Timeout')), 3000)
      );

      const fetchPromise = (async () => {
        try {
          const { data: pData, error: pError } = await supabase
            .from('products')
            .select('*')
            .limit(100);

          if (!pError && pData) {
            let mappedProducts = pData.map(mapProductFromDB);
            try {
              const localPricingRaw = localStorage.getItem('nenem_size_pricing');
              const localPricing = localPricingRaw ? JSON.parse(localPricingRaw) : {};
              mappedProducts = mappedProducts.map((prod) => {
                const byId = localPricing[prod.id];
                const byName = localPricing[prod.name];
                const pricing = byId || byName;
                return pricing ? { ...prod, sizePricing: pricing } : prod;
              });
            } catch {}
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

          // Carregar cupons ativos também para o site
          const { data: cpData, error: cpError } = await supabase.from('coupons').select('*').eq('active', true);
          if (!cpError && cpData) {
            const now = Date.now();
            const mappedCoupons = cpData
              .map(mapCouponFromDB)
              .filter(c => !c.expiresAt || new Date(c.expiresAt).getTime() >= now);
            setCoupons(mappedCoupons);
            localStorage.setItem('nenem_backup_coupons', JSON.stringify(mappedCoupons));
          }
          
          // Reviews são carregadas por página de produto; não buscamos globalmente para reduzir payload inicial
        } catch (innerError) {
          console.error("Erro interno no fetch:", errToString(innerError));
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
      const hasSupabase =
        (typeof window !== 'undefined' && (window as any).__NENEM_ENV?.SUPABASE_URL) ||
        (process.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
        '';
      if (!hasSupabase) return;
      // No admin, sempre forçamos o carregamento de tudo, incluindo cupons
      const { data: cpData } = await supabase.from('coupons').select('*');
      if (cpData) setCoupons(cpData.map(mapCouponFromDB));
      
      // Aqui você poderia adicionar fetch de outras tabelas pesadas que só o admin usa
    } catch (e) {
      console.error("Erro ao carregar dados administrativos:", errToString(e));
    }
  };

  useEffect(() => {
    fetchData();
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isAdmin) fetchAdminData();
  }, []);

  const addProduct = async (p: any) => {
    let payload = mapProductToDB(p);
    let res = await supabase.from('products').insert([payload]);
    if (res.error) {
      const msg = String(res.error.message || '');
      let tmp: any = { ...payload };
      if (msg.includes('gender')) {
        const { gender, ...rest } = tmp;
        tmp = rest;
      }
      if (msg.includes('colors')) {
        const { colors, ...rest } = tmp;
        tmp = rest;
      }
      if (msg.includes('sizes')) {
        const { sizes, ...rest } = tmp;
        tmp = rest;
      }
      if (msg.includes('is_best_seller')) {
        const { is_best_seller, ...rest } = tmp;
        tmp = rest;
      }
      if (msg.includes('best_seller_rank')) {
        const { best_seller_rank, ...rest } = tmp;
        tmp = rest;
      }
      if (tmp !== payload) {
        const retry = await supabase.from('products').insert([tmp]);
        if (retry.error) throw retry.error;
      } else {
        throw res.error;
      }
    }
    await fetchData();
  };

  const updateProduct = async (id: string, p: any) => {
    let payload = mapProductToDB(p);
    let res = await supabase.from('products').update(payload).eq('id', id);
    if (res.error) {
      const msg = String(res.error.message || '');
      let tmp: any = { ...payload };
      if (msg.includes('gender')) {
        const { gender, ...rest } = tmp;
        tmp = rest;
      }
      if (msg.includes('colors')) {
        const { colors, ...rest } = tmp;
        tmp = rest;
      }
      if (msg.includes('sizes')) {
        const { sizes, ...rest } = tmp;
        tmp = rest;
      }
      if (msg.includes('is_best_seller')) {
        const { is_best_seller, ...rest } = tmp;
        tmp = rest;
      }
      if (msg.includes('best_seller_rank')) {
        const { best_seller_rank, ...rest } = tmp;
        tmp = rest;
      }
      if (tmp !== payload) {
        const retry = await supabase.from('products').update(tmp).eq('id', id);
        if (retry.error) throw retry.error;
      } else {
        throw res.error;
      }
    }
    await fetchData();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const addCategory = async (c: any) => {
    const { error } = await supabase.from('categories').insert([c]);
    if (error) throw new Error(error.message || 'Erro ao salvar categoria');
    await fetchData();
  };

  const updateCategory = async (id: string, c: any) => {
    const { error } = await supabase.from('categories').update(c).eq('id', id);
    if (error) throw new Error(error.message || 'Erro ao atualizar categoria');
    await fetchData();
  };

  const addCoupon = async (c: any) => {
    let payload = mapCouponToDB(c);
    let { error } = await supabase.from('coupons').insert([payload]);
    if (error && String(error.message || '').includes('expires_at')) {
      const { expires_at, ...rest } = payload as any;
      const retry = await supabase.from('coupons').insert([rest]);
      if (retry.error) throw retry.error;
    } else if (error) {
      throw error;
    }
    await fetchData();
    await fetchAdminData();
  };

  const updateCoupon = async (id: string, c: any) => {
    let payload = mapCouponToDB(c);
    let { error } = await supabase.from('coupons').update(payload).eq('id', id);
    if (error && String(error.message || '').includes('expires_at')) {
      const { expires_at, ...rest } = payload as any;
      const retry = await supabase.from('coupons').update(rest).eq('id', id);
      if (retry.error) throw retry.error;
    } else if (error) {
      throw error;
    }
    await fetchData();
    await fetchAdminData();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

 

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
    await fetchAdminData();
  };

  const updateSettings = async (s: SiteSettings) => {
    const { error } = await supabase.from('settings').upsert([{ id: 1, ...mapSettingsToDB(s) }]);
    if (error) throw error;
    await fetchData();
  };

  const exportData = () => {
    return JSON.stringify({ products, categories, settings, reviewsByProduct }, null, 2);
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
      if (data.reviewsByProduct) {
        try {
          const grouped: Record<string, Review[]> = data.reviewsByProduct || {};
          const rows: any[] = [];
          Object.entries(grouped).forEach(([productId, list]) => {
            const arr: Review[] = Array.isArray(list) ? (list as Review[]) : [];
            arr.forEach((r: Review) => rows.push(mapReviewToDB({ productId, name: r.name, rating: r.rating, comment: r.comment })));
          });
          if (rows.length > 0) await supabase.from('reviews').insert(rows);
        } catch {}
      }
      await fetchData();
    } catch (e) {
      console.error("Erro ao importar JSON", errToString(e));
      throw e;
    }
  };

  const syncInitialData = async () => {
    try {
      setIsLoading(true);
      // Sincronizar Categorias
      const { data: existingCats } = await supabase.from('categories').select('*');
      if (!existingCats || existingCats.length === 0) {
        const catsToInsert = CATEGORIES.map(c => ({
          name: c.name,
          slug: c.slug
        }));
        await supabase.from('categories').insert(catsToInsert);
      } else {
        const hasMacacoes = existingCats.some((c: any) => c.slug === 'macacoes');
        const hasBodies = existingCats.some((c: any) => c.slug === 'bodies');
        // Renomear antiga 'Bodies & Macacões' para 'Macacões'
        const combined = existingCats.find((c: any) => c.slug === 'bodies' && String(c.name).toLowerCase().includes('macac'));
        if (!hasMacacoes && combined) {
          await supabase.from('categories').update({ name: 'Macacões', slug: 'macacoes' }).eq('id', combined.id);
        }
        // Garantir criação de 'Bodies'
        const stillHasBodies = (await supabase.from('categories').select('slug')).data?.some((c: any) => c.slug === 'bodies');
        if (!stillHasBodies) {
          await supabase.from('categories').insert([{ name: 'Bodies', slug: 'bodies' }]);
        }
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
      console.error("Erro ao sincronizar dados iniciais:", errToString(e));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const migrateProductCategories = async () => {
    try {
      setIsLoading(true);
      // Garante que as categorias existam
      await syncInitialData();
      const { data: prods, error } = await supabase.from('products').select('id,name,category');
      if (error) throw error;
      let movedToMacacoes = 0;
      let keptInBodies = 0;
      if (prods && prods.length > 0) {
        for (const p of prods) {
          const name: string = String(p.name || '');
          const cat: string = String(p.category || '');
          const hasMacac = /macac/i.test(name); // macacão / macacao / macac
          const hasBody = /body/i.test(name);
          if (cat === 'bodies' && hasMacac && !hasBody) {
            const { error: upErr } = await supabase.from('products').update({ category: 'macacoes' }).eq('id', p.id);
            if (!upErr) movedToMacacoes++;
          } else if (cat === 'bodies') {
            keptInBodies++;
          }
        }
      }
      await fetchData();
      return { movedToMacacoes, keptInBodies };
    } finally {
      setIsLoading(false);
    }
  };

  const standardizeBodiesPrices = async () => {
    try {
      setIsLoading(true);
      // Define price 29.90 and promo_price 15.00 for all bodies
      const { data, error } = await supabase
        .from('products')
        .update({ price: 29.9, promo_price: 15 })
        .eq('category', 'bodies')
        .select('id');
      if (error) throw error;
      await fetchData();
      return data ? data.length : 0;
    } finally {
      setIsLoading(false);
    }
  };

  const createSafetyBackup = () => {
    localStorage.setItem('nenem_backup_products', JSON.stringify(products));
    localStorage.setItem('nenem_backup_categories', JSON.stringify(categories));
    localStorage.setItem('nenem_backup_settings', JSON.stringify(settings));
    localStorage.setItem('nenem_backup_reviews', JSON.stringify(reviewsByProduct));
    localStorage.setItem('nenem_last_sync', new Date().toISOString());
  };

  const restoreFromBackup = async () => {
    try {
      setIsLoading(true);
      const savedProducts = localStorage.getItem('nenem_backup_products');
      const savedCategories = localStorage.getItem('nenem_backup_categories');
      const savedSettings = localStorage.getItem('nenem_backup_settings');
      const savedReviews = localStorage.getItem('nenem_backup_reviews');

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
      
      if (savedReviews) {
        try {
          const grouped = JSON.parse(savedReviews);
          const rows: any[] = [];
          Object.entries(grouped).forEach(([productId, list]) => {
            const arr: Review[] = Array.isArray(list) ? (list as Review[]) : [];
            arr.forEach((r: Review) => rows.push(mapReviewToDB({ productId, name: r.name, rating: r.rating, comment: r.comment })));
          });
          if (rows.length > 0) await supabase.from('reviews').insert(rows);
        } catch {}
      }

      await fetchData();
    } catch (e) {
      console.error("Erro ao restaurar backup:", errToString(e));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };
  
  const addProductReview = async (productId: string, review: Omit<Review, 'id' | 'createdAt'>) => {
    try {
      const payload = mapReviewToDB(review);
      const { error } = await supabase.from('reviews').insert([payload]);
      if (error) throw error;
    } catch (e) {
      // Fallback local
      const entry: Review = { id: String(Math.random()), productId, name: review.name, rating: review.rating, comment: review.comment, createdAt: new Date().toISOString() };
      const next = { ...reviewsByProduct };
      const key = String(productId);
      next[key] = [entry, ...(next[key] || [])];
      setReviewsByProduct(next);
      localStorage.setItem('nenem_backup_reviews', JSON.stringify(next));
      return;
    }
    // Atualizar estado via refetch
    await fetchData();
  };

  return (
    <DataContext.Provider value={{ 
      products, 
      categories, 
      coupons,
      settings, 
      reviewsByProduct,
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
      addProductReview,
      importData,
      exportData,
      createSafetyBackup,
      restoreFromBackup,
      syncInitialData,
      migrateProductCategories,
      standardizeBodiesPrices,
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
