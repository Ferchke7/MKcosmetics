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
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Price filter state
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Brand search within dropdown
  const [brandSearch, setBrandSearch] = useState('');

  const barRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
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
        const res = await catalogApi.getProducts({ q: searchQuery.trim(), pageSize: 6 });
        setSuggestions(res.products || []);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Left Buttons: Categories / Brands / Price */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* 1. Categories dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'categories' ? null : 'categories')}
                className={`h-10 px-3.5 rounded-card text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeMenu === 'categories'
                    ? 'bg-gold text-white'
                    : 'bg-cream-soft hover:bg-cream-deep text-ink border border-line'
                }`}
              >
                <span>Категории</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMenu === 'categories' ? 'rotate-180' : ''}`} />
              </button>

              {activeMenu === 'categories' && (
                <div className="absolute top-full left-0 mt-2 w-[320px] sm:w-[480px] bg-paper rounded-2xl shadow-soft-lg border border-line p-4 z-40 max-h-[75vh] overflow-y-auto animate-in fade-in duration-150">
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
                          <div className="text-xs font-medium text-ink group-hover:text-gold transition-colors truncate">
                            {c.title}
                          </div>
                          <div className="text-[10px] text-muted">{c.count} шт.</div>
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
                onClick={() => setActiveMenu(activeMenu === 'brands' ? null : 'brands')}
                className={`h-10 px-3.5 rounded-card text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeMenu === 'brands'
                    ? 'bg-gold text-white'
                    : 'bg-cream-soft hover:bg-cream-deep text-ink border border-line'
                }`}
              >
                <span>Бренды</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMenu === 'brands' ? 'rotate-180' : ''}`} />
              </button>

              {activeMenu === 'brands' && (
                <div className="absolute top-full left-0 mt-2 w-[280px] sm:w-[360px] bg-paper rounded-2xl shadow-soft-lg border border-line p-4 z-40 max-h-[75vh] overflow-y-auto animate-in fade-in duration-150">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Поиск по бренду..."
                      className="w-full h-8 px-3 text-xs bg-cream-soft rounded-lg border border-line focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    {filteredBrands.map((b) => (
                      <button
                        key={b.slug}
                        type="button"
                        onClick={() => handleSelectBrand(b.name)}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs hover:bg-cream-soft transition-colors group"
                      >
                        <span className="font-medium text-ink group-hover:text-gold transition-colors">{b.name}</span>
                        <span className="text-[11px] text-muted">{b.count}</span>
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
                className={`h-10 px-3.5 rounded-card text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeMenu === 'price'
                    ? 'bg-gold text-white'
                    : 'bg-cream-soft hover:bg-cream-deep text-ink border border-line'
                }`}
              >
                <span>Цена</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMenu === 'price' ? 'rotate-180' : ''}`} />
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

          {/* Right: Search Input with Live Suggestions */}
          <div className="relative flex-1">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Поиск косметики по названию, бренду..."
                className="w-full h-10 pl-10 pr-9 rounded-card bg-cream-soft border border-line text-xs sm:text-sm text-ink placeholder-muted focus:outline-none focus:border-gold focus:bg-paper transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Live Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-paper rounded-2xl shadow-soft-lg border border-line p-2 z-40 max-h-[420px] overflow-y-auto animate-in fade-in duration-150">
                <div className="p-2 text-[11px] font-bold uppercase tracking-wider text-muted border-b border-line">
                  Найдено в каталоге
                </div>
                <div className="divide-y divide-line/60">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/product/${p.slug}`);
                      }}
                      className="w-full p-2.5 flex items-center gap-3 hover:bg-cream-soft transition-colors text-left rounded-xl"
                    >
                      <img
                        src={p.photos?.[0]?.w150 || p.photos?.[0]?.full || '/placeholder.png'}
                        alt={p.title}
                        className="w-10 h-10 rounded-lg object-cover bg-cream-deep shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-semibold text-gold uppercase">{p.brand}</div>
                        <div className="text-xs font-medium text-ink truncate">{p.title}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-ink">{formatKrw(p.priceKrw)}</div>
                        {p.oldPriceKrw > p.priceKrw && (
                          <div className="text-[10px] text-muted line-through">{formatKrw(p.oldPriceKrw)}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full text-center py-2.5 text-xs text-gold font-semibold hover:underline border-t border-line mt-1 block"
                >
                  Смотреть все результаты для «{searchQuery}» →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
