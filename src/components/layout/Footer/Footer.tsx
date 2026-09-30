import React from 'react';
import { Send, MessageCircle, Phone, MapPin, Clock, ShieldCheck, Plane, Sparkles } from 'lucide-react';
import { InstagramIcon } from '../../ui/Icons';
import { Logo } from '../../ui/Logo';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import { NAV_ITEMS } from '../../../core/constants/navigation';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1C1917] text-[#FAF5EE] pt-16 pb-12 border-t border-[#332E2B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-[#332E2B]">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Logo size="md" variant="icon" />
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-wider text-white">
                  MK COSMET
                </span>
                <span className="text-[9px] text-[#C5A880] tracking-widest uppercase">
                  Korea Cosmetics
                </span>
              </div>
            </div>
            <p className="text-xs text-[#A89F97] leading-relaxed">
              Оригинальная корейская косметика премиум-класса напрямую из Сеула от Мухаббат Ким. Сертифицированная продукция, индивидуальный подбор и экспресс-доставка по всему миру.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={BRAND_CONFIG.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#229ED9]/20 hover:bg-[#229ED9] text-[#229ED9] hover:text-white flex items-center justify-center transition-all"
                title="Telegram Канал"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href={BRAND_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#E1306C]/20 hover:bg-[#E1306C] text-[#E1306C] hover:text-white flex items-center justify-center transition-all"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-all"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider text-white uppercase mb-4">
              Навигация
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A89F97]">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="hover:text-[#D09E88] transition-colors flex items-center gap-1.5"
                  >
                    <span>›</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Guarantees & Features */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider text-white uppercase mb-4">
              Наши гарантии
            </h4>
            <ul className="space-y-3 text-xs text-[#A89F97]">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>100% подлинность и свежие сроки годности напрямую с заводов Кореи</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Plane className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>Надежная авиа-доставка до двери с трек-номером отслеживания</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>Поддержка и профессиональные консультации 24/7</span>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider text-white uppercase mb-4">
              Контакты
            </h4>
            <div className="space-y-3 text-xs text-[#A89F97]">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D09E88] shrink-0" />
                <a
                  href={`tel:${BRAND_CONFIG.phone}`}
                  className="hover:text-white font-medium text-white transition-colors"
                >
                  {BRAND_CONFIG.phoneDisplay}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D09E88] shrink-0 mt-0.5" />
                <span>{BRAND_CONFIG.location}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#D09E88] shrink-0" />
                <span>{BRAND_CONFIG.workingHours}</span>
              </div>
              <div className="pt-2">
                <a
                  href={BRAND_CONFIG.telegramChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 text-[#229ED9] hover:bg-[#229ED9] hover:text-white text-xs font-medium transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Канал: {BRAND_CONFIG.telegramChannel}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C827A]">
          <p>© {new Date().getFullYear()} MK KOREA COSMETIC (mkcosmet). Все права защищены.</p>
          <p className="flex items-center gap-1">
            <span>Основатель:</span>
            <span className="text-[#FAF5EE] font-medium">{BRAND_CONFIG.founderName}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
