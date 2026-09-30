import React from 'react';
import { SectionHeading } from '../../ui/SectionHeading';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { Button } from '../../ui/Button';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { Product, ProductCategory, SkinConcern } from '../../../core/types/product';

interface ProductGridProps {
  products: Product[];
  selectedCategory: ProductCategory;
  onSelectCategory: (c: ProductCategory) => void;
  selectedConcern: SkinConcern | 'all';
  onSelectConcern: (c: SkinConcern | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'rating';
  onSortChange: (s: 'popular' | 'price-asc' | 'price-desc' | 'rating') => void;
  formatPrice: (amt: number) => string;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onQuickBuy: (title: string, price: string, url?: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  selectedConcern,
  onSelectConcern,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  formatPrice,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onQuickView,
  onQuickBuy,
}) => {
  return (
    <section id="catalog" className="py-20 sm:py-28 bg-[#FAF7F2] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Коллекция K-Beauty"
          badgeIcon={<Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />}
          title="Каталог корейской косметики"
          subtitle="Тщательно отобранные мировые бестселлеры и люксовые формулы, доказавшие свою эффективность"
        />

        {/* Filters */}
        <ProductFilters
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          selectedConcern={selectedConcern}
          onSelectConcern={onSelectConcern}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />

        {/* Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#F0E6DE] space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF5EE] text-[#A89F97] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-xl text-[#2D2A2E] font-medium">
              Товары не найдены
            </h4>
            <p className="text-xs text-[#8C827A] max-w-sm mx-auto">
              Попробуйте сбросить параметры поиска или фильтры
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onSelectCategory('all');
                onSelectConcern('all');
                onSearchChange('');
              }}
            >
              Показать все товары
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                formatPrice={formatPrice}
                isFavorite={isFavorite(product.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                onQuickBuy={onQuickBuy}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
