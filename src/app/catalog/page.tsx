import { Metadata } from 'next';
import CatalogClient from '@/components/catalog-client';

export const metadata: Metadata = {
  title: 'Catálogo Completo de Enxovais e Roupas Infantis',
  description: 'Explore nosso catálogo completo de roupinhas de bebê, saídas de maternidade, bodies, sapatinhos e kits de enxoval com qualidade premium.',
  openGraph: {
    title: 'Catálogo Completo | Neném Chique',
    description: 'Navegue por todas as nossas categorias de roupas infantis e monte o enxoval perfeito.',
  },
};

export default function CatalogPage() {
  return <CatalogClient />;
}
