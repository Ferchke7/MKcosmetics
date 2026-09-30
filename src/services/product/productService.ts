import { Product, ProductCategory, SkinConcern } from '../../core/types/product';
import { PRODUCTS_CATALOG } from './productData';

export class ProductService {
  public static getAll(): Product[] {
    return PRODUCTS_CATALOG;
  }

  public static getById(id: string): Product | undefined {
    return PRODUCTS_CATALOG.find((p) => p.id === id);
  }

  public static getBestsellers(): Product[] {
    return PRODUCTS_CATALOG.filter((p) => p.isBestseller);
  }

  public static filterProducts(params: {
    category?: ProductCategory;
    skinConcern?: SkinConcern | 'all';
    searchQuery?: string;
    sortBy?: 'popular' | 'price-asc' | 'price-desc' | 'rating';
  }): Product[] {
    let result = [...PRODUCTS_CATALOG];

    // Filter by Category
    if (params.category && params.category !== 'all') {
      result = result.filter((p) => p.category === params.category);
    }

    // Filter by Skin Concern
    if (params.skinConcern && params.skinConcern !== 'all') {
      result = result.filter((p) => p.skinConcerns.includes(params.skinConcern as SkinConcern));
    }

    // Filter by Search Query
    if (params.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.keyIngredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.priceKrw - b.priceKrw);
          break;
        case 'price-desc':
          result.sort((a, b) => b.priceKrw - a.priceKrw);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
        default:
          result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0) || b.reviewCount - a.reviewCount);
          break;
      }
    }

    return result;
  }
}
