
import { Product, Category, Testimonial } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Saída de Maternidade', slug: 'saida-maternidade' },
  { id: '2', name: 'Macacões', slug: 'macacoes' },
  { id: '5', name: 'Bodies', slug: 'bodies' },
  { id: '3', name: 'Sapatinhos', slug: 'sapatinhos' },
  { id: '4', name: 'Kits Enxoval', slug: 'kits' },
];

const baseProducts: Product[] = [
  {
    id: 'p1',
    name: 'Saída de Maternidade Nuvem Soft',
    description: 'Conjunto completo em tricot hipoalergênico com manta e macacão. Delicado e macio para o primeiro contato do bebê.',
    price: 189.90,
    category: 'saida-maternidade',
    images: ['https://picsum.photos/seed/saida-nuvem-soft/800/1000'],
    limitedStock: true,
    stockCount: 3,
  },
  {
    id: 'p1-alt',
    name: 'Saída de Maternidade Tricot Classic',
    description: 'Design atemporal em tricot de algodão premium. Conforto térmico ideal.',
    price: 219.00,
    category: 'saida-maternidade',
    images: ['https://picsum.photos/seed/saida-tricot-classic/800/1000'],
    limitedStock: false,
  },
  {
    id: 'p2',
    name: 'Body Manga Longa Algodão Pima',
    description: 'Essencial para o dia a dia. Gola americana que facilita a troca. Tecido premium extra macio.',
    price: 49.90,
    category: 'bodies',
    images: ['https://picsum.photos/seed/body-pima/800/1000'],
    limitedStock: false,
  },
  {
    id: 'p5',
    name: 'Macacão Ursinho Soft',
    description: 'Ideal para dias mais frios, com toque aveludado e proteção para o bebê.',
    price: 89.90,
    category: 'macacoes',
    images: ['https://picsum.photos/seed/macacao-ursinho-soft/800/1000'],
    limitedStock: false,
  },
  {
    id: 'p3',
    name: 'Sapatinho de Tricot Luxo',
    description: 'Feito à mão com linha antialérgica. Conforto absoluto para os pezinhos do recém-nascido.',
    price: 39.90,
    category: 'sapatinhos',
    images: ['https://picsum.photos/seed/sapatinho-tricot-luxo/800/1000'],
    limitedStock: true,
    stockCount: 8,
  },
  {
    id: 'p6',
    name: 'Pantufa de Algodão Soft',
    description: 'Macia e quentinha, não aperta o tornozelo e mantém o pezinho protegido.',
    price: 24.90,
    category: 'sapatinhos',
    images: ['https://picsum.photos/seed/pantufa-soft/800/1000'],
    limitedStock: false,
  },
  {
    id: 'p7',
    name: 'Manta Antialérgica Soft',
    description: 'Manta em tecido hipoalergênico, perfeita para o conforto e proteção do bebê.',
    price: 89.90,
    category: 'kits',
    images: ['https://picsum.photos/seed/manta-soft/800/1000'],
    limitedStock: false,
  },
  {
    id: 'p4',
    name: 'Kit Enxoval Completo 12 Peças',
    description: 'Tudo o que você precisa para os primeiros meses. Curadoria exclusiva Neném Chique.',
    price: 599.00,
    category: 'kits',
    images: ['https://picsum.photos/seed/kit-completo-12/800/1000'],
    limitedStock: false,
  },
  {
    id: 'p4-basico',
    name: 'Kit Primeiros Passos 5 Peças',
    description: 'Essenciais para a primeira semana. Toque de Neném Chique na pele do bebê.',
    price: 249.00,
    category: 'kits',
    images: ['https://picsum.photos/seed/kit-basico-5/800/1000'],
    limitedStock: false,
  }
];

function padCategory(items: Product[], category: string, baseName: string, baseId: string, basePrice: number, promoBase?: number): Product[] {
  const list = items.filter(p => p.category === category);
  const result = [...items];
  let i = list.length;
  while (i < 8) {
    const idx = i + 1;
    const price = parseFloat((basePrice + (idx * 7.13) % 60).toFixed(2));
    result.push({
      id: `${baseId}-${idx}`,
      name: `${baseName} ${idx}`,
      description: 'Peça confortável e macia para o dia a dia.',
      price,
      category,
      images: [`https://picsum.photos/seed/${baseId}-${idx}/800/1000`],
      limitedStock: idx % 3 === 0,
      stockCount: idx % 3 === 0 ? 5 + idx : undefined,
      promoPrice: promoBase !== undefined ? promoBase : undefined,
    });
    i++;
  }
  return result;
}

let PRODUCTS_WORK = [...baseProducts];
PRODUCTS_WORK = padCategory(PRODUCTS_WORK, 'saida-maternidade', 'Saída de Maternidade Tricot', 'saida', 179);
PRODUCTS_WORK = padCategory(PRODUCTS_WORK, 'bodies', 'Body Algodão', 'body', 29, 15);
PRODUCTS_WORK = padCategory(PRODUCTS_WORK, 'macacoes', 'Macacão Algodão', 'macacao', 79);
PRODUCTS_WORK = padCategory(PRODUCTS_WORK, 'sapatinhos', 'Sapatinho Tricot', 'sapatinho', 29);
PRODUCTS_WORK = padCategory(PRODUCTS_WORK, 'kits', 'Kit Enxoval', 'kit', 199);

export const PRODUCTS: Product[] = PRODUCTS_WORK;

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Mariana Silva',
    comment: 'A saída de maternidade é linda demais! O material é muito macio e chegou super rápido. Recomendo muito.',
    rating: 5,
    imageUrl: 'https://picsum.photos/seed/t1/200/200',
    babyName: 'Arthur',
    location: 'São Paulo, SP'
  },
  {
    id: 't2',
    name: 'Camila Rodrigues',
    comment: 'O atendimento pelo WhatsApp foi excelente. Tiraram todas as minhas dúvidas sobre os tamanhos e o kit é maravilhoso.',
    rating: 5,
    imageUrl: 'https://picsum.photos/seed/t2/200/200',
    babyName: 'Alice',
    location: 'Rio de Janeiro, RJ'
  },
  {
    id: 't3',
    name: 'Fernanda Oliveira',
    comment: 'Kits impecáveis. Comprei o enxoval completo aqui e a qualidade é surpreendente. O tricot é muito suave.',
    rating: 5,
    imageUrl: 'https://picsum.photos/seed/t3/200/200',
    babyName: 'Theo',
    location: 'Curitiba, PR'
  },
];
