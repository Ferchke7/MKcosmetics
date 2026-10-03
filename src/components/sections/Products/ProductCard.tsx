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
import { useLanguage } from '../../../core/i18n/LanguageContext';

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
}) => {
  const { t } = useLanguage();
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
    : t('product_price_on_request');

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
      className="group relative flex flex-col justify-between bg-white border border-[#EFE8E2] hover:border-[#D4AF37] transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer select-none hover:shadow-md hover:-translate-y-0.5"
    >
      <div>
        {/* Product Image Area */}
        <div className="relative aspect-[1/1] sm:aspect-[4/5] bg-[#FAF7F2] overflow-hidden">
          {photos.length > 0 ? (
            <img
              src={photos[activePhotoIdx]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#FAF7F2] text-[#A89F97]">
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#A96851]">MK Korea</span>
            </div>
          )}

          {/* Ranking Number Badge (e.g. 01, 02...) */}
          {rank !== undefined && rank <= 10 && (
            <div className="absolute top-0 left-0 z-10">
              <div className={`px-2.5 py-1 text-xs font-black tracking-tight text-white rounded-br-xl shadow-xs ${
                rank === 1
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#1F1615]'
                  : rank <= 3
                  ? 'bg-[#1F1615] text-[#D4AF37]'
                  : 'bg-[#382824] text-white'
              }`}>
                {rank < 10 ? `0${rank}` : rank}
              </div>
            </div>
          )}

          {/* Badges Top Left (Discount & Status) */}
          <div className={`absolute ${rank !== undefined && rank <= 10 ? 'top-8' : 'top-2.5'} left-2.5 flex flex-col gap-1 z-10 pointer-events-none`}>
            {discountPercent && discountPercent > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E53935] text-white text-[11px] font-black tracking-tight shadow-xs">
                -{discountPercent}%
              </span>
            )}
            {product.isBestseller && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#1F1615] text-[#D4AF37] text-[10px] font-black uppercase tracking-wider border border-[#D4AF37]/30">
                BEST
              </span>
            )}
          </div>

          {/* Direct Delivery Badge */}
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1F1615]/85 backdrop-blur-xs text-white text-[10px] font-semibold tracking-tight border border-white/10">
              <Plane className="w-3 h-3 text-[#D4AF37]" />
              <span>{t('product_flight_badge')}</span>
            </span>
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-20 cursor-pointer ${
              isFavorite
                ? 'bg-rose-50 text-[#E53935] shadow-sm scale-105 ring-1 ring-rose-200'
                : 'bg-white/90 backdrop-blur-xs text-[#767676] hover:text-[#E53935] hover:bg-white shadow-xs'
            }`}
            title="В избранное"
            aria-label="В избранное"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#E53935] text-[#E53935]' : ''}`} />
          </button>

          {/* Image Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
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
            <div className="w-full py-1.5 bg-white/95 backdrop-blur-xs text-[#1F1615] text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 border border-[#EFE8E2]">
              <Eye className="w-3.5 h-3.5 text-[#C2836B]" />
              <span>{t('product_quick_view')}</span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-3 sm:p-3.5 space-y-1.5">
          {/* Brand Name & Volume */}
          <div className="flex items-center justify-between gap-1.5">
            <span className="font-bold text-[11px] text-[#A96851] uppercase tracking-wider truncate">
              {product.brand}
            </span>
            {product.volume && (
              <span className="text-[10px] text-[#777777] font-medium shrink-0 bg-[#FAF5EE] px-1.5 py-0.5 rounded-md border border-[#EED9CF]/60">
                {product.volume}
              </span>
            )}
          </div>

          {/* Title (2 lines max) */}
          <h3 className="font-sans text-[12.5px] sm:text-[13.5px] font-medium text-[#1F1615] line-clamp-2 leading-[1.35] group-hover:text-[#C2836B] transition-colors">
            {product.name}
          </h3>

          {/* Rating & Authenticity */}
          <div className="flex items-center gap-1 text-xs pt-0.5">
            <div className="flex text-amber-400">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="font-bold text-[#1F1615] text-[11px]">{product.rating}</span>
            <span className="text-[10px] text-[#888888]">({product.reviewCount})</span>
            <span className="text-[10px] text-emerald-600 font-semibold ml-auto flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>100% Origin</span>
            </span>
          </div>

          {/* Price Block */}
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
                    <span className="text-[#E53935] font-black text-sm sm:text-base tracking-tight">
                      -{discountPercent}%
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-black text-[#1F1615] tracking-tight">
                    {displayPrice}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs font-bold text-[#1F1615] py-0.5">
                {t('product_price_on_request')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Bar (EvaCode Style: Add to bag + Direct WhatsApp order) */}
      <div className="p-3 sm:p-3.5 pt-0 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={handleAddCartClick}
          className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-[#E8DCD5] bg-[#FAF7F2] hover:bg-[#F2E8DC] text-[#1F1615] text-[11px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
          title={t('product_add_cart')}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#8A503C]" />
          <span>{t('product_add_cart')}</span>
        </button>

        <button
          type="button"
          onClick={handleBuyClick}
          className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-[11px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
          title={t('product_order_btn')}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{t('product_order_btn')}</span>
        </button>
      </div>
    </div>
  );
};
