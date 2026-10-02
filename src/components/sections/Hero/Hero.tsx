import React from 'react';
import { ArrowDown, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import { useLanguage } from '../../../core/i18n/LanguageContext';

interface HeroProps {
  onOpenCatalog?: () => void;
  totalProductsCount?: number;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCatalog, totalProductsCount }) => {
  const { t } = useLanguage();

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-b from-[#F7EDE8]/70 via-[#FAF7F2] to-[#FAF7F2] pt-32 pb-20 sm:pt-40 sm:pb-28"
    >
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#E8A598]/15 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-[#EED9CF] text-xs font-semibold uppercase tracking-[0.18em] text-[#A96851] shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>{BRAND_CONFIG.brandName}</span>
        </div>

        <h1 className="font-serif text-4xl font-normal leading-tight tracking-tight text-[#242120] sm:text-5xl lg:text-6xl">
          {t('hero_title_1')}
          <span className="mt-1 block font-light italic text-[#A96851]">
            {t('hero_title_2')}
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#6C635B] sm:text-lg">
          {t('hero_subtitle')}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {onOpenCatalog ? (
            <button
              onClick={onOpenCatalog}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C2836B] px-7 py-3.5 text-base font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-[#A96851] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2836B] sm:w-auto cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{t('hero_btn_catalog')} {totalProductsCount ? `(${totalProductsCount})` : ''}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <a
              href="#catalog"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C2836B] px-7 py-3.5 text-base font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-[#A96851] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2836B] sm:w-auto"
            >
              <ShoppingBag className="h-4 w-4" />
              {t('hero_btn_catalog')}
              <ArrowRight className="h-4 w-4" />
            </a>
          )}

          <a
            href="#contacts"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#EED9CF] bg-[#FAF5EE] px-7 py-3.5 text-base font-medium tracking-wide text-[#4D2C20] transition-colors hover:bg-[#F2E8DC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E1BEAF] sm:w-auto"
          >
            {t('hero_btn_contacts')}
            <ArrowDown className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
