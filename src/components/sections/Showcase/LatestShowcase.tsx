import React, { useState } from 'react';
import { Product } from '../../../core/types/product';
import { ProductCard } from '../Products/ProductCard';
import { Skeleton } from '../../ui/Skeleton';
import { ArrowRight, Trophy, Sparkles, Flame, Percent } from 'lucide-react';
import { useLanguage } from '../../../core/i18n/LanguageContext';

interface LatestShowcaseProps {
  products: Product[];
  totalCount: number;
  isLoading: boolean;
  formatPrice: (amt: number) => string;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onQuickBuy: (title: string, price: string, url?: string) => void;
  onOpenFullCatalog: () => void;
}

export const LatestShowcase: React.FC<LatestShowcaseProps> = ({
  products,
  totalCount,
  isLoading,
  formatPrice,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onQuickView,
  onQuickBuy,
  onOpenFullCatalog,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'bestsellers' | 'newest' | 'sale'>('bestsellers');

  // Filter products by active showcase tab
  const displayedList = React.useMemo(() => {
    const safeList = Array.isArray(products) ? products : [];
    if (activeTab === 'sale') {
      const sales = safeList.filter((p) => p && p.discountPercent && p.discountPercent > 0);
      return sales.length >= 5 ? sales.slice(0, 10) : safeList.slice(0, 10);
    }
    if (activeTab === 'newest') {
      return [...safeList].reverse().slice(0, 10);
    }
    // Default: Bestsellers (top 10)
    return safeList.slice(0, 10);
  }, [products, activeTab]);

  return (
    <section id="latest-arrivals" className="py-14 sm:py-20 bg-white border-b border-[#ECE8E1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#ECE8E1]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F4EF] text-[#B89254] border border-[#ECE8E1] text-[11px] font-bold uppercase tracking-widest mb-2 shadow-2xs">
              <Trophy className="w-3.5 h-3.5" />
              <span>{t('showcase_badge')}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1917] font-normal tracking-tight">
              {t('showcase_title')}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#8A8680] max-w-xl">
              {t('showcase_subtitle')}
            </p>
          </div>

          {/* Quick Filter Tabs & Catalog Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-[#FAF8F5] p-1 rounded-full border border-[#ECE8E1]">
              <button
                onClick={() => setActiveTab('bestsellers')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'bestsellers'
                    ? 'bg-[#1A1917] text-[#B89254] shadow-2xs'
                    : 'text-[#1A1917] hover:text-[#B89254]'
                }`}
              >
                ⭐ {language === 'uz' ? 'Xitlar' : 'Хиты'}
              </button>
              <button
                onClick={() => setActiveTab('sale')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'sale'
                    ? 'bg-[#E53935] text-white shadow-2xs'
                    : 'text-[#1A1917] hover:text-[#E53935]'
                }`}
              >
                🔥 {language === 'uz' ? 'Chegirmalar' : 'Скидки'}
              </button>
              <button
                onClick={() => setActiveTab('newest')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'newest'
                    ? 'bg-[#1A1917] text-[#B89254] shadow-2xs'
                    : 'text-[#1A1917] hover:text-[#B89254]'
                }`}
              >
                ✨ {language === 'uz' ? 'Yangi' : 'Новинки'}
              </button>
            </div>

            <button
              onClick={onOpenFullCatalog}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1A1917] hover:bg-[#B89254] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer ml-auto sm:ml-0"
            >
              <span>{t('showcase_all_btn')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B89254]" />
            </button>
          </div>
        </div>

        {/* 10 Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="space-y-2 rounded-2xl border border-[#ECE8E1] bg-white p-3">
                <Skeleton className="aspect-[4/5] rounded-xl" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <Skeleton className="h-8 rounded-lg" />
                  <Skeleton className="h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedList.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF8F5] rounded-3xl border border-[#ECE8E1] p-6">
            <p className="text-sm text-[#8A8680]">Товары загружаются...</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {displayedList.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  rank={index + 1}
                  formatPrice={formatPrice}
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={onToggleFavorite}
                  onAddToCart={onAddToCart}
                  onQuickView={onQuickView}
                  onQuickBuy={onQuickBuy}
                />
              ))}
            </div>

            {/* Premium Refined Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-[#342D28] via-[#29231E] to-[#1E1A17] p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-[#B89254]/25 relative overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#B89254]/20 blur-3xl" />
              <div className="space-y-2 text-center md:text-left relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[#DFCBA0] text-xs font-bold uppercase tracking-wider border border-white/15">
                  <Sparkles className="w-3.5 h-3.5 text-[#B89254]" />
                  <span>{t('showcase_banner_badge')}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {t('showcase_banner_title')}
                </h3>
                <p className="text-xs sm:text-sm text-white/85 max-w-lg leading-relaxed">
                  {t('showcase_banner_desc')}
                </p>
              </div>

              <button
                onClick={onOpenFullCatalog}
                className="relative z-10 shrink-0 inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#B89254] hover:bg-[#9E7B42] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <span>{t('showcase_banner_btn')} ({totalCount})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
