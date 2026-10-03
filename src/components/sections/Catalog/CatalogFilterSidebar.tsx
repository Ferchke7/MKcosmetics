import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Check,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useLanguage } from '../../../core/i18n/LanguageContext';
import { Product } from '../../../core/types/product';

export interface FilterState {
  category: string;
  selectedSkinTypes: string[];
  selectedBrands: string[];
  priceRange: [number, number];
  onlyDiscount: boolean;
  onlyInStock: boolean;
}

interface CatalogFilterSidebarProps {
  allBrands: { brand: string; count: number }[];
  totalProductsCount: number;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  onlyDiscount: boolean;
  onToggleDiscount: (val: boolean) => void;
  onlyWithPrice: boolean;
  onToggleWithPrice: (val: boolean) => void;
  selectedSkinTypes: string[];
  onToggleSkinType: (type: string) => void;
  priceMin: number;
  priceMax: number;
  currentPriceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  formatPrice: (krw: number) => string;
}

interface TreeNode {
  id: string;
  titleKey: string;
  children?: { id: string; titleKey: string }[];
}

const CATEGORY_TREE: TreeNode[] = [
  {
    id: 'face-care',
    titleKey: 'cat_face_care',
    children: [
      { id: 'peeling-cleansing', titleKey: 'cat_cleansers' },
      { id: 'hydration-serums', titleKey: 'cat_toners' },
      { id: 'serums', titleKey: 'cat_serums' },
      { id: 'creams', titleKey: 'cat_creams' },
      { id: 'eye-care', titleKey: 'cat_eye_care' },
      { id: 'masks', titleKey: 'cat_masks' },
    ],
  },
  {
    id: 'special-care',
    titleKey: 'cat_special_care',
    children: [
      { id: 'anti-aging', titleKey: 'cat_antiaging' },
      { id: 'brightening', titleKey: 'cat_brightening' },
      { id: 'sun-care', titleKey: 'cat_sun' },
      { id: 'sets', titleKey: 'cat_sets' },
    ],
  },
  {
    id: 'body-hair',
    titleKey: 'cat_body_hair',
    children: [
      { id: 'body-care', titleKey: 'cat_body_care' },
      { id: 'hair-care', titleKey: 'cat_hair_care' },
    ],
  },
];

const SKIN_TYPES = [
  { id: 'combination', titleKey: 'skin_combination' },
  { id: 'dry', titleKey: 'skin_dry' },
  { id: 'sensitive', titleKey: 'skin_sensitive' },
  { id: 'normal', titleKey: 'skin_normal' },
  { id: 'oily', titleKey: 'skin_oily' },
] as const;

