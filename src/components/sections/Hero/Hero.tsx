import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck, Plane, Award, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import { useLanguage } from '../../../core/i18n/LanguageContext';

interface HeroProps {
  onOpenCatalog?: () => void;
  onSelectCategory?: (cat: string) => void;
  totalProductsCount?: number;
}

interface HeroSlide {
  id: number;
  tagRu: string;
  tagUz: string;
  titleRu: string;
  titleUz: string;
  subRu: string;
  subUz: string;
  btnRu: string;
  btnUz: string;
  categoryFilter?: string;
  bgGradient: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tagRu: 'SEOUL DIRECT • 100% ОРИГИНАЛ',
    tagUz: 'SEUL DIRECT • 100% ORIGINAL',
    titleRu: 'Премиальная корейская косметика напрямую из Сеула',
    titleUz: "Seuldan to'g'ridan-to'g'ri premium Koreya kosmetikasi",
    subRu: 'Прямые оптовые и розничные поставки. Более 250+ проверенных средств от ведущих бьюти-лабораторий Южной Кореи.',
    subUz: "To'g'ridan-to'g'ri ulgurji va chakana yetkazib berish. Janubiy Koreyaning yetakchi brendlaridan 250+ dan ortiq vositalar.",
    btnRu: 'Смотреть каталог',
    btnUz: 'Katalogga oʻtish',
    bgGradient: 'from-[#231215] via-[#1A0E10] to-[#0F080A]',
  },
  {
    id: 2,
    tagRu: 'ЭКСКЛЮЗИВ СЕУЛА • TOP BRANDS',
    tagUz: 'SEUL EKSKLYUZIVI • TOP BRANDS',
    titleRu: 'Эксклюзив: Curación, JOGABI, Sulwhasoo & Whoo',
    titleUz: 'Eksklyuziv: Curación, JOGABI, Sulwhasoo & Whoo',
    subRu: 'Королевский уход, клеточное омоложение и мощные пептидные формулы для сияния и молодости кожи.',
    subUz: "Qirollik parvarishi, hujayralarni yoshartirish va teringiz yoshligini saqlovchi kuchli peptid formulalari.",
    btnRu: 'Эксклюзивные бренды',
    btnUz: 'Eksklyuziv brendlar',
    categoryFilter: 'curacion',
    bgGradient: 'from-[#1E1724] via-[#150F1A] to-[#0A070D]',
  },
  {
    id: 3,
    tagRu: 'ЭКСПРЕСС АВИА • ТАШКЕНТ И СНГ',
    tagUz: 'EKSPRESS AVIA • TOSHKENT VA MDH',
    titleRu: 'Свежие партии с завода и быстрая авиа-доставка',
    titleUz: "Zavoddan yangi partiyalar va tezkor avia yetkazib berish",
    subRu: 'Гарантия максимальных сроков годности. Регулярные рейсы Сеул-Ташкент и доставка до ваших дверей.',
    subUz: "Maksimal yaroqlilik muddatlari kafolati. Doimiy Seul-Toshkent reyslari va eshigingizgacha yetkazib berish.",
    btnRu: 'Оформить заказ',
    btnUz: 'Buyurtma berish',
    bgGradient: 'from-[#141C24] via-[#0E141A] to-[#070A0D]',
  },
];

const CATEGORY_PILLS = [
  { id: 'all', labelRu: '🌟 Все хиты', labelUz: '🌟 Barcha xitlar' },
  { id: 'curacion', labelRu: '💎 Curación & JOGABI', labelUz: '💎 Curación & JOGABI' },
  { id: 'serums', labelRu: '🧪 Сыворотки', labelUz: '🧪 Zardoblar' },
  { id: 'creams', labelRu: '🧴 Кремы', labelUz: '🧴 Kremlar' },
  { id: 'cleansers', labelRu: '🫧 Очищение', labelUz: '🫧 Tozalash' },
  { id: 'masks', labelRu: '🌿 Маски & Патчи', labelUz: '🌿 Niqoblar' },
  { id: 'sets', labelRu: '🎁 Наборы & Боксы', labelUz: '🎁 Toʻplamlar' },
  { id: 'sun', labelRu: '☀️ SPF Защита', labelUz: '☀️ SPF Himoya' },
];

export const Hero: React.FC<HeroProps> = ({ onOpenCatalog, onSelectCategory, totalProductsCount }) => {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section id="top" className="relative pt-28 sm:pt-32 pb-8 sm:pb-12 bg-[#FAF7F2]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Hero Slider Banner */}
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-r ${slide.bgGradient} text-white p-6 sm:p-12 lg:p-16 shadow-xl border border-white/10 transition-all duration-700`}>
          {/* Subtle Decorative Gold & Glow Shapes */}
          <div className="pointer-events-none absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#D4AF37]/15 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#C2836B]/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-6">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#F3E5AB] text-[11px] font-bold tracking-widest uppercase border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{language === 'uz' ? slide.tagUz : slide.tagRu}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] tracking-tight text-white">
              {language === 'uz' ? slide.titleUz : slide.titleRu}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed max-w-2xl font-normal">
              {language === 'uz' ? slide.subUz : slide.subRu}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={onOpenCatalog}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C5A880] hover:from-[#E5C79E] hover:to-[#D4AF37] text-[#1F1615] px-7 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 text-[#1F1615]" />
                <span>{language === 'uz' ? slide.btnUz : slide.btnRu} {totalProductsCount ? `(${totalProductsCount})` : ''}</span>
                <ArrowRight className="h-4 w-4 text-[#1F1615]" />
              </button>

              <a
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3.5 text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>{language === 'uz' ? 'Konsultatsiya olish' : 'Консультация в WhatsApp'}</span>
              </a>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="absolute right-4 sm:right-8 bottom-4 sm:bottom-8 z-20 flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5 px-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlide ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-white/40'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Category Navigation Pills (EvaCode Style) */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory(pill.id);
                } else if (onOpenCatalog) {
                  onOpenCatalog();
                }
              }}
              className="whitespace-nowrap px-4 py-2 rounded-full bg-white hover:bg-[#FAF5EE] text-[#1F1615] hover:text-[#C2836B] text-xs font-bold border border-[#E8DCD5] transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              {language === 'uz' ? pill.labelUz : pill.labelRu}
            </button>
          ))}
        </div>

        {/* Trust Badges Ribbon (EvaCode Style) */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#EFE8E2] shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] text-[#D4AF37] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1F1615]">100% Оригинал</h4>
              <p className="text-[11px] text-[#7A6F68]">Прямые поставки из Кореи</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#EFE8E2] shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] text-[#D4AF37] flex items-center justify-center shrink-0">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1F1615]">Экспресс Авиа</h4>
              <p className="text-[11px] text-[#7A6F68]">Сеул ➔ Ташкент & СНГ</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#EFE8E2] shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] text-[#D4AF37] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1F1615]">Опт & Розница</h4>
              <p className="text-[11px] text-[#7A6F68]">Специальные цены от объема</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#EFE8E2] shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] text-[#25D366] flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1F1615]">Подбор ухода</h4>
              <p className="text-[11px] text-[#7A6F68]">Бесплатно от экспертов MK</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
