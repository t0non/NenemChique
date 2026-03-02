
"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { CATEGORIES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ListFilter, Loader2 } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { Product } from '@/lib/types';
import { PRODUCTS } from '@/lib/data';

export default function CatalogPage() {
  const db = useFirestore();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: fetched = [], loading } = useCollection<Product>(productsQuery as any);
  const products: Product[] = fetched.length ? fetched : PRODUCTS;

  useEffect(() => {
    setActiveCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  const filteredProducts: Product[] = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="py-8 bg-background min-h-[80vh]">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary">Nossa Coleção</h1>
          <p className="text-muted-foreground text-base italic">Navegue pelas nossas categorias e encontre o melhor para o seu bebê.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 space-y-6">
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
                {CATEGORIES.map((cat) => (
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
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Exibindo <span className="text-foreground font-bold">{filteredProducts.length}</span> itens
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <p>Carregando coleção...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in duration-500">
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
