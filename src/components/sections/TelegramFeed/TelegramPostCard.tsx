import React, { useState } from 'react';
import { TelegramPost } from '../../../core/types/telegram';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Eye, Calendar, Send, MessageCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { sanitizeTelegramText } from '../../../utils/textSanitizer';

interface TelegramPostCardProps {
  post: TelegramPost;
  onOpenDetails: (post: TelegramPost) => void;
  onQuickOrder: (title: string, price: string, url: string) => void;
}

export const TelegramPostCard: React.FC<TelegramPostCardProps> = ({
  post,
  onOpenDetails,
  onQuickOrder,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const formattedDate = post?.timestamp
    ? new Date(post.timestamp).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      })
    : '';

  const prices = post?.prices || {};
  const priceKrw = prices.krw;
  const priceRub = prices.rub;
  const priceUsd = prices.usd;

  const displayPrice = priceKrw
    ? `${priceKrw.toLocaleString('ru-RU')} ₩`
    : priceRub
    ? `${priceRub.toLocaleString('ru-RU')} ₽`
    : 'По запросу';

  const discountPercent =
    prices.originalKrw &&
    prices.krw &&
    prices.originalKrw > prices.krw
      ? Math.round(
          ((prices.originalKrw - prices.krw) / prices.originalKrw) * 100
        )
      : 0;

  const sanitized = sanitizeTelegramText(post?.text || '', post?.productTitle);
  const photos = Array.isArray(post?.photos) && post.photos.length > 0 ? post.photos : [];
  const tags = Array.isArray(post?.tags) ? post.tags : [];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 0) {
      setActivePhotoIdx((prev) => (prev + 1) % photos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 0) {
      setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const handleOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickOrder(
      post?.productTitle || sanitized.title,
      displayPrice,
      post?.postUrl || ''
    );
  };

  return (
    <Card
      className="flex flex-col justify-between h-full group bg-white border-[#F0E6DE] transition-all duration-300"
      onClick={() => onOpenDetails(post)}
    >
      <div>
        {/* Post Image Box / Gallery */}
        <div className="relative aspect-[4/3] bg-[#FAF5EE] overflow-hidden">
          {photos.length > 0 ? (
            <img
              src={photos[activePhotoIdx]}
              alt={post?.productTitle || sanitized.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FAF5EE] to-[#EED9CF] text-[#8A503C]">
              <Send className="w-10 h-10 opacity-30" />
            </div>
          )}

          {/* Multiple Photos Navigation Arrows & Dots */}
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

              {/* Dots indicator */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full">
                {photos.map((_, idx) => (
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

          {/* Telegram Channel Pill */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#229ED9] text-white text-[10px] font-bold shadow-xs">
              <Send className="w-3 h-3" />
              <span>@mkcosmetkor</span>
            </span>
          </div>

          {/* Discount Tag: ONLY if discountPercent is strictly > 0 */}
          {discountPercent > 0 && (
            <div className="absolute top-3 right-3 z-10">
              <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-xs">
                -{discountPercent}% Скидка
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Date & Views */}
          <div className="flex items-center justify-between text-[11px] text-[#8C827A]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>{post?.views || '100+'}</span>
            </div>
          </div>

          {/* Product Title */}
          <h4 className="font-serif text-base font-medium text-[#2D2A2E] line-clamp-2 leading-snug group-hover:text-[#C2836B] transition-colors">
            {post?.productTitle || sanitized.title}
          </h4>

          {/* Multi-currency Price Pills */}
          {(priceKrw || priceRub || priceUsd) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {priceKrw && (
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] border border-[#EED9CF] text-xs font-bold text-[#8A503C]">
                  {priceKrw.toLocaleString('ru-RU')} ₩
                </span>
              )}
              {priceRub && (
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#F0E6DE] text-xs font-semibold text-[#2D2A2E]">
                  {priceRub.toLocaleString('ru-RU')} ₽
                </span>
              )}
              {priceUsd && (
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#F0E6DE] text-xs font-medium text-[#6C635B]">
                  ${priceUsd}
                </span>
              )}
            </div>
          )}

          {/* Sanitized Clean Preview Text */}
          {sanitized?.descriptionParagraphs && sanitized.descriptionParagraphs.length > 0 && (
            <p className="text-xs text-[#6C635B] line-clamp-2 leading-relaxed">
              {sanitized.descriptionParagraphs[0]}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-[#A89F97] hover:text-[#C2836B]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer CTAs */}
      <div className="px-5 pb-5 pt-2 border-t border-[#F0E6DE]/60 flex items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(post);
          }}
          className="text-xs font-medium text-[#8A503C] hover:text-[#C2836B] transition-colors"
        >
          Подробнее ›
        </button>

        <Button
          variant="whatsapp"
          size="sm"
          onClick={handleOrder}
          icon={<MessageCircle className="w-3.5 h-3.5" />}
        >
          Заказать
        </Button>
      </div>
    </Card>
  );
};
