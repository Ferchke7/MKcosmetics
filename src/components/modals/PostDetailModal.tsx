import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TelegramPost } from '../../core/types/telegram';
import { Send, Calendar, MessageCircle, ChevronLeft, ChevronRight, Sparkles, Check, Package } from 'lucide-react';
import { sanitizeTelegramText } from '../../utils/textSanitizer';

interface PostDetailModalProps {
  post: TelegramPost | null;
  isOpen: boolean;
  onClose: () => void;
  onQuickOrder: (title: string, price: string, url: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onQuickOrder,
}) => {
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);

  if (!post) return null;

  const sanitized = sanitizeTelegramText(post.text, post.productTitle);
  const photos = post.photos && post.photos.length > 0 ? post.photos : [];

  const dateFormatted = new Date(post.timestamp).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const priceKrw = post.prices.krw;
  const priceRub = post.prices.rub;
  const priceUsd = post.prices.usd;

  const displayPrice = [
    priceKrw && `${priceKrw.toLocaleString('ru-RU')} ₩`,
    priceRub && `${priceRub.toLocaleString('ru-RU')} ₽`,
    priceUsd && `$${priceUsd}`,
    post.prices.eur && `€${post.prices.eur}`,
    post.prices.kzt && `${post.prices.kzt.toLocaleString('ru-RU')} ₸`,
    post.prices.uzs && `${post.prices.uzs.toLocaleString('ru-RU')} сум`,
  ].filter(Boolean).join(' / ') || 'Уточнить при заказе';

  const discountPercent =
    post.prices.originalKrw &&
    post.prices.krw &&
    post.prices.originalKrw > post.prices.krw
      ? Math.round(
          ((post.prices.originalKrw - post.prices.krw) / post.prices.originalKrw) * 100
        )
      : 0;

  const handleQuickOrderAction = () => {
    onQuickOrder(
      sanitized.title,
      displayPrice,
      post.postUrl
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-6">
        {/* Multi-photo Gallery */}
        {photos.length > 0 && (
          <div className="space-y-2.5">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-[#FAF5EE] border border-[#F0E6DE] shadow-xs">
              <img
                src={photos[selectedPhotoIdx]}
                alt={sanitized.title}
                className="w-full h-full object-cover"
              />

              {photos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedPhotoIdx(
                        (prev) => (prev - 1 + photos.length) % photos.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedPhotoIdx((prev) => (prev + 1) % photos.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Discount Tag */}
              {discountPercent > 0 && (
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-md">
                    -{discountPercent}% Скидка
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails strip */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {photos.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedPhotoIdx === idx
                        ? 'border-[#C2836B] scale-95 shadow-xs'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Meta Top Bar */}
        <div className="flex items-center text-xs text-[#8C827A] border-b border-[#F0E6DE] pb-3">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#C2836B]" />
            <span>{dateFormatted}</span>
          </div>
        </div>

        {/* Product Brand & Title */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {sanitized.brand && (
              <span className="px-2.5 py-0.5 rounded-md bg-[#FAF5EE] border border-[#EED9CF] text-[11px] font-bold text-[#8A503C] uppercase tracking-wider">
                {sanitized.brand}
              </span>
            )}
            <span className="text-[11px] text-[#A89F97] uppercase tracking-widest font-semibold">
              Оригинал из Сеула 🇰🇷
            </span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl text-[#2D2A2E] font-medium leading-snug">
            {sanitized.title}
          </h3>

          {sanitized.volume && (
            <div className="inline-flex items-center gap-1.5 text-xs text-[#6C3E2E] font-semibold bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#F0E6DE]">
              <Package className="w-3.5 h-3.5 text-[#C2836B]" />
              <span>Объем: {sanitized.volume}</span>
            </div>
          )}
        </div>

        {/* Price Breakdown Card */}
        {(priceKrw || priceRub || priceUsd || post.prices.eur || post.prices.kzt || post.prices.uzs) && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF5EE] to-[#FDF8F6] border border-[#EED9CF] space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A503C] block">
              Стоимость на день публикации:
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {priceKrw && (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-[#8A503C] font-semibold">KRW:</span>
                  <span className="text-xl font-bold text-[#C2836B]">
                    {priceKrw.toLocaleString('ru-RU')} ₩
                  </span>
                  {post.prices.originalKrw && post.prices.originalKrw > priceKrw && (
                    <span className="text-xs line-through text-[#A89F97]">
                      {post.prices.originalKrw.toLocaleString('ru-RU')} ₩
                    </span>
                  )}
                </div>
              )}
              {priceRub && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-[#8A503C] font-semibold">RUB:</span>
                  <span className="text-sm font-semibold text-[#2D2A2E]">
                    {priceRub.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              )}
              {priceUsd && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-[#8A503C] font-semibold">USD:</span>
                  <span className="text-sm font-semibold text-[#2D2A2E]">
                    ${priceUsd}
                  </span>
                </div>
              )}
              {post.prices.eur && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-[#8A503C] font-semibold">EUR:</span>
                  <span className="text-sm font-semibold text-[#2D2A2E]">
                    €{post.prices.eur}
                  </span>
                </div>
              )}
              {post.prices.kzt && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-[#8A503C] font-semibold">KZT:</span>
                  <span className="text-sm font-semibold text-[#2D2A2E]">
                    {post.prices.kzt.toLocaleString('ru-RU')} ₸
                  </span>
                </div>
              )}
              {post.prices.uzs && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-[#8A503C]">UZS:</span>
                  <span className="text-sm font-semibold text-[#2D2A2E]">
                    {post.prices.uzs.toLocaleString('ru-RU')} сум
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {(priceKrw || priceRub || priceUsd || post.prices.eur || post.prices.kzt || post.prices.uzs) && (
          <p className="text-xs leading-relaxed text-[#8C827A]">
            Цена приведена по публикации. Перед заказом уточните актуальную стоимость и наличие.
          </p>
        )}

        {/* Clean Description Paragraphs */}
        <div className="space-y-3">
          {sanitized.descriptionParagraphs.map((para, idx) => (
            <p key={idx} className="text-xs sm:text-sm text-[#4D2C20] leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {/* Benefits & Action Points */}
        {sanitized.benefits.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-[#F0E6DE]/80">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#8A503C]">
              Преимущества и действие:
            </h5>
            <div className="grid grid-cols-1 gap-2">
              {sanitized.benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#F0E6DE] text-xs sm:text-sm text-[#2D2A2E]"
                >
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Ingredients Tags */}
        {sanitized.keyIngredients.length > 0 && (
          <div className="space-y-2 pt-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#8A503C] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              Активные компоненты:
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {sanitized.keyIngredients.map((ing, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] text-[#6C3E2E] text-xs font-medium border border-[#EED9CF]"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* How to use */}
        {sanitized.howToUse && (
          <div className="p-3.5 rounded-xl bg-[#EEF5F1] text-[#345243] text-xs leading-relaxed border border-[#CCE3D6]">
            <span className="font-semibold block mb-0.5">Способ применения:</span>
            {sanitized.howToUse}
          </div>
        )}

        {/* Tags */}
        {sanitized.rawTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#F0E6DE]/60">
            {sanitized.rawTags.map((tag) => (
              <Badge key={tag} variant="brand" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-[#ECE8E1]">
          <Button
            variant="primary"
            size="lg"
            onClick={handleQuickOrderAction}
            icon={<Sparkles className="w-4 h-4 text-[#B89254]" />}
            className="rounded-xl font-bold bg-[#1A1917] hover:bg-[#B89254] text-white py-3"
          >
            Быстрый заказ
          </Button>

          <a
            href={post.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              variant="outline"
              size="lg"
              fullWidth
              icon={<Send className="w-4 h-4 text-[#0088cc]" />}
              className="rounded-xl border-[#ECE8E1] text-[#1A1917] hover:border-[#B89254] py-3 font-semibold"
            >
              Открыть в Telegram
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
};
