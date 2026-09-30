import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Plane, MessageCircle, Send, Star } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Logo } from '../../ui/Logo';
import { BRAND_CONFIG } from '../../../core/constants/brand';

interface HeroProps {
  onExploreCatalog: () => void;
  onStartQuiz: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreCatalog, onStartQuiz }) => {
  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-b from-[#F7EDE8]/60 via-[#FAF7F2] to-[#FAF7F2]">
      {/* Decorative luxury gradient blurs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#E8A598]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-[#C5A880]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, Badges, CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#EED9CF] shadow-xs backdrop-blur-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-[#8A503C] tracking-wide">
                Прямые поставки из Сеула • Оптом и в розницу
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#242120] font-normal leading-[1.12] tracking-tight">
              Истинная красота <br />
              <span className="italic font-light bg-gradient-to-r from-[#C2836B] via-[#A96851] to-[#8A503C] bg-clip-text text-transparent">
                премиальной корейской
              </span>{' '}
              косметики
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6C635B] font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
              100% оригинальная люксовая и дерматологическая косметика от ведущих лабораторий Южной Кореи (CNP Rx, The History of Whoo, Sulwhasoo). Индивидуальный подбор ухода и экспресс-доставка до двери во все страны мира.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a href="#telegram-feed" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<Sparkles className="w-5 h-5" />}
                >
                  Смотреть новинки Telegram
                </Button>
              </a>

              <a href="#skin-quiz" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Подобрать уход (Тест)
                </Button>
              </a>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#F0E6DE]/80 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#C2836B]">100%</div>
                <div className="text-[11px] sm:text-xs text-[#8C827A] font-medium mt-0.5">Оригинал из Кореи</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#C2836B]">24/7</div>
                <div className="text-[11px] sm:text-xs text-[#8C827A] font-medium mt-0.5">Экспертный подбор</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#C2836B]">✈️ Door</div>
                <div className="text-[11px] sm:text-xs text-[#8C827A] font-medium mt-0.5">Доставка до двери</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Aesthetic Card with Royal Crest */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Image Card with Glassmorphism Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-soft-lg bg-white p-3 border border-white/80">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#FAF5EE] relative">
                  <img
                    src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85"
                    alt="Премиальная корейская косметика MK COSMET"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Card Bottom Meta with Royal Crest */}
                  <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-amber-300 text-xs mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                        <span className="text-white font-semibold ml-1">5.0 (500+ заказов)</span>
                      </div>
                      <p className="font-serif text-lg font-medium leading-snug">
                        MK KOREA COSMETIC
                      </p>
                      <p className="text-[11px] text-white/80">
                        Личный отбор продукции экспертом Мухаббат Ким
                      </p>
                    </div>

                    <div className="hidden sm:block">
                      <Logo size="sm" variant="icon" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Live Telegram Updates */}
              <a
                href="#telegram-feed"
                className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-soft-lg border border-[#EED9CF] flex items-center gap-3 transform hover:-translate-y-1 transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#2D2A2E]">Telegram Feed</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="text-[11px] text-[#8C827A]">Свежие обзоры & акции</span>
                </div>
              </a>

              {/* Floating Badge 2: Worldwide Shipping */}
              <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-soft-lg border border-[#EED9CF] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] text-[#C2836B] flex items-center justify-center border border-[#EED9CF]">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D2A2E]">Авиадоставка</div>
                  <span className="text-[11px] text-[#8C827A]">РФ, СНГ, ЕС, США и весь мир</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
