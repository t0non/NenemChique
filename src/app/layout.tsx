import type {Metadata, Viewport} from 'next';
import { Instrument_Sans } from 'next/font/google';
import './globals.css';
import {Navbar} from '@/components/navbar';
import {Footer} from '@/components/footer';
import {Toaster} from '@/components/ui/toaster';
import { WhatsAppIcon } from '@/components/whatsapp-icon';
import { Button } from '@/components/ui/button';
import { CartProvider } from '@/context/cart-context';
import { DataProvider } from '@/context/data-context';
import { TopBanner } from '@/components/top-banner';
import { FloatingCartButton } from '@/components/floating-cart-button';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FF69B4',
};

export const metadata: Metadata = {
  title: 'Neném Chique - O carinho que seu bebê merece',
  description: 'Enxovais exclusivos e curadoria personalizada para os primeiros meses de vida.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`scroll-smooth ${instrumentSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://pkparxozauwbpckwplht.supabase.co" />
        <link rel="preconnect" href="https://picsum.photos" />
        <meta property="og:title" content="Neném Chique — Tricot hipoalergênico e curadoria de enxoval" />
        <meta property="og:description" content="Mais do que roupas, memórias para o primeiro dia de vida. Frete grátis a partir de R$ 299." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Neném Chique',
              url: 'https://nenemchique.com.br',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '312'
              }
            })
          }}
          type="application/ld+json"
        />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen overflow-x-hidden">
        <DataProvider>
          <CartProvider>
            <TopBanner />
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
            
            {/* Floating Pulsing WhatsApp Button - Cor Verde Oficial */}
            <div className="fixed bottom-4 right-2 z-50 group">
              <div className="absolute bottom-full right-0 mb-4 w-64 bg-white p-4 rounded-3xl shadow-2xl border border-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  Olá! 👋 Precisa de ajuda para escolher o tamanho ideal ou montar seu enxoval?
                </p>
                <div className="absolute bottom-[-8px] right-6 w-4 h-4 bg-white border-r border-b border-primary/5 rotate-45" />
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-br from-emerald-500 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white rounded-full h-14 w-14 shadow-xl shadow-emerald-300/40 ring-1 ring-white/40 ring-offset-2 ring-offset-emerald-100 transition-transform duration-200 ease-out hover:scale-105 active:scale-95 p-0 relative"
                asChild
              >
                <a href="https://wa.me/5531999384130" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <WhatsAppIcon className="w-8 h-8 fill-white" />
                </a>
              </Button>
            </div>
            {/* Floating Cart Button */}
            <FloatingCartButton />
          </CartProvider>
        </DataProvider>
      </body>
    </html>
  );
}
