
"use client"

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search, Package, PlusCircle, LayoutDashboard, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: products = [], loading } = useCollection(productsQuery);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({
    name: '',
    category: 'bodies',
    price: '',
    description: '',
    imageUrl: 'https://picsum.photos/seed/baby/600/800'
  });

  const handleSave = async () => {
    if (!db) return;
    setIsAdding(true);
    try {
      const dataToSave = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description,
        images: [formData.imageUrl],
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), dataToSave);
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso!" });
      } else {
        await addDoc(collection(db, 'products'), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Sucesso", description: "Produto adicionado com sucesso!" });
      }
      
      setFormData({ name: '', category: 'bodies', price: '', description: '', imageUrl: 'https://picsum.photos/seed/baby/600/800' });
      setEditingProduct(null);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o produto." });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (confirm('Deseja realmente excluir este produto?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast({ title: "Sucesso", description: "Produto excluído." });
      } catch (error) {
        toast({ variant: "destructive", title: "Erro", description: "Erro ao excluir." });
      }
    }
  };

  const startEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description || '',
      imageUrl: product.images?.[0] || ''
    });
  };

  return (
    <div className="min-h-screen bg-[#FDF8FB] py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2 uppercase tracking-widest">
              <LayoutDashboard className="w-4 h-4" />
              Painel Administrativo
            </div>
            <h1 className="text-3xl font-bold">Gerenciamento de Produtos</h1>
          </div>
          
          <Dialog open={editingProduct !== null || formData.name !== '' ? undefined : undefined}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 h-12" onClick={() => {setEditingProduct(null); setFormData({name:'', category:'bodies', price:'', description:'', imageUrl:'https://picsum.photos/seed/baby/600/800'})}}>
                <PlusCircle className="w-5 h-5" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ex: Macacão Nuvem" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <select 
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="saida-maternidade">Saída de Maternidade</option>
                      <option value="bodies">Bodies & Macacões</option>
                      <option value="sapatinhos">Sapatinhos</option>
                      <option value="kits">Kits Enxoval</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">URL da Imagem</Label>
                    <Input id="image" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Detalhada</Label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full h-24 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button className="rounded-xl font-bold h-12 w-full" onClick={handleSave} disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingProduct ? 'Atualizar' : 'Salvar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Produtos</p>
              <h3 className="text-2xl font-bold">{products.length}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-xl border border-primary/5 overflow-hidden">
          <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-primary/[0.01]">
            <h2 className="text-xl font-bold flex items-center gap-3">
              Catálogo de Produtos
              <Badge variant="outline" className="rounded-full bg-white font-bold border-primary text-primary px-3">{filteredProducts.length}</Badge>
            </h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar..." 
                className="pl-10 rounded-2xl border-muted focus-visible:ring-primary h-11" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/20">
                  <TableHead className="font-bold py-6 pl-8">Produto</TableHead>
                  <TableHead className="font-bold">Categoria</TableHead>
                  <TableHead className="font-bold text-right">Preço</TableHead>
                  <TableHead className="font-bold text-right pr-8">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">Carregando catálogo...</TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">Nenhum produto encontrado.</TableCell>
                  </TableRow>
                ) : filteredProducts.map((p) => (
                  <TableRow key={p.id} className="hover:bg-primary/[0.01] transition-colors group">
                    <TableCell className="py-4 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-sm">
                          <Image src={p.images?.[0] || 'https://picsum.photos/seed/baby/200/200'} alt={p.name} fill className="object-cover" />
                        </div>
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground font-medium">{p.category?.replace('-', ' ')}</TableCell>
                    <TableCell className="text-right font-bold text-primary">R$ {p.price?.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => startEdit(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
