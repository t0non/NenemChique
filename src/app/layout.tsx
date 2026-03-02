import type {Metadata} from 'next';
import './globals.css';
import {Navbar} from '@/components/navbar';
import {Footer} from '@/components/footer';
import {Toaster} from '@/components/ui/toaster';
import { WhatsAppIcon } from '@/components/whatsapp-icon';
import { Button } from '@/components/ui/button';
import { CartProvider } from '@/context/cart-context';
import { TopBanner } from '@/components/top-banner';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'EnxovalNuvem - O carinho que seu bebê merece',
  description: 'Enxovais exclusivos e curadoria personalizada para os primeiros meses de vida.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://picsum.photos" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <FirebaseClientProvider>
          <CartProvider>
            <TopBanner />
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
            
            {/* Floating Pulsing WhatsApp Button - Cor Verde Oficial */}
            <div className="fixed bottom-8 right-8 z-50">
              <Button 
                size="lg" 
                className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full h-16 w-16 shadow-2xl animate-pulse-gentle p-0 border-none group"
                asChild
              >
                <a href="https://wa.me/5531999384130" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <WhatsAppIcon className="w-9 h-9 fill-white" />
                </a>
              </Button>
            </div>
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
