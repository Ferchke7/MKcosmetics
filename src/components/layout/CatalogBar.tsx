import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  X,
  Clock,
  Trash2,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { CatalogCategory, CatalogBrand, CatalogProduct } from '../../core/types/catalog';
import { catalogApi } from '../../api/catalogApi';
import { formatKrw } from '../ui/Price';

interface CatalogBarProps {
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  cartCount?: number;
  onOpenCart?: () => void;
}

const RECENT_SEARCHES_KEY = 'mk_recent_searches';

export const CatalogBar: React.FC<CatalogBarProps> = ({ categories, brands }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<'categories' | 'brands' | 'price' | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CatalogProduct[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Recent searches stored in localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Price filter state
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Brand search within dropdown
  const [brandSearch, setBrandSearch] = useState('');

  const barRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Save to recent searches
  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return;
    setRecentSearches((prev) => {
      const updated = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  const removeRecentSearch = (term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Close dropdowns on outside click or touch
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

  // Debounced live search suggestions
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
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      setShowSuggestions(false);
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectProduct = (slug: string) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
    }
    setShowSuggestions(false);
    navigate(`/product/${slug}`);
  };

  const handleSelectCategory = (slug: string) => {
    setActiveMenu(null);
    setShowSuggestions(false);
    if (!slug || slug === 'all') {
      navigate('/catalog');
    } else {
      navigate(`/catalog?categorySlug=${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBrand = (brandName: string) => {
    setActiveMenu(null);
    setShowSuggestions(false);
    saveRecentSearch(brandName);
    navigate(`/catalog?brand=${encodeURIComponent(brandName)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const popularBrands = brands.slice(0, 8);
  const popularCategories = categories.slice(0, 6);

  return (
    <>
      {/* 1. Backdrop Scrim: Dims background when search or menus are active */}
      {(showSuggestions || activeMenu) && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-30 transition-opacity animate-in fade-in duration-200"
          onClick={() => {
            setShowSuggestions(false);
            setActiveMenu(null);
          }}
          aria-hidden="true"
        />
      )}

      {/* 2. Main Sticky Bar */}
      <div
        ref={barRef}
        className={`sticky top-0 bg-[#FAF8F5] border-y border-[#E8E4DC] shadow-sm transition-all duration-200 ${
          showSuggestions || activeMenu ? 'z-40' : 'z-30'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 relative">
          {/* Mobile: 2-Row layout. Desktop: 1-Row layout */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5">
            {/* Row 1 (Mobile) / Left (Desktop): Categories & Brands Pills */}
            <div className="flex items-center gap-2 shrink-0">
              {/* 1. Categories Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuggestions(false);
                    setActiveMenu(activeMenu === 'categories' ? null : 'categories');
                  }}
                  className={`h-9 sm:h-11 px-3.5 sm:px-4.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                    activeMenu === 'categories'
                      ? 'bg-gold text-white shadow-xs'
                      : 'bg-white hover:bg-[#F2EDE4] active:bg-[#ECE6DA] text-ink border border-[#E0DBD1]'
                  }`}
                >
                  <span>Категории</span>
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${activeMenu === 'categories' ? 'rotate-180' : ''}`} />
                </button>

                {activeMenu === 'categories' && (
                  <div className="absolute top-full left-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-[480px] max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E0DBD1] p-3.5 sm:p-5 z-50 max-h-[75vh] overflow-y-auto animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E8E4DC] text-xs font-bold uppercase tracking-wider text-muted">
                      <span>Все категории ({categories.length})</span>
                      <button
                        type="button"
                        onClick={() => handleSelectCategory('all')}
                        className="text-gold hover:underline capitalize font-semibold cursor-pointer"
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
                          className="flex items-center gap-2.5 p-2 rounded-xl text-left bg-[#FAF8F5] hover:bg-[#F2EDE4] active:bg-[#ECE6DA] border border-[#EAE5DC] transition-colors group cursor-pointer"
                        >
                          {c.photo ? (
                            <img src={c.photo} alt={c.title} className="w-8 h-8 rounded-lg object-cover bg-white shrink-0 border border-[#EAE5DC]" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-white border border-[#EAE5DC] flex items-center justify-center text-muted shrink-0 text-xs font-serif">
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

              {/* 2. Brands Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuggestions(false);
                    setActiveMenu(activeMenu === 'brands' ? null : 'brands');
                  }}
                  className={`h-9 sm:h-11 px-3.5 sm:px-4.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                    activeMenu === 'brands'
                      ? 'bg-gold text-white shadow-xs'
                      : 'bg-white hover:bg-[#F2EDE4] active:bg-[#ECE6DA] text-ink border border-[#E0DBD1]'
                  }`}
                >
                  <span>Бренды</span>
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${activeMenu === 'brands' ? 'rotate-180' : ''}`} />
                </button>

                {activeMenu === 'brands' && (
                  <div className="absolute top-full left-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-[380px] max-w-sm bg-white rounded-2xl shadow-2xl border border-[#E0DBD1] p-3.5 sm:p-5 z-50 max-h-[75vh] overflow-y-auto animate-in fade-in duration-150">
                    <div className="mb-3">
                      <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        placeholder="Поиск по бренду..."
                        className="w-full h-9 px-3 text-xs sm:text-sm bg-[#FAF8F5] rounded-xl border border-[#E0DBD1] focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredBrands.map((b) => (
                        <button
                          key={b.slug}
                          type="button"
                          onClick={() => handleSelectBrand(b.name)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm hover:bg-[#FAF8F5] transition-colors group cursor-pointer"
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

              {/* 3. Price Filter (Desktop only) */}
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuggestions(false);
                    setActiveMenu(activeMenu === 'price' ? null : 'price');
                  }}
                  className={`h-11 px-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeMenu === 'price'
                      ? 'bg-gold text-white'
                      : 'bg-white hover:bg-[#F2EDE4] text-ink border border-[#E0DBD1]'
                  }`}
                >
                  <span>Цена</span>
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${activeMenu === 'price' ? 'rotate-180' : ''}`} />
                </button>

                {activeMenu === 'price' && (
                  <div className="absolute top-full left-0 mt-2 w-[280px] bg-white rounded-2xl shadow-2xl border border-[#E0DBD1] p-4 z-50 animate-in fade-in duration-150">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Цена (₩ KRW)</div>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="number"
                        placeholder="От"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-1/2 h-9 px-3 text-xs bg-[#FAF8F5] rounded-xl border border-[#E0DBD1] focus:outline-none focus:border-gold"
                      />
                      <span className="text-muted">—</span>
                      <input
                        type="number"
                        placeholder="До"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-1/2 h-9 px-3 text-xs bg-[#FAF8F5] rounded-xl border border-[#E0DBD1] focus:outline-none focus:border-gold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyPrice}
                      className="w-full btn-gold h-9 text-xs font-semibold cursor-pointer"
                    >
                      Применить
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2 (Mobile) / Right (Desktop): Full Width Search Input */}
            <div className="flex-1 w-full">
              <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8A8680] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    inputMode="search"
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      setActiveMenu(null);
                      setShowSuggestions(true);
                    }}
                    placeholder="Поиск косметики по названию, бренду..."
                    className="w-full h-10 sm:h-11 pl-10 sm:pl-11 pr-10 rounded-2xl bg-white hover:bg-[#FAF8F5] focus:bg-white border border-[#E0DBD1] focus:border-gold text-xs sm:text-sm text-ink placeholder-[#8A8680] focus:outline-none transition-all shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSuggestions([]);
                        setTotalFound(0);
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-muted hover:text-ink transition-colors cursor-pointer"
                      aria-label="Очистить"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>

                {/* Cancel button visible on mobile when search suggestions are open */}
                {showSuggestions && (
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="sm:hidden px-2 text-xs font-bold text-muted hover:text-ink shrink-0 cursor-pointer"
                  >
                    Отмена
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SEARCH DROPDOWN / RESULTS PANEL: 100% SOLID OPAQUE WHITE      */}
          {/* ============================================================== */}
          {showSuggestions && (
            <div className="absolute top-full left-2 right-2 sm:left-6 sm:right-6 lg:left-8 lg:right-8 mt-2 bg-white rounded-2xl shadow-2xl border border-[#E0DBD1] p-3.5 sm:p-5 z-50 max-h-[75vh] sm:max-h-[580px] overflow-y-auto animate-in fade-in duration-150">
              {/* 1. Searching indicator */}
              {isSearching ? (
                <div className="py-12 text-center text-xs text-muted flex items-center justify-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                  <span>Ищем «{searchQuery}» в каталоге...</span>
                </div>
              ) : suggestions.length > 0 ? (
                /* 2. Results Found */
                <>
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E8E4DC] text-xs font-bold uppercase tracking-wider text-muted">
                    <span className="flex items-center gap-1.5">
                      <span>Найдено товаров</span>
                      {totalFound > 0 && <span className="text-gold">({totalFound})</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="text-gold hover:underline font-semibold capitalize text-xs cursor-pointer"
                    >
                      Показать все ({totalFound || suggestions.length})
                    </button>
                  </div>

                  {/* Clean spacious cards: 1 col on mobile, 2 cols on tablet/desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    {suggestions.map((p) => {
                      const photoUrl = p.photos?.[0]?.w150 || p.photos?.[0]?.full || p.images?.[0] || '/logo.png';
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProduct(p.slug)}
                          className="p-2.5 sm:p-3 flex items-center gap-3 bg-[#FAF8F5] hover:bg-[#F4EFE6] active:bg-[#ECE5D8] border border-[#EAE4D8] hover:border-[#B89254]/50 rounded-xl transition-all text-left group cursor-pointer"
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white overflow-hidden shrink-0 border border-[#E8E2D5] p-1 flex items-center justify-center">
                            <img
                              src={photoUrl}
                              alt={p.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain transition-transform group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.png';
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] sm:text-[11px] font-bold text-gold uppercase tracking-wider truncate">
                              {p.brand || 'K-Beauty'}
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-ink line-clamp-2 leading-snug group-hover:text-gold transition-colors mt-0.5">
                              {p.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-ink">
                                {formatKrw(p.priceKrw)}
                              </span>
                              {p.oldPriceKrw > p.priceKrw && (
                                <span className="text-[10px] sm:text-xs text-muted line-through">
                                  {formatKrw(p.oldPriceKrw)}
                                </span>
                              )}
                              {p.discountPct > 0 && (
                                <span className="px-1.5 py-0.5 bg-[#E53935] text-white text-[9px] font-bold rounded">
                                  -{p.discountPct}%
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted/50 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full text-center py-3 text-xs sm:text-sm text-gold font-bold hover:underline border-t border-[#E8E4DC] mt-3.5 block tracking-wide cursor-pointer"
                  >
                    Смотреть все найденные товары ({totalFound || suggestions.length}) в каталоге →
                  </button>
                </>
              ) : searchQuery.trim().length >= 2 ? (
                /* 3. Empty Results */
                <div className="py-8 px-4 text-center space-y-2">
                  <div className="text-xs sm:text-sm font-semibold text-ink">
                    По запросу «{searchQuery}» ничего не найдено в каталоге
                  </div>
                  <div className="text-xs text-muted max-w-sm mx-auto">
                    Попробуйте поискать по бренду (напр. Sulwhasoo, Medi-Peel) или категории
                  </div>
                </div>
              ) : (
                /* 4. Default Hints when search input is focused but empty */
                <div className="space-y-4 py-1">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted mb-2">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gold" />
                          <span>История поиска</span>
                        </span>
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-[11px] text-muted hover:text-sale lowercase flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>очистить</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term) => (
                          <div
                            key={term}
                            className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#E0DBD1] rounded-xl text-xs font-medium text-ink transition-colors"
                          >
                            <span
                              onClick={() => {
                                setSearchQuery(term);
                                saveRecentSearch(term);
                              }}
                              className="cursor-pointer"
                            >
                              {term}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecentSearch(term);
                              }}
                              className="text-muted hover:text-sale p-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span>Популярные бренды</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {popularBrands.map((b) => (
                        <button
                          key={b.slug}
                          type="button"
                          onClick={() => handleSelectBrand(b.name)}
                          className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-gold hover:text-white border border-[#E0DBD1] text-xs font-semibold text-ink rounded-full transition-all active:scale-95 cursor-pointer shadow-2xs"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-gold" />
                      <span>Популярные категории</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {popularCategories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCategory(c.slug)}
                          className="p-2 sm:p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#E0DBD1] flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                        >
                          {c.photo ? (
                            <img src={c.photo} alt={c.title} className="w-7 h-7 rounded-lg object-cover bg-white shrink-0 border border-[#E0DBD1]" />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-white border border-[#E0DBD1] flex items-center justify-center text-muted shrink-0 text-[10px] font-serif">
                              MK
                            </div>
                          )}
                          <span className="text-xs font-medium text-ink truncate flex-1">
                            {c.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
