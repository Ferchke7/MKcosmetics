import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Product } from '../../core/types/product';
import { Star, ShoppingBag, MessageCircle, Check, Send, Sparkles } from 'lucide-react';
import { buildWhatsAppUrl } from '../../core/constants/brand';

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
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  if (!product) return null;

  const handleOrderWhatsApp = () => {
    onQuickBuy(product.name, formatPrice(product.priceKrw), product.telegramPostUrl);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF5EE] border border-[#F0E6DE] relative">
            <img
              src={product.images[selectedImgIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isBestseller && (
              <div className="absolute top-3 left-3">
                <Badge variant="gold" size="sm" icon={<Sparkles className="w-3 h-3" />}>
                  Хит продаж
                </Badge>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImgIndex === idx ? 'border-[#C2836B] scale-95' : 'border-transparent opacity-70 hover:opacity-100'
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
            <span className="text-xs font-semibold uppercase tracking-widest text-[#A96851]">
              {product.brand}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-[#2D2A2E] font-medium mt-1 leading-snug">
              {product.name}
            </h2>
            {product.volume && (
              <p className="text-xs text-[#8C827A] mt-1">Объем: {product.volume}</p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-bold text-[#2D2A2E]">{product.rating}</span>
            <span className="text-xs text-[#8C827A]">({product.reviewCount} отзывов)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 p-3 rounded-2xl bg-[#FAF5EE] border border-[#EED9CF]">
            <span className="text-2xl font-bold text-[#C2836B]">
              {formatPrice(product.priceKrw)}
            </span>
            {product.originalPriceKrw && (
              <span className="text-sm line-through text-[#A89F97]">
                {formatPrice(product.originalPriceKrw)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-[#6C635B] leading-relaxed">
            {product.description}
          </p>

          {/* Key Ingredients */}
          {product.keyIngredients && product.keyIngredients.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#4D2C20] mb-1.5">
                Ключевые ингредиенты:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {product.keyIngredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] text-[#6C3E2E] text-[11px] font-medium border border-[#EED9CF]"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* How to use */}
          {product.howToUse && (
            <div className="p-3 rounded-xl bg-[#EEF5F1] text-[#345243] text-xs leading-relaxed border border-[#CCE3D6]">
              <span className="font-semibold block mb-0.5">Способ применения:</span>
              {product.howToUse}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                icon={<ShoppingBag className="w-4 h-4" />}
              >
                В корзину
              </Button>
              <Button
                variant="whatsapp"
                onClick={handleOrderWhatsApp}
                icon={<MessageCircle className="w-4 h-4" />}
              >
                Купить в 1 клик
              </Button>
            </div>

            {product.telegramPostUrl && (
              <a
                href={product.telegramPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 text-xs text-[#229ED9] hover:text-[#1E8BC0] font-medium"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Смотреть обзор в Telegram</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
