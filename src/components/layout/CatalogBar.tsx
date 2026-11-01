import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Tag, Sparkles, X } from 'lucide-react';
import { CatalogCategory, CatalogBrand, CatalogProduct } from '../../core/types/catalog';
import { catalogApi } from '../../api/catalogApi';
import { formatKrw } from '../ui/Price';

interface CatalogBarProps {
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  cartCount?: number;
  onOpenCart?: () => void;
}

export const CatalogBar: React.FC<CatalogBarProps> = ({ categories, brands }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<'categories' | 'brands' | 'price' | null>(null);

  // Search state with live suggestions
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CatalogProduct[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Price filter state
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Brand search within dropdown
  const [brandSearch, setBrandSearch] = useState('');

  const barRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or mobile touch
  useEffect(() => {
    const handleDocClick = (e: MouseEvent | TouchEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    document.addEventListener('touchstart', handleDocClick);
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      document.removeEventListener('touchstart', handleDocClick);
    };
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await catalogApi.getProducts({ q: searchQuery.trim(), pageSize: 12 });
        setSuggestions(res.products || []);
        setTotalFound(res.total || res.products?.length || 0);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Suggest error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectCategory = (slug: string) => {
    setActiveMenu(null);
    if (!slug || slug === 'all') {
      navigate('/catalog');
    } else {
      navigate(`/catalog?categorySlug=${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBrand = (brandName: string) => {
    setActiveMenu(null);
    navigate(`/catalog?brand=${encodeURIComponent(brandName)}`);
  };

  const handleApplyPrice = () => {
    setActiveMenu(null);
    const params = new URLSearchParams();
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    navigate(`/catalog?${params.toString()}`);
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div ref={barRef} className="sticky top-0 z-30 bg-paper/95 backdrop-blur-md border-y border-line shadow-sm">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 relative">
        {/* On mobile: Row 1 = Categories & Brands pills; Row 2 = Full width Search bar */}
        {/* On sm+: Single horizontal bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5">
          {/* Pills: Categories / Brands / Price */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 1. Categories dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowSuggestions(false);
                  setActiveMenu(activeMenu === 'categories' ? null : 'categories');
                }}
                className={`h-10 sm:h-11 px-4 sm:px-4.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                  activeMenu === 'categories'
                    ? 'bg-gold text-white shadow-xs'
                    : 'bg-[#F9F7F4] hover:bg-[#F2EDE4] text-ink border border-[#E8E4DC]'
                }`}
              >
                <span>Категории</span>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${activeMenu === 'categories' ? 'rotate-180' : ''}`} />
              </button>

              {activeMenu === 'categories' && (
                <div className="absolute top-full left-0 mt-2 w-[calc(100vw-1.75rem)] sm:w-[480px] max-w-lg bg-paper rounded-2xl shadow-soft-2xl border border-line p-3.5 sm:p-4 z-40 max-h-[75vh] overflow-y-auto animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-line text-xs font-bold uppercase tracking-wider text-muted">
                    <span>Все категории ({categories.length})</span>
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('all')}
                      className="text-gold hover:underline capitalize font-semibold"
                    >
                      Показать все
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCategory(c.slug)}
                        className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-cream-soft transition-colors group"
                      >
                        {c.photo ? (
                          <img src={c.photo} alt={c.title} className="w-8 h-8 rounded-lg object-cover bg-cream-deep shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-cream-deep flex items-center justify-center text-muted shrink-0 text-xs font-serif">
                            MK
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-ink group-hover:text-gold transition-colors truncate">
                            {c.title}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Brands dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowSuggestions(false);
                  setActiveMenu(activeMenu === 'brands' ? null : 'brands');
                }}
                className={`h-10 sm:h-11 px-4 sm:px-4.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                  activeMenu === 'brands'
                    ? 'bg-gold text-white shadow-xs'
                    : 'bg-[#F9F7F4] hover:bg-[#F2EDE4] text-ink border border-[#E8E4DC]'
                }`}
              >
                <span>Бренды</span>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${activeMenu === 'brands' ? 'rotate-180' : ''}`} />
              </button>

              {activeMenu === 'brands' && (
                <div className="absolute top-full left-0 mt-2 w-[calc(100vw-1.75rem)] sm:w-[360px] max-w-sm bg-paper rounded-2xl shadow-soft-2xl border border-line p-3.5 sm:p-4 z-40 max-h-[75vh] overflow-y-auto animate-in fade-in duration-150">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Поиск по бренду..."
                      className="w-full h-9 px-3 text-xs sm:text-sm bg-cream-soft rounded-lg border border-line focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    {filteredBrands.map((b) => (
                      <button
                        key={b.slug}
                        type="button"
                        onClick={() => handleSelectBrand(b.name)}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-cream-soft transition-colors group"
                      >
                        <span className="font-medium text-ink group-hover:text-gold transition-colors">{b.name}</span>
                        <span className="text-[11px] sm:text-xs text-muted">{b.count}</span>
                      </button>
                    ))}
                    {filteredBrands.length === 0 && (
                      <div className="text-center py-4 text-xs text-muted">Бренд не найден</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Price dropdown */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'price' ? null : 'price')}
                className={`h-10 sm:h-11 px-3.5 sm:px-4 rounded-card text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all ${
                  activeMenu === 'price'
                    ? 'bg-gold text-white'
                    : 'bg-cream-soft hover:bg-cream-deep text-ink border border-line'
                }`}
              >
                <span>Цена</span>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${activeMenu === 'price' ? 'rotate-180' : ''}`} />
              </button>

              {activeMenu === 'price' && (
                <div className="absolute top-full left-0 mt-2 w-[280px] bg-paper rounded-2xl shadow-soft-lg border border-line p-4 z-40 animate-in fade-in duration-150">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Цена (₩ KRW)</div>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      placeholder="От"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-1/2 h-9 px-3 text-xs bg-cream-soft rounded-lg border border-line focus:outline-none focus:border-gold"
                    />
                    <span className="text-muted">—</span>
                    <input
                      type="number"
                      placeholder="До"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-1/2 h-9 px-3 text-xs bg-cream-soft rounded-lg border border-line focus:outline-none focus:border-gold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPrice}
                    className="w-full btn-gold h-9 text-xs font-semibold"
                  >
                    Применить
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Input: Full-width on mobile row 2; flex-1 on desktop row 1 */}
          <div className="flex-1 w-full">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4.5 h-4.5 text-[#8A8680] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                inputMode="search"
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setActiveMenu(null);
                  if (suggestions.length > 0 || searchQuery.trim().length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Поиск косметики по названию, бренду..."
                className="w-full h-11 pl-11 pr-10 rounded-2xl bg-[#F9F7F4] hover:bg-[#F2EDE4] focus:bg-white border border-[#E8E4DC] focus:border-gold text-xs sm:text-sm text-ink placeholder-[#8A8680] focus:outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setTotalFound(0);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted hover:text-ink transition-colors"
                  aria-label="Очистить"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Live Search Results: Appears slightly below, across the FULL WIDTH of the container */}
        {showSuggestions && (
          <div className="absolute top-full left-3 right-3 sm:left-6 sm:right-6 lg:left-8 lg:right-8 mt-2 bg-paper/98 backdrop-blur-xl rounded-2xl shadow-soft-2xl border border-line p-3 sm:p-4 z-50 max-h-[75vh] sm:max-h-[540px] overflow-y-auto animate-in fade-in duration-200">
            {isSearching ? (
              <div className="p-8 text-center text-xs text-muted flex items-center justify-center gap-2.5">
                <div className="w-4 h-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                <span>Ищем «{searchQuery}» в каталоге...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <>
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-line text-xs font-bold uppercase tracking-wider text-muted">
                  <span className="flex items-center gap-1.5">
                    <span>Найдено товаров</span>
                    {totalFound > 0 && <span className="text-gold">({totalFound})</span>}
                  </span>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-gold hover:underline font-semibold capitalize text-xs"
                  >
                    Показать все ({totalFound || suggestions.length})
                  </button>
                </div>
                
                {/* Responsive Grid: 1 col on mobile, 2 cols on tablet/desktop with 12 items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/product/${p.slug}`);
                      }}
                      className="p-2 sm:p-2.5 flex items-center gap-3 bg-cream-soft/50 hover:bg-cream-soft border border-line/60 hover:border-gold/40 rounded-xl transition-all text-left group"
                    >
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-lg bg-cream-deep overflow-hidden shrink-0 border border-line/60">
                        <img
                          src={p.photos?.[0]?.w150 || p.photos?.[0]?.full || p.images?.[0] || '/logo.png'}
                          alt={p.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo.png';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-gold uppercase tracking-wider truncate">
                          {p.brand || 'K-Beauty'}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-ink line-clamp-2 leading-snug group-hover:text-gold transition-colors">
                          {p.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs sm:text-sm font-bold text-ink">
                            {formatKrw(p.priceKrw)}
                          </span>
                          {p.oldPriceKrw > p.priceKrw && (
                            <span className="text-[10px] text-muted line-through">
                              {formatKrw(p.oldPriceKrw)}
                            </span>
                          )}
                          {p.discountPct > 0 && (
                            <span className="px-1.5 py-0.2 bg-sale text-white text-[9px] font-bold rounded">
                              -{p.discountPct}%
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full text-center py-3 text-xs sm:text-sm text-gold font-bold hover:underline border-t border-line mt-3 block tracking-wide"
                >
                  Смотреть все найденные товары ({totalFound || suggestions.length}) в каталоге →
                </button>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-muted">
                По запросу «{searchQuery}» ничего не найдено в каталоге
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
