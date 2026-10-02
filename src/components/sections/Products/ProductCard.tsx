import React, { useState } from 'react';
import { Product } from '../../../core/types/product';
import {
  Star,
  Heart,
  ShoppingBag,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Plane,
  ShieldCheck,
  Eye,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  formatPrice: (amt: number) => string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onQuickBuy: (title: string, price: string, url?: string) => void;
  rank?: number;
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
  rank,
  layout = 'grid',
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(product.id);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between bg-white border border-[#EBEBEB] hover:border-[#111111] transition-all duration-250 rounded-xl overflow-hidden cursor-pointer select-none hover:shadow-lg"
    >
      <div>
        {/* Product Image Area - Musinsa Ratio */}
        <div className="relative aspect-[1/1] sm:aspect-[4/5] bg-[#F7F7F7] overflow-hidden">
          {photos.length > 0 ? (
            <img
              src={photos[activePhotoIdx]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-104"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F3F4F6] text-[#9CA3AF]">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">MK Korea</span>
            </div>
          )}

          {/* Musinsa Ranking Number Badge (e.g. 01, 02...) */}
          {rank !== undefined && rank <= 10 && (
            <div className="absolute top-0 left-0 z-10">
              <div className={`px-2.5 py-1 text-xs font-black tracking-tight text-white ${
                rank === 1 ? 'bg-[#000000] ring-1 ring-amber-400' : rank <= 3 ? 'bg-[#111111]' : 'bg-[#333333]'
              }`}>
                {rank < 10 ? `0${rank}` : rank}
              </div>
            </div>
          )}

          {/* Badges Top Left (Discount & Status) */}
          <div className={`absolute ${rank !== undefined && rank <= 10 ? 'top-8' : 'top-2.5'} left-2.5 flex flex-col gap-1 z-10 pointer-events-none`}>
            {discountPercent && discountPercent > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-[#FF0038] text-white text-[11px] font-black tracking-tight shadow-2xs">
                -{discountPercent}%
              </span>
            )}
            {product.isBestseller && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-[#111111] text-white text-[10px] font-extrabold uppercase tracking-wider">
                BEST
              </span>
            )}
          </div>

          {/* Seoul Direct Flight Delivery Badge */}
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#111111]/90 backdrop-blur-xs text-white text-[10px] font-semibold tracking-tight">
              <Plane className="w-3 h-3 text-amber-300" />
              <span>Сеул • Прямой рейс</span>
            </span>
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-20 ${
              isFavorite
                ? 'bg-rose-50 text-[#FF0038] shadow-sm scale-105'
                : 'bg-white/85 backdrop-blur-xs text-[#767676] hover:text-[#FF0038] hover:bg-white shadow-2xs'
            }`}
            title="В избранное"
            aria-label="В избранное"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#FF0038] text-[#FF0038]' : ''}`} />
          </button>

          {/* Image Navigation Arrows (Desktop hover) */}
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 z-20"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 z-20"
                aria-label="Следующее фото"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 z-10 bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded-full pointer-events-none">
                {photos.slice(0, 5).map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1 rounded-full transition-all ${
                      idx === activePhotoIdx ? 'w-2.5 bg-white' : 'w-1 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Quick View Overlay Button on Hover */}
          <div className="hidden sm:flex absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
            <div className="w-full py-2 bg-white/95 backdrop-blur-xs text-[#111111] text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center gap-1.5 border border-gray-200">
              <Eye className="w-3.5 h-3.5" />
              <span>Быстрый просмотр</span>
            </div>
          </div>
        </div>

        {/* Product Details - Musinsa Clean Style */}
        <div className="p-3 sm:p-3.5 space-y-1.5">
          {/* Brand Name & Volume */}
          <div className="flex items-center justify-between gap-1.5">
            <span className="font-extrabold text-[11px] text-[#111111] uppercase tracking-wider truncate">
              {product.brand}
            </span>
            {product.volume && (
              <span className="text-[10px] text-[#777777] font-medium shrink-0 bg-[#F5F5F5] px-1.5 py-0.5 rounded">
                {product.volume}
              </span>
            )}
          </div>

          {/* Title (2 lines max with clean typography) */}
          <h3 className="font-sans text-[12.5px] sm:text-[13.5px] font-medium text-[#222222] line-clamp-2 leading-[1.35] group-hover:underline group-hover:text-black">
            {product.name}
          </h3>

          {/* Rating & Authenticity */}
          <div className="flex items-center gap-1 text-xs pt-0.5">
            <div className="flex text-amber-400">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="font-bold text-[#111111] text-[11px]">{product.rating}</span>
            <span className="text-[10px] text-[#888888]">({product.reviewCount})</span>
            <span className="text-[10px] text-emerald-600 font-semibold ml-auto flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" />
              100% Origin
            </span>
          </div>

          {/* Musinsa Price Block */}
          <div className="pt-1">
            {product.priceKrw > 0 ? (
              <div className="space-y-0.5">
                {product.originalPriceKrw && product.originalPriceKrw > product.priceKrw && (
                  <div className="text-[11px] text-[#999999] line-through leading-none">
                    {formatPrice(product.originalPriceKrw)}
                  </div>
                )}
                <div className="flex items-baseline gap-1.5">
                  {discountPercent && discountPercent > 0 && (
                    <span className="text-[#FF0038] font-black text-sm sm:text-base tracking-tight">
                      {discountPercent}%
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-black text-[#111111] tracking-tight">
                    {displayPrice}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs font-bold text-[#111111] py-0.5">
                Цена по запросу
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="p-3 sm:p-3.5 pt-0 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={handleAddCartClick}
          className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-lg border border-[#E0E0E0] bg-[#FFFFFF] hover:bg-[#F5F5F5] text-[#111111] text-[11px] sm:text-xs font-bold transition-colors active:scale-95 cursor-pointer shadow-2xs"
          title="Добавить в корзину"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#555555]" />
          <span>В корзину</span>
        </button>

        <button
          type="button"
          onClick={handleBuyClick}
          className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-[#25D366] hover:bg-[#20BA5A] text-white text-[11px] sm:text-xs font-bold transition-colors active:scale-95 cursor-pointer shadow-2xs"
          title="Заказать через WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Заказать</span>
        </button>
      </div>
    </div>
  );
};
