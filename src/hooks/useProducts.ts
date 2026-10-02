import { useState, useMemo } from 'react';
import { Product, ProductCategory, SkinConcern, ProductSortOption } from '../core/types/product';
import { TelegramPost } from '../core/types/telegram';
import { ProductService } from '../services/product/productService';

export function useProducts(telegramPosts: TelegramPost[] = []) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedConcern, setSelectedConcern] = useState<SkinConcern | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<ProductSortOption>('newest');
  const [onlyDiscount, setOnlyDiscount] = useState<boolean>(false);
  const [onlyWithPrice, setOnlyWithPrice] = useState<boolean>(false);

  // Convert all telegram posts into typed Product items
  const allProducts: Product[] = useMemo(() => {
    return ProductService.fromTelegramPosts(telegramPosts);
  }, [telegramPosts]);

  // Extract unique brands with product count
  const allBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    for (const p of allProducts) {
      if (p.brand && p.brand !== 'Корейский уход') {
        brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
      }
    }
    return Array.from(brandMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([brand, count]) => ({ brand, count }));
  }, [allProducts]);

  // Extract unique tags/categories with count
  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    for (const p of allProducts) {
      for (const t of p.tags || []) {
        if (t.length > 1) {
          tagMap.set(t, (tagMap.get(t) || 0) + 1);
        }
      }
    }
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [allProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return ProductService.filterAndSort(allProducts, {
      category: selectedCategory,
      brand: selectedBrand,
      skinConcern: selectedConcern,
      searchQuery,
      sortBy,
      onlyDiscount,
      onlyWithPrice,
    });
  }, [allProducts, selectedCategory, selectedBrand, selectedConcern, searchQuery, sortBy, onlyDiscount, onlyWithPrice]);

  const discountCount = useMemo(() => {
    return allProducts.filter((p) => p.discountPercent && p.discountPercent > 0).length;
  }, [allProducts]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedConcern('all');
    setSearchQuery('');
    setSortBy('newest');
    setOnlyDiscount(false);
    setOnlyWithPrice(false);
  };

  const hasActiveFilters = Boolean(
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    selectedConcern !== 'all' ||
    searchQuery.trim() !== '' ||
    onlyDiscount ||
    onlyWithPrice ||
    sortBy !== 'newest'
  );

  return {
    products: filteredProducts,
    allProducts,
    allBrands,
    allTags,
    totalCount: allProducts.length,
    filteredCount: filteredProducts.length,
    discountCount,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    selectedConcern,
    setSelectedConcern,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    onlyDiscount,
    setOnlyDiscount,
    onlyWithPrice,
    setOnlyWithPrice,
    resetFilters,
    hasActiveFilters,
  };
}
