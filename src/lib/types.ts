
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  category: string;
  images: string[];
  isUpsell?: boolean;
  isBestSeller?: boolean;
  bestSellerRank?: number;
  limitedStock?: boolean;
  stockCount?: number;
  sizes?: string[];
  gender?: 'masculino' | 'feminino' | 'unisex';
  colors?: string[];
  createdAt?: string;
  sizePricing?: Record<string, { price: number; promo?: number }>;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  active: boolean;
  createdAt?: string;
  expiresAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  comment: string;
  rating: number;
  imageUrl: string;
  babyName?: string;
  location?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
}
