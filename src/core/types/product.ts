export type ProductCategory = 
  | 'all'
  | 'anti-aging'
  | 'peeling-cleansing'
  | 'sets'
  | 'hydration-serums'
  | 'sun-care'
  | 'premium-luxury';

export type SkinConcern = 
  | 'anti-age'
  | 'hydration'
  | 'brightening'
  | 'pores-acne'
  | 'sensitive'
  | 'pigmentation'
  | 'lifting';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  skinConcerns: SkinConcern[];
  description: string;
  shortDescription: string;
  priceKrw: number;
  originalPriceKrw?: number;
  images: string[];
  volume?: string;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isNew?: boolean;
  inStock: boolean;
  keyIngredients: string[];
  benefits: string[];
  howToUse?: string;
  telegramPostUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
