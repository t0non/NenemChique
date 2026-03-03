
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  category: string;
  images: string[];
  isUpsell?: boolean;
  limitedStock?: boolean;
  stockCount?: number;
  sizes?: string[];
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
