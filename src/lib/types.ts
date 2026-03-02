
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  limitedStock?: boolean;
  stockCount?: number;
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
