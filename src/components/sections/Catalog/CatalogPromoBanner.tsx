import React from 'react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { useLanguage } from '../../../core/i18n/LanguageContext';

interface CatalogPromoBannerProps {
  onExploreSale: () => void;
}

export const CatalogPromoBanner: React.FC<CatalogPromoBannerProps> = ({ onExploreSale }) => {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2A2420] via-[#352D27] to-[#1E1916] text-white p-8 sm:p-12 lg:p-14 shadow-2xl mt-16 border border-[#ECE8E1]/20">
      {/* Background glowing image with overlay */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity">
        <img
          src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80"
          alt="Glowing Skin Care Treatment"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A2420] via-[#2A2420]/80 to-transparent" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Campaign Copy */}
        <div className="lg:col-span-8 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#DFCBA0] text-xs font-bold uppercase tracking-widest border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#DFCBA0]" />
            <span>{t('promo_badge')}</span>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
            {t('promo_title')}
          </h3>

          <p className="text-xs sm:text-sm text-[#DFCBA0]/90 leading-relaxed max-w-lg">
            {t('promo_desc')}
          </p>

          <div className="pt-2">
            <button
              onClick={onExploreSale}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#B89254] hover:bg-[#9E7B42] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-transform active:scale-95 shadow-lg cursor-pointer"
            >
              <span>{t('promo_btn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Floating Featured Cosmetic Card */}
        <div className="lg:col-span-4 flex justify-center lg:justify-end">
          <div className="w-full max-w-[240px] bg-white rounded-2xl p-3 text-[#1A1917] shadow-2xl border border-white/20 transform hover:-translate-y-1 transition-transform">
            <div className="aspect-square rounded-xl bg-[#FAF8F5] overflow-hidden mb-3 relative border border-[#ECE8E1]">
              <img
                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"
                alt="Cosmetic Firming Serum"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-sm bg-[#E53935] text-white text-[10px] font-black">
                -30%
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#B89254] uppercase tracking-wider block">
                MEDIPEEL KOREA
              </span>
              <h5 className="font-sans text-xs font-semibold text-[#1A1917] line-clamp-1">
                Peptide 9 Volume Bio Tox Ampoule
              </h5>

              <div className="flex items-center gap-1 text-[10px] text-amber-500 py-0.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-current" />
                  ))}
                </div>
                <span className="text-[#8A8680] font-medium">(5.0)</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-black text-[#1A1917]">28.000 ₩</span>
                <span className="text-[10px] text-[#8A8680] line-through">40.000 ₩</span>
              </div>

              <button
                onClick={onExploreSale}
                className="w-full mt-2 py-1.5 rounded-lg bg-[#1A1917] hover:bg-[#B89254] text-white text-[11px] font-semibold transition-colors cursor-pointer"
              >
                {t('product_quick_buy')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
