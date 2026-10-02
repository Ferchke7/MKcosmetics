import React, { useState, useMemo } from 'react';
import { Product, ProductSortOption } from '../../../core/types/product';
import { ProductCard } from '../Products/ProductCard';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import {
  Search,
  SlidersHorizontal,
  Send,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  LayoutGrid,
  List,
  Flame,
  CheckCircle2,
  X,
  ChevronDown,
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

const ITEMS_PER_PAGE = 12;

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
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Reset pagination when filter/search changes
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
    <div className="bg-[#FAF7F2] min-h-screen pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumbs & Back Button */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8A503C] hover:text-[#C2836B] transition-colors py-1.5 px-3 rounded-full bg-[#FAF5EE] border border-[#EED9CF]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Вернуться на главную</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 text-xs text-[#6C635B] hover:text-[#2D2A2E] bg-white px-3 py-1.5 rounded-full border border-[#EED9CF] transition-colors disabled:opacity-50 shadow-xs"
              title="Синхронизировать с Telegram"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C2836B]' : ''}`} />
              <span>{isRefreshing ? 'Синхронизация…' : 'Обновить из Telegram'}</span>
            </button>
          </div>
        </div>

        {/* Header Banner */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#F5EDE6] via-[#FAF5EE] to-[#FAF7F2] border border-[#EED9CF] p-6 sm:p-10 mb-8 overflow-hidden shadow-xs">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#E8A598]/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#EED9CF] text-xs font-semibold text-[#8A503C] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Каталог товаров • 100% оригинал из Сеула</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#242120] leading-tight">
              Все товары из Telegram
            </h1>

            <p className="text-sm sm:text-base text-[#6C635B] leading-relaxed max-w-2xl">
              Полный актуальный ассортимент из нашего канала{' '}
              <a
                href={BRAND_CONFIG.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#229ED9] hover:underline"
              >
                {BRAND_CONFIG.telegramChannel}
              </a>
              . Выбирайте товары, добавляйте в корзину или оформляйте заказ в WhatsApp напрямую.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[#8C827A]">
              <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-lg border border-[#F0E6DE]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Всего товаров в базе: <strong className="text-[#2D2A2E]">{totalCount}</strong>
              </span>
              {discountCount > 0 && (
                <button
                  onClick={() => onToggleDiscount(!onlyDiscount)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-colors ${
                    onlyDiscount
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white/80 text-[#8A503C] border-[#F0E6DE] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  Со скидкой: <strong>{discountCount}</strong>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search & Main Controls */}
        <div className="space-y-4 mb-8">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8C827A]" />
            <input
              type="search"
              aria-label="Поиск по всему каталогу"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Поиск по названию, бренду (Medi-Peel, Manyo, Sulwhasoo...), ингредиентам или описанию..."
              className="w-full rounded-2xl border border-[#EED9CF] bg-white py-3.5 pl-12 pr-10 text-sm sm:text-base text-[#2D2A2E] placeholder-[#A89F97] shadow-xs focus:border-[#C2836B] focus:outline-none focus:ring-2 focus:ring-[#C2836B]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8C827A] hover:text-[#2D2A2E] rounded-full hover:bg-[#FAF5EE]"
                title="Очистить поиск"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Tag Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => {
                onCategoryChange('all');
                onToggleDiscount(false);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                selectedCategory === 'all' && !onlyDiscount
                  ? 'bg-[#8A503C] text-white shadow-xs'
                  : 'bg-white border border-[#EED9CF] text-[#6C3E2E] hover:bg-[#FAF5EE]'
              }`}
            >
              Все товары ({totalCount})
            </button>

            {discountCount > 0 && (
              <button
                onClick={() => onToggleDiscount(!onlyDiscount)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  onlyDiscount
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                Скидки и акции ({discountCount})
              </button>
            )}

            {allTags.slice(0, 10).map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => {
                  onCategoryChange(selectedCategory === tag ? 'all' : tag);
                }}
                className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition-all ${
                  selectedCategory === tag
                    ? 'bg-[#C2836B] text-white shadow-xs'
                    : 'bg-white border border-[#EED9CF] text-[#6C3E2E] hover:bg-[#FAF5EE]'
                }`}
              >
                #{tag} ({count})
              </button>
            ))}
          </div>

          {/* Filter & Sort Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#EED9CF] shadow-xs">
            {/* Brand and Filter Selects */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Brand Filter */}
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => onBrandChange(e.target.value)}
                  className="appearance-none rounded-xl bg-[#FAF7F2] border border-[#EED9CF] py-2 pl-3 pr-8 text-xs font-semibold text-[#4D2C20] focus:border-[#C2836B] focus:outline-none cursor-pointer"
                >
                  <option value="all">Все бренды ({allBrands.length})</option>
                  {allBrands.map(({ brand, count }) => (
                    <option key={brand} value={brand}>
                      {brand} ({count})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C827A]" />
              </div>

              {/* Price Filter Checkbox */}
              <button
                onClick={() => onToggleWithPrice(!onlyWithPrice)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold border transition-colors ${
                  onlyWithPrice
                    ? 'bg-[#FAF5EE] border-[#C2836B] text-[#8A503C]'
                    : 'bg-[#FAF7F2] border-[#EED9CF] text-[#6C635B] hover:text-[#2D2A2E]'
                }`}
              >
                Только с точной ценой
              </button>
            </div>

            {/* Sort & Layout Controls */}
            <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-[#F0E6DE]">
              {/* Sorting Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8C827A] hidden sm:inline">Сортировка:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as ProductSortOption)}
                    className="appearance-none rounded-xl bg-[#FAF7F2] border border-[#EED9CF] py-2 pl-3 pr-8 text-xs font-semibold text-[#4D2C20] focus:border-[#C2836B] focus:outline-none cursor-pointer"
                  >
                    <option value="newest">🆕 Сначала новые</option>
                    <option value="oldest">⏳ Сначала старые</option>
                    <option value="price-asc">📉 Сначала дешевле</option>
                    <option value="price-desc">📈 Сначала дороже</option>
                    <option value="discount">🔥 Сначала со скидкой</option>
                    <option value="popular">👁️ По популярности</option>
                    <option value="name-asc">🔤 По названию (А-Я)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C827A]" />
                </div>
              </div>

              {/* Grid / List Switcher */}
              <div className="flex items-center bg-[#FAF7F2] p-0.5 rounded-xl border border-[#EED9CF]">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    layoutMode === 'grid'
                      ? 'bg-white text-[#8A503C] shadow-xs'
                      : 'text-[#8C827A] hover:text-[#2D2A2E]'
                  }`}
                  title="Отображение сеткой"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    layoutMode === 'list'
                      ? 'bg-white text-[#8A503C] shadow-xs'
                      : 'text-[#8C827A] hover:text-[#2D2A2E]'
                  }`}
                  title="Отображение списком"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Summary Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-[#8C827A]">
              <div>
                Найдено товаров: <strong className="text-[#2D2A2E]">{filteredCount}</strong> из {totalCount}
              </div>
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 font-semibold text-[#8A503C] hover:text-[#C2836B] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Сбросить все фильтры
              </button>
            </div>
          )}
        </div>

        {/* Product Grid / List */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-[#F0E6DE] bg-white p-4">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Skeleton className="h-9 rounded-xl" />
                  <Skeleton className="h-9 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="space-y-4 rounded-3xl border border-[#F0E6DE] bg-white px-5 py-16 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF5EE] text-[#A89F97]">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-[#2D2A2E]">
              {hasActiveFilters ? 'Товары не найдены' : 'Товаров пока нет'}
            </h3>
            <p className="mx-auto max-w-md text-sm text-[#6C635B] leading-relaxed">
              {hasActiveFilters
                ? 'Попробуйте изменить поисковый запрос, выбрать другой бренд или сбросить фильтры.'
                : 'Свежие поставки косметики публикуются в нашем Telegram-канале.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {hasActiveFilters && (
                <Button variant="outline" size="md" onClick={onResetFilters}>
                  Сбросить фильтры
                </Button>
              )}
              <a
                href={BRAND_CONFIG.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#229ED9] px-6 py-3 text-sm font-medium text-white shadow-xs hover:bg-[#1E8BC0] transition-colors"
              >
                <Send className="h-4 w-4" />
                Перейти в Telegram-канал
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div
              className={
                layoutMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
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
                  layout={layoutMode}
                />
              ))}
            </div>

            {/* Pagination / Load More */}
            {visibleCount < products.length && (
              <div className="text-center pt-6 space-y-3">
                <p className="text-xs text-[#8C827A]">
                  Показано {visibleCount} из {products.length} товаров
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                >
                  Показать еще ({Math.min(ITEMS_PER_PAGE, products.length - visibleCount)} товаров)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
