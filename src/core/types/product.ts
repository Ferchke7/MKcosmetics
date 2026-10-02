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

export type ProductSortOption =
  | 'newest'
  | 'oldest'
  | 'price-asc'
  | 'price-desc'
  | 'discount'
  | 'popular'
  | 'name-asc';

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
  discountPercent?: number;
  images: string[];
  volume?: string;
  weight?: string;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isNew?: boolean;
  inStock: boolean;
  keyIngredients: string[];
  benefits: string[];
  howToUse?: string;
  telegramPostUrl?: string;
  tags?: string[];
  timestamp?: number;
  views?: string;
  reactionsCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

