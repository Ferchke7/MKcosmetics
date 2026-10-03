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
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick search keywords
  const popularKeywords = [
    'Curación',
    'JOGABI',
    'Sulwhasoo',
    'Сыворотка',
    'Коллаген',
    'Крем',
    'SPF',
    'Пептиды',
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
            (p.description && p.description.toLowerCase().includes(q))
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
    <div ref={containerRef} className="relative flex-1 max-w-md mx-2 sm:mx-4">
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
          placeholder={language === 'uz' ? "Mahsulot, brend, tarkib bo'yicha qidiruv..." : "Поиск по бренду, товару, составу..."}
          className="w-full h-10 pl-9 pr-8 bg-[#FAF8F5] hover:bg-[#F7F4EF] focus:bg-white text-xs sm:text-sm text-[#1A1917] rounded-full border border-[#ECE8E1] focus:border-[#B89254] focus:ring-2 focus:ring-[#B89254]/20 outline-none transition-all placeholder:text-[#8A8680]"
        />
        <Search className="w-4 h-4 text-[#B89254] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="w-5 h-5 absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#8A8680] hover:text-[#1A1917] rounded-full hover:bg-black/5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Live Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-[#ECE8E1] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Quick Keywords when query is empty */}
          {query.trim().length < 2 && (
            <div className="p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A8680] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#B89254]" />
                <span>{language === 'uz' ? 'Ommabop qidiruvlar' : 'Популярные запросы'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularKeywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleKeywordClick(kw)}
                    className="px-2.5 py-1 rounded-full bg-[#F7F4EF] hover:bg-[#ECE8E1] text-[#1A1917] text-xs font-medium border border-[#ECE8E1] transition-colors cursor-pointer"
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
                <div className="divide-y divide-[#F7F4EF]">
                  <div className="px-3.5 py-2 bg-[#FAF8F5] text-[11px] font-bold text-[#8A8680] uppercase tracking-wider flex items-center justify-between">
                    <span>{language === 'uz' ? 'Topilgan mahsulotlar' : 'Найдено в каталоге'}</span>
                    <span>{filteredProducts.length}</span>
                  </div>
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelect(prod)}
                      className="p-2.5 flex items-center gap-3 hover:bg-[#F7F4EF] transition-colors cursor-pointer group"
                    >
                      <img
                        src={prod.images?.[0] || '/logo.png'}
                        alt={prod.name}
                        className="w-11 h-11 rounded-lg object-cover bg-white shrink-0 border border-[#ECE8E1]"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B89254] block">
                          {prod.brand}
                        </span>
                        <h4 className="text-xs font-medium text-[#1A1917] group-hover:text-[#B89254] truncate">
                          {prod.name}
                        </h4>
                        <div className="text-xs font-bold text-[#1A1917] mt-0.5">
                          {prod.priceKrw > 0 ? formatPrice(prod.priceKrw) : t('product_price_on_request')}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#B89254] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  ))}
                  <div className="p-2 bg-[#FAF8F5] text-center border-t border-[#ECE8E1]">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onOpenCatalogWithQuery(query.trim());
                      }}
                      className="text-xs font-bold text-[#B89254] hover:text-[#9E7B42] py-1 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{language === 'uz' ? "Barcha natijalarni ko'rish" : 'Смотреть все результаты в каталоге'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-[#8A8680] space-y-1">
                  <p className="text-xs font-medium">
                    {language === 'uz' ? 'Hech narsa topilmadi' : 'По вашему запросу ничего не найдено'}
                  </p>
                  <p className="text-[11px] text-[#8A8680]">
                    {language === 'uz' ? 'Boshqa soʻz bilan qidirib koʻring' : 'Попробуйте изменить запрос'}
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
