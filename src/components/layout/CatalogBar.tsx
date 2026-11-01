import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  X,
  ArrowLeft,
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
  const [showDesktopSuggestions, setShowDesktopSuggestions] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Save to recent searches
  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return;
    setRecentSearches((prev) => {
      const updated = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore quota errors
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

  // Lock body scroll when mobile search modal is open
  useEffect(() => {
    if (isMobileSearchOpen) {
      document.body.style.overflow = 'hidden';
      // Auto-focus input on mobile
      const timer = setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileSearchOpen]);

  // Close desktop dropdowns on outside click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent | TouchEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setShowDesktopSuggestions(false);
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
      } catch (err) {
        console.error('Suggest error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      setShowDesktopSuggestions(false);
      setIsMobileSearchOpen(false);
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectProduct = (slug: string) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
    }
    setShowDesktopSuggestions(false);
    setIsMobileSearchOpen(false);
    navigate(`/product/${slug}`);
  };

  const handleSelectCategory = (slug: string) => {
    setActiveMenu(null);
    setIsMobileSearchOpen(false);
    if (!slug || slug === 'all') {
      navigate('/catalog');
    } else {
      navigate(`/catalog?categorySlug=${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBrand = (brandName: string) => {
    setActiveMenu(null);
    setIsMobileSearchOpen(false);
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

  // Top popular brands for quick search chips
  const popularBrands = brands.slice(0, 8);
  const popularCategories = categories.slice(0, 6);

  return (
    <>
      {/* ============================================================== */}
      {/* 1. STICKY CATALOG BAR (Header Navigation) */}
      {/* ============================================================== */}
      <div ref={barRef} className="sticky top-0 z-30 bg-paper/95 backdrop-blur-md border-y border-line shadow-sm">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2 sm:py-2.5 relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5">
            {/* Filter Pills: Categories & Brands (Row 1 on mobile, left side on desktop) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Categories dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowDesktopSuggestions(false);
                    setActiveMenu(activeMenu === 'categories' ? null : 'categories');
                  }}
                  className={`h-9.5 sm:h-11 px-3.5 sm:px-4.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all ${
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

              {/* Brands dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowDesktopSuggestions(false);
                    setActiveMenu(activeMenu === 'brands' ? null : 'brands');
                  }}
                  className={`h-9.5 sm:h-11 px-3.5 sm:px-4.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all ${
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

              {/* Price dropdown (desktop) */}
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'price' ? null : 'price')}
                  className={`h-11 px-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    activeMenu === 'price'
                      ? 'bg-gold text-white'
                      : 'bg-[#F9F7F4] hover:bg-[#F2EDE4] text-ink border border-[#E8E4DC]'
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

            {/* Mobile Search Button Trigger (Row 2 on mobile) */}
            <div className="sm:hidden w-full">
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                className="w-full h-10 px-3.5 rounded-2xl bg-[#F9F7F4] active:bg-[#F2EDE4] border border-[#E8E4DC] flex items-center gap-2.5 text-left text-xs text-[#8A8680] shadow-2xs transition-all"
              >
                <Search className="w-4 h-4 text-gold shrink-0" />
                <span className="truncate flex-1 font-medium">
                  {searchQuery ? searchQuery : 'Поиск косметики по названию, бренду...'}
                </span>
                {searchQuery ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="w-5 h-5 flex items-center justify-center text-muted"
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold/80 px-2 py-0.5 rounded-md bg-gold/10">
                    Поиск
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Search Input (Row 1 on desktop) */}
            <div className="hidden sm:block flex-1 w-full">
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
                    setShowDesktopSuggestions(true);
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
                      setShowDesktopSuggestions(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted hover:text-ink transition-colors"
                    aria-label="Очистить"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Desktop Live Search Dropdown Panel */}
          {showDesktopSuggestions && (
            <div className="hidden sm:block absolute top-full left-6 right-6 lg:left-8 lg:right-8 mt-2 bg-paper/98 backdrop-blur-xl rounded-2xl shadow-soft-2xl border border-line p-4 z-50 max-h-[540px] overflow-y-auto animate-in fade-in duration-200">
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
                      onClick={() => handleSearchSubmit()}
                      className="text-gold hover:underline font-semibold capitalize text-xs"
                    >
                      Показать все ({totalFound || suggestions.length})
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProduct(p.slug)}
                        className="p-2.5 flex items-center gap-3 bg-cream-soft/50 hover:bg-cream-soft border border-line/60 hover:border-gold/40 rounded-xl transition-all text-left group"
                      >
                        <div className="w-14 h-14 rounded-lg bg-cream-deep overflow-hidden shrink-0 border border-line/60">
                          <picture>
                            <source srcSet={p.photos?.[0]?.w150 || p.photos?.[0]?.full || p.images?.[0] || '/logo.webp'} type="image/webp" />
                            <img
                              src={p.photos?.[0]?.w150 || p.photos?.[0]?.full || p.images?.[0] || '/logo.png'}
                              alt={p.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.png';
                              }}
                            />
                          </picture>
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
                    onClick={() => handleSearchSubmit()}
                    className="w-full text-center py-3 text-xs sm:text-sm text-gold font-bold hover:underline border-t border-line mt-3 block tracking-wide"
                  >
                    Смотреть все найденные товары ({totalFound || suggestions.length}) в каталоге →
                  </button>
                </>
              ) : searchQuery.trim().length >= 2 ? (
                <div className="p-8 text-center text-xs text-muted">
                  По запросу «{searchQuery}» ничего не найдено в каталоге
                </div>
              ) : (
                /* Empty query desktop hints */
                <div className="space-y-4 py-2">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted mb-2">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gold" />
                          <span>Недавние поиски</span>
                        </span>
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-[11px] text-muted hover:text-sale lowercase"
                        >
                          очистить
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setSearchQuery(term);
                              saveRecentSearch(term);
                            }}
                            className="px-3 py-1 bg-cream-soft hover:bg-cream-deep border border-line rounded-lg text-xs font-medium text-ink transition-colors"
                          >
                            {term}
                          </button>
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
                          className="px-3 py-1 bg-[#FAF8F5] hover:bg-gold hover:text-white border border-line/80 rounded-lg text-xs font-medium text-ink transition-colors"
                        >
                          {b.name}
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

      {/* ============================================================== */}
      {/* 2. DEDICATED FULL-SCREEN MOBILE SEARCH MODAL / SHEET */}
      {/* ============================================================== */}
      {isMobileSearchOpen && (
        <div className="sm:hidden fixed inset-0 z-50 bg-[#FAF8F5] flex flex-col animate-in fade-in duration-200 overscroll-none">
          {/* Top Search Bar */}
          <div className="px-3 py-2.5 bg-paper border-b border-line shadow-xs flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-cream-soft text-ink shrink-0 transition-colors"
              aria-label="Назад"
            >
              <ArrowLeft className="w-5 h-5 text-ink" />
            </button>

            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={mobileInputRef}
                type="text"
                inputMode="search"
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Бренд, крем, сыворотка..."
                className="w-full h-10 pl-9.5 pr-8 rounded-xl bg-[#F9F7F4] focus:bg-white border border-[#E8E4DC] focus:border-gold text-sm text-ink placeholder-[#8A8680] focus:outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setTotalFound(0);
                    mobileInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-muted hover:text-ink"
                  aria-label="Очистить"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {searchQuery.trim() ? (
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="px-3 h-10 bg-gold text-white font-semibold text-xs rounded-xl shrink-0 shadow-xs"
              >
                Найти
              </button>
            ) : null}
          </div>

          {/* Modal Content Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* If searching spinner */}
            {isSearching && (
              <div className="p-8 text-center text-xs text-muted flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                <span>Ищем «{searchQuery}» в каталоге...</span>
              </div>
            )}

            {/* When search results exist */}
            {!isSearching && suggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-line text-xs font-bold uppercase tracking-wider text-muted">
                  <span className="flex items-center gap-1.5">
                    <span>Найдено товаров</span>
                    {totalFound > 0 && <span className="text-gold">({totalFound})</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="text-gold hover:underline font-semibold capitalize text-xs"
                  >
                    Показать все ({totalFound || suggestions.length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p.slug)}
                      className="w-full p-2.5 flex items-center gap-3 bg-paper active:bg-cream-soft border border-line rounded-2xl transition-all text-left shadow-2xs group"
                    >
                      <div className="w-16 h-16 rounded-xl bg-cream-deep overflow-hidden shrink-0 border border-line/60">
                        <picture>
                          <source srcSet={p.photos?.[0]?.w150 || p.photos?.[0]?.full || p.images?.[0] || '/logo.webp'} type="image/webp" />
                          <img
                            src={p.photos?.[0]?.w150 || p.photos?.[0]?.full || p.images?.[0] || '/logo.png'}
                            alt={p.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                        </picture>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-gold uppercase tracking-wider truncate">
                          {p.brand || 'K-Beauty'}
                        </div>
                        <div className="text-xs font-semibold text-ink line-clamp-2 leading-snug group-hover:text-gold transition-colors">
                          {p.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-bold text-ink">
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

                      <ChevronRight className="w-4 h-4 text-muted/60 shrink-0" />
                    </button>
                  ))}
                </div>

                <div className="pt-2 pb-6">
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full btn-gold py-3 text-xs font-bold tracking-wide rounded-2xl shadow-sm"
                  >
                    Смотреть все ({totalFound || suggestions.length}) в каталоге →
                  </button>
                </div>
              </div>
            )}

            {/* When search query has 0 results */}
            {!isSearching && searchQuery.trim().length >= 2 && suggestions.length === 0 && (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-cream-soft border border-line flex items-center justify-center mx-auto text-muted">
                  <Search className="w-6 h-6 text-muted" />
                </div>
                <div className="text-sm font-semibold text-ink">
                  Ничего не найдено по запросу «{searchQuery}»
                </div>
                <div className="text-xs text-muted max-w-xs mx-auto">
                  Проверьте правильность написания или выберите один из популярных брендов ниже:
                </div>
              </div>
            )}

            {/* Default Hints: Shown when query is empty or when nothing found */}
            {(!searchQuery.trim() || suggestions.length === 0) && (
              <div className="space-y-6">
                {/* 1. Recent Searches (History) */}
                {recentSearches.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold" />
                        <span>История поиска</span>
                      </span>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-[11px] text-muted hover:text-sale lowercase flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>очистить</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <div
                          key={term}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-paper rounded-xl border border-line text-xs font-medium text-ink shadow-2xs"
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
                            className="text-muted hover:text-sale p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Popular Brands */}
                {popularBrands.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span>Популярные бренды</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularBrands.map((b) => (
                        <button
                          key={b.slug}
                          type="button"
                          onClick={() => handleSelectBrand(b.name)}
                          className="px-3.5 py-1.5 rounded-xl bg-paper active:bg-gold active:text-white border border-line text-xs font-semibold text-ink shadow-2xs transition-colors flex items-center gap-1.5"
                        >
                          <span>{b.name}</span>
                          <span className="text-[10px] text-muted">{b.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Popular Categories Quick Tiles */}
                {popularCategories.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                      <TrendingUp className="w-3.5 h-3.5 text-gold" />
                      <span>Популярные категории</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {popularCategories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCategory(c.slug)}
                          className="p-2.5 rounded-xl bg-paper active:bg-cream-soft border border-line flex items-center gap-2.5 text-left shadow-2xs"
                        >
                          {c.photo ? (
                            <img src={c.photo} alt={c.title} className="w-8 h-8 rounded-lg object-cover bg-cream-deep shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-cream-deep flex items-center justify-center text-muted shrink-0 text-xs font-serif">
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
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
