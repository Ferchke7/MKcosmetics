import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../../../core/types/product';
import { useLanguage } from '../../../core/i18n/LanguageContext';

interface GlobalSearchBarProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenCatalogWithQuery: (query: string) => void;
  formatPrice: (amt: number) => string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  products,
  onSelectProduct,
  onOpenCatalogWithQuery,
  formatPrice,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick search keywords
  const popularKeywords = [
    'Curación',
    'JOGABI',
    'Sulwhasoo',
    'Medi-Peel',
    'Сыворотка',
    'Коллаген',
    'SPF защита',
    'Пептиды',
    'Крем для лица',
    'Тонер',
  ];

  // Filter products matching query
  const filteredProducts = query.trim().length >= 2
    ? products
        .filter((p) => {
          const q = query.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            (p.category && p.category.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q)) ||
            (p.keyIngredients && p.keyIngredients.some((ing) => ing.toLowerCase().includes(q)))
          );
        })
        .slice(0, 6)
    : [];

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      setIsOpen(false);
      onOpenCatalogWithQuery(query.trim());
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (product: Product) => {
    setIsOpen(false);
    setQuery('');
    onSelectProduct(product);
  };

  const handleKeywordClick = (kw: string) => {
    setQuery(kw);
    setIsOpen(false);
    onOpenCatalogWithQuery(kw);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Поиск косметики, бренда, состава (SPF, Коллаген, Medi-Peel)..."
          className="w-full h-12 sm:h-13 lg:h-14 pl-12 lg:pl-14 pr-11 lg:pr-12 bg-[#FAF8F5] hover:bg-[#F7F4EF] focus:bg-white text-sm sm:text-base lg:text-base text-[#1A1917] rounded-2xl border border-[#ECE8E1] hover:border-[#B89254]/60 focus:border-[#B89254] focus:ring-4 focus:ring-[#B89254]/10 shadow-xs outline-none transition-all placeholder:text-[#8A8680] placeholder:text-xs sm:placeholder:text-sm lg:placeholder:text-sm font-medium"
        />
        <Search className="w-5 h-5 lg:w-5.5 lg:h-5.5 text-[#B89254] absolute left-4 lg:left-4.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="w-6 h-6 lg:w-7 lg:h-7 absolute right-3.5 lg:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#8A8680] hover:text-[#1A1917] rounded-full hover:bg-black/5 cursor-pointer transition-colors"
            title="Очистить"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Live Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2.5 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#ECE8E1] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Quick Keywords when query is empty */}
          {query.trim().length < 2 && (
            <div className="p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8A8680] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#B89254]" />
                <span>Популярные запросы</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularKeywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleKeywordClick(kw)}
                    className="px-3 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F7F4EF] text-[#1A1917] hover:text-[#B89254] text-xs font-medium border border-[#ECE8E1] hover:border-[#B89254]/50 transition-colors cursor-pointer"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {query.trim().length >= 2 && (
            <div>
              {filteredProducts.length > 0 ? (
                <div className="divide-y divide-[#ECE8E1]/60">
                  <div className="px-4 py-2.5 bg-[#FAF8F5] text-xs font-bold text-[#8A8680] uppercase tracking-wider flex items-center justify-between border-b border-[#ECE8E1]">
                    <span>Найдено в каталоге</span>
                    <span className="text-[#B89254]">{filteredProducts.length}</span>
                  </div>
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelect(prod)}
                      className="p-3 flex items-center gap-3.5 hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                    >
                      <img
                        src={prod.images?.[0] || '/logo.png'}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-[#ECE8E1]"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B89254] block">
                          {prod.brand}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-[#1A1917] group-hover:text-[#B89254] truncate">
                          {prod.name}
                        </h4>
                        <div className="text-xs font-bold text-[#1A1917] mt-0.5">
                          {prod.priceKrw > 0 ? formatPrice(prod.priceKrw) : t('product_price_on_request')}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#B89254] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
                    </div>
                  ))}
                  <div className="p-2.5 bg-[#FAF8F5] text-center border-t border-[#ECE8E1]">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onOpenCatalogWithQuery(query.trim());
                      }}
                      className="text-xs font-bold text-[#B89254] hover:text-[#9E7B42] py-1 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Смотреть все результаты в каталоге</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-[#8A8680] space-y-1">
                  <p className="text-xs sm:text-sm font-semibold text-[#1A1917]">
                    По вашему запросу ничего не найдено
                  </p>
                  <p className="text-xs text-[#8A8680]">
                    Попробуйте ввести другое название или бренд
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
