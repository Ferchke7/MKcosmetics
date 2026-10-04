import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface Slide {
  id: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  bgGradient: string;
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
  },
  {
    id: 2,
    eyebrow: 'Прямые поставки из Кореи',
    title: 'Опт и розница без посредников',
    subtitle: 'Собственный склад в Южной Корее. Быстрая авиа-доставка и надежное карго по всему миру',
    buttonText: 'Смотреть бренды',
    link: '/catalog',
    bgGradient: 'from-[#F7F4EF] via-[#EFE9DF] to-[#E3DACB]',
  },
  {
    id: 3,
    eyebrow: 'Специальные наборы',
    title: 'Комплексные программы ухода',
    subtitle: 'Готовые наборы для глубокого восстановления, лифтинга и увлажнения с выгодой до 40%',
    buttonText: 'Смотреть наборы',
    link: '/catalog?categorySlug=nabory-588136',
    bgGradient: 'from-[#FAF5F0] via-[#F0E4D8] to-[#E8D6C6]',
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

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const active = slides[current];

  return (
    <div className="relative w-full overflow-hidden bg-cream-deep border-b border-line select-none">
      <div
        className={`w-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] bg-gradient-to-r ${active.bgGradient} flex items-center transition-all duration-700 ease-out py-12 px-6 sm:px-12 lg:px-20 relative`}
      >
        {/* Subtle Luxury Pattern & Watermark */}
        <div className="watermark right-10 top-1/2 -translate-y-1/2 hidden md:block">
          Seoul
        </div>

        <div className="max-w-2xl z-10 space-y-4 sm:space-y-6 animate-in fade-in duration-500 key={active.id}">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-paper/80 backdrop-blur-sm border border-line text-xs font-bold text-gold uppercase tracking-[0.16em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{active.eyebrow}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-ink font-bold leading-[1.1] tracking-tight">
            {active.title}
          </h1>

          <p className="text-sm sm:text-base text-ink/80 leading-relaxed max-w-xl font-normal">
            {active.subtitle}
          </p>

          <div className="pt-2">
            <Link
              to={active.link}
              className="inline-flex items-center gap-2.5 h-12 px-8 rounded-card bg-gold hover:bg-gold-hover text-white text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg"
            >
              <span>{active.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/70 backdrop-blur-sm text-ink hover:bg-paper hover:text-gold flex items-center justify-center transition-all shadow-sm border border-line"
          aria-label="Назад"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/70 backdrop-blur-sm text-ink hover:bg-paper hover:text-gold flex items-center justify-center transition-all shadow-sm border border-line"
          aria-label="Вперед"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

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
