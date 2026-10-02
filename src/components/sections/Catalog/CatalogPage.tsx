import React, { useState, useMemo } from 'react';
import { Product, ProductSortOption } from '../../../core/types/product';
import { ProductCard } from '../Products/ProductCard';
import { Skeleton } from '../../ui/Skeleton';
import {
  Search,
  ArrowLeft,
  X,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '../../../core/i18n/LanguageContext';
import { Translations } from '../../../core/i18n/translations';

interface CatalogPageProps {
  products: Product[];
  allProducts: Product[];
  allBrands: { brand: string; count: number }[];
  allTags: { tag: string; count: number }[];
  totalCount: number;
  filteredCount: number;
  discountCount: number;
  isLoading: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedBrand: string;
  onBrandChange: (b: string) => void;
  sortBy: ProductSortOption;
  onSortChange: (s: ProductSortOption) => void;
  onlyDiscount: boolean;
  onToggleDiscount: (val: boolean) => void;
  onlyWithPrice: boolean;
  onToggleWithPrice: (val: boolean) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  formatPrice: (amt: number) => string;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onQuickBuy: (title: string, price: string, url?: string) => void;
  onBackToHome: () => void;
}

const ITEMS_PER_PAGE = 20;

const CATEGORIES_CONFIG: { id: string; key: keyof Translations; isDiscount?: boolean }[] = [
  { id: 'all', key: 'cat_all' },
  { id: 'discount', key: 'cat_discount', isDiscount: true },
  { id: 'sets', key: 'cat_sets' },
  { id: 'hydration-serums', key: 'cat_serums' },
  { id: 'anti-aging', key: 'cat_antiaging' },
  { id: 'peeling-cleansing', key: 'cat_cleansing' },
  { id: 'sun-care', key: 'cat_sun' },
  { id: 'premium-luxury', key: 'cat_luxury' },
];

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  allProducts,
  allBrands,
  allTags,
  totalCount,
  filteredCount,
  discountCount,
  isLoading,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  sortBy,
  onSortChange,
  onlyDiscount,
  onToggleDiscount,
  onlyWithPrice,
  onToggleWithPrice,
  onResetFilters,
  hasActiveFilters,
  formatPrice,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onQuickView,
  onQuickBuy,
  onBackToHome,
}) => {
  const { t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [priceRangeFilter, setPriceRangeFilter] = useState<'all' | 'under30k' | '30k-60k' | 'over60k'>('all');

  // Reset pagination when search or filters change
  React.useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, onlyDiscount, onlyWithPrice, priceRangeFilter]);

  // Apply optional local price range filter
  const processedProducts = useMemo(() => {
    if (priceRangeFilter === 'all') return products;

    return products.filter((p) => {
      if (p.priceKrw <= 0) return true;
      if (priceRangeFilter === 'under30k') return p.priceKrw < 30000;
      if (priceRangeFilter === '30k-60k') return p.priceKrw >= 30000 && p.priceKrw <= 60000;
      if (priceRangeFilter === 'over60k') return p.priceKrw > 60000;
      return true;
    });
  }, [products, priceRangeFilter]);

  const visibleProducts = useMemo(() => {
    return processedProducts.slice(0, visibleCount);
  }, [processedProducts, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const isAnyFilterActive = hasActiveFilters || priceRangeFilter !== 'all';

  const handleResetAll = () => {
    setPriceRangeFilter('all');
    onResetFilters();
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen pt-24 pb-24 text-[#111111]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumb & Back Navigation */}
        <div className="flex items-center justify-between gap-4 py-3 border-b border-[#EEEEEE] mb-6">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#555555] transition-colors py-1.5 px-3 rounded-lg bg-[#F5F5F5] hover:bg-[#EBEBEB] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← {t('nav_home')}</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-[#888888]">
            <span>MK KOREA COSMETIC</span>
            <span>•</span>
            <span className="text-[#111111]">100% ORIGINAL</span>
          </div>
        </div>

        {/* Header Title & Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#111111]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#777777] mb-1">
                <span>{t('catalog_badge')}</span>
              </div>
              <h1 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-[#111111]">
                {t('catalog_title')}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#666666]">
                {t('catalog_subtitle')} • <strong className="text-[#111111] font-bold">{totalCount}</strong> {t('catalog_items')}
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80 lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('catalog_search_placeholder')}
                className="w-full rounded-xl border border-[#DCDCDC] bg-[#FAFAFA] py-2.5 pl-10 pr-9 text-xs sm:text-sm text-[#111111] placeholder-[#888888] focus:border-[#111111] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#111111]"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] cursor-pointer"
                  aria-label="Очистить поиск"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Horizontal Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto py-3.5 border-b border-[#EEEEEE] no-scrollbar">
            {CATEGORIES_CONFIG.map((cat) => {
              const isActive = cat.isDiscount
                ? onlyDiscount
                : selectedCategory === cat.id && !onlyDiscount;

              const label = t(cat.key);

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.isDiscount) {
                      onToggleDiscount(!onlyDiscount);
                    } else {
                      onToggleDiscount(false);
                      onCategoryChange(cat.id);
                    }
                  }}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-tight transition-all cursor-pointer ${
                    isActive
                      ? cat.isDiscount
                        ? 'bg-[#FF0038] text-white shadow-sm'
                        : 'bg-[#111111] text-white shadow-sm'
                      : cat.isDiscount
                      ? 'bg-[#FFF0F3] text-[#FF0038] hover:bg-[#FFE0E6] border border-[#FFCCD5]'
                      : 'bg-[#F7F7F7] text-[#444444] hover:bg-[#EBEBEB] hover:text-[#111111]'
                  }`}
                >
                  <span>{label}</span>
                  {cat.isDiscount && discountCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                      {discountCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter & Sorting Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAFAFA] p-3.5 sm:p-4 rounded-xl border border-[#EEEEEE] mb-6">
          {/* Left: Brand Dropdown, Price Filter Pills, Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Brand Dropdown */}
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => onBrandChange(e.target.value)}
                className="appearance-none rounded-lg bg-white border border-[#D5D5D5] py-2 pl-3 pr-8 text-xs font-bold text-[#111111] focus:border-[#111111] focus:outline-none cursor-pointer hover:border-[#999999]"
              >
                <option value="all">{t('catalog_all_brands')} ({allBrands.length})</option>
                {allBrands.map(({ brand, count }) => (
                  <option key={brand} value={brand}>
                    {brand} ({count})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#777777]" />
            </div>

            {/* Price Range Selector */}
            <div className="relative hidden sm:block">
              <select
                value={priceRangeFilter}
                onChange={(e) => setPriceRangeFilter(e.target.value as any)}
                className="appearance-none rounded-lg bg-white border border-[#D5D5D5] py-2 pl-3 pr-8 text-xs font-bold text-[#111111] focus:border-[#111111] focus:outline-none cursor-pointer hover:border-[#999999]"
              >
                <option value="all">{t('catalog_all_prices')}</option>
                <option value="under30k">{t('catalog_under_30k')}</option>
                <option value="30k-60k">{t('catalog_30k_60k')}</option>
                <option value="over60k">{t('catalog_over_60k')}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#777777]" />
            </div>

            {/* Discount Pill */}
            <button
              onClick={() => onToggleDiscount(!onlyDiscount)}
              className={`rounded-lg px-3 py-2 text-xs font-bold border transition-colors cursor-pointer ${
                onlyDiscount
                  ? 'bg-[#FF0038] text-white border-[#FF0038]'
                  : 'bg-white border-[#D5D5D5] text-[#333333] hover:bg-[#F0F0F0]'
              }`}
            >
              🔥 {t('catalog_sale_filter')} ({discountCount})
            </button>

            {/* In-Stock with Price */}
            <button
              onClick={() => onToggleWithPrice(!onlyWithPrice)}
              className={`rounded-lg px-3 py-2 text-xs font-bold border transition-colors cursor-pointer ${
                onlyWithPrice
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white border-[#D5D5D5] text-[#333333] hover:bg-[#F0F0F0]'
              }`}
            >
              {t('catalog_with_price')}
            </button>
          </div>

          {/* Right: Sorting Dropdown & Items Count */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#777777]">
              {processedProducts.length} {t('catalog_items')}
            </span>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as ProductSortOption)}
                className="appearance-none rounded-lg bg-white border border-[#D5D5D5] py-2 pl-3 pr-8 text-xs font-bold text-[#111111] focus:border-[#111111] focus:outline-none cursor-pointer hover:border-[#999999]"
              >
                <option value="popular">{t('catalog_sort_popular')}</option>
                <option value="newest">{t('catalog_sort_newest')}</option>
                <option value="discount">{t('catalog_sort_discount')}</option>
                <option value="price-asc">{t('catalog_sort_price_asc')}</option>
                <option value="price-desc">{t('catalog_sort_price_desc')}</option>
                <option value="name-asc">{t('catalog_sort_name_asc')}</option>
                <option value="oldest">{t('catalog_sort_oldest')}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#777777]" />
            </div>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-[#F8F9FA] rounded-xl border border-[#EEEEEE]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777777] mr-1">
              {t('catalog_active_filters')}
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#D0D0D0] text-xs font-bold text-[#111111]">
                <span>{searchQuery}</span>
                <button onClick={() => onSearchChange('')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedBrand !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#D0D0D0] text-xs font-bold text-[#111111]">
                <span>{selectedBrand}</span>
                <button onClick={() => onBrandChange('all')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#D0D0D0] text-xs font-bold text-[#111111]">
                <span>
                  {(() => {
                    const cfg = CATEGORIES_CONFIG.find((c) => c.id === selectedCategory);
                    return cfg ? t(cfg.key) : selectedCategory;
                  })()}
                </span>
                <button onClick={() => onCategoryChange('all')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {onlyDiscount && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF0F3] border border-[#FFCCD5] text-xs font-bold text-[#FF0038]">
                <span>{t('catalog_sale_filter')}</span>
                <button onClick={() => onToggleDiscount(false)} className="hover:text-red-700 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {onlyWithPrice && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#D0D0D0] text-xs font-bold text-[#111111]">
                <span>{t('catalog_with_price')}</span>
                <button onClick={() => onToggleWithPrice(false)} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {priceRangeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#D0D0D0] text-xs font-bold text-[#111111]">
                <span>
                  {priceRangeFilter === 'under30k' && t('catalog_under_30k')}
                  {priceRangeFilter === '30k-60k' && t('catalog_30k_60k')}
                  {priceRangeFilter === 'over60k' && t('catalog_over_60k')}
                </span>
                <button onClick={() => setPriceRangeFilter('all')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetAll}
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[#777777] hover:text-[#111111] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('catalog_reset_all')}</span>
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-[#EBEBEB] bg-white p-3">
                <Skeleton className="aspect-[4/5] rounded-lg" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <Skeleton className="h-8 rounded-lg" />
                  <Skeleton className="h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-[#FAFAFA] rounded-2xl border border-dashed border-[#D5D5D5] p-8">
            <div className="w-16 h-16 rounded-full bg-[#EEEEEE] text-[#777777] flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-sans text-xl font-bold text-[#111111]">
              {t('catalog_not_found_title')}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#777777] max-w-md mx-auto">
              {t('catalog_not_found_desc')}
            </p>
            <button
              onClick={handleResetAll}
              className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold tracking-wide hover:bg-[#333333] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('catalog_show_all_btn')} ({totalCount})</span>
            </button>
          </div>
        ) : (
          /* 5-Column Responsive Product Grid */
          <div className="space-y-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {visibleProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  rank={sortBy === 'popular' ? index + 1 : undefined}
                  formatPrice={formatPrice}
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={onToggleFavorite}
                  onAddToCart={onAddToCart}
                  onQuickView={onQuickView}
                  onQuickBuy={onQuickBuy}
                />
              ))}
            </div>

            {/* Pagination & Load More */}
            {visibleCount < processedProducts.length && (
              <div className="flex flex-col items-center justify-center pt-8 border-t border-[#EEEEEE] space-y-3">
                <p className="text-xs text-[#777777] font-medium">
                  {t('catalog_showing')} <strong className="text-[#111111]">{visibleCount}</strong> {t('catalog_of')} <strong className="text-[#111111]">{processedProducts.length}</strong> {t('catalog_items')}
                </p>

                {/* Progress bar */}
                <div className="w-48 h-1 bg-[#EBEBEB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#111111] transition-all duration-300"
                    style={{ width: `${Math.min(100, (visibleCount / processedProducts.length) * 100)}%` }}
                  />
                </div>

                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#111111] hover:bg-[#333333] text-white text-xs sm:text-sm font-bold tracking-wider transition-all duration-200 active:scale-95 shadow-md cursor-pointer"
                >
                  <span>{t('catalog_show_more')} ({Math.min(ITEMS_PER_PAGE, processedProducts.length - visibleCount)})</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
