import React, { useState } from 'react';
import { Filter, X, Search, Check, Flame, Package } from 'lucide-react';
import { CatalogCategory, CatalogBrand, CatalogFilterParams } from '../../core/types/catalog';

export interface FiltersSidebarProps {
  categories?: CatalogCategory[];
  brands?: CatalogBrand[];
  filters?: CatalogFilterParams;
  onChange?: (filters: CatalogFilterParams) => void;
  onReset?: () => void;

  // Legacy direct props support
  selectedCategorySlug?: string;
  onSelectCategory?: (slug: string) => void;
  selectedBrands?: string[];
  onToggleBrand?: (brand: string) => void;
  minPrice?: string | number;
  maxPrice?: string | number;
  onChangePrice?: (min: string, max: string) => void;
  inStockOnly?: boolean;
  onToggleInStock?: (val: boolean) => void;
  discountOnly?: boolean;
  onToggleDiscount?: (val: boolean) => void;
  onResetAll?: () => void;
  hasActiveFilters?: boolean;
}

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  categories = [],
  brands = [],
  filters = {},
  onChange,
  onReset,
  selectedCategorySlug,
  onSelectCategory,
  selectedBrands = [],
  onToggleBrand,
  minPrice = '',
  maxPrice = '',
  onChangePrice,
  inStockOnly = false,
  onToggleInStock,
  discountOnly = false,
  onToggleDiscount,
  onResetAll,
  hasActiveFilters: propHasActiveFilters,
}) => {
  const [brandSearch, setBrandSearch] = useState('');

  // Active state derived from unified filters OR legacy props
  const activeCategorySlug = filters.categorySlug ?? selectedCategorySlug;
  const activeBrand = filters.brand ?? (selectedBrands.length > 0 ? selectedBrands[0] : undefined);
  const activeInStock = filters.inStockOnly ?? inStockOnly;
  const activeIsHit = Boolean(filters.isHit);
  const activeMinPrice = filters.minPrice ? String(filters.minPrice) : (minPrice ? String(minPrice) : '');
  const activeMaxPrice = filters.maxPrice ? String(filters.maxPrice) : (maxPrice ? String(maxPrice) : '');

  const hasAnyActiveFilters =
    propHasActiveFilters ||
    Boolean(
      activeCategorySlug ||
      activeBrand ||
      activeInStock ||
      activeIsHit ||
      activeMinPrice ||
      activeMaxPrice
    );

  const handleCategoryClick = (slug?: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug || 'all');
    }
    if (onChange) {
      onChange({
        ...filters,
        categorySlug: slug || undefined,
        page: 1,
      });
    }
  };

  const handleBrandClick = (brandName: string) => {
    if (onToggleBrand) {
      onToggleBrand(brandName);
    }
    if (onChange) {
      const nextBrand = activeBrand === brandName ? undefined : brandName;
      onChange({
        ...filters,
        brand: nextBrand,
        page: 1,
      });
    }
  };

  const handleInStockChange = (val: boolean) => {
    if (onToggleInStock) {
      onToggleInStock(val);
    }
    if (onChange) {
      onChange({
        ...filters,
        inStockOnly: val ? true : undefined,
        page: 1,
      });
    }
  };

  const handleHitChange = (val: boolean) => {
    if (onChange) {
      onChange({
        ...filters,
        isHit: val ? true : undefined,
        page: 1,
      });
    }
  };

  const handlePriceChange = (minVal: string, maxVal: string) => {
    if (onChangePrice) {
      onChangePrice(minVal, maxVal);
    }
    if (onChange) {
      onChange({
        ...filters,
        minPrice: minVal ? Number(minVal) : undefined,
        maxPrice: maxVal ? Number(maxVal) : undefined,
        page: 1,
      });
    }
  };

  const handleReset = () => {
    if (onReset) onReset();
    if (onResetAll) onResetAll();
    if (onChange) {
      onChange({ page: 1 });
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <aside className="w-full bg-paper rounded-3xl border border-line p-5 shadow-sm space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gold" />
          <h3 className="font-serif text-lg font-normal text-ink">Фильтры</h3>
        </div>
        {hasAnyActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-sale hover:underline font-semibold flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Сбросить все</span>
          </button>
        )}
      </div>

      {/* 1. Quick Badges (In Stock, Hits) */}
      <div className="space-y-2.5 pb-5 border-b border-line text-xs font-medium">
        <label className="flex items-center gap-2.5 cursor-pointer text-ink select-none hover:text-gold transition-colors">
          <input
            type="checkbox"
            checked={activeInStock}
            onChange={(e) => handleInStockChange(e.target.checked)}
            className="w-4 h-4 rounded text-gold focus:ring-gold accent-gold cursor-pointer"
          />
          <span className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            Только в наличии (Сеул)
          </span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-ink select-none hover:text-gold transition-colors">
          <input
            type="checkbox"
            checked={activeIsHit}
            onChange={(e) => handleHitChange(e.target.checked)}
            className="w-4 h-4 rounded text-gold focus:ring-gold accent-gold cursor-pointer"
          />
          <span className="flex items-center gap-1.5 text-sale font-semibold">
            <Flame className="w-3.5 h-3.5 text-sale" />
            Хиты продаж
          </span>
        </label>
      </div>

      {/* 2. Categories */}
      <div className="space-y-3 pb-5 border-b border-line">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted">
          <span>Категории</span>
          <span className="text-[10px] font-mono text-ink/40">{categories.length}</span>
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto pr-1 text-xs">
          <button
            type="button"
            onClick={() => handleCategoryClick(undefined)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
              !activeCategorySlug || activeCategorySlug === 'all'
                ? 'bg-[#191A15] text-[#FAF7F2] font-semibold shadow-sm'
                : 'text-ink hover:bg-cream'
            }`}
          >
            <span>Все товары</span>
          </button>

          {categories.map((c) => {
            const isSelected = activeCategorySlug === c.slug;
            const categoryTitle = c.title || (c as any).name || 'Категория';
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCategoryClick(c.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-[#191A15] text-[#FAF7F2] font-semibold shadow-sm'
                    : 'text-ink hover:bg-cream'
                }`}
              >
                <span className="truncate pr-2">{categoryTitle}</span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-[#FAF7F2]/70' : 'text-muted'}`}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Brands */}
      <div className="space-y-3 pb-5 border-b border-line">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted">
          <span>Бренды</span>
          {activeBrand && (
            <span className="text-[10px] text-gold font-bold">1 выбран</span>
          )}
        </div>

        {brands.length > 6 && (
          <div className="relative">
            <input
              type="text"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Поиск бренда..."
              className="w-full h-8 pl-8 pr-2.5 text-xs bg-cream rounded-xl border border-line focus:outline-none focus:border-gold transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        <div className="space-y-1 max-h-52 overflow-y-auto pr-1 text-xs">
          {filteredBrands.map((b) => {
            const isChecked = activeBrand === b.name || selectedBrands.includes(b.name);
            return (
              <button
                key={b.slug}
                type="button"
                onClick={() => handleBrandClick(b.name)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-cream cursor-pointer text-left transition-colors select-none ${
                  isChecked ? 'bg-cream text-gold font-semibold' : 'text-ink'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      isChecked ? 'bg-gold border-gold text-white' : 'border-line bg-paper'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <span className="truncate">{b.name}</span>
                </div>
                <span className="text-[10px] font-mono text-muted">{b.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Price Filter (KRW) */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
          Цена (₩ KRW)
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="От ₩"
            value={activeMinPrice}
            onChange={(e) => handlePriceChange(e.target.value, activeMaxPrice)}
            className="w-1/2 h-8 px-2.5 text-xs bg-cream rounded-xl border border-line focus:outline-none focus:border-gold font-mono"
          />
          <span className="text-muted text-xs">—</span>
          <input
            type="number"
            placeholder="До ₩"
            value={activeMaxPrice}
            onChange={(e) => handlePriceChange(activeMinPrice, e.target.value)}
            className="w-1/2 h-8 px-2.5 text-xs bg-cream rounded-xl border border-line focus:outline-none focus:border-gold font-mono"
          />
        </div>
      </div>
    </aside>
  );
};
