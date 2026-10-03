import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../core/i18n/LanguageContext';

interface CatalogHeroHeaderProps {
  onBackToHome: () => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
}

const RIBBON_ITEMS = [
  { id: 'peeling-cleansing', key: 'cat_cleansers' },
  { id: 'sun-care', key: 'cat_sun' },
  { id: 'hydration-serums', key: 'cat_toners' },
  { id: 'serums', key: 'cat_serums' },
  { id: 'anti-aging', key: 'cat_antiaging' },
  { id: 'brightening', key: 'cat_brightening' },
  { id: 'sets', key: 'cat_sets' },
] as const;

export const CatalogHeroHeader: React.FC<CatalogHeroHeaderProps> = ({
  onBackToHome,
  selectedCategory,
  onCategoryChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="mb-10">
      {/* Luxury Ivory / Gold Shop Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF8F5] via-[#F7F4EF] to-[#FAF5EC] border border-[#ECE8E1] shadow-sm p-6 sm:p-10 lg:p-12">
        {/* Soft blur light */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#B89254]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#DFCBA0]/15 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Breadcrumb & Title */}
          <div className="lg:col-span-7 space-y-4">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#8A8680]">
              <button
                onClick={onBackToHome}
                className="hover:text-[#B89254] transition-colors cursor-pointer"
              >
                {t('nav_home')}
              </button>
              <span>/</span>
              <span className="text-[#1A1917] font-semibold">{t('nav_catalog')}</span>
            </div>

            {/* Shop Title */}
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#1A1917]">
                Shop
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#8A8680] leading-relaxed max-w-xl">
                {t('catalog_shop_tagline')}
              </p>
            </div>
          </div>

          {/* Right Column: Aesthetic Cosmetics Composition */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden bg-white/70 backdrop-blur-xs border border-[#ECE8E1] p-3 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80"
                alt="Luxury Korean Cosmetic Care"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 rounded-xl ring-1 ring-black/5" />
              
              {/* Floating aesthetic label */}
              <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#ECE8E1] text-[11px] font-semibold text-[#B89254] flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#B89254]" />
                <span>Seoul Glow Routine</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Category Ribbon with Diamonds */}
      <div className="mt-4 border-y border-[#ECE8E1] py-3.5 px-4 overflow-x-auto no-scrollbar bg-white/60">
        <div className="flex items-center justify-between min-w-max gap-4 sm:gap-6 text-xs font-semibold text-[#8A8680]">
          {RIBBON_ITEMS.map((item, idx) => (
            <React.Fragment key={item.id}>
              <button
                onClick={() => onCategoryChange(item.id)}
                className={`transition-colors cursor-pointer uppercase tracking-wider text-[11px] sm:text-xs ${
                  selectedCategory === item.id
                    ? 'text-[#B89254] font-bold underline underline-offset-4'
                    : 'hover:text-[#1A1917]'
                }`}
              >
                {t(item.key)}
              </button>
              {idx < RIBBON_ITEMS.length - 1 && (
                <span className="text-[#DFCBA0] text-xs select-none">✧</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
