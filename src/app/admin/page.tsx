"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search, Package, PlusCircle, LayoutDashboard, ChevronRight, Loader2, Tag, Settings, Megaphone, Sparkles, Check, Clock, Download, Upload, ImageIcon, ShieldCheck, Undo2, Ticket, Users, Mail, Phone, Calendar, ShoppingBag, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useData } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const { toast } = useToast();
  const { 
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
    exportData,
    importData,
    createSafetyBackup,
    restoreFromBackup,
    syncInitialData,
    migrateProductCategories,
    standardizeBodiesPrices,
    isLoading
  } = useData();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);

  const [leads, setLeads] = useState<any[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newReviewsCount, setNewReviewsCount] = useState(0);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const hasSupabase =
        (typeof window !== 'undefined' && (window as any).__NENEM_ENV?.SUPABASE_URL) ||
        (process.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
        '';
      if (!hasSupabase) {
        setOrders([]);
        return;
      }
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) throw error;
      fetchOrders();
      toast({ title: "Status Atualizado", description: `Pedido marcado como ${newStatus}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao atualizar status." });
    }
  };

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const hasSupabase =
        (typeof window !== 'undefined' && (window as any).__NENEM_ENV?.SUPABASE_URL) ||
        (process.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
        '';
      if (!hasSupabase) {
        setLeads([]);
        return;
      }
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setIsLoadingLeads(false);
    }
  };
  
  const fetchNewReviews = async () => {
    try {
      const lastSeenRaw = typeof window !== 'undefined' ? localStorage.getItem('nenem_admin_last_reviews_seen') : null;
      const lastSeen = lastSeenRaw ? new Date(lastSeenRaw).toISOString() : null;
      const query = supabase.from('reviews').select('created_at');
      const { data, error } = lastSeen ? await query.gt('created_at', lastSeen) : await query;
      if (error) throw error;
      setNewReviewsCount(Array.isArray(data) ? data.length : 0);
    } catch (e) {
      setNewReviewsCount(0);
    }
  };
  
  useEffect(() => {
    fetchNewReviews();
  }, []);
  
  const markReviewsAsSeen = () => {
    localStorage.setItem('nenem_admin_last_reviews_seen', new Date().toISOString());
    setNewReviewsCount(0);
  };

  useEffect(() => {
    // Carregar dados administrativos apenas ao entrar nesta página
    const loadAdminData = async () => {
      setIsLoadingOrders(true);
      setIsLoadingLeads(true);
      await Promise.all([fetchLeads(), fetchOrders()]);
    };
    
    loadAdminData();
  }, []);

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

  const mapCouponFromDB = (c: any): any => ({
    id: c.id,
    code: c.code,
    discountType: c.discount_type,
    discountValue: Number(c.discount_value),
    active: c.active,
  });

  const mapCouponToDB = (c: any) => ({
    code: c.code,
    discount_type: c.discountType,
    discount_value: c.discountValue,
    active: c.active,
  });

  const handleCreateBackup = () => {
    createSafetyBackup();
    const now = new Date();
    setLastSyncDate(now.toLocaleString('pt-BR'));
    toast({ 
      title: "Cópia de Segurança Criada", 
      description: "Uma cópia local dos seus dados foi salva com sucesso no seu navegador." 
    });
  };

  const handleRestoreBackup = async () => {
    if (!confirm("Tem certeza que deseja restaurar a última cópia de segurança? Isso substituirá todos os dados atuais do banco de dados pelo backup local.")) return;
    
    setIsRestoring(true);
    try {
      await restoreFromBackup();
      toast({ title: "Sucesso", description: "Dados restaurados com sucesso!" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao restaurar dados." });
    } finally {
      setIsRestoring(false);
    }
  };

  useEffect(() => {
    const savedDate = localStorage.getItem('nenem_last_sync');
    if (savedDate) setLastSyncDate(new Date(savedDate).toLocaleString('pt-BR'));
  }, [products]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'hero') => {
    const inputEl = e.currentTarget;
    const files = inputEl?.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      if (target === 'product') {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `uploads/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('Imagens').upload(filePath, file);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('Imagens').getPublicUrl(filePath);
          uploadedUrls.push(publicUrl);
        }
        setProductForm(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      } else {
        const file = files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('Imagens').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('Imagens').getPublicUrl(filePath);
        setSettingsForm(prev => ({ ...prev, heroImageUrl: publicUrl }));
      }
      toast({ title: "Sucesso", description: "Imagem enviada com sucesso!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro no upload", description: error.message || "Falha no envio" });
    } finally {
      setIsUploading(false);
      if (inputEl) inputEl.value = "";
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncInitialData();
      toast({ title: "Sucesso", description: "Dados sincronizados com o Supabase!" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erro", description: "Falha na sincronização." });
    } finally {
      setIsSyncing(false);
    }
  };
  const [isMigrating, setIsMigrating] = useState(false);
  const handleStandardizeBodies = async () => {
    setIsMigrating(true);
    try {
      const count = await standardizeBodiesPrices();
      toast({ title: "Preços ajustados", description: `${count} body(s) atualizados para R$ 29,90 (promo R$ 15,00).` });
    } catch (e: any) {
      const msg = e?.message || 'Falha ao padronizar preços.';
      toast({ variant: "destructive", title: "Erro", description: msg });
    } finally {
      setIsMigrating(false);
    }
  };
  const handleMigrateCategories = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateProductCategories();
      toast({ title: "Migração concluída", description: `${result.movedToMacacoes} produto(s) movidos para Macacões.` });
    } catch (e: any) {
      const msg = e?.message || 'Falha ao migrar categorias.';
      toast({ variant: "destructive", title: "Erro", description: msg });
    } finally {
      setIsMigrating(false);
    }
  };
  const handleFixHygieneKits = async () => {
    setIsMigrating(true);
    try {
      let updated = 0;
      for (const p of products) {
        const nm = String(p.name || '');
        if (/\bkit\s+higiene\b/i.test(nm)) {
          const newName = nm.replace(/cuidados/gi, 'Higiene');
          const newCategory = 'kits-higiene';
          const newImages = Array.isArray(p.images) ? p.images.slice(0, 2) : [];
          await updateProduct(p.id, {
            name: newName,
            category: newCategory,
            price: Number(p.price || 0),
            promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
            description: p.description || '',
            images: newImages,
            isUpsell: !!p.isUpsell,
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            gender: p.gender || 'unisex',
            colors: Array.isArray(p.colors) ? p.colors : [],
          });
          updated++;
        }
      }
      toast({ title: "Kits separados", description: `${updated} produto(s) movidos para 'Kits de Higiene'.` });
    } catch (e: any) {
      const msg = e?.message || 'Falha ao corrigir kits.';
      toast({ variant: "destructive", title: "Erro", description: msg });
    } finally {
      setIsMigrating(false);
    }
  };
  const handleSeparateHygieneKits = async () => {
    setIsMigrating(true);
    try {
      // Garantir categoria 'Kits de Higiene'
      const exists = categories.some(c => c.slug === 'kits-higiene');
      if (!exists) {
        await addCategory({ name: 'Kits de Higiene', slug: 'kits-higiene' });
      }
      let moved = 0;
      for (const p of products) {
        const nm = String(p.name || '');
        const isHygieneByName = /\bkit(\s+de)?\s+higiene\b/i.test(nm);
        const looksHygieneChanged = /\bkit(\s+de)?\s+cuidados\b/i.test(nm) && Array.isArray(p.images) && p.images.length === 2;
        if (isHygieneByName || looksHygieneChanged) {
          const newName = nm.replace(/cuidados/gi, 'Higiene');
          const newImages = Array.isArray(p.images) ? p.images.slice(0, 2) : [];
          await updateProduct(p.id, {
            name: newName,
            category: 'kits-higiene',
            price: Number(p.price || 0),
            promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
            description: p.description || '',
            images: newImages,
            isUpsell: !!p.isUpsell,
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            gender: p.gender || 'unisex',
            colors: Array.isArray(p.colors) ? p.colors : [],
          });
          moved++;
        }
      }
      toast({ title: "Kits Higiene atualizados", description: `${moved} produto(s) agora em 'Kits de Higiene'.` });
    } catch (e: any) {
      const msg = e?.message || 'Falha ao separar kits de higiene.';
      toast({ variant: "destructive", title: "Erro", description: msg });
    } finally {
      setIsMigrating(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    images: [] as string[],
    isUpsell: false,
    isBestSeller: false,
    bestSellerRank: '' as string,
    promoPrice: '',
    sizes: ['P','M','G'] as string[],
    gender: 'unisex' as 'masculino' | 'feminino' | 'unisex',
    colors: [] as string[],
    dynamicBySize: false,
    sizePricing: {} as Record<string, { price?: string; promo?: string }>,
  });

  const SIZE_ORDER = ['RN','P','M','G','GG','1','2','3','4','6','8','10','12','14'];
  const sortSizes = (arr: string[]) => [...arr].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));

  const CATEGORY_DEFAULTS: Record<string, {sizes?: string[]; price?: string; promoPrice?: string; description?: string; dynamicBySize?: boolean}> = {
    bodies: { price: '29,90', promoPrice: '15,00' },
    'conjuntos-fleece': { sizes: ['1','2','3'], price: '99,00', promoPrice: '68,00', description: 'Conjunto de fleece macio, quentinho e confortável.', dynamicBySize: true },
  };

  const applyCategoryDefaults = (category: string) => {
    const defs = CATEGORY_DEFAULTS[category];
    if (!defs) {
      setProductForm(prev => ({ ...prev, category }));
      return;
    }
    setProductForm(prev => ({
      ...prev,
      category,
      sizes: (!prev.sizes || prev.sizes.length === 0) && defs.sizes ? defs.sizes : prev.sizes,
      price: !prev.price && defs.price ? defs.price : prev.price,
      promoPrice: !prev.promoPrice && defs.promoPrice ? defs.promoPrice : prev.promoPrice,
      description: !prev.description && defs.description ? defs.description : prev.description,
      dynamicBySize: defs.dynamicBySize ?? prev.dynamicBySize,
      sizePricing: prev.sizePricing,
    }));
  };
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    active: true,
    expiresAt: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
  });

  const [settingsForm, setSettingsForm] = useState({
    marqueeItems: '',
    promotionText: '',
    promotionCountdown: '',
    heroTitle: '',
    heroDescription: '',
    heroImageUrl: '',
    showCouponCTA: true,
  });

  // Sync settingsForm with settings context on first load
  useEffect(() => {
    if (settings) {
      setSettingsForm({
        marqueeItems: settings.marqueeItems?.join('\n') || '',
        promotionText: settings.promotionText || '',
        promotionCountdown: settings.promotionCountdown || '',
        heroTitle: settings.heroTitle || '',
        heroDescription: settings.heroDescription || '',
        heroImageUrl: settings.heroImageUrl || '',
        showCouponCTA: settings.showCouponCTA ?? true,
      });
    }
  }, [settings]);

  const formatDigitsToBRL = (digits: string) => {
    const only = digits.replace(/\D/g, '');
    if (!only) return '';
    const padded = only.padStart(3, '0');
    const cents = padded.slice(-2);
    const ints = padded.slice(0, -2).replace(/^0+/, '') || '0';
    const withSep = ints.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${withSep},${cents}`;
  };
  const formatNumberToBRLString = (n: number) => {
    const abs = Math.round(n * 100);
    const s = String(abs);
    return formatDigitsToBRL(s);
  };
  const unformatBRLStringToNumber = (s: string) => {
    if (!s) return NaN;
    const cleaned = s.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    return parseFloat(cleaned);
  };

  const handleSaveProduct = async () => {
    setIsAdding(true);
    try {
      const parseNumber = (v: string) => unformatBRLStringToNumber(v);
      const nameOk = productForm.name.trim().length > 0;
      const categoryOk = productForm.category && productForm.category.trim().length > 0;
      const priceValue = parseNumber(productForm.price);
      const priceOk = Number.isFinite(priceValue) && priceValue >= 0;
      if (!nameOk || !categoryOk || !priceOk) {
        toast({
          variant: "destructive",
          title: "Preencha os campos obrigatórios",
          description: !nameOk
            ? "Informe o nome do produto."
            : !categoryOk
            ? "Selecione a categoria."
            : "Informe um preço válido (ex: 49,90).",
        });
        return;
      }
      if (productForm.images.length === 0) {
        toast({
          variant: "destructive",
          title: "Adicione pelo menos uma imagem",
          description: "Envie ao menos uma foto do produto.",
        });
        return;
      }
      const dataToSave = {
        name: productForm.name,
        category: productForm.category,
        price: priceValue,
        promoPrice: productForm.promoPrice ? parseNumber(productForm.promoPrice) : null,
        description: productForm.description,
        images: productForm.images,
        isUpsell: productForm.isUpsell,
        isBestSeller: productForm.isBestSeller,
        bestSellerRank: productForm.bestSellerRank ? Number(productForm.bestSellerRank) : null,
        sizes: productForm.sizes,
        gender: productForm.gender,
        colors: productForm.colors,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, dataToSave);
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso!" });
      } else {
        await addProduct(dataToSave);
        toast({ title: "Sucesso", description: "Produto adicionado com sucesso!" });
      }
      
      if (productForm.dynamicBySize && Object.keys(productForm.sizePricing).length > 0) {
        try {
          const raw = localStorage.getItem('nenem_size_pricing');
          const store = raw ? JSON.parse(raw) : {};
          const parseNumber = (v: string) => unformatBRLStringToNumber(v);
          const map: Record<string, { price: number; promo?: number }> = {};
          for (const [sz, vals] of Object.entries(productForm.sizePricing)) {
            const p = vals.price ? parseNumber(vals.price) : NaN;
            const pr = vals.promo ? parseNumber(vals.promo) : undefined;
            if (Number.isFinite(p)) {
              map[sz] = { price: p, promo: (pr && Number.isFinite(pr)) ? pr : undefined };
            }
          }
          const key = editingProduct?.id || productForm.name;
          store[key] = map;
          localStorage.setItem('nenem_size_pricing', JSON.stringify(store));
        } catch {}
      }
      
      setProductForm({ name: '', category: categories?.[0]?.slug || '', price: '', description: '', images: [], isUpsell: false, isBestSeller: false, bestSellerRank: '', promoPrice: '', sizes: [], gender: 'unisex', colors: [], dynamicBySize: false, sizePricing: {} });
      setEditingProduct(null);
    } catch (error: any) {
      const desc =
        typeof error?.message === "string"
          ? error.message
          : typeof error?.error?.message === "string"
          ? error.error.message
          : "Não foi possível salvar.";
      toast({ variant: "destructive", title: "Erro ao salvar", description: desc });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    
    try {
      await deleteProduct(id);
      toast({ title: "Sucesso", description: "Produto excluído." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao excluir." });
    }
  };

  const handleSaveCategory = async () => {
    try {
      const name = categoryForm.name.trim();
      if (!name) {
        toast({ variant: "destructive", title: "Erro", description: "Informe o nome da categoria." });
        return;
      }
      const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      if (!slug) {
        toast({ variant: "destructive", title: "Erro", description: "Nome inválido para gerar o identificador." });
        return;
      }
      if (!editingCategory && categories.some(c => c.slug === slug)) {
        toast({ variant: "destructive", title: "Já existe", description: "Esta categoria já está cadastrada." });
        return;
      }
      const dataToSave = {
        name: name,
        slug: slug,
      };

      if (editingCategory) {
        updateCategory(editingCategory.id, dataToSave);
      } else {
        addCategory(dataToSave);
      }
      
      setCategoryForm({ name: '' });
      setEditingCategory(null);
      toast({ title: "Sucesso", description: "Categoria salva!" });
    } catch (error: any) {
      const desc = error?.message || "Erro ao salvar.";
      toast({ variant: "destructive", title: "Erro", description: desc });
    }
  };

  const handleSaveCoupon = async () => {
    try {
      const parseNumber = (v: string) => unformatBRLStringToNumber(v);
      const data = {
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue: parseNumber(couponForm.discountValue),
        active: couponForm.active,
        expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString() : null
      };
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, data);
      } else {
        await addCoupon(data);
      }
      setCouponForm({ code: '', discountType: 'percentage', discountValue: '', active: true, expiresAt: '' });
      setEditingCoupon(null);
      const validade = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
      toast({ title: "Sucesso", description: `Cupom criado. Validade: ${validade}` });
    } catch (e: any) {
      const msg = (typeof e?.message === 'string' && e.message) ? e.message :
        (typeof e?.error?.message === 'string' && e.error.message) ? e.error.message :
        'Erro ao salvar cupom.';
      toast({ variant: "destructive", title: "Erro", description: msg });
    }
  };

  const filteredProducts = products ? products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleSaveSettings = async () => {
    try {
      const marqueeArray = settingsForm.marqueeItems.split('\n').filter(i => i.trim() !== '');
      updateSettings({
        ...settingsForm,
        marqueeItems: marqueeArray,
      });
      toast({ title: "Sucesso", description: "Configurações do site salvas!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao salvar." });
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nenem-chique-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        importData(content);
        toast({ title: "Sucesso", description: "Dados importados com sucesso!" });
      };
      reader.readAsText(file);
    }
  };
  
  const handleSeedReviews = async () => {
    try {
      const firstNames = ['Ana', 'Maria', 'João', 'Pedro', 'Laura', 'Luiza', 'Mariana', 'Rafael', 'Carolina', 'Isabela', 'Sofia', 'Gabriela', 'Beatriz', 'Paula', 'Rafaela', 'Clara', 'Valentina', 'Bruna', 'Patrícia', 'Alice', 'Helena', 'Manuela', 'Vitória', 'Miguel', 'Guilherme', 'Henrique', 'Eduardo', 'Lucas', 'Matheus'];
      const middleNames = ['Clara', 'Fernanda', 'Eduarda', 'Miguel', 'Sofia', 'Henrique', 'Valentina', 'Carla', 'Camila', 'Isadora', 'Nicole', 'Yasmin', 'Antônio', 'José', 'Luiz', 'Felipe', 'Caio', 'Heitor', 'Álvaro', 'Otávio'];
      const connectors = ['da', 'de', 'do', 'dos', 'das'];
      const lastNames = ['Silva', 'Souza', 'Oliveira', 'Santos', 'Pereira', 'Almeida', 'Ferreira', 'Rodrigues', 'Gomes', 'Carvalho', 'Araújo', 'Barbosa', 'Costa', 'Lima', 'Ribeiro', 'Martins', 'Rocha', 'Dias', 'Teixeira', 'Melo', 'Monteiro', 'Azevedo', 'Batista', 'Machado'];
      const messages = [
        'Chegou certinho e muito rápido. Tecido macio, amei!',
        'Qualidade ótima, exatamente como nas fotos.',
        'Atendimento excelente e produto impecável.',
        'Fiquei encantada, muito delicado e bem feito.',
        'Valeu cada centavo, super recomendo!',
        'Meu bebê ficou lindo, material é muito confortável.',
        'Cor fiel e acabamento perfeito, voltarei a comprar.',
        'Tamanho certinho e sem cheiro, aprovado.',
        'Presenteei uma amiga e ela amou, embalagem bonita.',
        'Macio, não irrita a pele e esquenta na medida.',
        'Comprei o kit e veio tudo certinho, muito prático.',
        'Atendimento pelo Whats foi rápido, tirou minhas dúvidas.',
        'Gostei muito, caiu super bem no bebê.',
        'Produto de qualidade, vou comprar outras cores.',
        'Meu pedido chegou antes do prazo, nota 10.',
        'Design lindo e muito confortável.'
      ];
      const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      const makeName = () => {
        const parts: string[] = [];
        parts.push(pick(firstNames));
        if (Math.random() < 0.8) parts.push(pick(middleNames));
        if (Math.random() < 0.5) parts.push(pick(connectors));
        parts.push(pick(lastNames));
        if (Math.random() < 0.35) {
          parts.push(pick(connectors));
          parts.push(pick(lastNames));
        }
        return parts.join(' ');
      };
      const rows: any[] = [];
      for (const p of products) {
        const target = 12 + Math.floor(Math.random() * 16); // 12..27
        for (let i = 0; i < target; i++) {
          const fullName = makeName();
          const comment = messages[Math.floor(Math.random()*messages.length)];
          const rating = Math.random() < 0.8 ? 5 : (Math.random() < 0.9 ? 4 : 3);
          rows.push({ product_id: p.id, name: fullName, rating, comment });
        }
      }
      if (rows.length > 0) {
        const { error } = await supabase.from('reviews').insert(rows);
        if (error) throw error;
      }
      toast({ title: "Comentários criados", description: "Avaliações adicionadas de forma realista em vários produtos." });
    } catch (e) {
      try {
        const firstNames = ['Ana', 'Maria', 'João', 'Pedro', 'Laura', 'Luiza', 'Mariana', 'Rafael', 'Carolina', 'Isabela', 'Sofia', 'Gabriela', 'Beatriz', 'Paula', 'Rafaela', 'Clara', 'Valentina', 'Bruna', 'Patrícia', 'Alice', 'Helena', 'Manuela', 'Vitória', 'Miguel', 'Guilherme', 'Henrique', 'Eduardo', 'Lucas', 'Matheus'];
        const middleNames = ['Clara', 'Fernanda', 'Eduarda', 'Miguel', 'Sofia', 'Henrique', 'Valentina', 'Carla', 'Camila', 'Isadora', 'Nicole', 'Yasmin', 'Antônio', 'José', 'Luiz', 'Felipe', 'Caio', 'Heitor', 'Álvaro', 'Otávio'];
        const connectors = ['da', 'de', 'do', 'dos', 'das'];
        const lastNames = ['Silva', 'Souza', 'Oliveira', 'Santos', 'Pereira', 'Almeida', 'Ferreira', 'Rodrigues', 'Gomes', 'Carvalho', 'Araújo', 'Barbosa', 'Costa', 'Lima', 'Ribeiro', 'Martins', 'Rocha', 'Dias', 'Teixeira', 'Melo', 'Monteiro', 'Azevedo', 'Batista', 'Machado'];
        const messages = [
          'Chegou certinho e muito rápido. Tecido macio, amei!',
          'Qualidade ótima, exatamente como nas fotos.',
          'Atendimento excelente e produto impecável.',
          'Fiquei encantada, muito delicado e bem feito.',
          'Valeu cada centavo, super recomendo!',
          'Meu bebê ficou lindo, material é muito confortável.',
          'Cor fiel e acabamento perfeito, voltarei a comprar.',
          'Tamanho certinho e sem cheiro, aprovado.',
          'Presenteei uma amiga e ela amou, embalagem bonita.',
          'Macio, não irrita a pele e esquenta na medida.',
          'Comprei o kit e veio tudo certinho, muito prático.',
          'Atendimento pelo Whats foi rápido, tirou minhas dúvidas.',
          'Gostei muito, caiu super bem no bebê.',
          'Produto de qualidade, vou comprar outras cores.',
          'Meu pedido chegou antes do prazo, nota 10.',
          'Design lindo e muito confortável.'
        ];
        const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
        const makeName = () => {
          const parts: string[] = [];
          parts.push(pick(firstNames));
          if (Math.random() < 0.8) parts.push(pick(middleNames));
          if (Math.random() < 0.5) parts.push(pick(connectors));
          parts.push(pick(lastNames));
          if (Math.random() < 0.35) {
            parts.push(pick(connectors));
            parts.push(pick(lastNames));
          }
          return parts.join(' ');
        };
        const grouped: Record<string, { name: string; rating: number; comment: string; createdAt: string }[]> = {};
        for (const p of products) {
          const target = 12 + Math.floor(Math.random() * 16);
          const pid = String(p.id);
          grouped[pid] = grouped[pid] || [];
          for (let i = 0; i < target; i++) {
            const fullName = makeName();
            const comment = messages[Math.floor(Math.random()*messages.length)];
            const rating = Math.random() < 0.8 ? 5 : (Math.random() < 0.9 ? 4 : 3);
            grouped[pid].push({ name: fullName, rating, comment, createdAt: new Date().toISOString() });
          }
        }
        localStorage.setItem('nenem_backup_reviews', JSON.stringify(grouped));
        toast({ title: "Comentários criados localmente", description: "Banco indisponível. Use o site normalmente; as avaliações já aparecem." });
      } catch {
        toast({ variant: "destructive", title: "Erro ao gerar comentários", description: "Verifique a conexão com o banco. Posso tentar novamente." });
      }
    }
  };

  const startEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: formatNumberToBRLString(Number(product.price || 0)),
      promoPrice: product.promoPrice != null ? formatNumberToBRLString(Number(product.promoPrice)) : '',
      description: product.description || '',
      images: product.images || [],
      isUpsell: product.isUpsell || false,
      isBestSeller: product.isBestSeller || false,
      bestSellerRank: product.bestSellerRank != null ? String(product.bestSellerRank) : '',
      sizes: sortSizes(product.sizes || []),
      gender: product.gender || 'unisex',
      colors: product.colors || [],
      dynamicBySize: product.category === 'conjuntos-fleece',
      sizePricing: (() => {
        try {
          const raw = localStorage.getItem('nenem_size_pricing');
          const store = raw ? JSON.parse(raw) : {};
          const entry = store[product.id] || store[product.name];
          if (!entry) return {};
          const out: Record<string, { price?: string; promo?: string }> = {};
          for (const [sz, vals] of Object.entries(entry)) {
            const v: any = vals;
            out[sz] = {
              price: formatNumberToBRLString(Number(v.price || 0)),
              promo: v.promo != null ? formatNumberToBRLString(Number(v.promo)) : undefined,
            };
          }
          return out;
        } catch { return {}; }
      })(),
    });
    setProductDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDF8FB] py-6 md:py-12">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        
        /* Ajuste para mobile */
        @media (max-width: 640px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          [data-radix-popper-content-wrapper] {
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            transform: none !important;
            padding: 1rem;
          }
        }
      `}</style>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 text-primary font-bold text-sm mb-6 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            <span>Painel Administrativo</span>
          </div>
          <Badge variant="outline" className="w-fit text-[10px] border-primary/20 text-primary/60">Modo Autônomo</Badge>
        </div>
        
        <Tabs defaultValue="produtos" className="w-full">
          <TabsList className="bg-white p-1 rounded-2xl border border-primary/5 mb-8 h-auto min-h-14 shadow-sm flex flex-wrap md:flex-nowrap overflow-x-auto no-scrollbar">
            <TabsTrigger value="produtos" className="flex-1 md:flex-none rounded-xl font-bold gap-2 px-4 md:px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-xs md:text-sm">
              <Package className="w-4 h-4" /> <span className="hidden xs:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="flex-1 md:flex-none rounded-xl font-bold gap-2 px-4 md:px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-xs md:text-sm" onClick={fetchOrders}>
              <ShoppingBag className="w-4 h-4" /> <span className="hidden xs:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="categorias" className="flex-1 md:flex-none rounded-xl font-bold gap-2 px-4 md:px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-xs md:text-sm">
              <Tag className="w-4 h-4" /> <span className="hidden xs:inline">Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="cupons" className="flex-1 md:flex-none rounded-xl font-bold gap-2 px-4 md:px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-xs md:text-sm">
              <Ticket className="w-4 h-4" /> <span className="hidden xs:inline">Cupons</span>
            </TabsTrigger>
            <TabsTrigger value="site" className="flex-1 md:flex-none rounded-xl font-bold gap-2 px-4 md:px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-xs md:text-sm">
              <Settings className="w-4 h-4" /> <span className="hidden xs:inline">Site</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex-1 md:flex-none rounded-xl font-bold gap-2 px-4 md:px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-xs md:text-sm" onClick={fetchLeads}>
              <Users className="w-4 h-4" /> <span className="hidden xs:inline">Leads</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produtos" className="space-y-6 outline-none">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold">Gestão de Catálogo</h2>
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full md:w-auto rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 h-12"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({name:'', category: categories?.[0]?.slug || '', price:'', description:'', images: [], isUpsell: false, isBestSeller: false, bestSellerRank: '', promoPrice: '', sizes: ['P','M','G'], gender: 'unisex', colors: [], dynamicBySize: false, sizePricing: {}});
                        setProductDialogOpen(true);
                      }}
                    >
                      <PlusCircle className="w-5 h-5" /> Novo Produto
                    </Button>
                  </DialogTrigger>
                <DialogContent className="w-[95vw] sm:max-w-[650px] h-[90vh] sm:h-auto max-h-[90vh] flex flex-col rounded-3xl p-0 overflow-hidden shadow-2xl border-none !fixed !top-[50%] !left-[50%] !-translate-x-1/2 !-translate-y-1/2">
                  <DialogHeader className="p-4 md:p-6 pb-2 md:pb-4 border-b bg-white z-30 shrink-0 text-left">
                    <DialogTitle className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
                      {editingProduct ? <Pencil className="w-5 h-5 md:w-6 md:h-6" /> : <PlusCircle className="w-5 h-5 md:w-6 md:h-6" />}
                      {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-[#FDF8FB]/30 z-10 min-h-0">
                    <div className="grid gap-4 md:gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome do Produto</Label>
                          <Input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="rounded-xl border-primary/10 focus:border-primary/30 h-11" placeholder="Ex: Macacão Nuvem" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoria</Label>
                          <select 
                            className="flex h-11 w-full rounded-xl border border-primary/10 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                            value={productForm.category}
                            onChange={(e) => {
                              const category = e.target.value;
                              applyCategoryDefaults(category);
                            }}
                          >
                            <option value="">Selecione...</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.slug}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Gênero</Label>
                          <select 
                            className="flex h-11 w-full rounded-xl border border-primary/10 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                            value={productForm.gender}
                            onChange={(e) => setProductForm({...productForm, gender: e.target.value as any})}
                          >
                            <option value="unisex">Unissex</option>
                            <option value="feminino">Feminino</option>
                            <option value="masculino">Masculino</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
                        <Checkbox 
                          id="isBestSeller" 
                          checked={productForm.isBestSeller} 
                          onCheckedChange={(checked) => setProductForm({...productForm, isBestSeller: !!checked})} 
                          className="w-5 h-5 rounded-md border-primary/20 data-[state=checked]:bg-primary"
                        />
                        <Label htmlFor="isBestSeller" className="font-bold text-primary flex items-center gap-2 cursor-pointer text-xs md:text-sm">
                          Destacar em “Mais Vendidos”
                        </Label>
                        <div className="flex items-center gap-2 ml-auto">
                          <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Posição</Label>
                          <Input
                            value={productForm.bestSellerRank}
                            onChange={(e) => setProductForm({ ...productForm, bestSellerRank: e.target.value.replace(/[^\d]/g, '') })}
                            className="rounded-xl h-9 w-20"
                            placeholder="1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Preço (R$)</Label>
                          <Input 
                            type="text" 
                            inputMode="numeric"
                            value={productForm.price} 
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '');
                              const formatted = formatDigitsToBRL(digits);
                              setProductForm({...productForm, price: formatted});
                            }} 
                            className="rounded-xl border-primary/10 h-11" 
                            disabled={productForm.dynamicBySize}
                            placeholder="0,00" 
                          />
                          {productForm.dynamicBySize && (
                            <p className="text-[10px] text-muted-foreground">Preço calculado automaticamente pelo tamanho selecionado.</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Promo (Opcional)</Label>
                          <Input 
                            type="text" 
                            inputMode="numeric"
                            value={productForm.promoPrice} 
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '');
                              const formatted = formatDigitsToBRL(digits);
                              setProductForm({...productForm, promoPrice: formatted});
                            }} 
                            className="rounded-xl border-primary/10 h-11 text-green-600 font-bold" 
                            disabled={productForm.dynamicBySize}
                            placeholder="0,00" 
                          />
                          {productForm.dynamicBySize && (
                            <p className="text-[10px] text-muted-foreground">Promo calculada automaticamente pelo tamanho selecionado.</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Imagens do Produto</Label>
                        <div className="flex flex-col gap-3 p-3 md:p-4 border-2 border-dashed border-primary/10 rounded-2xl bg-white group hover:border-primary/30 transition-all">
                          {productForm.images.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {productForm.images.map((url, idx) => (
                                <div key={url + idx} className="relative aspect-square rounded-xl overflow-hidden border shadow-inner bg-muted/20">
                                  <Image src={url} alt={`Imagem ${idx+1}`} fill className="object-cover" />
                                  <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-md p-1"
                                    onClick={() => setProductForm(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center py-4">
                              <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center mb-2">
                                <ImageIcon className="w-5 h-5 text-primary/40" />
                              </div>
                              <p className="text-xs font-medium text-muted-foreground">Selecione uma ou mais fotos</p>
                            </div>
                          )}
                          
                          <div className="relative">
                            <Button variant="outline" className="w-full h-11 rounded-xl gap-2 font-bold border-primary/10 hover:bg-primary/5 transition-all text-xs" disabled={isUploading}>
                              {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload className="w-4 h-4 text-primary" />}
                              {productForm.images.length > 0 ? 'Adicionar Mais Fotos' : 'Selecionar Fotos'}
                            </Button>
                            <input 
                              type="file" 
                              accept="image/*" 
                              multiple
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={(e) => handleFileUpload(e, 'product')}
                              disabled={isUploading}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
                        <Checkbox 
                          id="isUpsell" 
                          checked={productForm.isUpsell} 
                          onCheckedChange={(checked) => setProductForm({...productForm, isUpsell: !!checked})} 
                          className="w-5 h-5 rounded-md border-primary/20 data-[state=checked]:bg-primary"
                        />
                        <Label htmlFor="isUpsell" className="font-bold text-primary flex items-center gap-2 cursor-pointer text-xs md:text-sm">
                          <Sparkles className="w-4 h-4 text-yellow-500" /> Sugestão de Mãe (Upsell)
                        </Label>
                      </div>

                      <div className="space-y-3 bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Tamanhos Disponíveis</Label>
                        {true && (
                          <div className="flex items-center gap-2 bg-muted/30 px-3 py-2 rounded-lg border border-primary/10">
                            <Checkbox 
                              id="dynamicBySize" 
                              checked={productForm.dynamicBySize} 
                              onCheckedChange={(checked) => {
                                const nextDyn = !!checked;
                                let nextPrice = productForm.price;
                                let nextPromo = productForm.promoPrice;
                                if (nextDyn) {
                                  const big = new Set(['4','6','8']);
                                  const hasBig = productForm.sizes.some(s => big.has(s));
                                  if (hasBig) {
                                    nextPrice = '109,90';
                                    nextPromo = '78,00';
                                  } else {
                                    nextPrice = '99,00';
                                    nextPromo = '68,00';
                                  }
                                  const nextPricing = { ...productForm.sizePricing };
                                  for (const s of productForm.sizes) {
                                    if (!nextPricing[s]) {
                                      if (['4','6','8'].includes(s)) nextPricing[s] = { price: '109,90', promo: '78,00' };
                                      else if (['1','2','3'].includes(s)) nextPricing[s] = { price: '99,00', promo: '68,00' };
                                      else nextPricing[s] = { price: nextPrice, promo: nextPromo };
                                    }
                                  }
                                  setProductForm({ ...productForm, dynamicBySize: nextDyn, price: nextPrice, promoPrice: nextPromo, sizePricing: nextPricing });
                                  return;
                                }
                                setProductForm({ ...productForm, dynamicBySize: nextDyn, price: nextPrice, promoPrice: nextPromo });
                              }} 
                              className="w-4 h-4 rounded border-primary/20 data-[state=checked]:bg-primary"
                            />
                            <Label htmlFor="dynamicBySize" className="text-[10px] md:text-xs font-bold cursor-pointer">
                              Preço dinâmico por tamanho
                            </Label>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {['RN', 'P', 'M', 'G', 'GG', '1', '2', '3', '4', '6', '8', '10', '12', '14'].map((size) => (
                            <div key={size} className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-lg border border-primary/5">
                              <Checkbox 
                                id={`size-${size}`} 
                                checked={productForm.sizes.includes(size)} 
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? sortSizes([...productForm.sizes, size])
                                    : sortSizes(productForm.sizes.filter(s => s !== size));
                                  let nextPrice = productForm.price;
                                  let nextPromo = productForm.promoPrice;
                                  if (productForm.dynamicBySize) {
                                    const small = new Set(['1','2','3']);
                                    const big = new Set(['4','6','8']);
                                    const hasBig = next.some(s => big.has(s));
                                    const onlySmall = next.every(s => small.has(s)) && next.length > 0;
                                    if (hasBig) {
                                      nextPrice = '109,90';
                                      nextPromo = '78,00';
                                    } else if (onlySmall) {
                                      nextPrice = '99,00';
                                      nextPromo = '68,00';
                                    }
                                    const nextPricing = { ...productForm.sizePricing };
                                    if (checked) {
                                      if (!nextPricing[size]) {
                                        if (['4','6','8'].includes(size)) nextPricing[size] = { price: '109,90', promo: '78,00' };
                                        else if (['1','2','3'].includes(size)) nextPricing[size] = { price: '99,00', promo: '68,00' };
                                        else nextPricing[size] = { price: nextPrice, promo: nextPromo };
                                      }
                                    } else {
                                      delete nextPricing[size];
                                    }
                                    setProductForm({ ...productForm, sizes: next, price: nextPrice, promoPrice: nextPromo, sizePricing: nextPricing });
                                    return;
                                  }
                                  setProductForm({ ...productForm, sizes: next, price: nextPrice, promoPrice: nextPromo });
                                }}
                                className="w-3.5 h-3.5 rounded border-primary/20 data-[state=checked]:bg-primary"
                              />
                              <Label htmlFor={`size-${size}`} className="text-[10px] md:text-xs font-bold cursor-pointer">{size}</Label>
                            </div>
                          ))}
                        </div>
                        {productForm.dynamicBySize && productForm.sizes.length > 0 && (
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {sortSizes(productForm.sizes).map((s) => (
                              <div key={s} className="bg-white border border-primary/10 rounded-xl p-3">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Tamanho {s}</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preço</Label>
                                    <Input
                                      value={productForm.sizePricing[s]?.price || ''}
                                      onChange={(e) => {
                                        const digits = e.target.value.replace(/\D/g, '');
                                        const formatted = formatDigitsToBRL(digits);
                                        const nextPricing = { ...productForm.sizePricing, [s]: { ...(productForm.sizePricing[s] || {}), price: formatted } };
                                        setProductForm({ ...productForm, sizePricing: nextPricing });
                                      }}
                                      className="rounded-xl h-11"
                                      placeholder="0,00"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Promo</Label>
                                    <Input
                                      value={productForm.sizePricing[s]?.promo || ''}
                                      onChange={(e) => {
                                        const digits = e.target.value.replace(/\D/g, '');
                                        const formatted = formatDigitsToBRL(digits);
                                        const nextPricing = { ...productForm.sizePricing, [s]: { ...(productForm.sizePricing[s] || {}), promo: formatted } };
                                        setProductForm({ ...productForm, sizePricing: nextPricing });
                                      }}
                                      className="rounded-xl h-11"
                                      placeholder="0,00"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Cores</Label>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {['Amarelo','Azul','Azul Marinho','Azul Pó','Bege','Branco','Off White','Creme','Caramelo','Marrom','Preto','Cinza','Cinza Claro','Cinza Escuro','Chumbo','Lavanda','Lilás','Rosa','Goiaba','Verde','Verde Água','Verde Menta','Vermelho','Vermelho Melancia'].map((cor) => (
                            <div key={cor} className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-lg border border-primary/5">
                              <Checkbox 
                                id={`cor-${cor}`} 
                                checked={productForm.colors.includes(cor)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setProductForm({ ...productForm, colors: [...productForm.colors, cor] });
                                  } else {
                                    setProductForm({ ...productForm, colors: productForm.colors.filter(c => c !== cor) });
                                  }
                                }}
                                className="w-3.5 h-3.5 rounded border-primary/20 data-[state=checked]:bg-primary"
                              />
                              <Label htmlFor={`cor-${cor}`} className="text-[10px] md:text-xs font-bold cursor-pointer">{cor}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição</Label>
                        <textarea 
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          className="w-full h-24 md:h-32 rounded-xl border border-primary/10 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none" 
                          placeholder="Detalhes do produto..."
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="p-4 md:p-6 border-t bg-white z-20 shrink-0">
                    <Button className="rounded-xl font-bold h-12 w-full text-base shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all" onClick={handleSaveProduct} disabled={isAdding}>
                      {isAdding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                      {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="bg-white border rounded-2xl p-4 md:p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">Guia rápido</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-sm font-bold">Cadastrar produto</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Informe nome, escolha categoria, defina preço ou ative preço por tamanho. Adicione pelo menos uma foto e salve.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-sm font-bold">Preço por tamanho</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Ative “Preço dinâmico por tamanho” e preencha os valores de cada tamanho. O site mostra o menor preço como “A partir de”.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-sm font-bold">Fotos do produto</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Coloque fotos claras. A primeira vira a principal. Você pode adicionar mais fotos no botão “Selecionar Fotos”.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-sm font-bold">Cupom e capa do site</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Em “Site”, edite textos e imagem da capa. Controle o botão “Cupom Aqui” no carrinho com a opção “Mostrar botão”.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-primary/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">Produtos</p>
                  <h3 className="text-xl md:text-2xl font-bold">{products.length}</h3>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Package className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-primary/5 flex items-center justify-between col-span-1 md:col-span-2">
                <div className="w-full">
                  <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">Versões de Dados</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="default" size="sm" className="rounded-xl gap-2 text-[10px] md:text-xs font-bold h-9 bg-primary" onClick={handleCreateBackup}>
                      <ShieldCheck className="w-3 h-3" /> Salvar versão
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl gap-2 text-[10px] md:text-xs font-bold h-9" onClick={handleRestoreBackup} disabled={isRestoring}>
                      {isRestoring ? <Loader2 className="w-3 h-3 animate-spin" /> : <Undo2 className="w-3 h-3" />} 
                      Restaurar versão
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl gap-2 text-[10px] md:text-xs font-bold h-9" onClick={handleSeedReviews}>
                      <MessageCircle className="w-3 h-3" /> Gerar comentários
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-primary/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">Novas Avaliações</p>
                  <h3 className="text-2xl font-bold">{newReviewsCount}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs font-bold" onClick={fetchNewReviews}>
                    Atualizar
                  </Button>
                  <Button variant="default" size="sm" className="rounded-xl h-9 text-xs font-bold" onClick={markReviewsAsSeen}>
                    Marcar como lidas
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-xl border border-primary/5 overflow-hidden">
              <div className="p-4 md:p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-primary/[0.01]">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Pesquisar produtos..." 
                    className="pl-10 rounded-2xl border-muted h-11" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="font-bold py-4 md:py-6 pl-4 md:pl-8 text-xs md:text-sm">Produto</TableHead>
                      <TableHead className="font-bold text-xs md:text-sm hidden sm:table-cell">Categoria</TableHead>
                      <TableHead className="font-bold text-right text-xs md:text-sm">Preço</TableHead>
                      <TableHead className="font-bold text-right pr-4 md:pr-8 text-xs md:text-sm">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id} className="hover:bg-primary/[0.01] transition-colors group">
                        <TableCell className="py-3 md:py-4 pl-4 md:pl-8">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden shadow-sm shrink-0">
                              <Image src={p.images?.[0] || 'https://picsum.photos/seed/baby/200/200'} alt={p.name} fill className="object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-xs md:text-sm line-clamp-1">{p.name}</span>
                              <span className="sm:hidden text-[10px] text-muted-foreground uppercase">{p.category?.replace('-', ' ')}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-muted-foreground font-medium text-xs hidden sm:table-cell">{p.category?.replace('-', ' ')}</TableCell>
                        <TableCell className="text-right font-bold text-primary text-xs md:text-sm">
                          {p.promoPrice ? (
                            <div className="flex flex-col">
                              <span className="text-[9px] md:text-[10px] line-through text-muted-foreground">R$ {p.price.toFixed(2)}</span>
                              <span>R$ {p.promoPrice.toFixed(2)}</span>
                            </div>
                          ) : `R$ ${p.price.toFixed(2)}`}
                        </TableCell>
                        <TableCell className="text-right pr-4 md:pr-8">
                          <div className="flex justify-end gap-1 md:gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10" onClick={() => startEditProduct(p)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteProduct(p.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pedidos" className="space-y-6 outline-none">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Gestão de Pedidos</h2>
                <p className="text-sm text-muted-foreground">Monitore carrinhos abertos e pedidos finalizados.</p>
              </div>
              <Button onClick={fetchOrders} variant="outline" className="rounded-xl font-bold h-11" disabled={isLoadingOrders}>
                {isLoadingOrders ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Undo2 className="w-4 h-4 mr-2" />}
                Atualizar Pedidos
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">Carrinhos Abertos</p>
                  <h3 className="text-2xl font-bold">{orders.filter(o => o.status === 'cart_open').length}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">Aguardando Pgto</p>
                  <h3 className="text-2xl font-bold text-orange-600">{orders.filter(o => o.status === 'pending_payment').length}</h3>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">Finalizados</p>
                  <h3 className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'completed').length}</h3>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <Check className="w-6 h-6" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">Total em Vendas</p>
                  <h3 className="text-2xl font-bold text-primary">R$ {orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + Number(o.total), 0).toFixed(2)}</h3>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-xl border border-primary/5 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="font-bold py-4 md:py-6 pl-4 md:pl-8 text-xs md:text-sm">Código / Cliente</TableHead>
                      <TableHead className="font-bold text-xs md:text-sm">Itens</TableHead>
                      <TableHead className="font-bold text-xs md:text-sm">Total</TableHead>
                      <TableHead className="font-bold text-xs md:text-sm">Status</TableHead>
                      <TableHead className="font-bold text-right pr-4 md:pr-8 text-xs md:text-sm">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                          Nenhum pedido ou carrinho encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-primary/[0.01] transition-colors group">
                          <TableCell className="py-4 pl-4 md:pl-8">
                            <div className="flex flex-col">
                              <span className="font-black text-primary text-sm tracking-tight">{order.order_code}</span>
                              <span className="font-bold text-xs text-foreground mt-0.5">{order.customer_name || 'SEM LOGIN'}</span>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                                <Phone className="w-3 h-3 text-green-600" /> {order.customer_whatsapp}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1">
                                {(() => {
                                  const dt = order.updated_at || order.created_at;
                                  try {
                                    return new Date(dt).toLocaleString('pt-BR');
                                  } catch {
                                    return '';
                                  }
                                })()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-col gap-1 max-w-[200px]">
                              {order.items.map((item: any, idx: number) => (
                                <span key={idx} className="text-[10px] text-muted-foreground truncate">
                                  {item.quantity}x {item.name}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 font-bold text-foreground text-sm">
                            R$ {Number(order.total).toFixed(2).replace('.', ',')}
                          </TableCell>
                          <TableCell className="py-4">
                            <select 
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 border-none focus:ring-2",
                                order.status === 'cart_open' && "bg-blue-100 text-blue-700",
                                order.status === 'pending_payment' && "bg-orange-100 text-orange-700",
                                order.status === 'completed' && "bg-green-100 text-green-700",
                                order.status === 'abandoned' && "bg-red-100 text-red-700",
                              )}
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="cart_open">🛒 Aberto</option>
                              <option value="pending_payment">⏳ Aguardando</option>
                              <option value="completed">✅ Pago</option>
                              <option value="abandoned">❌ Abandonado</option>
                            </select>
                          </TableCell>
                          <TableCell className="text-right pr-4 md:pr-8">
                            <div className="flex justify-end gap-2">
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-green-600 hover:bg-green-50">
                                <a href={`https://wa.me/55${order.customer_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${order.customer_name}! Vi que você deixou alguns itens no carrinho da Neném Chique (Pedido ${order.order_code}). Posso te ajudar a finalizar?`)}`} target="_blank" rel="noopener noreferrer">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categorias" className="space-y-6 outline-none">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <h2 className="text-xl md:text-2xl font-bold">Categorias</h2>
               <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                 <DialogTrigger asChild>
                   <Button 
                     onClick={() => {
                       setEditingCategory(null);
                       setCategoryForm({ name: '' });
                       setCategoryDialogOpen(true);
                     }}
                     className="rounded-xl font-bold h-11 px-4 shrink-0"
                   >
                     <PlusCircle className="w-4 h-4 sm:mr-2" /> Nova Categoria
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="w-[92vw] max-w-[400px] rounded-2xl p-0 overflow-hidden border-none">
                   <DialogHeader className="p-4 border-b bg-white">
                     <DialogTitle className="text-lg font-bold text-primary">
                       {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                     </DialogTitle>
                   </DialogHeader>
                   <div className="p-4 space-y-3 bg-white">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nome</Label>
                     <Input 
                       placeholder="Ex: Saída de Maternidade" 
                       value={categoryForm.name} 
                       onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                       className="rounded-xl h-11"
                     />
                     <Button 
                       onClick={async () => {
                         await handleSaveCategory();
                         setCategoryDialogOpen(false);
                       }} 
                       className="w-full rounded-xl font-bold h-11"
                     >
                       {editingCategory ? 'Salvar' : 'Criar Categoria'}
                     </Button>
                   </div>
                 </DialogContent>
               </Dialog>
             </div>

             <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-xl border border-primary/5 p-4 md:p-6">
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 md:p-4 bg-muted/20 rounded-2xl group">
                      <div className="overflow-hidden">
                        <p className="font-bold text-xs md:text-sm truncate">{cat.name}</p>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground truncate">/{cat.slug}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {setEditingCategory(cat); setCategoryForm({name: cat.name}); setCategoryDialogOpen(true);}}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-red-500" onClick={() => deleteCategory(cat.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </TabsContent>

          <TabsContent value="cupons" className="space-y-6 outline-none">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl md:text-2xl font-bold">Gestão de Cupons</h2>
              <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-xl border border-primary/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Código</Label>
                    <Input 
                      placeholder="Ex: PRIMEIRA10" 
                      value={couponForm.code} 
                      onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                      className="rounded-xl h-11 uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Tipo</Label>
                    <select 
                      className="flex h-11 w-full rounded-xl border border-primary/10 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value as any})}
                    >
                      <option value="percentage">% Porcentagem</option>
                      <option value="fixed">R$ Fixo</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Valor</Label>
                    <Input 
                      type="text" 
                      inputMode="numeric"
                      placeholder={couponForm.discountType === 'fixed' ? '0,00' : '0'}
                      value={couponForm.discountValue} 
                      onChange={(e) => {
                        if (couponForm.discountType === 'fixed') {
                          const digits = e.target.value.replace(/\D/g, '');
                          const formatted = formatDigitsToBRL(digits);
                          setCouponForm({...couponForm, discountValue: formatted});
                        } else {
                          const v = e.target.value.replace(/[^\d,]/g, '');
                          setCouponForm({...couponForm, discountValue: v});
                        }
                      }}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Validade</Label>
                    <Input 
                      type="date" 
                      value={couponForm.expiresAt} 
                      onChange={(e) => setCouponForm({...couponForm, expiresAt: e.target.value})}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <Button onClick={handleSaveCoupon} className="rounded-xl font-bold h-11 w-full shadow-lg shadow-primary/10">
                    {editingCoupon ? <Check className="w-4 h-4 mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                    {editingCoupon ? 'Atualizar' : 'Criar Cupom'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
              {coupons && coupons.map(coupon => (
                <div key={coupon.id} className="bg-white p-4 md:p-5 rounded-[24px] md:rounded-[28px] shadow-sm border border-primary/5 group relative overflow-hidden transition-all hover:shadow-md">
                  <div className={`absolute top-0 right-0 w-10 h-10 flex items-center justify-center rounded-bl-2xl ${coupon.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {coupon.active ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    <h4 className="text-base md:text-lg font-black text-primary tracking-tight truncate pr-8">{coupon.code}</h4>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `R$ ${formatNumberToBRLString(coupon.discountValue)}`}
                      <span className="text-[9px] md:text-[10px] text-muted-foreground ml-1 font-normal uppercase tracking-widest">OFF</span>
                    </p>
                    <div className="text-[10px] text-muted-foreground font-medium leading-tight">
                      <div>
                        Criado em: {coupon.createdAt ? new Date(coupon.createdAt).toLocaleDateString('pt-BR') : '-'}
                      </div>
                      <div>
                        Validade: {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('pt-BR') : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-dashed border-muted">
                    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[9px] md:text-[10px] font-bold border-none ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {coupon.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
                        setEditingCoupon(coupon);
                        setCouponForm({
                          code: coupon.code,
                          discountType: coupon.discountType,
                          discountValue: coupon.discountValue.toString(),
                          active: coupon.active,
                          expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0,10) : ''
                        });
                      }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-red-500" onClick={() => deleteCoupon(coupon.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="site" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
               <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-xl border border-primary/5 space-y-6">
                 <div className="flex items-center gap-3 text-primary mb-2">
                   <Megaphone className="w-5 h-5 md:w-6 md:h-6" />
                   <h3 className="text-lg md:text-xl font-bold">Banners & Avisos</h3>
                 </div>
                 
                 <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Itens do Letreiro (Marquee)</Label>
                   <textarea 
                     value={settingsForm.marqueeItems}
                     onChange={(e) => setSettingsForm({...settingsForm, marqueeItems: e.target.value})}
                     className="w-full h-24 md:h-32 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none"
                     placeholder="Um por linha..."
                   />
                 </div>

                 <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Barra de Promoção (Rosa)</Label>
                   <Input value={settingsForm.promotionText} onChange={(e) => setSettingsForm({...settingsForm, promotionText: e.target.value})} className="rounded-xl h-11" />
                 </div>

                 <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Timer da Promoção</Label>
                   <Input type="datetime-local" value={settingsForm.promotionCountdown} onChange={(e) => setSettingsForm({...settingsForm, promotionCountdown: e.target.value})} className="rounded-xl h-11" />
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <Checkbox 
                     id="showCouponCTA"
                     checked={settingsForm.showCouponCTA}
                     onCheckedChange={(checked) => setSettingsForm({...settingsForm, showCouponCTA: !!checked})}
                     className="w-4 h-4 rounded border-primary/20 data-[state=checked]:bg-primary"
                   />
                   <Label htmlFor="showCouponCTA" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                     Mostrar botão “Cupom Aqui” no carrinho
                   </Label>
                 </div>
               </div>

               <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-xl border border-primary/5 space-y-6">
                 <div className="flex items-center gap-3 text-primary mb-2">
                   <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" />
                   <h3 className="text-lg md:text-xl font-bold">Capa do Site (Hero)</h3>
                 </div>

                 <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título Principal</Label>
                   <Input value={settingsForm.heroTitle} onChange={(e) => setSettingsForm({...settingsForm, heroTitle: e.target.value})} className="rounded-xl h-11" />
                 </div>

                 <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição Curta</Label>
                   <textarea 
                     value={settingsForm.heroDescription}
                     onChange={(e) => setSettingsForm({...settingsForm, heroDescription: e.target.value})}
                     className="w-full h-20 md:h-24 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none"
                   />
                 </div>

                 <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Imagem de Capa</Label>
                   <div className="flex flex-col gap-3 p-3 md:p-4 border-2 border-dashed rounded-xl bg-muted/5 group hover:bg-muted/10 transition-colors">
                     {settingsForm.heroImageUrl ? (
                       <div className="relative aspect-video rounded-lg overflow-hidden border">
                         <Image src={settingsForm.heroImageUrl} alt="Preview" fill className="object-cover" />
                       </div>
                     ) : (
                       <div className="flex flex-col items-center py-4">
                         <ImageIcon className="w-8 h-8 text-muted-foreground/40 mb-2" />
                         <p className="text-[10px] text-muted-foreground">Sem imagem</p>
                       </div>
                     )}
                     <div className="relative">
                       <Button variant="outline" className="w-full h-10 rounded-xl gap-2 font-bold text-xs" disabled={isUploading}>
                         {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                         Trocar Foto
                       </Button>
                       <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'hero')} disabled={isUploading} />
                     </div>
                   </div>
                 </div>
                 
                 <Button onClick={handleSaveSettings} className="w-full h-12 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
                   <Check className="w-4 h-4 mr-2" /> Salvar Alterações
                 </Button>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6 outline-none">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Leads e Clientes</h2>
                <p className="text-sm text-muted-foreground">Pessoas que demonstraram interesse ou se identificaram no site.</p>
              </div>
              <Button onClick={fetchLeads} variant="outline" className="rounded-xl font-bold h-11" disabled={isLoadingLeads}>
                {isLoadingLeads ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Undo2 className="w-4 h-4 mr-2" />}
                Atualizar Lista
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">Total de Leads</p>
                  <h3 className="text-2xl font-bold">{leads.length}</h3>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">Últimas 24h</p>
                  <h3 className="text-2xl font-bold">
                    {leads.filter(l => new Date(l.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">Newsletter</p>
                  <h3 className="text-2xl font-bold">
                    {leads.filter(l => l.source === 'newsletter_footer' || l.source === 'newsletter_popup').length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Mail className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-xl border border-primary/5 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="font-bold py-4 md:py-6 pl-4 md:pl-8 text-xs md:text-sm">Nome / Identificação</TableHead>
                      <TableHead className="font-bold text-xs md:text-sm">Contato</TableHead>
                      <TableHead className="font-bold text-xs md:text-sm">Origem</TableHead>
                      <TableHead className="font-bold text-xs md:text-sm">Data</TableHead>
                      <TableHead className="font-bold text-right pr-4 md:pr-8 text-xs md:text-sm">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                          Nenhum lead encontrado ainda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      leads.map((lead) => (
                        <TableRow key={lead.id} className="hover:bg-primary/[0.01] transition-colors group">
                          <TableCell className="py-3 md:py-4 pl-4 md:pl-8">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                {lead.name ? lead.name.substring(0, 2) : <Mail className="w-4 h-4" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-xs md:text-sm">{lead.name || 'Visitante Anônimo'}</span>
                                {lead.source === 'identification_login' && (
                                  <Badge className="w-fit text-[8px] h-4 px-1.5 bg-primary/5 text-primary border-none">Cliente Identificado</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 md:py-4">
                            <div className="flex flex-col gap-0.5">
                              {lead.email && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Mail className="w-3 h-3" /> {lead.email}
                                </div>
                              )}
                              {lead.whatsapp && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                  <Phone className="w-3 h-3 text-green-600" /> {lead.whatsapp}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 md:py-4 capitalize text-xs text-muted-foreground font-medium">
                            <Badge variant="outline" className="text-[10px] font-medium border-primary/10 text-primary/70">
                              {lead.source?.replace('_', ' ') || 'Site'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 md:py-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-4 md:pr-8">
                            <div className="flex justify-end gap-2">
                              {lead.whatsapp && (
                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-green-600 hover:bg-green-50">
                                  <a href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                    <Phone className="w-3.5 h-3.5" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
