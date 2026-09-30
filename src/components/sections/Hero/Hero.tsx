import React from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { BRAND_CONFIG } from '../../../core/constants/brand';

export const Hero: React.FC = () => {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-b from-[#F7EDE8]/70 via-[#FAF7F2] to-[#FAF7F2] pt-32 pb-20 sm:pt-40 sm:pb-28"
    >
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#E8A598]/15 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#A96851]">
          {BRAND_CONFIG.brandName}
        </p>

        <h1 className="font-serif text-4xl font-normal leading-tight tracking-tight text-[#242120] sm:text-5xl lg:text-6xl">
          Корейская косметика
          <span className="mt-1 block font-light italic text-[#A96851]">
            и актуальные предложения
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#6C635B] sm:text-lg">
          Смотрите товары и цены в публикациях Telegram. Перед заказом уточним актуальное наличие,
          стоимость и доставку.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#telegram-feed"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C2836B] px-7 py-3.5 text-base font-medium tracking-wide text-white shadow-sm transition-colors hover:bg-[#A96851] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2836B] sm:w-auto"
          >
            Актуальные предложения
            <ArrowDown className="h-4 w-4" />
          </a>
          <a
            href="#skin-quiz"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#EED9CF] bg-[#FAF5EE] px-7 py-3.5 text-base font-medium tracking-wide text-[#4D2C20] transition-colors hover:bg-[#F2E8DC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E1BEAF] sm:w-auto"
          >
            Подобрать уход
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

      </div>
    </section>
  );
};
