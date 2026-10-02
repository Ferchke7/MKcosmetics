import React, { useState } from 'react';
import { Product } from '../../../core/types/product';
import {
  Star,
  Heart,
  ShoppingBag,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Zap,
  ShieldCheck,
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

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group relative flex flex-col justify-between bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#111827]/30 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-full"
    >
      <div>
        {/* Product Image Box */}
        <div className="relative aspect-square bg-[#F9FAFB] overflow-hidden">
          {photos.length > 0 ? (
            <img
              src={photos[activePhotoIdx]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F3F4F6] text-[#9CA3AF]">
              <Send className="w-8 h-8 opacity-30" />
            </div>
          )}

          {/* Badges Top Left (Coupang discount & bestseller tag) */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {discountPercent && discountPercent > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EF4444] text-white text-[11px] font-black tracking-tight shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {product.isBestseller && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#F59E0B] text-white text-[10px] font-bold shadow-2xs">
                ★ ХИТ
              </span>
            )}
          </div>

          {/* Direct delivery badge (Coupang Rocket style) */}
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0073E9]/90 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
              <Zap className="w-3 h-3 fill-current text-yellow-300" />
              Доставка из Сеула
            </span>
          </div>

          {/* Favorite button Top Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
              isFavorite
                ? 'bg-rose-50 text-rose-500 shadow-sm'
                : 'bg-white/80 backdrop-blur-xs text-[#9CA3AF] hover:text-rose-500 hover:bg-white shadow-2xs'
            }`}
            title="В избранное"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Photo navigation arrows (subtle on hover) */}
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 z-20"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 z-20"
                aria-label="Следующее фото"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 z-10 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-full">
                {photos.slice(0, 5).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-1 h-1 rounded-full transition-all ${
                      idx === activePhotoIdx ? 'w-2.5 bg-white' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Details (Coupang style: Brand -> Title -> Rating -> Price) */}
        <div className="p-3.5 sm:p-4 space-y-1.5">
          {/* Brand & Volume */}
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <span className="font-bold text-[#6B7280] uppercase tracking-wider truncate">
              {product.brand}
            </span>
            {product.volume && (
              <span className="text-[10px] text-[#4B5563] bg-[#F3F4F6] px-1.5 py-0.5 rounded font-medium shrink-0">
                {product.volume}
              </span>
            )}
          </div>

          {/* Product Title (clean 2 lines) */}
          <h3 className="font-sans text-[13px] sm:text-[14px] font-semibold text-[#111827] line-clamp-2 leading-[1.35] group-hover:text-[#0073E9] transition-colors">
            {product.name}
          </h3>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1 pt-0.5 text-xs">
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-[#111827] text-[11px]">{product.rating}</span>
            <span className="text-[11px] text-[#9CA3AF]">({product.reviewCount})</span>
            <span className="text-[10px] text-emerald-600 font-medium ml-auto flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" />
              Оригинал
            </span>
          </div>

          {/* Price Block (Coupang style) */}
          <div className="pt-1">
            {product.priceKrw > 0 ? (
              <div>
                {product.originalPriceKrw && product.originalPriceKrw > product.priceKrw && (
                  <div className="text-[11px] text-[#9CA3AF] line-through leading-none mb-0.5">
                    {formatPrice(product.originalPriceKrw)}
                  </div>
                )}
                <div className="flex items-baseline gap-1.5">
                  {discountPercent && discountPercent > 0 && (
                    <span className="text-[#EF4444] font-black text-base sm:text-lg">
                      {discountPercent}%
                    </span>
                  )}
                  <span className="text-base sm:text-lg font-black text-[#111827] tracking-tight">
                    {displayPrice}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs font-bold text-[#0073E9] py-1">
                Цена по запросу
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons (Coupang Fast Buy & Cart) */}
      <div className="p-3.5 sm:p-4 pt-0 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleAddCartClick}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#374151] text-xs font-semibold transition-colors active:scale-95 shadow-2xs"
          title="Добавить в корзину"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#6B7280]" />
          <span>В корзину</span>
        </button>

        <button
          type="button"
          onClick={handleBuyClick}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition-colors active:scale-95 shadow-2xs"
          title="Быстрый заказ в WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Заказать</span>
        </button>
      </div>
    </div>
  );
};
