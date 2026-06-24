import { Metadata } from 'next';
import HomeClient from '@/components/home-client';

export const metadata: Metadata = {
  title: 'Roupa de Bebê e Enxoval no Barreiro, BH | Neném Chique',
  description: 'Procurando roupa de bebê no Barreiro, Belo Horizonte? Especialistas em enxoval premium e hipoalergênico. Entrega expressa em BH e Frete Grátis +R$299.',
  openGraph: {
    title: 'Roupa de Bebê e Enxoval no Barreiro, BH | Neném Chique',
    description: 'A melhor loja de enxoval premium e roupas antialérgicas no Barreiro. Compre online com entrega expressa para toda Belo Horizonte.',
    images: ['/imagens/logo.png'],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
