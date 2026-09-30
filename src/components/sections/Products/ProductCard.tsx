import React from 'react';
import { Product } from '../../../core/types/product';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Star, Heart, ShoppingBag, MessageCircle, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  formatPrice: (amt: number) => string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onQuickBuy: (title: string, price: string, url?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  formatPrice,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onQuickView,
  onQuickBuy,
}) => {
  const discountPercent =
    product.originalPriceKrw && product.originalPriceKrw > product.priceKrw
      ? Math.round(
          ((product.originalPriceKrw - product.priceKrw) / product.originalPriceKrw) * 100
        )
      : null;

  return (
    <Card className="flex flex-col justify-between h-full group bg-white border-[#F0E6DE]">
      <div>
        {/* Product Image Box */}
        <div
          className="relative aspect-square bg-[#FAF5EE] overflow-hidden cursor-pointer"
          onClick={() => onQuickView(product)}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isBestseller && (
              <Badge variant="gold" size="sm" icon={<Sparkles className="w-3 h-3" />}>
                Хит
              </Badge>
            )}
            {product.isNew && (
              <Badge variant="sage" size="sm">
                Новинка
              </Badge>
            )}
            {discountPercent && (
              <Badge variant="discount" size="sm">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
              isFavorite
                ? 'bg-rose-50 text-rose-500 shadow-sm'
                : 'bg-white/80 backdrop-blur-xs text-[#8C827A] hover:text-rose-500 hover:bg-white shadow-xs'
            }`}
            title="Добавить в избранное"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Quick View Hover Overlay Button */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-xs font-semibold text-[#2D2A2E] shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <Eye className="w-3.5 h-3.5" />
              Быстрый просмотр
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A96851] uppercase tracking-wider">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-[#2D2A2E] font-bold text-[11px]">
                {product.rating}
              </span>
            </div>
          </div>

          <h3
            className="font-serif text-sm sm:text-base font-medium text-[#2D2A2E] line-clamp-2 leading-snug group-hover:text-[#C2836B] transition-colors cursor-pointer"
            onClick={() => onQuickView(product)}
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#6C635B] line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base sm:text-lg font-bold text-[#C2836B]">
              {formatPrice(product.priceKrw)}
            </span>
            {product.originalPriceKrw && (
              <span className="text-xs line-through text-[#A89F97]">
                {formatPrice(product.originalPriceKrw)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 pb-5 pt-1 border-t border-[#F0E6DE]/60 grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddToCart(product)}
          icon={<ShoppingBag className="w-3.5 h-3.5" />}
        >
          В корзину
        </Button>

        <Button
          variant="whatsapp"
          size="sm"
          onClick={() =>
            onQuickBuy(product.name, formatPrice(product.priceKrw), product.telegramPostUrl)
          }
          icon={<MessageCircle className="w-3.5 h-3.5" />}
        >
          Заказать
        </Button>
      </div>
    </Card>
  );
};
