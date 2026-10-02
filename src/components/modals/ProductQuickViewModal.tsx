import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Product } from '../../core/types/product';
import { Star, ShoppingBag, MessageCircle, ShieldCheck, Plane } from 'lucide-react';
import { useLanguage } from '../../core/i18n/LanguageContext';

interface ProductQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  formatPrice: (krw: number) => string;
  onAddToCart: (p: Product) => void;
  onQuickBuy: (productTitle: string, priceFormatted: string, sourceUrl?: string) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  formatPrice,
  onAddToCart,
  onQuickBuy,
}) => {
  const { t } = useLanguage();
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  if (!product) return null;

  const photos = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];
  const discountPercent = product.discountPercent;
  const displayPrice = product.priceKrw > 0 ? formatPrice(product.priceKrw) : t('product_price_on_request');

  const handleOrderWhatsApp = () => {
    onQuickBuy(product.name, displayPrice, product.telegramPostUrl);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-[#111111]">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#F7F7F7] border border-[#EAEAEA] relative">
            {photos.length > 0 ? (
              <img
                src={photos[selectedImgIndex] || photos[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                MK KOREA COSMETIC
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {discountPercent && discountPercent > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-[#FF0038] text-white text-xs font-black tracking-tight shadow-sm">
                  -{discountPercent}%
                </span>
              )}
              {product.isBestseller && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-[#111111] text-white text-[10px] font-black uppercase tracking-wider">
                  BESTSELLER
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3 z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#111111]/90 backdrop-blur-xs text-white text-[11px] font-semibold">
                <Plane className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('product_flight_badge')}</span>
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {photos.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImgIndex === idx
                      ? 'border-[#111111] ring-1 ring-[#111111]'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#777777]">
                {product.brand}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('product_genuine_badge')}
              </span>
            </div>

            <h2 className="font-sans text-xl sm:text-2xl font-black text-[#111111] mt-1.5 leading-snug">
              {product.name}
            </h2>

            {product.volume && (
              <p className="text-xs font-medium text-[#777777] mt-1">
                {t('product_volume')} <strong className="text-[#111111]">{product.volume}</strong>
              </p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="font-bold text-[#111111]">{product.rating}</span>
            <span className="text-[#888888]">({product.reviewCount} {t('product_reviews')})</span>
          </div>

          {/* Price Card */}
          <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] space-y-1">
            {product.originalPriceKrw && product.originalPriceKrw > product.priceKrw && (
              <div className="text-xs text-[#999999] line-through">
                {formatPrice(product.originalPriceKrw)}
              </div>
            )}
            <div className="flex items-baseline gap-2">
              {discountPercent && discountPercent > 0 && (
                <span className="text-[#FF0038] font-black text-2xl tracking-tight">
                  {discountPercent}%
                </span>
              )}
              <span className="text-2xl font-black text-[#111111] tracking-tight">
                {displayPrice}
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed max-h-36 overflow-y-auto pr-1">
              {product.description}
            </p>
          )}

          {/* Key Ingredients */}
          {product.keyIngredients && product.keyIngredients.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#777777] mb-1.5">
                {t('product_active_ingredients')}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {product.keyIngredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-[#F5F5F5] text-[#111111] text-[11px] font-semibold border border-[#E0E0E0]"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-3 border-t border-[#EEEEEE]">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#111111] bg-white hover:bg-gray-50 text-[#111111] text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('product_add_cart')}</span>
              </button>

              <button
                type="button"
                onClick={handleOrderWhatsApp}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t('product_quick_buy')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
