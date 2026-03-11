import type {Metadata, Viewport} from 'next';
import Script from 'next/script';
import { Instrument_Sans } from 'next/font/google';
import './globals.css';
import {Navbar} from '@/components/navbar';
import {Footer} from '@/components/footer';
import {Toaster} from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { DataProvider } from '@/context/data-context';
import { TopBanner } from '@/components/top-banner';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { ClientLeadWrapper } from '@/components/client-lead-wrapper';
import slide1 from '@/imagens/SLIDE (1).png';
import logo from '@/imagens/logo.png';

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
    <html lang="pt-BR" className={`scroll-smooth overflow-x-hidden ${instrumentSans.variable}`}>
      <head>
        {process.env.NODE_ENV === 'production' ? (
          <Script src="/env.js" strategy="afterInteractive" />
        ) : null}
        {process.env.NODE_ENV !== 'production' ? (
          <Script id="filter-dev-err-aborted" strategy="beforeInteractive">{`
            (function(){
              var o = console.error;
              console.error = function(){
                for (var i=0;i<arguments.length;i++){
                  var a = arguments[i];
                  if (typeof a === 'string' && a.indexOf('net::ERR_ABORTED') !== -1 && a.indexOf('_rsc=') !== -1) {
                    return;
                  }
                }
                return o.apply(console, arguments);
              };
            })();
          `}</Script>
        ) : null}
        <link rel="icon" href={logo.src} sizes="any" />
        <link rel="apple-touch-icon" href={logo.src} />
        <meta name="application-name" content="Neném Chique" />
        <meta name="apple-mobile-web-app-title" content="Neném Chique" />
        {/* Removido preload de imagem para evitar warning de 'preloaded but not used' */}
        <link rel="preconnect" href="https://pkparxozauwbpckwplht.supabase.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://pkparxozauwbpckwplht.supabase.co" />
        <link rel="preconnect" href="https://picsum.photos" crossOrigin="" />
        <link rel="dns-prefetch" href="https://picsum.photos" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://source.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://source.unsplash.com" />
        <link rel="preconnect" href="https://placehold.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://placehold.co" />
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
            <ClientLeadWrapper />
            {/* Floating Cart Button */}
            <FloatingCartButton />
          </CartProvider>
        </DataProvider>
      </body>
    </html>
  );
}
