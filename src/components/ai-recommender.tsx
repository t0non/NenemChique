
"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Baby, Loader2, ArrowRight, CheckCircle2, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { formatPhoneBR, digitsOnlyPhone } from '@/lib/utils';
import { personalizedLayetteKitRecommendation, PersonalizedLayetteKitRecommendationOutput } from '@/ai/flows/personalized-layette-kit-recommendation';

export function AIRecommender() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PersonalizedLayetteKitRecommendationOutput | null>(null);
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    babyAgeSize: '',
    season: ''
  });

  const handleRecommend = async () => {
    if (!form.babyAgeSize || !form.season || !form.name || !form.whatsapp) return;
    setLoading(true);
    try {
      const recommendation = await personalizedLayetteKitRecommendation({
        babyAgeSize: form.babyAgeSize,
        season: form.season
      });
      setResult(recommendation);
      
      // Salvar o lead no Supabase
      try {
        await supabase.from('leads').insert({
          name: form.name,
          whatsapp: digitsOnlyPhone(form.whatsapp),
          source: 'ai_recommender',
          data: { 
            babyAgeSize: form.babyAgeSize, 
            season: form.season,
            recommendations: recommendation.recommendations 
          }
        });
      } catch (dbError) {
        // Silently fail
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-6 py-2 text-xs font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border-none rounded-full">Tecnologia & Carinho</Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">Recomendador Inteligente</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto italic leading-relaxed">
              "Deixe que nossa IA cuide da organização enquanto você cuida do que importa."
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <Card className="border-none shadow-2xl bg-white rounded-[40px] p-8 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <CardHeader className="px-0 pt-0 relative z-10">
                <CardTitle className="flex items-center gap-3 text-3xl">
                  <Baby className="w-8 h-8 text-primary" />
                  Perfil do Bebê
                </CardTitle>
                <CardDescription className="text-lg">Personalize sua experiência em segundos.</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-6 mt-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Seu Nome</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                      <Input 
                        placeholder="Ex: Maria Silva" 
                        className="rounded-2xl border-muted bg-muted/20 h-14 pl-11"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                      <Input 
                        placeholder="(00) 00000-0000" 
                        className="rounded-2xl border-muted bg-muted/20 h-14 pl-11"
                        value={form.whatsapp}
                        onChange={(e) => setForm({ ...form, whatsapp: formatPhoneBR(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Idade / Tamanho do Bebê</Label>
                  <Select onValueChange={(val) => setForm({ ...form, babyAgeSize: val })}>
                    <SelectTrigger className="rounded-2xl border-muted bg-muted/20 h-14 px-6">
                      <SelectValue placeholder="Selecione o tamanho" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="Recém-nascido (RN)">Recém-nascido (RN)</SelectItem>
                      <SelectItem value="0-3 meses">0-3 meses (P)</SelectItem>
                      <SelectItem value="3-6 meses">3-6 meses (M)</SelectItem>
                      <SelectItem value="6-9 meses">6-9 meses (G)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Estação do Nascimento</Label>
                  <Select onValueChange={(val) => setForm({ ...form, season: val })}>
                    <SelectTrigger className="rounded-2xl border-muted bg-muted/20 h-14 px-6">
                      <SelectValue placeholder="Selecione a estação" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="Verão">Verão</SelectItem>
                      <SelectItem value="Inverno">Inverno</SelectItem>
                      <SelectItem value="Primavera">Primavera</SelectItem>
                      <SelectItem value="Outono">Outono</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleRecommend} 
                  disabled={loading || !form.babyAgeSize || !form.season || !form.name || !form.whatsapp}
                  className="w-full h-16 rounded-full text-lg font-bold gap-3 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] bg-pink-gradient border-none text-white"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                  Gerar Minha Curadoria
                </Button>
                <p className="text-[10px] text-center text-muted-foreground opacity-60">
                  Ao clicar, você concorda em receber nossa curadoria via WhatsApp.
                </p>
              </CardContent>
            </Card>

            <div className="min-h-[400px]">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] shadow-xl border-2 border-dashed border-primary/20 animate-pulse">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold">Analisando tendências...</h3>
                  <p className="text-muted-foreground mt-4">Estamos selecionando as melhores peças para o seu bebê.</p>
                </div>
              ) : result ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
                  <div className="p-10 bg-white rounded-[40px] shadow-2xl border border-primary/5">
                    <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                      Sua Curadoria
                    </h3>
                    <ul className="grid grid-cols-1 gap-4 mb-8">
                      {result.recommendations.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-4 bg-background p-5 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                            <Baby className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-foreground text-lg leading-tight">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 pt-8 border-t border-muted">
                      <h4 className="font-black text-xs uppercase text-primary tracking-[0.2em] mb-4">Por que sugerimos isso?</h4>
                      <p className="text-base text-muted-foreground leading-relaxed italic">
                        "{result.justifications}"
                      </p>
                    </div>
                    <Button asChild variant="outline" className="w-full mt-10 h-14 rounded-full font-bold border-primary text-primary hover:bg-primary/5 text-base group">
                      <Link href="/catalog" className="flex items-center gap-2">
                        Ver Coleção Disponível
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/40 rounded-[40px] border-2 border-dashed border-muted shadow-inner">
                  <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-muted" />
                  </div>
                  <h3 className="text-2xl font-bold text-muted-foreground">Aguardando seu perfil...</h3>
                  <p className="text-muted-foreground mt-4 max-w-xs mx-auto">Preencha os dados ao lado para receber sua curadoria personalizada em instantes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
