
"use client"

import { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCcw, Move, Maximize2, ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PRODUCTS } from '@/lib/data';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function VirtualFittingPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  
  // Adjustment states
  const [position, setPosition] = useState({ x: 50, y: 30 });
  const [scale, setScale] = useState(150);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acesso à Câmera Negado',
          description: 'Por favor, habilite as permissões de câmera nas configurações do seu navegador.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [toast]);

  const resetAdjustments = () => {
    setPosition({ x: 50, y: 30 });
    setScale(150);
    setRotation(0);
  };

  return (
    <div className="min-h-screen bg-[#FDF8FB] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-primary/20 text-primary border-none rounded-full px-4 py-1">Exclusivo</Badge>
            <h1 className="text-4xl font-bold mb-2">Provador Virtual Infantil</h1>
            <p className="text-muted-foreground italic">Veja como as roupinhas ficam no seu bebê em tempo real</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Camera Viewport */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative aspect-[4/3] bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover scale-x-[-1]" 
                  autoPlay 
                  muted 
                  playsInline 
                />
                
                {/* Overlay Image */}
                {hasCameraPermission && (
                  <div 
                    className="absolute pointer-events-none transition-transform duration-75"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                      width: `${scale}px`,
                      height: 'auto'
                    }}
                  >
                    <div className="relative aspect-[3/4] w-full">
                       <Image 
                        src={selectedProduct.images[0]} 
                        alt={selectedProduct.name}
                        fill
                        className="object-contain opacity-90"
                      />
                    </div>
                  </div>
                )}

                {/* Error State */}
                {hasCameraPermission === false && (
                  <div className="absolute inset-0 flex items-center justify-center p-8 bg-muted/90 text-center">
                    <Alert variant="destructive" className="max-w-sm rounded-3xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Câmera Indisponível</AlertTitle>
                      <AlertDescription>
                        Não conseguimos acessar sua câmera. Verifique as permissões do navegador e tente novamente.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Controls HUD overlay (mobile style) */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
                  <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg pointer-events-auto flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Ao Vivo</span>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="rounded-full shadow-lg pointer-events-auto bg-white/80 backdrop-blur-md"
                    onClick={resetAdjustments}
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Adjustment Sliders */}
              <Card className="rounded-[30px] border-none shadow-xl bg-white overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <Maximize2 className="w-4 h-4 text-primary" /> Tamanho
                        </label>
                        <span className="text-xs font-medium text-muted-foreground">{scale}px</span>
                      </div>
                      <Slider 
                        value={[scale]} 
                        min={50} 
                        max={400} 
                        step={1} 
                        onValueChange={([val]) => setScale(val)} 
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <RefreshCcw className="w-4 h-4 text-primary" /> Rotação
                        </label>
                        <span className="text-xs font-medium text-muted-foreground">{rotation}°</span>
                      </div>
                      <Slider 
                        value={[rotation]} 
                        min={-45} 
                        max={45} 
                        step={1} 
                        onValueChange={([val]) => setRotation(val)} 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <Move className="w-4 h-4 text-primary" /> Posição Horizontal
                      </label>
                      <Slider 
                        value={[position.x]} 
                        min={0} 
                        max={100} 
                        step={1} 
                        onValueChange={([val]) => setPosition(p => ({ ...p, x: val }))} 
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <Move className="w-4 h-4 text-primary" /> Posição Vertical
                      </label>
                      <Slider 
                        value={[position.y]} 
                        min={0} 
                        max={100} 
                        step={1} 
                        onValueChange={([val]) => setPosition(p => ({ ...p, y: val }))} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selection Sidebar */}
            <aside className="space-y-6">
              <h3 className="font-bold text-xl mb-4 px-2">Escolha uma peça</h3>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                {PRODUCTS.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`relative p-3 rounded-3xl border-2 transition-all text-left flex items-center gap-4 group ${
                      selectedProduct.id === product.id 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-transparent bg-white hover:border-primary/30'
                    }`}
                  >
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden shadow-sm shrink-0">
                      <Image 
                        src={product.images[0]} 
                        alt={product.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-primary uppercase mb-1">{product.category}</p>
                      <h4 className="font-bold text-sm truncate leading-tight">{product.name}</h4>
                      <p className="text-sm font-black text-foreground mt-1">
                        {product.promoPrice ? (
                          <>
                            R$ {product.promoPrice.toFixed(2)} <span className="text-xs text-muted-foreground line-through ml-1">R$ {product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <>R$ {product.price.toFixed(2)}</>
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-6 bg-primary rounded-[30px] text-white shadow-lg shadow-primary/20">
                <ShoppingBag className="w-8 h-8 mb-4 opacity-80" />
                <h4 className="font-bold text-lg mb-2">Gostou da peça?</h4>
                <p className="text-sm opacity-90 mb-6">Fale agora com nossas consultoras e reserve para seu enxoval.</p>
                <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-2xl font-bold">
                  Comprar via WhatsApp
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
