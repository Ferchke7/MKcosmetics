import React, { useState } from 'react';
import { Product } from '../../../core/types/product';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import {
  Star,
  Heart,
  ShoppingBag,
  MessageCircle,
  Eye,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  Package,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  formatPrice: (amt: number) => string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onQuickBuy: (title: string, price: string, url?: string) => void;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  formatPrice,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onQuickView,
  onQuickBuy,
  layout = 'grid',
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const photos = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];
  const discountPercent = product.discountPercent;

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 1) {
      setActivePhotoIdx((prev) => (prev + 1) % photos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 1) {
      setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const displayPrice = product.priceKrw > 0
    ? formatPrice(product.priceKrw)
    : 'По запросу';

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickBuy(product.name, displayPrice, product.telegramPostUrl);
  };

  const handleAddCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  if (layout === 'list') {
    return (
      <Card
        className="group flex flex-col sm:flex-row items-stretch bg-white border-[#F0E6DE] hover:border-[#EED9CF] transition-all duration-300 overflow-hidden"
        onClick={() => onQuickView(product)}
      >
        {/* Photo Box */}
        <div className="relative w-full sm:w-64 aspect-[4/3] sm:aspect-auto shrink-0 bg-[#FAF5EE] overflow-hidden">
          {photos.length > 0 ? (
            <img
              src={photos[activePhotoIdx]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FAF5EE] to-[#EED9CF] text-[#8A503C]">
              <Send className="w-10 h-10 opacity-30" />
            </div>
          )}

          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20"
                aria-label="Следующее фото"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {discountPercent && discountPercent > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-xs">
                -{discountPercent}%
              </span>
            )}
            {product.isBestseller && (
              <Badge variant="gold" size="sm" icon={<Sparkles className="w-3 h-3" />}>
                Хит
              </Badge>
            )}
          </div>

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
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#A96851] uppercase tracking-wider">
                {product.brand}
              </span>
              {product.volume && (
                <span className="text-[11px] text-[#8C827A] bg-[#FAF5EE] px-2 py-0.5 rounded-md border border-[#EED9CF]">
                  {product.volume}
                </span>
              )}
            </div>

            <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2D2A2E] leading-snug group-hover:text-[#C2836B] transition-colors cursor-pointer">
              {product.name}
            </h3>

            <p className="text-xs sm:text-sm text-[#6C635B] line-clamp-3 leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-[#8A503C] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#F0E6DE]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="pt-4 mt-4 border-t border-[#F0E6DE] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#C2836B]">
                {displayPrice}
              </span>
              {product.originalPriceKrw && product.originalPriceKrw > product.priceKrw && (
                <span className="text-xs line-through text-[#A89F97]">
                  {formatPrice(product.originalPriceKrw)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddCartClick}
                icon={<ShoppingBag className="w-4 h-4" />}
              >
                В корзину
              </Button>
              <Button
                variant="whatsapp"
                size="sm"
                onClick={handleBuyClick}
                icon={<MessageCircle className="w-4 h-4" />}
              >
                Заказать
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="flex flex-col justify-between h-full group bg-white border-[#F0E6DE] hover:border-[#EED9CF] transition-all duration-300"
      onClick={() => onQuickView(product)}
    >
      <div>
        {/* Product Image Box */}
        <div className="relative aspect-[4/3] bg-[#FAF5EE] overflow-hidden cursor-pointer">
          {photos.length > 0 ? (
            <img
              src={photos[activePhotoIdx]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FAF5EE] to-[#EED9CF] text-[#8A503C]">
              <Send className="w-10 h-10 opacity-30" />
            </div>
          )}

          {/* Multiple Photos Navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20 opacity-0 group-hover:opacity-100"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20 opacity-0 group-hover:opacity-100"
                aria-label="Следующее фото"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full">
                {photos.slice(0, 6).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === activePhotoIdx ? 'w-3 bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {discountPercent && discountPercent > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-xs">
                -{discountPercent}% Скидка
              </span>
            )}
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
          </div>

          {/* Favorite */}
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
        </div>

        {/* Product Info */}
        <div className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#A96851] uppercase tracking-wider">
              {product.brand}
            </span>
            {product.volume && (
              <span className="text-[10px] text-[#8C827A] bg-[#FAF5EE] px-2 py-0.5 rounded-md border border-[#EED9CF]">
                {product.volume}
              </span>
            )}
          </div>

          <h3
            className="font-serif text-sm sm:text-base font-medium text-[#2D2A2E] line-clamp-2 leading-snug group-hover:text-[#C2836B] transition-colors cursor-pointer"
            onClick={() => onQuickView(product)}
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#6C635B] line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base sm:text-lg font-bold text-[#C2836B]">
              {displayPrice}
            </span>
            {product.originalPriceKrw && product.originalPriceKrw > product.priceKrw && (
              <span className="text-xs line-through text-[#A89F97]">
                {formatPrice(product.originalPriceKrw)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2 border-t border-[#F0E6DE]/60 grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddCartClick}
          icon={<ShoppingBag className="w-3.5 h-3.5" />}
        >
          В корзину
        </Button>

        <Button
          variant="whatsapp"
          size="sm"
          onClick={handleBuyClick}
          icon={<MessageCircle className="w-3.5 h-3.5" />}
        >
          Заказать
        </Button>
      </div>
    </Card>
  );
};
