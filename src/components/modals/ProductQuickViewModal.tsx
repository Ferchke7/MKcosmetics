import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Product } from '../../core/types/product';
import {
  Star,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Plane,
  Plus,
  Minus,
  Sparkles,
  Truck,
  CheckCircle2,
} from 'lucide-react';
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
  const { t, language } = useLanguage();
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'usage' | 'shipping'>('desc');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const photos = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];
  const discountPercent = product.discountPercent;
  const unitPrice = product.priceKrw > 0 ? formatPrice(product.priceKrw) : t('product_price_on_request');
  const totalPriceFormatted = product.priceKrw > 0 ? formatPrice(product.priceKrw * quantity) : t('product_price_on_request');

  const handleOrderWhatsApp = () => {
    onQuickBuy(`${product.name} (${quantity} шт.)`, totalPriceFormatted, product.telegramPostUrl);
    onClose();
  };

  const handleAddMultipleToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start text-[#1A1917]">
        {/* Left Column: Gallery */}
        <div className="space-y-3">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#ECE8E1] relative shadow-2xs">
            {photos.length > 0 ? (
              <img
                src={photos[selectedImgIndex] || photos[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#8A8680] text-xs font-bold font-serif">
                MK KOREA COSMETIC
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {discountPercent && discountPercent > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#E53935] text-white text-xs font-black tracking-tight shadow-xs">
                  -{discountPercent}%
                </span>
              )}
              {product.isBestseller && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#1A1917] text-[#B89254] text-[10px] font-bold uppercase tracking-wider border border-[#B89254]/30">
                  BESTSELLER
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3 z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1917]/90 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/10">
                <Plane className="w-3.5 h-3.5 text-[#B89254]" />
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
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImgIndex === idx
                      ? 'border-[#B89254] ring-1 ring-[#B89254]'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Specs & Ordering */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#B89254]">
                {product.brand}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Оригинал</span>
              </span>
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1917] mt-1 leading-snug">
              {product.name}
            </h2>

            {product.volume && (
              <p className="text-xs font-medium text-[#8A8680] mt-1">
                {t('product_volume')} <strong className="text-[#1A1917]">{product.volume}</strong>
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
            <span className="font-bold text-[#1A1917]">{product.rating}</span>
            <span className="text-[#8A8680]">({product.reviewCount} {t('product_reviews')})</span>
          </div>

          {/* Price Box */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] flex items-center justify-between">
            <div>
              {product.originalPriceKrw && product.originalPriceKrw > product.priceKrw && (
                <div className="text-[11px] text-[#8A8680] line-through leading-none">
                  {formatPrice(product.originalPriceKrw * quantity)}
                </div>
              )}
              <div className="flex items-baseline gap-2">
                {discountPercent && discountPercent > 0 && (
                  <span className="text-[#E53935] font-black text-xl sm:text-2xl tracking-tight">
                    -{discountPercent}%
                  </span>
                )}
                <span className="text-xl sm:text-2xl font-black text-[#1A1917] tracking-tight">
                  {totalPriceFormatted}
                </span>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-1.5 bg-white rounded-xl border border-[#ECE8E1] p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 text-[#8A8680] hover:text-[#1A1917] cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold px-2 text-[#1A1917]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 text-[#8A8680] hover:text-[#1A1917] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Specification Tabs */}
          <div className="space-y-2">
            <div className="flex border-b border-[#ECE8E1] text-xs font-bold">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-2 px-2.5 transition-colors cursor-pointer ${
                  activeTab === 'desc'
                    ? 'border-b-2 border-[#1A1917] text-[#1A1917]'
                    : 'text-[#8A8680] hover:text-[#1A1917]'
                }`}
              >
                {language === 'uz' ? 'Tavsif' : 'Описание'}
              </button>
              {product.keyIngredients && product.keyIngredients.length > 0 && (
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`pb-2 px-2.5 transition-colors cursor-pointer ${
                    activeTab === 'ingredients'
                      ? 'border-b-2 border-[#1A1917] text-[#1A1917]'
                      : 'text-[#8A8680] hover:text-[#1A1917]'
                  }`}
                >
                  {language === 'uz' ? 'Tarkib' : 'Состав'}
                </button>
              )}
              {product.howToUse && (
                <button
                  onClick={() => setActiveTab('usage')}
                  className={`pb-2 px-2.5 transition-colors cursor-pointer ${
                    activeTab === 'usage'
                      ? 'border-b-2 border-[#1A1917] text-[#1A1917]'
                      : 'text-[#8A8680] hover:text-[#1A1917]'
                  }`}
                >
                  {language === 'uz' ? 'Qoʻllash' : 'Применение'}
                </button>
              )}
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-2 px-2.5 transition-colors cursor-pointer ${
                  activeTab === 'shipping'
                    ? 'border-b-2 border-[#1A1917] text-[#1A1917]'
                    : 'text-[#8A8680] hover:text-[#1A1917]'
                }`}
              >
                {language === 'uz' ? 'Yetkazish' : 'Доставка'}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="text-xs text-[#8A8680] leading-relaxed max-h-32 overflow-y-auto pr-1">
              {activeTab === 'desc' && (
                <p>{product.description || (language === 'uz' ? 'Mahsulot Janubiy Koreyadan keltirilgan 100% original vosita.' : 'Оригинальный премиальный продукт из Южной Кореи.')}</p>
              )}

              {activeTab === 'ingredients' && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {product.keyIngredients?.map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-[#FAF8F5] text-[#1A1917] text-[11px] font-semibold border border-[#ECE8E1]"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              )}

              {activeTab === 'usage' && (
                <p>{product.howToUse}</p>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2 text-[11px] text-[#1A1917]">
                    <Plane className="w-3.5 h-3.5 text-[#B89254]" />
                    <span>{language === 'uz' ? 'Seuldan toʻgʻridan-toʻgʻri avia yetkazib berish' : 'Прямая авиа-доставка из Сеула 2 раза в неделю'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#1A1917]">
                    <Truck className="w-3.5 h-3.5 text-[#B89254]" />
                    <span>{language === 'uz' ? 'Toshkent boʻylab tezkor kuryer va Oʻzbekiston viloyatlariga yetkazish' : 'Экспресс-доставка по Ташкенту (2-4 часа) и по всем регионам'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#1A1917]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'uz' ? '100% haqiqiylik va yangi partiya kafolati' : '100% гарантия свежих сроков и оригинальности'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-[#ECE8E1]">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddMultipleToCart}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#ECE8E1] bg-[#FAF8F5] hover:bg-[#F7F4EF] text-[#1A1917] text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <ShoppingBag className="w-4 h-4 text-[#B89254]" />
                <span>{t('product_add_cart')}</span>
              </button>

              <button
                type="button"
                onClick={handleOrderWhatsApp}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md"
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
