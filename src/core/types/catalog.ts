export interface CatalogPhoto {
  full: string;
  w600: string;
  w300: string;
  w150: string;
}

export interface CatalogCategory {
  id: number;
  parentId: number;
  title: string;
  slug: string;
  photo: string;
  count: number;
}

export interface CatalogProduct {
  id: number;
  sourceId: number;
  slug: string;
  title: string;
  brand: string;
  description: string;
  excerpt: string;
  categoryId: number;
  categoryTitle: string;
  categorySlug: string;
  priceKrw: number;
  oldPriceKrw: number;
  discountPct: number;
  stock: number;
  inStock: boolean;
  archived: boolean;
  photos: CatalogPhoto[];
  isHit: boolean;
  isHidden: boolean;
  brandOverride?: string;
  excerptOverride?: string;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogBrand {
  name: string;
  slug: string;
  count: number;
}

export interface HomeCatalogData {
  hits: CatalogProduct[];
  sets: CatalogProduct[];
  newArrivals: CatalogProduct[];
  categories: CatalogCategory[];
  brandSpotlights: Array<{
    brand: string;
    slug: string;
    count: number;
    products: CatalogProduct[];
  }>;
}

export interface CatalogDeliveryOption {
  id: number;
  title: string;
  cost: number;
  enabled: boolean;
  allow_free: boolean;
}

export interface CatalogFilterParams {
  categoryId?: number;
  categorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  discount?: boolean;
  q?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface CartItem {
  product: CatalogProduct;
  quantity: number;
}
