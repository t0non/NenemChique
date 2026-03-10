import type {Metadata, Viewport} from 'next';
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
        {process.env.NODE_ENV === 'production' ? <script src="/env.js" /> : null}
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="application-name" content="Neném Chique" />
        <meta name="apple-mobile-web-app-title" content="Neném Chique" />
        <link rel="preload" as="image" href={slide1.src} />
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
            <ClientLeadWrapper />
            {/* Floating Cart Button */}
            <FloatingCartButton />
          </CartProvider>
        </DataProvider>
      </body>
    </html>
  );
}
