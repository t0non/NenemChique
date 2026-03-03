"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Phone, ArrowRight, Loader2, CheckCircle2, ChevronLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !name) return;

    setLoading(true);
    try {
      // Normalizar telefone (apenas números)
      const cleanPhone = phone.replace(/\D/g, '');

      // 1. Tentar encontrar o lead pelo WhatsApp ou criar um novo
      const { data: existingLead, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('whatsapp', cleanPhone)
        .single();

      let leadId;

      if (existingLead) {
        // Se já existe, atualizamos o nome se ele mudou
        if (existingLead.name !== name) {
          await supabase.from('leads').update({ name }).eq('id', existingLead.id);
        }
        leadId = existingLead.id;
      } else {
        // Se não existe, criamos um novo
        const { data: newLead, error: insertError } = await supabase
          .from('leads')
          .insert({
            name,
            whatsapp: cleanPhone,
            source: 'login_identification'
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        leadId = newLead.id;
      }

      // 2. Login via LocalStorage
      localStorage.setItem('nenem_user_id', leadId);
      localStorage.setItem('nenem_user_name', name);
      localStorage.setItem('nenem_user_phone', cleanPhone);
      localStorage.setItem('nenem_is_logged', 'true');

      toast({
        title: `Bem-vinda, ${name.split(' ')[0]}! ✨`,
        description: "Agora você terá uma experiência personalizada na Neném Chique.",
      });

      // 3. Pequeno delay para o feedback visual
      setTimeout(() => {
        router.push('/');
      }, 1000);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ops!",
        description: "Ocorreu um erro. Tente novamente em instantes.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isLogged = typeof window !== 'undefined' && localStorage.getItem('nenem_is_logged') === 'true';
  const currentName = typeof window !== 'undefined' ? localStorage.getItem('nenem_user_name') : '';

  if (isLogged) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#FDF8FB]">
        <div className="w-full max-w-md text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-light mb-2">Olá, {currentName?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mb-8">Você já está conectada à nossa nuvem.</p>
          <div className="flex flex-col gap-3">
            <Button asChild className="h-14 rounded-full bg-pink-gradient border-none font-bold text-lg shadow-xl shadow-primary/20">
              <Link href="/">Continuar Compras</Link>
            </Button>
            <Button 
              variant="ghost" 
              className="text-muted-foreground font-bold uppercase tracking-widest text-xs"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#FDF8FB]">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold mb-6 hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-4 h-4" />
            Voltar para a loja
          </Link>
          <h1 className="text-4xl font-light text-foreground mb-2">Identifique-se</h1>
          <p className="text-muted-foreground font-light italic">Para uma experiência cheia de carinho.</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
          <div className="bg-pink-gradient h-3 w-full" />
          <CardHeader className="pt-10 px-10">
            <CardTitle className="text-2xl flex items-center gap-3">
              <MessageCircle className="w-7 h-7 text-primary" />
              Acesso Rápido
            </CardTitle>
            <CardDescription className="text-base">
              Identifique-se apenas uma vez para salvar seus favoritos e acompanhar seus pedidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <form onSubmit={handleIdentify} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-4">Seu Nome</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                    <Input 
                      placeholder="Ex: Maria Silva" 
                      className="rounded-[20px] border-muted bg-muted/20 h-16 pl-14 text-lg focus:ring-primary"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-4">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                    <Input 
                      placeholder="(00) 00000-0000" 
                      className="rounded-[20px] border-muted bg-muted/20 h-16 pl-14 text-lg focus:ring-primary"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !phone || !name}
                className="w-full h-16 rounded-full text-lg font-bold gap-3 shadow-2xl shadow-primary/20 bg-pink-gradient border-none text-white hover:scale-[1.02] transition-all"
              >
                {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <ArrowRight className="w-7 h-7" />}
                Começar Experiência
              </Button>

              <div className="pt-6 border-t border-muted text-center">
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  Ao entrar, você concorda em receber novidades <br />
                  pelo nosso WhatsApp de atendimento.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
