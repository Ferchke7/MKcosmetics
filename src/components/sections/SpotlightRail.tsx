import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import { CatalogProduct } from '../../core/types/catalog';
import { ProductCard } from '../product/ProductCard';
import { Price } from '../ui/Price';

interface SpotlightRailProps {
  eyebrow: string;
  title: string;
  lead: string;
  ritualText: string;
  catalogLink: string;
  catalogLinkText?: string;
  products: CatalogProduct[];
  watermarkText?: string;
  accentPosition?: 'left' | 'right';
  onAddToCart?: (p: CatalogProduct) => void;
  isFavorite?: (id: number) => boolean;
  onToggleFavorite?: (id: number) => void;
  cartItemsCount?: (id: number) => number;
}

export const SpotlightRail: React.FC<SpotlightRailProps> = ({
  eyebrow,
  title,
  lead,
  ritualText,
  catalogLink,
  catalogLinkText = 'В каталог',
  products,
  watermarkText = 'Best',
  accentPosition = 'left',
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  cartItemsCount,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!products || products.length === 0) return null;

  const featured = products[selectedIndex] || products[0];
  const sideProducts = products.filter((_, idx) => idx !== selectedIndex).slice(0, 4);

  const featuredPhoto = featured.photos?.[0]?.w600 || featured.photos?.[0]?.full || '/placeholder.png';

  return (
    <section className="py-12 sm:py-16 bg-cream-soft border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 pb-4 border-b border-line">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <div className="flex flex-wrap items-baseline gap-4 mt-1">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">{title}</h2>
              <span className="hidden md:inline text-xs font-serif text-muted italic">
                {ritualText}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl">{lead}</p>
          </div>

          <Link
            to={catalogLink}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-gold-hover hover:underline shrink-0"
          >
            <span>{catalogLinkText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </header>

        {/* Spotlight Stage */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch ${
            accentPosition === 'right' ? 'lg:flex-row-reverse' : ''
          }`}
        >
          {/* Spotlight Hero Stage (5 cols) */}
          <div
            className={`lg:col-span-5 bg-paper rounded-2xl border border-line p-6 relative overflow-hidden flex flex-col justify-between shadow-soft ${
              accentPosition === 'right' ? 'lg:order-2' : 'lg:order-1'
            }`}
          >
            <div className="watermark -right-4 -bottom-4">{watermarkText}</div>

            <div className="relative z-10">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-cream-soft mb-4">
                <Link to={`/product/${featured.slug}`}>
                  <img
                    src={featuredPhoto}
                    alt={featured.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </Link>

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(featured.id)}
                    className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
                      isFavorite && isFavorite(featured.id)
                        ? 'bg-sale text-white shadow-sm'
                        : 'bg-white/80 backdrop-blur-sm text-ink hover:text-sale hover:bg-white'
                    }`}
                    title={isFavorite && isFavorite(featured.id) ? 'Удалить из избранного' : 'В избранное'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite && isFavorite(featured.id) ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-gold mb-1">
                {featured.brand}
              </div>
              <Link to={`/product/${featured.slug}`}>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink hover:text-gold transition-colors leading-snug">
                  {featured.title}
                </h3>
              </Link>
              {featured.excerpt && (
                <p className="text-xs text-muted mt-2 line-clamp-3 leading-relaxed">
                  {featured.excerpt}
                </p>
              )}
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-line flex items-center justify-between">
              <Price amount={featured.priceKrw} oldAmount={featured.oldPriceKrw} size="lg" />

              {onAddToCart && (
                <button
                  type="button"
                  onClick={() => onAddToCart(featured)}
                  className="btn-gold h-10 px-5 text-xs font-semibold"
                >
                  В корзину
                </button>
              )}
            </div>

            {/* Dots to cycle featured product */}
            <div className="flex items-center justify-center gap-1.5 mt-4 pt-2">
              {products.slice(0, 4).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    selectedIndex === idx ? 'w-6 bg-gold' : 'w-2 bg-line hover:bg-muted'
                  }`}
                  aria-label={`Выбрать акцент ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Side Goods Grid (7 cols) */}
          <div
            className={`lg:col-span-7 grid grid-cols-2 gap-3.5 sm:gap-4 ${
              accentPosition === 'right' ? 'lg:order-1' : 'lg:order-2'
            }`}
          >
            {sideProducts.map((p) => (
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
      </div>
    </section>
  );
};
