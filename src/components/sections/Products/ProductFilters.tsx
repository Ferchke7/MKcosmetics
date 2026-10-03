import React from 'react';
import { ProductCategory, SkinConcern } from '../../../core/types/product';
import { Search, SlidersHorizontal } from 'lucide-react';

interface ProductFiltersProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  selectedConcern: SkinConcern | 'all';
  onSelectConcern: (concern: SkinConcern | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'rating';
  onSortChange: (sort: 'popular' | 'price-asc' | 'price-desc' | 'rating') => void;
}

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'all', label: 'Все товары' },
  { id: 'premium-luxury', label: '👑 Люкс & Премиум' },
  { id: 'peeling-cleansing', label: 'Пилинг & Очищение' },
  { id: 'hydration-serums', label: 'Сыворотки & Ампулы' },
  { id: 'sets', label: 'Подарочные наборы' },
  { id: 'sun-care', label: '☀️ Солнцезащита' },
];

const CONCERNS: { id: SkinConcern | 'all'; label: string }[] = [
  { id: 'all', label: 'Все типы кожи' },
  { id: 'anti-age', label: 'Лифтинг / Анти-эйдж' },
  { id: 'hydration', label: 'Увлажнение' },
  { id: 'pores-acne', label: 'Поры / Акне' },
  { id: 'brightening', label: 'Осветление / Тон' },
  { id: 'sensitive', label: 'Чувствительная' },
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedConcern,
  onSelectConcern,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="space-y-6 mb-10">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xl lg:max-w-2xl">
          <Search className="w-5 h-5 text-[#B89254] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по бренду, названию, компонентам (SPF, Коллаген, Peptides)..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] text-sm text-[#1A1917] placeholder-[#8A8680] focus:border-[#B89254] focus:outline-none focus:ring-2 focus:ring-[#B89254]/20"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <SlidersHorizontal className="w-4 h-4 text-[#8C827A]" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#EED9CF] text-xs text-[#2D2A2E] focus:outline-none focus:border-[#C2836B] cursor-pointer"
          >
            <option value="popular">По популярности</option>
            <option value="rating">По рейтингу</option>
            <option value="price-asc">Сначала недорогие</option>
            <option value="price-desc">Сначала премиум</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#C2836B] text-white shadow-soft'
                : 'bg-white text-[#4D2C20] hover:bg-[#FAF5EE] border border-[#EED9CF]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Skin Concern Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-[#8C827A] font-medium mr-1 shrink-0">По задаче:</span>
        {CONCERNS.map((concern) => (
          <button
            key={concern.id}
            onClick={() => onSelectConcern(concern.id)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              selectedConcern === concern.id
                ? 'bg-[#8A503C] text-white'
                : 'bg-[#FAF5EE] text-[#6C3E2E] hover:bg-[#F2E8DC] border border-[#EED9CF]/60'
            }`}
          >
            {concern.label}
          </button>
        ))}
      </div>
    </div>
  );
};
