import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { CatalogProduct } from '../../core/types/catalog';
import { Price } from '../ui/Price';

interface ProductCardProps {
  product: CatalogProduct;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  onAddToCart?: (product: CatalogProduct) => void;
  inCartCount?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  inCartCount = 0,
}) => {
  const photoUrl =
    product.photos?.[0]?.w300 ||
    product.photos?.[0]?.w600 ||
    product.photos?.[0]?.full ||
    product.images?.[0] ||
    '/placeholder.png';
  const displayTitle = product.title || product.name || 'Товар';

  return (
    <div className="group flex flex-col justify-between bg-paper rounded-card border border-line p-3 transition-all duration-300 hover:shadow-soft-lg hover:border-gold/30">
      <div>
        {/* Photo Stage */}
        <div className="relative aspect-square w-full overflow-hidden rounded-[10px] bg-cream-soft mb-3">
          <Link to={`/product/${product.slug}`} className="block w-full h-full">
            <img
              src={photoUrl}
              alt={displayTitle}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            {product.discountPct > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-sale text-white text-[10px] font-bold tracking-wider">
                -{product.discountPct}%
              </span>
            )}
            {product.isHit && (
              <span className="px-2 py-0.5 rounded-full bg-gold text-white text-[10px] font-bold tracking-wider uppercase">
                Хит
              </span>
            )}
            {!product.inStock && (
              <span className="px-2 py-0.5 rounded-full bg-muted text-white text-[10px] font-semibold">
                Под заказ
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(product.id)}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isFavorite
                  ? 'bg-sale text-white shadow-sm'
                  : 'bg-white/80 backdrop-blur-sm text-ink hover:text-sale hover:bg-white'
              }`}
              title={isFavorite ? 'Удалить из избранного' : 'В избранное'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Brand & Category */}
        <div className="flex items-center justify-between text-[11px] text-muted mb-1">
          <span className="font-semibold uppercase tracking-wider text-gold truncate max-w-[70%]">
            {product.brand}
          </span>
          {product.stock > 0 && product.stock <= 3 && (
            <span className="text-sale text-[10px] font-bold">Осталось {product.stock} шт.</span>
          )}
        </div>

        {/* Title */}
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-medium text-xs sm:text-sm text-ink line-clamp-2 leading-snug group-hover:text-gold transition-colors">
            {displayTitle}
          </h3>
        </Link>

        {/* Excerpt */}
        {product.excerpt && (
          <p className="text-[11px] text-muted line-clamp-2 mt-1 leading-relaxed">
            {product.excerpt}
          </p>
        )}
      </div>

      {/* Footer: Price & Add to Cart */}
      <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between gap-2">
        <Price amount={product.priceKrw} oldAmount={product.oldPriceKrw} size="sm" />

        {onAddToCart && (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className={`h-8 px-3 rounded-card text-xs font-semibold flex items-center gap-1.5 transition-all ${
              inCartCount > 0
                ? 'bg-gold/15 text-gold border border-gold/40'
                : 'border border-gold text-gold hover:bg-gold hover:text-white'
            }`}
            title="Добавить в корзину"
          >
            {inCartCount > 0 ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{inCartCount}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">В корзину</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
