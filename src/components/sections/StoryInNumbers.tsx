import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const StoryInNumbers: React.FC = () => {
  const stats = [
    { value: '200+', label: 'Товаров в наличии', desc: 'Ежедневное обновление склада' },
    { value: '15+', label: 'Премиум брендов', desc: 'Sulwhasoo, OHUI, The History of Whoo' },
    { value: '10,000+', label: 'Доставлено заказов', desc: 'Довольные клиенты по всему миру' },
    { value: '100%', label: 'Оригинал из Кореи', desc: 'Прямые контракты с производителями' },
  ];

  return (
    <section className="bg-[#FAF7F2] py-20 px-4 sm:px-6 lg:px-8 border-y border-line">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kraft-soft border border-line text-[11px] font-bold text-kraft uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>MK Cosmetics в цифрах</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-ink leading-tight">
            Our story in numbers
          </h2>

          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Мы работаем напрямую со складами Сеула и косметическими лабораториями Южной Кореи, чтобы доставлять подлинную косметику по честным ценам в корейских вонах.
          </p>
        </div>

        {/* 4 Stats Cards (Matching Wellbeing X Webflow grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-sm hover:shadow-md transition-all text-center flex flex-col justify-center"
            >
              <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
                {stat.value}
              </div>
              <div className="font-medium text-xs sm:text-sm text-ink mt-2">
                {stat.label}
              </div>
              <div className="text-[11px] text-muted mt-1 leading-snug">
                {stat.desc}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Pill Buttons matching Wellbeing X */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#191A15] hover:bg-kraft text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
          >
            <span>В каталог косметики</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white hover:bg-sand border border-line text-ink text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <span>О нашей компании</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
