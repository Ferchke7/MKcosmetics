import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CatalogProduct } from '../../core/types/catalog';
import { ProductCard } from '../product/ProductCard';

interface BrandStageProps {
  brand: string;
  brandSlug: string;
  count: number;
  products: CatalogProduct[];
  description?: string;
  onAddToCart?: (p: CatalogProduct) => void;
  isFavorite?: (id: number) => boolean;
  onToggleFavorite?: (id: number) => void;
  cartItemsCount?: (id: number) => number;
}

export const BrandStage: React.FC<BrandStageProps> = ({
  brand,
  brandSlug,
  count,
  products,
  description,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  cartItemsCount,
}) => {
  if (!products || products.length === 0) return null;

  const defaultDesc = description || `Эксклюзивная линейка средств бренда ${brand} со склада в Сеуле. Проверенные формулы и оригинальное качество от ведущих южнокорейских лабораторий.`;

  return (
    <section className="py-14 sm:py-16 bg-paper border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Stage Banner */}
        <div className="bg-cream-soft rounded-2xl border border-line p-6 sm:p-10 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="watermark right-4 top-1/2 -translate-y-1/2">{brand.split(' ')[0]}</div>

          <div className="relative z-10 max-w-xl text-center md:text-left">
            <span className="eyebrow inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Бренд каталога</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink mt-2">
              {brand}
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
              {defaultDesc}
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              to={`/catalog?brand=${encodeURIComponent(brand)}`}
              className="btn-outline h-11 px-6 text-xs font-bold inline-flex items-center gap-2"
            >
              <span>Все товары {brand} ({count})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4 Brand Goods Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {products.slice(0, 4).map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isFavorite={isFavorite ? isFavorite(p.id) : false}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
              inCartCount={cartItemsCount ? cartItemsCount(p.id) : 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
