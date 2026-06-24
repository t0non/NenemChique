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
import { LazyClientComponents } from '@/components/lazy-client-components';
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
  metadataBase: new URL('https://nenemchique.com.br'),
  title: {
    default: 'Roupa de Bebê e Enxoval no Barreiro, BH | Neném Chique',
    template: '%s | Neném Chique BH',
  },
  description: 'Procurando roupa de bebê no Barreiro, Belo Horizonte? Especialistas em enxoval premium e hipoalergênico. Entrega expressa em BH e Frete Grátis +R$299.',
  applicationName: 'Neném Chique',
  openGraph: {
    title: 'Roupa de Bebê e Enxoval no Barreiro, BH | Neném Chique',
    description: 'A melhor loja de enxoval premium e roupas antialérgicas no Barreiro. Compre online com entrega expressa para toda Belo Horizonte.',
    url: 'https://nenemchique.com.br',
    siteName: 'Neném Chique BH',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roupa de Bebê e Enxoval em BH | Neném Chique',
    description: 'Especialistas em enxoval premium no Barreiro, Belo Horizonte.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`scroll-smooth overflow-x-hidden ${instrumentSans.variable}`}>
      <head>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5LMNZW8F');
          `}
        </Script>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-KK5SWTYQ0T" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-KK5SWTYQ0T');
          `}
        </Script>
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
                  if (typeof a === 'string') {
                    var s = String(a);
                    if (
                      (s.indexOf('net::ERR_ABORTED') !== -1 && s.indexOf('_rsc=') !== -1) ||
                      s.indexOf('webpack.hot-update') !== -1 ||
                      s.indexOf('_next/static/webpack') !== -1
                    ) {
                      return;
                    }
                  }
                }
                return o.apply(console, arguments);
              };
            })();
          `}</Script>
        ) : null}
        <script
          dangerouslySetInnerHTML={{
            __html: `{
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Neném Chique",
              "url": "https://nenemchique.com.br",
              "logo": "https://nenemchique.com.br/imagens/logo.png",
              "image": "https://nenemchique.com.br/imagens/logo.png",
              "telephone": "+55-31-99624-4487",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Av. Visc. de Ibituruna, 370A",
                "addressLocality": "Belo Horizonte",
                "addressRegion": "MG",
                "postalCode": "30640-080",
                "addressCountry": "BR"
              },
              "areaServed": [
                "Belo Horizonte",
                "Barreiro"
              ]
            }`
          }}
          type="application/ld+json"
        />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen overflow-x-hidden">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5LMNZW8F"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <DataProvider>
          <CartProvider>
            <TopBanner />
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
            <LazyClientComponents />
          </CartProvider>
        </DataProvider>
      </body>
    </html>
  );
}
