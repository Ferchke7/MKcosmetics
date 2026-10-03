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
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../../core/i18n/LanguageContext';
import { CatalogHeroHeader } from './CatalogHeroHeader';
import { CatalogFilterSidebar } from './CatalogFilterSidebar';
import { CatalogPromoBanner } from './CatalogPromoBanner';

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

const ITEMS_PER_PAGE = 12; // 3 columns x 4 rows like reference design

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

  // Mobile Filter Drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter state for skin types and price slider
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [currentPriceRange, setCurrentPriceRange] = useState<[number, number]>([0, 150000]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const priceMin = 0;
  const priceMax = 200000;

  // Toggle skin type filter
  const handleToggleSkinType = (typeId: string) => {
    setSelectedSkinTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
  };

  // Reset pagination on filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    sortBy,
    onlyDiscount,
    onlyWithPrice,
    selectedSkinTypes,
    currentPriceRange,
  ]);

  // Combined client-side filtering (tree categories, price slider, skin types)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Price slider
      if (product.priceKrw > 0) {
        if (product.priceKrw < currentPriceRange[0] || product.priceKrw > currentPriceRange[1]) {
          return false;
        }
      }

      // 2. Skin types / concerns
      if (selectedSkinTypes.length > 0) {
        const text = `${product.name} ${product.description} ${(product.keyIngredients || []).join(' ')}`.toLowerCase();
        const matchesAnySkin = selectedSkinTypes.some((type) => {
          if (type === 'dry') return text.includes('сух') || text.includes('увлажн') || text.includes('hydrat');
          if (type === 'oily') return text.includes('жирн') || text.includes('пор') || text.includes('себум') || text.includes('acne');
          if (type === 'sensitive') return text.includes('чувствительн') || text.includes('успокаив') || text.includes('cica');
          if (type === 'combination') return text.includes('комбинирован') || text.includes('баланс');
          if (type === 'normal') return true;
          return false;
        });
        if (!matchesAnySkin) return false;
      }

      return true;
    });
  }, [products, currentPriceRange, selectedSkinTypes]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const isCustomFilterActive =
    hasActiveFilters ||
    selectedSkinTypes.length > 0 ||
    currentPriceRange[1] < 150000 ||
    currentPriceRange[0] > 0;

  const handleResetAll = () => {
    setSelectedSkinTypes([]);
    setCurrentPriceRange([0, 150000]);
    onResetFilters();
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-24 pb-24 text-[#1A1917]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* 1. Elegant Shop Hero Header & Category Diamond Strip */}
        <CatalogHeroHeader
          onBackToHome={onBackToHome}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />

        {/* 2. Main Two-Column Layout (Left: Filter Tree Sidebar, Right: Product Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Desktop Tree Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24">
            <CatalogFilterSidebar
              allBrands={allBrands}
              totalProductsCount={totalCount}
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              selectedBrand={selectedBrand}
              onBrandChange={onBrandChange}
              onlyDiscount={onlyDiscount}
              onToggleDiscount={onToggleDiscount}
              onlyWithPrice={onlyWithPrice}
              onToggleWithPrice={onToggleWithPrice}
              selectedSkinTypes={selectedSkinTypes}
              onToggleSkinType={handleToggleSkinType}
              priceMin={priceMin}
              priceMax={priceMax}
              currentPriceRange={currentPriceRange}
              onPriceRangeChange={setCurrentPriceRange}
              onResetFilters={handleResetAll}
              hasActiveFilters={isCustomFilterActive}
              formatPrice={formatPrice}
            />
          </div>

          {/* Right Column: Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Top Toolbar (Results Count, Mobile Filter Trigger, Sorting) */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-2xs">
              
              {/* Results count */}
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-medium text-[#8A8680]">
                  {t('catalog_showing')}{' '}
                  <strong className="text-[#1A1917]">
                    {filteredProducts.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}
                  </strong>{' '}
                  {t('catalog_of')}{' '}
                  <strong className="text-[#1A1917]">{filteredProducts.length}</strong> {t('catalog_results')}
                </span>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="inline-flex lg:hidden items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#ECE8E1] text-xs font-semibold text-[#1A1917] hover:bg-[#F7F4EF] cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#B89254]" />
                  <span>{t('catalog_filters_title')}</span>
                  {isCustomFilterActive && (
                    <span className="w-2 h-2 rounded-full bg-[#B89254]" />
                  )}
                </button>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8A8680] hidden sm:inline">
                  {t('catalog_sort_label')}:
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as ProductSortOption)}
                    className="appearance-none rounded-xl bg-[#FAF8F5] border border-[#ECE8E1] py-2 pl-3 pr-8 text-xs font-bold text-[#1A1917] focus:border-[#B89254] focus:outline-none cursor-pointer"
                  >
                    <option value="popular">{t('catalog_sort_default')}</option>
                    <option value="newest">{t('catalog_sort_newest')}</option>
                    <option value="discount">{t('catalog_sort_discount')}</option>
                    <option value="price-asc">{t('catalog_sort_price_asc')}</option>
                    <option value="price-desc">{t('catalog_sort_price_desc')}</option>
                    <option value="name-asc">{t('catalog_sort_name_asc')}</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A8680]" />
                </div>
              </div>
            </div>

            {/* Active Filters Pill Row */}
            {isCustomFilterActive && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-[#ECE8E1]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B89254] mr-1">
                  {t('catalog_active_filters')}
                </span>

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#ECE8E1] text-xs font-medium text-[#1A1917]">
                    <span>{searchQuery}</span>
                    <button onClick={() => onSearchChange('')} className="hover:text-red-500 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#ECE8E1] text-xs font-medium text-[#1A1917]">
                    <span>{selectedCategory}</span>
                    <button onClick={() => onCategoryChange('all')} className="hover:text-red-500 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {selectedBrand !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#ECE8E1] text-xs font-medium text-[#1A1917]">
                    <span>{selectedBrand}</span>
                    <button onClick={() => onBrandChange('all')} className="hover:text-red-500 cursor-pointer">
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

                {selectedSkinTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#ECE8E1] text-xs font-medium text-[#1A1917]"
                  >
                    <span>{type}</span>
                    <button onClick={() => handleToggleSkinType(type)} className="hover:text-red-500 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}

                <button
                  onClick={handleResetAll}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#B89254] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('catalog_reset_all')}</span>
                </button>
              </div>
            )}

            {/* Product Grid (3 Columns) */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3 rounded-2xl border border-[#ECE8E1] bg-white p-4">
                    <Skeleton className="aspect-[4/5] rounded-xl" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-9 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20 bg-white rounded-3xl border border-[#ECE8E1] p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] text-[#8A8680] flex items-center justify-center mx-auto border border-[#ECE8E1]">
                  <Search className="w-8 h-8 text-[#B89254]" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#1A1917]">
                  {t('catalog_not_found_title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#8A8680] max-w-md mx-auto">
                  {t('catalog_not_found_desc')}
                </p>
                <button
                  onClick={handleResetAll}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1A1917] hover:bg-[#B89254] text-white text-xs font-semibold tracking-wide transition-colors shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('catalog_show_all_btn')} ({totalCount})</span>
                </button>
              </div>
            ) : (
              /* 3-Column Luxury Product Grid */
              <div className="space-y-10">
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      formatPrice={formatPrice}
                      isFavorite={isFavorite(product.id)}
                      onToggleFavorite={onToggleFavorite}
                      onAddToCart={onAddToCart}
                      onQuickView={onQuickView}
                      onQuickBuy={onQuickBuy}
                    />
                  ))}
                </div>

                {/* Numbered Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-8 border-t border-[#ECE8E1]">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl text-[#8A8680] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      const isActive = currentPage === pageNum;

                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#1A1917] text-[#B89254] shadow-xs'
                                : 'bg-white text-[#8A8680] hover:bg-[#FAF8F5] border border-[#ECE8E1]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        (pageNum === 2 && currentPage > 3) ||
                        (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <span key={pageNum} className="px-1 text-xs text-[#8A8680]">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl text-[#8A8680] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Bottom Editorial Campaign Promo Banner */}
        <CatalogPromoBanner
          onExploreSale={() => {
            onToggleDiscount(true);
            window.scrollTo({ top: 400, behavior: 'smooth' });
          }}
        />

        {/* 4. Mobile Filter Slide-out Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 z-10 w-[88%] max-w-sm bg-white p-5 shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#ECE8E1]">
                <span className="font-serif text-lg font-semibold text-[#1A1917]">
                  {t('catalog_filters_title')}
                </span>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full text-[#8A8680] hover:bg-[#FAF8F5]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <CatalogFilterSidebar
                allBrands={allBrands}
                totalProductsCount={totalCount}
                selectedCategory={selectedCategory}
                onCategoryChange={(cat) => {
                  onCategoryChange(cat);
                  setIsMobileFilterOpen(false);
                }}
                selectedBrand={selectedBrand}
                onBrandChange={(b) => {
                  onBrandChange(b);
                  setIsMobileFilterOpen(false);
                }}
                onlyDiscount={onlyDiscount}
                onToggleDiscount={onToggleDiscount}
                onlyWithPrice={onlyWithPrice}
                onToggleWithPrice={onToggleWithPrice}
                selectedSkinTypes={selectedSkinTypes}
                onToggleSkinType={handleToggleSkinType}
                priceMin={priceMin}
                priceMax={priceMax}
                currentPriceRange={currentPriceRange}
                onPriceRangeChange={setCurrentPriceRange}
                onResetFilters={handleResetAll}
                hasActiveFilters={isCustomFilterActive}
                formatPrice={formatPrice}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
