import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../api/catalogApi';
import { ProductCard } from '../../components/product/ProductCard';
import { FiltersSidebar } from '../../components/sections/FiltersSidebar';
import { CatalogProduct, CatalogFilterParams } from '../../core/types/catalog';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import {
  SlidersHorizontal,
  ChevronRight,
  ArrowUpDown,
  Search,
  X,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

const PAGE_SIZE = 24;

export const CatalogPage: React.FC = () => {
  const { categorySlug: routeCategorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, items: cartItems, setIsOpen: setIsCartOpen } = useCart();
  const { isFavorite, toggleWishlist } = useWishlist();

  // Mobile filters drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read state from URL route params or search params
  const rawCategory = (routeCategorySlug && routeCategorySlug !== 'all')
    ? routeCategorySlug
    : searchParams.get('categorySlug') || searchParams.get('category') || undefined;
  const categoryParam = rawCategory === 'all' ? undefined : rawCategory;
  const brandParam = searchParams.get('brand') || undefined;
  const queryParam = searchParams.get('q') || '';
  const sortParam = (searchParams.get('sort') as CatalogFilterParams['sort']) || 'popular';
  const isHitParam = searchParams.get('hit') === 'true';
  const minPriceParam = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const inStockParam = searchParams.get('inStock') === 'true';
  const pageParam = Number(searchParams.get('page')) || 1;

  // Local filter draft
  const currentFilters: CatalogFilterParams = useMemo(() => ({
    categorySlug: categoryParam,
    brand: brandParam,
    search: queryParam || undefined,
    sort: sortParam,
    isHit: isHitParam ? true : undefined,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    inStockOnly: inStockParam ? true : undefined,
    page: pageParam,
    limit: PAGE_SIZE,
  }), [categoryParam, brandParam, queryParam, sortParam, isHitParam, minPriceParam, maxPriceParam, inStockParam, pageParam]);

  // Query categories & brands for sidebar counts
  const { data: categories = [] } = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => catalogApi.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['catalog', 'brands'],
    queryFn: () => catalogApi.getBrands(),
    staleTime: 5 * 60 * 1000,
  });

  // Query products with active filters
  const {
    data: productsData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['catalog', 'products', currentFilters],
    queryFn: () => catalogApi.getProducts(currentFilters),
    staleTime: 60 * 1000,
  });

  const products = productsData?.items || [];
  const totalItems = productsData?.total || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  // Update URL helper
  const updateQuery = (updates: Record<string, string | null | undefined>) => {
    const next = new URLSearchParams(searchParams);
    if (categoryParam && !('category' in updates) && !('categorySlug' in updates)) {
      next.set('categorySlug', categoryParam);
    }
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    // Reset page to 1 unless page is explicitly changed
    if (!('page' in updates)) {
      next.delete('page');
    }
    navigate(`/catalog?${next.toString()}`);
  };

  const handleFilterChange = (newFilters: CatalogFilterParams) => {
    updateQuery({
      categorySlug: newFilters.categorySlug || null,
      category: null,
      brand: newFilters.brand,
      minPrice: newFilters.minPrice ? String(newFilters.minPrice) : null,
      maxPrice: newFilters.maxPrice ? String(newFilters.maxPrice) : null,
      hit: newFilters.isHit ? 'true' : null,
      inStock: newFilters.inStockOnly ? 'true' : null,
    });
  };

  const handleSortChange = (newSort: string) => {
    updateQuery({ sort: newSort });
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (categoryParam && !next.has('categorySlug') && !next.has('category')) {
      next.set('categorySlug', categoryParam);
    }
    next.set('page', String(newPage));
    navigate(`/catalog?${next.toString()}`);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleResetAll = () => {
    navigate('/catalog');
  };

  // Determine page title
  const currentCategoryObj = categories.find((c) => c.slug === categoryParam);
  const currentCategoryTitle = currentCategoryObj?.title || (currentCategoryObj as any)?.name || categoryParam;
  const pageTitle = currentCategoryObj
    ? currentCategoryTitle
    : brandParam
    ? `Косметика ${brandParam}`
    : isHitParam
    ? 'Хиты продаж'
    : queryParam
    ? `Поиск: «${queryParam}»`
    : 'Каталог корейской косметики';

  const hasActiveFilters = Boolean(
    categoryParam ||
      brandParam ||
      queryParam ||
      isHitParam ||
      minPriceParam ||
      maxPriceParam ||
      inStockParam
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-ink pb-20">
      {/* Top Breadcrumb & Title */}
      <div className="border-b border-line bg-paper/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center gap-1.5 text-xs text-ink/50 mb-3 tracking-wide">
            <Link to="/" className="hover:text-gold transition-colors">Главная</Link>
            <ChevronRight className="w-3.5 h-3.5 text-line" />
            <Link to="/catalog" className="hover:text-gold transition-colors">Каталог</Link>
            {categoryParam && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-line" />
                <span className="text-ink font-medium">{currentCategoryTitle}</span>
              </>
            )}
            {brandParam && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-line" />
                <span className="text-ink font-medium">{brandParam}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-gold mb-1">ORIGINAL KOREAN BEAUTY</p>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-ink">
                {pageTitle}
              </h1>
            </div>
            <p className="text-xs text-ink/60 font-mono tracking-tight">
              Найдено: <span className="font-bold text-ink">{totalItems}</span> позиций
            </p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-line">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-paper text-xs font-semibold uppercase tracking-wider hover:border-gold transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-gold" />
            Фильтры {hasActiveFilters && '•'}
          </button>

          {/* Active Filter Badges */}
          <div className="hidden lg:flex flex-wrap items-center gap-2 text-xs">
            {brandParam && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cream border border-line font-medium text-ink">
                Бренд: {brandParam}
                <button
                  onClick={() => updateQuery({ brand: null })}
                  className="hover:text-gold ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {categoryParam && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cream border border-line font-medium text-ink">
                {currentCategoryObj?.name || categoryParam}
                <button
                  onClick={() => updateQuery({ category: null })}
                  className="hover:text-gold ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {isHitParam && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/15 text-gold border border-gold/30 font-medium">
                Хиты
                <button
                  onClick={() => updateQuery({ hit: null })}
                  className="hover:text-ink ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {queryParam && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cream border border-line font-medium text-ink">
                «{queryParam}»
                <button
                  onClick={() => updateQuery({ q: null })}
                  className="hover:text-gold ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {hasActiveFilters && (
              <button
                onClick={handleResetAll}
                className="text-xs text-ink/50 hover:text-sale underline ml-2 transition-colors"
              >
                Сбросить все
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-ink/60 hidden sm:inline">Сортировка:</span>
            <div className="relative">
              <select
                value={sortParam}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-paper border border-line rounded-full pl-4 pr-9 py-2 text-xs font-medium text-ink focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="popular">По популярности</option>
                <option value="price_asc">Сначала дешевле (KRW)</option>
                <option value="price_desc">Сначала дороже (KRW)</option>
                <option value="name_asc">По названию (А–Я)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-ink/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <FiltersSidebar
                categories={categories}
                brands={brands}
                filters={currentFilters}
                onChange={handleFilterChange}
                onReset={handleResetAll}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-paper rounded-2xl border border-line/60 p-4 space-y-3 animate-pulse"
                  >
                    <div className="w-full aspect-square rounded-xl bg-line/40" />
                    <div className="h-3 w-1/3 bg-line/40 rounded" />
                    <div className="h-4 w-3/4 bg-line/40 rounded" />
                    <div className="h-4 w-1/2 bg-line/40 rounded" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-paper rounded-2xl border border-line p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center text-ink/40">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl font-normal text-ink">Товары не найдены</h3>
                <p className="text-xs text-ink/60 max-w-md mx-auto leading-relaxed">
                  По выбранным фильтрам ничего не найдено. Попробуйте смягчить критерии поиска или очистить фильтры.
                </p>
                <button
                  onClick={handleResetAll}
                  className="btn-gold text-xs px-6 py-2.5 rounded-full uppercase tracking-wider inline-block"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={isFavorite(product.id)}
                      onToggleFavorite={toggleWishlist}
                      onAddToCart={(p) => {
                        addToCart(p, 1);
                        setIsCartOpen(true);
                      }}
                      inCartCount={cartItems.find((i) => i.product.id === product.id)?.quantity || 0}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-line">
                    <button
                      disabled={pageParam <= 1}
                      onClick={() => handlePageChange(pageParam - 1)}
                      className="px-4 py-2 rounded-full border border-line text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none hover:border-gold hover:text-gold transition-colors"
                    >
                      Назад
                    </button>

                    <div className="flex items-center gap-1 text-xs font-mono">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageParam) <= 2)
                        .map((p, idx, arr) => {
                          const prev = arr[idx - 1];
                          const showEllipsis = prev && p - prev > 1;
                          return (
                            <React.Fragment key={p}>
                              {showEllipsis && <span className="px-1 text-ink/40">…</span>}
                              <button
                                onClick={() => handlePageChange(p)}
                                className={`w-9 h-9 rounded-full font-sans text-xs font-semibold transition-colors ${
                                  p === pageParam
                                    ? 'bg-ink text-paper'
                                    : 'hover:bg-cream border border-line text-ink'
                                }`}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <button
                      disabled={pageParam >= totalPages}
                      onClick={() => handlePageChange(pageParam + 1)}
                      className="px-4 py-2 rounded-full border border-line text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none hover:border-gold hover:text-gold transition-colors"
                    >
                      Вперёд
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-sm bg-[#FDFBF7] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-line bg-paper">
              <span className="font-serif text-lg font-normal">Фильтры</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 rounded-full border border-line flex items-center justify-center hover:bg-cream"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FiltersSidebar
                categories={categories}
                brands={brands}
                filters={currentFilters}
                onChange={(f) => {
                  handleFilterChange(f);
                }}
                onReset={handleResetAll}
              />
            </div>
            <div className="p-4 border-t border-line bg-paper flex gap-2">
              <button
                onClick={() => {
                  handleResetAll();
                  setMobileFiltersOpen(false);
                }}
                className="flex-1 py-3 border border-line rounded-full text-xs font-semibold uppercase tracking-wider hover:border-gold"
              >
                Сброс
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3 btn-gold rounded-full text-xs font-semibold uppercase tracking-wider"
              >
                Показать ({totalItems})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
