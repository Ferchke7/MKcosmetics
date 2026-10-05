import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Slide {
  id: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  bgGradient: string;
  image: string;
  badge: string;
}

const slides: Slide[] = [
  {
    id: 1,
    eyebrow: 'Ритуал корейской красоты',
    title: 'Люксовый уход со склада в Сеуле',
    subtitle: 'Оригинальная косметика от ведущих производителей Кореи: Sulwhasoo, The History of Whoo, Amore Pacific',
    buttonText: 'В каталог',
    link: '/catalog',
    bgGradient: 'from-[#FAF8F5] via-[#F4ECE1] to-[#EBE2D3]',
    image: '/images/hero/hero-slide-1.jpg',
    badge: 'Премиум уход • Сеул',
  },
  {
    id: 2,
    eyebrow: 'Прямые поставки из Кореи',
    title: 'Опт и розница без посредников',
    subtitle: 'Собственный склад в Южной Корее. Быстрая авиа-доставка и надежное карго по всему миру',
    buttonText: 'Смотреть бренды',
    link: '/catalog',
    bgGradient: 'from-[#F7F4EF] via-[#EFE9DF] to-[#E3DACB]',
    image: '/images/hero/hero-slide-2.jpg',
    badge: '100% Оригинал • Прямой рейс',
  },
  {
    id: 3,
    eyebrow: 'Специальные наборы',
    title: 'Комплексные программы ухода',
    subtitle: 'Готовые наборы для глубокого восстановления, лифтинга и увлажнения с выгодой до 40%',
    buttonText: 'Смотреть наборы',
    link: '/catalog?categorySlug=nabory-588136',
    bgGradient: 'from-[#FAF5F0] via-[#F0E4D8] to-[#E8D6C6]',
    image: '/images/hero/hero-slide-3.jpg',
    badge: 'Выгода до 40% • Готовые сеты',
  },
];

export const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);


  const active = slides[current];

  return (
    <div className="relative w-full overflow-hidden bg-cream-deep border-b border-line select-none">
      <div
        className={`w-full min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] bg-gradient-to-r ${active.bgGradient} flex items-center transition-colors duration-700 ease-out py-12 px-6 sm:px-12 lg:px-20 relative overflow-hidden`}
      >
        {/* Dynamic AI Skincare Photo with Seamless Gradient Blend */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-2/3 lg:w-3/5 overflow-hidden pointer-events-none">
          <img
            key={active.image}
            src={active.image}
            alt={active.title}
            className="w-full h-full object-cover object-[center_right] animate-in fade-in zoom-in-105 duration-1000 transform transition-transform"
          />
          {/* Subtle warm luxury gradients to smoothly blend into left content & edges */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/80 sm:via-[#FAF8F5]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5]/40 via-transparent to-[#FAF8F5]/30" />
        </div>

        {/* Subtle Luxury Pattern & Watermark */}
        <div className="watermark right-12 top-1/2 -translate-y-1/2 hidden xl:block opacity-20 pointer-events-none text-white">
          Seoul
        </div>

        {/* Left Content */}
        <div className="max-w-xl sm:max-w-2xl z-10 space-y-4 sm:space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-paper/90 backdrop-blur-sm border border-line text-xs font-bold text-gold uppercase tracking-[0.16em] shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{active.eyebrow}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-ink font-bold leading-[1.1] tracking-tight drop-shadow-xs">
            {active.title}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-ink/80 leading-relaxed max-w-xl font-normal drop-shadow-xs">
            {active.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              to={active.link}
              className="inline-flex items-center gap-2.5 h-12 sm:h-13 px-8 rounded-full bg-[#191A15] hover:bg-kraft text-[#FAF7F2] text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
            >
              <span>{active.buttonText}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            <a
              href="https://t.me/mkcosmetkor"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 h-12 sm:h-13 px-6 rounded-full bg-white/90 hover:bg-white border border-line text-ink text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-sm"
            >
              <span>Telegram: @mkcosmetkor</span>
            </a>
          </div>
        </div>

        {/* Floating Luxury Pill Badge on bottom-right of banner */}
        <div className="hidden lg:flex items-center gap-2.5 absolute right-14 bottom-10 z-10 bg-paper/90 backdrop-blur-md px-4 py-2 rounded-full border border-line shadow-md text-xs font-semibold text-ink animate-in fade-in duration-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-gold">✦</span>
          <span>{active.badge}</span>
        </div>


        {/* Slide Indicator Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === idx ? 'w-8 bg-gold' : 'w-2 bg-ink/20 hover:bg-ink/40'
              }`}
              aria-label={`Слайд ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
