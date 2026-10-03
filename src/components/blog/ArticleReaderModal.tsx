import React from 'react';
import { X, Clock, User, Sparkles, Send, ShoppingBag, ArrowRight, Share2, Tag, CheckCircle2 } from 'lucide-react';

export interface ArticleData {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  contentMarkdown: string;
  coverImage?: string;
  author?: string;
  readingTimeMinutes?: number;
  tags?: string[];
  relatedProductIDs?: string[];
  sourceTelegramUrl?: string;
  views?: number;
  publishedAt?: string;
}

interface ArticleReaderModalProps {
  article: ArticleData | null;
  onClose: () => void;
  onOpenProduct?: (productId: string) => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  article,
  onClose,
  onOpenProduct,
}) => {
  if (!article) return null;

  // Format content paragraphs and routine steps
  const paragraphs = article.contentMarkdown.split('\n').filter((p) => p.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-[#ECE8E1] rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#1A1917]">
        
        {/* Sticky Header with Close */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#FAF8F5]/95 backdrop-blur-lg border-b border-[#ECE8E1]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B89254] uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#B89254]" />
            <span>MK K-Beauty Journal & Guide</span>
          </div>

          <div className="flex items-center gap-2">
            {article.sourceTelegramUrl && (
              <a
                href={article.sourceTelegramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAF8F5] border border-[#0088cc]/30 text-[#0088cc] text-xs font-medium rounded-xl transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Оригинал в Telegram</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-white hover:bg-[#FAF8F5] border border-[#ECE8E1] rounded-xl text-[#8A8680] hover:text-[#1A1917] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 bg-white">
          {/* Cover Hero Image */}
          {article.coverImage && (
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#ECE8E1] shadow-sm">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#8A8680] border-b border-[#ECE8E1] pb-4">
            <div className="flex items-center gap-1.5 text-[#B89254] font-medium">
              <User className="w-4 h-4 text-[#B89254]" />
              <span>{article.author || 'MK Skincare Editorial'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#8A8680]" />
              <span>{article.readingTimeMinutes || 3} мин. чтения</span>
            </div>
            {article.views !== undefined && article.views > 0 && (
              <span className="text-[#8A8680]">{article.views} просмотров</span>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1917] tracking-tight leading-snug">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="text-base text-[#8A8680] italic border-l-2 border-[#B89254] pl-3">
                {article.subtitle}
              </p>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FAF8F5] text-[#B89254] border border-[#ECE8E1]"
                >
                  <Tag className="w-3 h-3 text-[#B89254]" />
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Article Text Content */}
          <div className="max-w-none text-[#1A1917] text-sm sm:text-base leading-relaxed space-y-4">
            {paragraphs.map((p, idx) => {
              const isHeadline = p.startsWith('📌') || p.startsWith('✨') || p.startsWith('💎') || p.startsWith('💡') || p.startsWith('🌿');
              const isStep = p.toLowerCase().includes('этап') || p.toLowerCase().includes('шаг') || p.startsWith('1.') || p.startsWith('2.') || p.startsWith('3.');

              if (isStep) {
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#FAF8F5] border-l-4 border-[#B89254] flex items-start gap-3 my-3 border border-[#ECE8E1]"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#B89254] shrink-0 mt-0.5" />
                    <p className="text-[#1A1917] font-medium m-0">{p}</p>
                  </div>
                );
              }

              if (isHeadline) {
                return (
                  <h3 key={idx} className="font-serif text-lg font-bold text-[#1A1917] mt-6 mb-2 flex items-center gap-2">
                    {p}
                  </h3>
                );
              }

              return <p key={idx} className="text-[#1A1917] leading-relaxed">{p}</p>;
            })}
          </div>

          {/* Call to Action for Related Product */}
          {article.relatedProductIDs && article.relatedProductIDs.length > 0 && onOpenProduct && (
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white text-[#B89254] border border-[#ECE8E1] shadow-2xs">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A1917] text-base">Товар из этой статьи</h4>
                  <p className="text-xs text-[#8A8680]">Оригинальная корейская косметика в наличии в Ташкенте</p>
                </div>
              </div>

              <button
                onClick={() => onOpenProduct(article.relatedProductIDs![0])}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#1A1917] hover:bg-[#B89254] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span>Перейти к товару</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#ECE8E1] flex items-center justify-between text-xs text-[#8A8680]">
          <span>MK Cosmetics • Официальный поставщик K-Beauty в Узбекистан</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#F7F4EF] text-[#1A1917] font-medium rounded-xl border border-[#ECE8E1] transition-all cursor-pointer"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
