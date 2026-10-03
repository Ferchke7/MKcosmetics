import React, { useState } from 'react';
import { Product } from '../../../core/types/product';
import { ProductCard } from '../Products/ProductCard';
import { Crown, Sparkles, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { useLanguage } from '../../../core/i18n/LanguageContext';

interface BrandSpotlightProps {
  products: Product[];
  formatPrice: (amt: number) => string;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onQuickBuy: (title: string, price: string, url?: string) => void;
  onOpenBrandInCatalog: (brandName: string) => void;
}

interface FeaturedBrandInfo {
  id: string;
  name: string;
  taglineRu: string;
  taglineUz: string;
  badgeRu: string;
  badgeUz: string;
  bgGradient: string;
}

const FEATURED_BRANDS: FeaturedBrandInfo[] = [
  {
    id: 'Curación',
    name: 'Curación',
    taglineRu: 'Премиальная корейская дерматокосметика с активными пептидами и факторами роста',
    taglineUz: 'Faol peptidlar va oʻsish omillariga ega premium Koreya dermatokosmetikasi',
    badgeRu: 'Эксклюзивный бренд',
    badgeUz: 'Eksklyuziv brend',
    bgGradient: 'from-[#342D28] via-[#29231E] to-[#1E1A17]',
  },
  {
    id: 'JOGABI',
    name: 'JOGABI',
    taglineRu: 'Инновационные формулы для клеточного омоложения и глубокого восстановления кожи',
    taglineUz: 'Hujayralarni yoshartirish va chuqur tiklash uchun innovatsion formulalar',
    badgeRu: 'Топ Кореи',
    badgeUz: 'Koreya Topi',
    bgGradient: 'from-[#2C2930] via-[#221F26] to-[#1A171F]',
  },
  {
    id: 'Sulwhasoo',
    name: 'Sulwhasoo',
    taglineRu: 'Легендарный королевский уход на основе ценнейшего корейского красного женьшеня',
    taglineUz: 'Noyob koreys qizil jensheni asosidagi afsonaviy qirollik parvarishi',
    badgeRu: 'Люкс Корея',
    badgeUz: 'Lyuks Koreya',
    bgGradient: 'from-[#332B22] via-[#28221B] to-[#1E1914]',
  },
  {
    id: 'The History of Whoo',
    name: 'The History of Whoo',
    taglineRu: 'Императорские рецепты красоты для непревзойденной упругости и сияния',
    taglineUz: 'Betakror taranglik va jilo uchun imperator goʻzallik retseptlari',
    badgeRu: 'Императорский уход',
    badgeUz: 'Imperator parvarishi',
    bgGradient: 'from-[#332626] via-[#281D1E] to-[#1E1415]',
  },
  {
    id: 'Medi-Peel',
    name: 'Medi-Peel',
    taglineRu: 'Салонный антивозрастной эффект с пептидными комплексами и волюфилином',
    taglineUz: 'Peptid komplekslari va volyufilin bilan salon darajasidagi yoshartirish',
    badgeRu: 'Хит продаж',
    badgeUz: 'Eng koʻp sotilgan',
    bgGradient: 'from-[#242D33] via-[#1C2329] to-[#141B20]',
  },
];

export const BrandSpotlight: React.FC<BrandSpotlightProps> = ({
  products,
  formatPrice,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onQuickView,
  onQuickBuy,
  onOpenBrandInCatalog,
}) => {
  const { language } = useLanguage();
  const [activeBrandId, setActiveBrandId] = useState('Curación');

  const activeBrand = FEATURED_BRANDS.find((b) => b.id === activeBrandId) || FEATURED_BRANDS[0];

  const safeProducts = Array.isArray(products) ? products : [];

  // Find products belonging to active brand (or matching brand name)
  const brandProducts = safeProducts
    .filter((p) => (p?.brand || '').toLowerCase().includes(activeBrand.name.toLowerCase()))
    .slice(0, 4);

  // If active brand has fewer than 4, fill with general products
  const displayProducts = brandProducts.length > 0
    ? brandProducts
    : safeProducts.slice(0, 4);

  return (
    <section className="py-14 sm:py-20 bg-[#FAF8F5] border-b border-[#ECE8E1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F4EF] text-[#B89254] border border-[#ECE8E1] text-[11px] font-bold uppercase tracking-widest mb-2 shadow-2xs">
              <Crown className="w-3.5 h-3.5" />
              <span>{language === 'uz' ? 'Eksklyuziv Koreya brendlari' : 'Эксклюзивные бренды Кореи'}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1917] font-normal tracking-tight">
              {language === 'uz' ? 'Premium tanlov & original brendlar' : 'Премиальная селекция брендов'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#8A8680] max-w-xl">
              {language === 'uz'
                ? "Eng mashhur Koreya dermato va lyuks laboratoriyalaridan to'g'ridan-to'g'ri yetkazib berish."
                : 'Прямые поставки от ведущих дерматологических и премиальных лабораторий Сеула.'}
            </p>
          </div>

          {/* Brand Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {FEATURED_BRANDS.map((brand) => {
              const isActive = brand.id === activeBrandId;
              return (
                <button
                  key={brand.id}
                  onClick={() => setActiveBrandId(brand.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1A1917] text-[#B89254] shadow-xs scale-102'
                      : 'bg-white text-[#1A1917] hover:bg-[#F7F4EF] border border-[#ECE8E1] hover:border-[#B89254]'
                  }`}
                >
                  {brand.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Banner Card */}
        <div className={`rounded-3xl bg-gradient-to-r ${activeBrand.bgGradient} p-6 sm:p-8 text-white mb-8 border border-[#B89254]/25 shadow-lg relative overflow-hidden`}>
          <div className="pointer-events-none absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#B89254]/20 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[#DFCBA0] text-xs font-bold uppercase tracking-wider border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-[#B89254]" />
                <span>{language === 'uz' ? activeBrand.badgeUz : activeBrand.badgeRu}</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
                {activeBrand.name}
              </h3>
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                {language === 'uz' ? activeBrand.taglineUz : activeBrand.taglineRu}
              </p>
            </div>

            <button
              onClick={() => onOpenBrandInCatalog(activeBrand.name)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B89254] hover:bg-[#9E7B42] text-white font-bold text-xs sm:text-sm tracking-wide transition-transform active:scale-95 shadow-md cursor-pointer shrink-0"
            >
              <span>{language === 'uz' ? `${activeBrand.name} katalogi` : `Все товары ${activeBrand.name}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Products Showcase */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-5">
          {displayProducts.map((product) => (
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
      </div>
    </section>
  );
};
