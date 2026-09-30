import { useState, useMemo } from 'react';
import { Product, ProductCategory, SkinConcern } from '../core/types/product';
import { ProductService } from '../services/product/productService';

export function useProducts() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [selectedConcern, setSelectedConcern] = useState<SkinConcern | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');

  const products = useMemo(() => {
    return ProductService.filterProducts({
      category: selectedCategory,
      skinConcern: selectedConcern,
      searchQuery,
      sortBy,
    });
  }, [selectedCategory, selectedConcern, searchQuery, sortBy]);

  const bestsellers = useMemo(() => {
    return ProductService.getBestsellers();
  }, []);

  return {
    products,
    bestsellers,
    selectedCategory,
    setSelectedCategory,
    selectedConcern,
    setSelectedConcern,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    totalCount: products.length,
  };
}
