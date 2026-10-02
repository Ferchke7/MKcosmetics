import React from 'react';
import { Product } from '../../../core/types/product';
import { ProductCard } from '../Products/ProductCard';
import { Skeleton } from '../../ui/Skeleton';
import { ArrowRight, Trophy, Sparkles, Flame, ShieldCheck } from 'lucide-react';

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
  // Show strictly top 10 latest / top-ranking products
  const latestTen = products.slice(0, 10);

  return (
    <section id="latest-arrivals" className="py-16 sm:py-24 bg-[#FFFFFF] border-b border-[#EEEEEE]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Musinsa Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-[#111111]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#111111] text-white text-[10px] font-extrabold uppercase tracking-widest mb-2">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>MUSINSA BEAUTY RANKING • 뷰티 랭킹</span>
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl text-[#111111] font-black tracking-tight">
              ТОП-10 БЕСТСЕЛЛЕРОВ
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#777777] max-w-xl">
              Самые востребованные оригинальные средства из Южной Кореи в режиме реального времени.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenFullCatalog}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#111111] hover:bg-[#333333] text-white text-xs sm:text-sm font-bold tracking-wider transition-colors shadow-sm cursor-pointer"
            >
              <span>ВЕСЬ КАТАЛОГ ({totalCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 10 Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="space-y-2 rounded-xl border border-[#EBEBEB] bg-white p-3">
                <Skeleton className="aspect-[4/5] rounded-lg" />
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
        ) : latestTen.length === 0 ? (
          <div className="text-center py-16 bg-[#FAFAFA] rounded-2xl border border-[#EEEEEE] p-6">
            <p className="text-sm text-[#777777]">Товары загружаются...</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {latestTen.map((product, index) => (
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

            {/* Musinsa Black Banner */}
            <div className="rounded-2xl bg-[#111111] p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-black">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PREMIUM K-BEAUTY SELECTION</span>
                </div>
                <h3 className="font-sans text-2xl sm:text-3xl font-black tracking-tight">
                  Более {totalCount} оригинальных товаров из Кореи
                </h3>
                <p className="text-xs sm:text-sm text-[#999999] max-w-lg">
                  Быстрый поиск по брендам, фильтры по типам кожи, объему и эксклюзивным скидкам до 70%.
                </p>
              </div>

              <button
                onClick={onOpenFullCatalog}
                className="shrink-0 inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-gray-100 text-[#111111] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <span>Перейти в полный каталог ({totalCount})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
