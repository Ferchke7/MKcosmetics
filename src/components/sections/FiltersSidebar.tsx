import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { CatalogCategory, CatalogBrand } from '../../core/types/catalog';

interface FiltersSidebarProps {
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  selectedCategorySlug?: string;
  onSelectCategory: (slug: string) => void;
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  minPrice: string;
  maxPrice: string;
  onChangePrice: (min: string, max: string) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  discountOnly: boolean;
  onToggleDiscount: (val: boolean) => void;
  onResetAll: () => void;
  hasActiveFilters: boolean;
}

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  categories,
  brands,
  selectedCategorySlug,
  onSelectCategory,
  selectedBrands,
  onToggleBrand,
  minPrice,
  maxPrice,
  onChangePrice,
  inStockOnly,
  onToggleInStock,
  discountOnly,
  onToggleDiscount,
  onResetAll,
  hasActiveFilters,
}) => {
  const [brandSearch, setBrandSearch] = useState('');

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gold" />
          <h3 className="font-serif text-lg font-bold text-ink">Фильтры</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetAll}
            className="text-[11px] text-sale hover:underline font-semibold flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Сбросить</span>
          </button>
        )}
      </div>

      {/* 1. Quick Flags (In Stock, Discount) */}
      <div className="space-y-2.5 pb-5 border-b border-line text-xs font-medium">
        <label className="flex items-center gap-2.5 cursor-pointer text-ink select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="w-4 h-4 rounded text-gold focus:ring-gold accent-gold"
          />
          <span>Только в наличии</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-ink select-none">
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(e) => onToggleDiscount(e.target.checked)}
            className="w-4 h-4 rounded text-gold focus:ring-gold accent-gold"
          />
          <span className="text-sale font-semibold">Со скидкой</span>
        </label>
      </div>

      {/* 2. Categories */}
      <div className="space-y-3 pb-5 border-b border-line">
        <div className="text-xs font-bold uppercase tracking-wider text-muted">Категории</div>
        <div className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar text-xs">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              !selectedCategorySlug || selectedCategorySlug === 'all'
                ? 'bg-gold text-white font-semibold'
                : 'text-ink hover:bg-cream-soft'
            }`}
          >
            <span>Все товары</span>
          </button>
          {categories.map((c) => {
            const isSelected = selectedCategorySlug === c.slug;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCategory(c.slug)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-gold text-white font-semibold'
                    : 'text-ink hover:bg-cream-soft'
                }`}
              >
                <span className="truncate pr-2">{c.title}</span>
                <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Brands */}
      <div className="space-y-3 pb-5 border-b border-line">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted">
          <span>Бренды</span>
          {selectedBrands.length > 0 && (
            <span className="text-[10px] text-gold font-bold">Выбрано: {selectedBrands.length}</span>
          )}
        </div>
        <input
          type="text"
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
          placeholder="Поиск бренда..."
          className="w-full h-8 px-2.5 text-xs bg-cream-soft rounded-lg border border-line focus:outline-none focus:border-gold"
        />
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 custom-scrollbar text-xs">
          {filteredBrands.map((b) => {
            const isChecked = selectedBrands.includes(b.name);
            return (
              <label
                key={b.slug}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-cream-soft cursor-pointer text-ink select-none"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleBrand(b.name)}
                    className="w-3.5 h-3.5 rounded text-gold focus:ring-gold accent-gold"
                  />
                  <span className="truncate">{b.name}</span>
                </div>
                <span className="text-[10px] text-muted">{b.count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Price Filter */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-muted">Цена (₩ KRW)</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="От"
            value={minPrice}
            onChange={(e) => onChangePrice(e.target.value, maxPrice)}
            className="w-1/2 h-8 px-2.5 text-xs bg-cream-soft rounded-lg border border-line focus:outline-none focus:border-gold"
          />
          <span className="text-muted text-xs">—</span>
          <input
            type="number"
            placeholder="До"
            value={maxPrice}
            onChange={(e) => onChangePrice(minPrice, e.target.value)}
            className="w-1/2 h-8 px-2.5 text-xs bg-cream-soft rounded-lg border border-line focus:outline-none focus:border-gold"
          />
        </div>
      </div>
    </aside>
  );
};