export const CatalogFilterSidebar: React.FC<CatalogFilterSidebarProps> = ({
  allBrands,
  totalProductsCount,
  selectedCategory,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  onlyDiscount,
  onToggleDiscount,
  onlyWithPrice,
  onToggleWithPrice,
  selectedSkinTypes,
  onToggleSkinType,
  priceMin,
  priceMax,
  currentPriceRange,
  onPriceRangeChange,
  onResetFilters,
  hasActiveFilters,
  formatPrice,
}) => {
  const { t } = useLanguage();

  // Collapsible tree branches
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({
    'face-care': true,
    'special-care': true,
    'body-hair': false,
  });

  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [showAllBrands, setShowAllBrands] = useState(false);

  const toggleBranch = (branchId: string) => {
    setOpenBranches((prev) => ({ ...prev, [branchId]: !prev[branchId] }));
  };

  const filteredBrands = allBrands.filter((b) =>
    b.brand.toLowerCase().includes(brandSearch.toLowerCase())
  );
  const displayedBrands = showAllBrands ? filteredBrands : filteredBrands.slice(0, 7);

  return (
    <aside className="w-full space-y-8 bg-white p-5 sm:p-6 rounded-2xl border border-[#ECE8E1] text-[#1A1917]">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ECE8E1]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#B89254]" />
          <h3 className="font-serif text-lg font-medium text-[#1A1917]">
            {t('catalog_filters_title')}
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#B89254] hover:text-[#9E7B42] hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('catalog_reset_all')}</span>
          </button>
        )}
      </div>

      {/* 1. Category Tree Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#B89254]">
          {t('nav_catalog')}
        </h4>

        {/* 'All Products' Root Node */}
        <div className="pt-1">
          <button
            onClick={() => onCategoryChange('all')}
            className={`flex items-center gap-2.5 w-full text-left text-xs font-medium py-1.5 transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'text-[#B89254] font-bold'
                : 'text-[#8A8680] hover:text-[#1A1917]'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                selectedCategory === 'all'
                  ? 'border-[#B89254] bg-[#B89254]'
                  : 'border-[#ECE8E1]'
              }`}
            >
              {selectedCategory === 'all' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </span>
            <span>{t('cat_all')}</span>
          </button>
        </div>

        {/* Tree Branches */}
        <div className="space-y-2 pt-1">
          {CATEGORY_TREE.map((branch) => {
            const isOpen = !!openBranches[branch.id];

            return (
              <div key={branch.id} className="space-y-1">
                {/* Branch Header */}
                <div
                  onClick={() => toggleBranch(branch.id)}
                  className="flex items-center justify-between py-1 text-xs font-semibold text-[#1A1917] cursor-pointer select-none hover:text-[#B89254]"
                >
                  <span className="flex items-center gap-1.5">
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-[#8A8680]" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[#8A8680]" />
                    )}
                    <span>{t(branch.titleKey as any)}</span>
                  </span>
                </div>

                {/* Sub-items list */}
                {isOpen && branch.children && (
                  <div className="pl-5 space-y-1.5 border-l border-[#ECE8E1] ml-1.5 pt-1">
                    {branch.children.map((child) => {
                      const isSelected = selectedCategory === child.id;

                      return (
                        <button
                          key={child.id}
                          onClick={() => onCategoryChange(child.id)}
                          className={`flex items-center gap-2 w-full text-left text-xs py-1 transition-colors cursor-pointer ${
                            isSelected
                              ? 'text-[#B89254] font-bold'
                              : 'text-[#8A8680] hover:text-[#1A1917]'
                          }`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-[#B89254] bg-[#B89254]'
                                : 'border-[#ECE8E1]'
                            }`}
                          >
                            {isSelected && (
                              <span className="w-1 h-1 rounded-full bg-white" />
                            )}
                          </span>
                          <span>{t(child.titleKey as any)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Price Range Filter */}
      <div className="space-y-3 pt-4 border-t border-[#ECE8E1]">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#B89254]">
            {t('catalog_price_filter_title')}
          </h4>
          <span className="text-[11px] text-[#8A8680] font-medium">
            {formatPrice(currentPriceRange[1])}
          </span>
        </div>

        {/* Dual Slider / Quick Presets */}
        <input
          type="range"
          min={priceMin}
          max={priceMax}
          step={5000}
          value={currentPriceRange[1]}
          onChange={(e) =>
            onPriceRangeChange([currentPriceRange[0], Number(e.target.value)])
          }
          className="w-full accent-[#B89254] cursor-pointer"
        />

        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#ECE8E1] font-medium text-[#1A1917]">
            {formatPrice(currentPriceRange[0])}
          </div>
          <span className="text-[#8A8680]">—</span>
          <div className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#ECE8E1] font-medium text-[#1A1917]">
            {formatPrice(currentPriceRange[1])}
          </div>
        </div>
      </div>

      {/* 3. Skin Type / Concerns Filter */}
      <div className="space-y-3 pt-4 border-t border-[#ECE8E1]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#B89254]">
          {t('catalog_skin_type_title')}
        </h4>

        <div className="space-y-2">
          {SKIN_TYPES.map((type) => {
            const isChecked = selectedSkinTypes.includes(type.id);

            return (
              <label
                key={type.id}
                onClick={() => onToggleSkinType(type.id)}
                className="flex items-center gap-2.5 text-xs text-[#8A8680] hover:text-[#1A1917] cursor-pointer select-none"
              >
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    isChecked
                      ? 'border-[#B89254] bg-[#B89254] text-white'
                      : 'border-[#ECE8E1] bg-white'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{t(type.titleKey as any)}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Brand Filter */}
      <div className="space-y-3 pt-4 border-t border-[#ECE8E1]">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#B89254]">
            {t('catalog_all_brands')}
          </h4>
          <span className="text-[11px] text-[#8A8680]">({allBrands.length})</span>
        </div>

        {/* Search inside brands */}
        {allBrands.length > 8 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A8680] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Поиск бренда..."
              className="w-full text-xs py-1.5 pl-8 pr-2 rounded-lg bg-[#FAF8F5] border border-[#ECE8E1] focus:outline-none focus:border-[#B89254] text-[#1A1917]"
            />
          </div>
        )}

        {/* Brands Checkboxes */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          {displayedBrands.map(({ brand, count }) => {
            const isSelected = selectedBrand === brand;

            return (
              <label
                key={brand}
                onClick={() => onBrandChange(isSelected ? 'all' : brand)}
                className="flex items-center justify-between text-xs text-[#8A8680] hover:text-[#1A1917] cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                      isSelected
                        ? 'border-[#B89254] bg-[#B89254] text-white'
                        : 'border-[#ECE8E1] bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="truncate uppercase font-medium">{brand}</span>
                </div>
                <span className="text-[11px] text-[#8A8680] ml-2">({count})</span>
              </label>
            );
          })}
        </div>

        {filteredBrands.length > 7 && (
          <button
            onClick={() => setShowAllBrands(!showAllBrands)}
            className="text-[11px] font-semibold text-[#B89254] hover:underline cursor-pointer"
          >
            {showAllBrands ? t('catalog_show_less') : `${t('catalog_show_more')} (${filteredBrands.length - 7})`}
          </button>
        )}
      </div>

      {/* 5. Status / Availability Filter */}
      <div className="space-y-3 pt-4 border-t border-[#ECE8E1]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#B89254]">
          {t('catalog_status_title')}
        </h4>

        <div className="space-y-2">
          {/* In-Stock */}
          <label
            onClick={() => onToggleWithPrice(!onlyWithPrice)}
            className="flex items-center gap-2.5 text-xs text-[#8A8680] hover:text-[#1A1917] cursor-pointer select-none"
          >
            <div
              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                onlyWithPrice
                  ? 'border-[#B89254] bg-[#B89254] text-white'
                  : 'border-[#ECE8E1] bg-white'
              }`}
            >
              {onlyWithPrice && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>{t('catalog_in_stock')}</span>
          </label>

          {/* On Sale */}
          <label
            onClick={() => onToggleDiscount(!onlyDiscount)}
            className="flex items-center gap-2.5 text-xs text-[#8A8680] hover:text-[#1A1917] cursor-pointer select-none"
          >
            <div
              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                onlyDiscount
                  ? 'border-[#E53935] bg-[#E53935] text-white'
                  : 'border-[#ECE8E1] bg-white'
              }`}
            >
              {onlyDiscount && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>{t('catalog_sale_filter')}</span>
          </label>
        </div>
      </div>
    </aside>
  );
};
