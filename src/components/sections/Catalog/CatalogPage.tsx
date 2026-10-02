import React, { useState, useMemo } from 'react';
import { Product, ProductSortOption } from '../../../core/types/product';
import { ProductCard } from '../Products/ProductCard';
import { Skeleton } from '../../ui/Skeleton';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import {
  Search,
  Zap,
  ArrowLeft,
  RotateCcw,
  Flame,
  X,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface CatalogPageProps {
  products: Product[];
  allProducts: Product[];
  allBrands: { brand: string; count: number }[];
  allTags: { tag: string; count: number }[];
  totalCount: number;
  filteredCount: number;
  discountCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
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

const QUICK_CATEGORIES = [
  { id: 'all', label: 'Все товары' },
  { id: 'discount', label: '🔥 Со скидкой', isDiscount: true },
  { id: 'sets', label: 'Наборы' },
  { id: 'hydration-serums', label: 'Сыворотки и ампулы' },
  { id: 'anti-aging', label: 'Антивозрастной уход' },
  { id: 'peeling-cleansing', label: 'Очищение и пилинги' },
  { id: 'sun-care', label: 'SPF защита' },
  { id: 'premium-luxury', label: 'Люкс бренды' },
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
  isRefreshing,
  onRefresh,
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
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Reset pagination when search or filters change
  React.useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, onlyDiscount, onlyWithPrice]);

  const visibleProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation & Refresh Bar */}
        <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-200/80 mb-6">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#111827] hover:text-[#0073E9] transition-colors py-1.5 px-3 rounded-full bg-white border border-gray-200 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Главная страница</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-full border border-gray-200 transition-colors disabled:opacity-50 shadow-2xs"
              title="Обновить товары из Telegram"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0073E9]' : ''}`} />
              <span>{isRefreshing ? 'Синхронизация…' : 'Обновить из Telegram'}</span>
            </button>
          </div>
        </div>

        {/* Coupang Header Title Banner */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-8 mb-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0073E9]/10 text-[#0073E9] text-[11px] font-bold uppercase tracking-wider mb-2">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Каталог косметики из Южной Кореи</span>
              </div>
              <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                Все товары из Telegram ({totalCount})
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-2xl">
                Прямые поставки оригинальной косметики из Сеула по ценам канала @mkcosmetkor.
              </p>
            </div>

            {/* Fast Coupang Search */}
            <div className="relative w-full md:w-80 lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Поиск по бренду, названию..."
                className="w-full rounded-2xl border border-gray-300 bg-white py-2.5 pl-10 pr-9 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-[#0073E9] focus:outline-none focus:ring-2 focus:ring-[#0073E9]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Coupang Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-5 border-t border-gray-100 no-scrollbar">
            {QUICK_CATEGORIES.map((cat) => {
              const isActive = cat.isDiscount
                ? onlyDiscount
                : selectedCategory === cat.id && !onlyDiscount;

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
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? cat.isDiscount
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-[#111827] text-white shadow-xs'
                      : cat.isDiscount
                      ? 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat.label}
                  {cat.isDiscount && discountCount > 0 && ` (${discountCount})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Coupang Controls Bar (Brand Filter, Sort, Status) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 mb-6 shadow-2xs">
          {/* Brand & Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Brand Dropdown */}
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => onBrandChange(e.target.value)}
                className="appearance-none rounded-xl bg-gray-50 border border-gray-200 py-2 pl-3 pr-8 text-xs font-bold text-gray-800 focus:border-[#0073E9] focus:outline-none cursor-pointer"
              >
                <option value="all">Все бренды ({allBrands.length})</option>
                {allBrands.map(({ brand, count }) => (
                  <option key={brand} value={brand}>
                    {brand} ({count})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            </div>

            {/* Discount Only Pill */}
            <button
              onClick={() => onToggleDiscount(!onlyDiscount)}
              className={`rounded-xl px-3 py-2 text-xs font-bold border transition-colors ${
                onlyDiscount
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              🔥 Только скидки ({discountCount})
            </button>

            {/* With Price Only Pill */}
            <button
              onClick={() => onToggleWithPrice(!onlyWithPrice)}
              className={`rounded-xl px-3 py-2 text-xs font-bold border transition-colors ${
                onlyWithPrice
                  ? 'bg-[#0073E9] text-white border-[#0073E9]'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              С точной ценой
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">Сортировка:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as ProductSortOption)}
                className="appearance-none rounded-xl bg-gray-50 border border-gray-200 py-2 pl-3 pr-8 text-xs font-bold text-gray-800 focus:border-[#0073E9] focus:outline-none cursor-pointer"
              >
                <option value="popular">🏆 По популярности</option>
                <option value="newest">🆕 Сначала новинки</option>
                <option value="price-asc">📉 Сначала дешевле</option>
                <option value="price-desc">📈 Сначала дороже</option>
                <option value="discount">🔥 По скидке %</option>
                <option value="name-asc">🔤 По названию (А-Я)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters status header */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between px-2 mb-4 text-xs text-gray-500">
            <span>Найдено товаров: <strong className="text-gray-900">{filteredCount}</strong> из {totalCount}</span>
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 font-bold text-[#0073E9] hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* Products Grid (Coupang 5-columns / 4-columns) */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {[...Array(15)].map((_, index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-3">
                <Skeleton className="aspect-square rounded-xl" />
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
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-2xs space-y-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-sans text-xl font-bold text-gray-900">
              Товары не найдены
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              Попробуйте изменить поисковый запрос, выбрать другой бренд или сбросить фильтры.
            </p>
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="px-5 py-2.5 rounded-full bg-[#111827] text-white text-xs font-bold hover:bg-gray-800 transition-colors"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
              {visibleProducts.map((product) => (
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

            {/* Coupang Load More Button */}
            {visibleCount < products.length && (
              <div className="text-center pt-4 space-y-2">
                <p className="text-xs text-gray-500 font-medium">
                  Показано {visibleCount} из {products.length} товаров
                </p>
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3.5 rounded-2xl bg-white border border-gray-300 hover:border-gray-900 text-gray-900 font-bold text-xs sm:text-sm transition-all shadow-2xs active:scale-95"
                >
                  Показать еще ({Math.min(ITEMS_PER_PAGE, products.length - visibleCount)} товаров)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
