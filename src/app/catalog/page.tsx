
"use client"

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { ListFilter, Loader2 } from 'lucide-react';
import { useData } from '@/context/data-context';
import { Product } from '@/lib/types';

function CatalogInner() {
  const { products, isLoading: loading, categories } = useData();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [genderFilter, setGenderFilter] = useState<'all' | 'masculino' | 'feminino' | 'unisex'>('all');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'destaque'|'menor-preco'|'maior-preco'|'novidades'>('destaque');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setActiveCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  const byCategory: Product[] = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const genderedProducts: Product[] = useMemo(() => {
    if (genderFilter === 'all') return byCategory;
    const g = genderFilter;
    return byCategory.filter(p => {
      const pg = (p.gender || 'unisex');
      if (g === 'feminino') return pg === 'feminino' || pg === 'unisex';
      if (g === 'masculino') return pg === 'masculino' || pg === 'unisex';
      return pg === 'unisex';
    });
  }, [byCategory, genderFilter]);

  // Cores dinâmicas com contagem, apenas as cadastradas nos produtos do contexto atual (categoria + gênero)
  const colorCounts = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    for (const p of genderedProducts) {
      const cols = (p.colors || []).filter(Boolean);
      for (const c of cols) {
        const key = c.toLowerCase();
        const cur = map.get(key);
        if (cur) map.set(key, { label: cur.label, count: cur.count + 1 });
        else map.set(key, { label: c, count: 1 });
      }
    }
    // Ordenar por nome
    return Array.from(map.entries())
      .sort((a, b) => a[1].label.localeCompare(b[1].label));
  }, [genderedProducts]);

  let filteredProducts: Product[] = genderedProducts;

  // Filtro por cores (se o produto ainda não tiver cores, não filtra)
  if (selectedColors.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const pcs = (p.colors || []).map(c => c.toLowerCase());
      return selectedColors.some(c => pcs.includes(c.toLowerCase()));
    });
  }

  // Ordenação
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'menor-preco') {
      const pa = a.promoPrice ?? a.price;
      const pb = b.promoPrice ?? b.price;
      return pa - pb;
    }
    if (sortBy === 'maior-preco') {
      const pa = a.promoPrice ?? a.price;
      const pb = b.promoPrice ?? b.price;
      return pb - pa;
    }
    if (sortBy === 'novidades') {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    }
    return 0; // destaque
  });

  return (
    <div className="py-8 bg-background min-h-[80vh]">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-primary">
            {activeCategory === 'all' ? 'Nossa Coleção' : (categories.find((c) => c.slug === activeCategory)?.name || 'Coleção')}
          </h1>
          <p className="text-muted-foreground text-base italic">Navegue pelas categorias, filtre e ordene como preferir.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile categories bar */}
          <div className="lg:hidden space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categorias</span>
              <Button variant="outline" className="rounded-full h-9 text-xs" onClick={() => setShowFilters(v => !v)}>
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto py-1">
              <Button 
                variant={activeCategory === 'all' ? 'default' : 'ghost'} 
                className={`rounded-full h-9 px-3 whitespace-nowrap ${activeCategory === 'all' ? 'shadow-md shadow-primary/10' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                Todos
              </Button>
              {categories.filter(cat => products.some(p => p.category === cat.slug)).map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.slug ? 'default' : 'ghost'}
                  className={`rounded-full h-9 px-3 whitespace-nowrap ${activeCategory === cat.slug ? 'shadow-md shadow-primary/10' : ''}`}
                  onClick={() => setActiveCategory(cat.slug)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
            {showFilters && (
              <div className="space-y-3 bg-white rounded-2xl border p-3">
                {colorCounts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Cor</h4>
                    <div className="max-h-36 overflow-auto">
                      {colorCounts.map(([key, info]) => {
                        const label = info.label;
                        const isSel = selectedColors.includes(label);
                        return (
                          <label key={key} className="flex items-center justify-between gap-2 py-1 text-sm">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSel}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedColors(prev => [...prev, label]);
                                  else setSelectedColors(prev => prev.filter(x => x !== label));
                                }}
                              />
                              <span className="text-muted-foreground">{label}</span>
                            </div>
                            <span className="text-[10px] font-bold text-primary/70">{info.count}</span>
                          </label>
                        );
                      })}
                    </div>
                    <Button variant="outline" className="rounded-full h-9 text-xs" onClick={() => setSelectedColors([])}>
                      Limpar Cor
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Gênero</h4>
                  <div className="flex flex-wrap gap-2">
                    {(['all','feminino','masculino','unisex'] as const).map(g => (
                      <Button
                        key={g}
                        variant={genderFilter === g ? 'default' : 'ghost'}
                        className="rounded-full h-9 px-3 text-xs"
                        onClick={() => setGenderFilter(g)}
                      >
                        {g === 'all' ? 'Todos' : g.charAt(0).toUpperCase()+g.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <aside className="hidden lg:block w-full lg:w-72 space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-foreground uppercase tracking-wider text-xs">
                <ListFilter className="w-4 h-4" />
                Categorias
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <Button 
                  variant={activeCategory === 'all' ? 'default' : 'ghost'} 
                  className={`justify-start font-bold rounded-xl h-10 ${activeCategory === 'all' ? 'shadow-md shadow-primary/20' : ''}`}
                  onClick={() => setActiveCategory('all')}
                >
                  Todos
                </Button>
                {categories
                  .filter((cat) => products.some((p) => p.category === cat.slug))
                  .map((cat) => (
                  <Button 
                    key={cat.id} 
                    variant={activeCategory === cat.slug ? 'default' : 'ghost'} 
                    className={`justify-start font-bold rounded-xl h-10 ${activeCategory === cat.slug ? 'shadow-md shadow-primary/20' : ''}`}
                    onClick={() => setActiveCategory(cat.slug)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
            {colorCounts.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2 text-foreground uppercase tracking-wider text-xs">
                  <ListFilter className="w-4 h-4" />
                  Cor
                </h3>
                <div className="bg-white rounded-2xl border p-3 max-h-64 overflow-auto">
                  {colorCounts.map(([key, info]) => {
                    const label = info.label;
                    const isSel = selectedColors.includes(label);
                    return (
                      <label key={key} className="flex items-center justify-between gap-2 py-1 text-sm">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedColors(prev => [...prev, label]);
                              else setSelectedColors(prev => prev.filter(x => x !== label));
                            }}
                          />
                          <span className="text-muted-foreground">{label}</span>
                        </div>
                        <span className="text-[10px] font-bold text-primary/70">{info.count}</span>
                      </label>
                    );
                  })}
                </div>
                <Button 
                  variant="outline"
                  className="rounded-xl h-10"
                  onClick={() => setSelectedColors([])}
                >
                  Limpar Cor
                </Button>
              </div>
            )}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-foreground uppercase tracking-wider text-xs">
                <ListFilter className="w-4 h-4" />
                Gênero
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <Button 
                  variant={genderFilter === 'all' ? 'default' : 'ghost'} 
                  className={`justify-start font-bold rounded-xl h-10 ${genderFilter === 'all' ? 'shadow-md shadow-primary/20' : ''}`}
                  onClick={() => setGenderFilter('all')}
                >
                  Todos
                </Button>
                <Button 
                  variant={genderFilter === 'feminino' ? 'default' : 'ghost'} 
                  className={`justify-start font-bold rounded-xl h-10 ${genderFilter === 'feminino' ? 'shadow-md shadow-primary/20' : ''}`}
                  onClick={() => setGenderFilter('feminino')}
                >
                  Feminino
                </Button>
                <Button 
                  variant={genderFilter === 'masculino' ? 'default' : 'ghost'} 
                  className={`justify-start font-bold rounded-xl h-10 ${genderFilter === 'masculino' ? 'shadow-md shadow-primary/20' : ''}`}
                  onClick={() => setGenderFilter('masculino')}
                >
                  Masculino
                </Button>
                <Button 
                  variant={genderFilter === 'unisex' ? 'default' : 'ghost'} 
                  className={`justify-start font-bold rounded-xl h-10 ${genderFilter === 'unisex' ? 'shadow-md shadow-primary/20' : ''}`}
                  onClick={() => setGenderFilter('unisex')}
                >
                  Unissex
                </Button>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Exibindo <span className="text-foreground font-bold">{filteredProducts.length}</span> itens
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase text-muted-foreground font-bold tracking-widest">Ordenar por</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl border border-primary/10 h-9 px-3 text-sm"
                >
                  <option value="destaque">Destaque</option>
                  <option value="novidades">Novidades</option>
                  <option value="menor-preco">Menor preço</option>
                  <option value="maior-preco">Maior preço</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <p>Carregando coleção...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8 animate-in fade-in duration-500">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-muted">
                <p className="text-base font-medium text-muted-foreground mb-4 italic">Nenhum produto cadastrado nesta categoria ainda.</p>
                <Button onClick={() => setActiveCategory('all')} variant="outline">Ver todos</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 bg-background min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Carregando catálogo...</p>
          </div>
        </div>
      }
    >
      <CatalogInner />
    </Suspense>
  );
}
