import React from 'react';
import { Product } from '../../../core/types/product';
import { ProductCard } from '../Products/ProductCard';
import { Skeleton } from '../../ui/Skeleton';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

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
  // Show strictly top 10 latest products
  const latestTen = products.slice(0, 10);

  return (
    <section id="latest-arrivals" className="py-16 sm:py-24 bg-white border-b border-[#F0E6DE]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0073E9]/10 text-[#0073E9] text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Свежие поступления из Кореи</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111827] font-semibold tracking-tight">
              Топ-10 новинок
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#6B7280] max-w-xl">
              Свежие поступления и популярные бестселлеры. Все товары 100% оригинальные с быстрой доставкой из Южной Кореи.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenFullCatalog}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111827] hover:bg-[#374151] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <span>Смотреть весь каталог ({totalCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 10 Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Skeleton className="h-8 rounded-lg" />
                  <Skeleton className="h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : latestTen.length === 0 ? (
          <div className="text-center py-12 bg-[#F9FAFB] rounded-3xl border border-[#E5E7EB] p-6">
            <p className="text-sm text-[#6B7280]">Товары загружаются...</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
              {latestTen.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  formatPrice={formatPrice}
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={onToggleFavorite}
                  onAddToCart={onAddToCart}
                  onQuickView={onQuickView}
                  onQuickBuy={onQuickBuy}
                />
              ))}
            </div>

            {/* Big Coupang-style CTA Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-[#111827] via-[#1E293B] to-[#0F172A] p-6 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Полная база косметики</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold">
                  В каталоге доступно {totalCount} товаров
                </h3>
                <p className="text-sm text-gray-300 max-w-lg">
                  Используйте удобные фильтры по брендам, категориям, ценам и скидкам на отдельной странице каталога.
                </p>
              </div>

              <button
                onClick={onOpenFullCatalog}
                className="shrink-0 inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#0073E9] hover:bg-[#0060C7] text-white font-bold text-sm sm:text-base shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <span>Перейти в полный каталог</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
