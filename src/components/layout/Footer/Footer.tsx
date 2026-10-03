import React from 'react';
import { MessageCircle, Send, Phone, MapPin, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { InstagramIcon } from '../../ui/InstagramIcon';
import { Logo } from '../../ui/Logo';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import { NAV_ITEMS } from '../../../core/constants/navigation';
import { CountryVisitorCounter } from '../../common/CountryVisitorCounter';
import { useLanguage } from '../../../core/i18n/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  const getLocalizedLabel = (href: string, fallback: string) => {
    switch (href) {
      case '#top':
        return t('nav_home');
      case '#catalog':
        return t('nav_catalog');
      case '#delivery':
        return t('nav_delivery');
      case '#faq':
        return t('nav_faq');
      case '#contacts':
        return t('nav_contact');
      default:
        return fallback;
    }
  };

  return (
    <footer className="border-t border-[#2A181B] bg-[#140C0E] py-14 text-[#FAF5EE]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4">
            <a href="#top" className="inline-flex items-center gap-3" aria-label={`${BRAND_CONFIG.brandName}, наверх`}>
              <Logo size="md" variant="horizontal" />
            </a>
            <p className="text-xs leading-relaxed text-[#A89F97] max-w-xs">
              {t('footer_about_desc')}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Original Seoul Direct • 100% Оригинал</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              {t('nav_catalog')}
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A89F97]">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors hover:text-white">
                    {getLocalizedLabel(item.href, item.label)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery & Service */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              {t('nav_delivery')}
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A89F97]">
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>{language === 'uz' ? 'Xalqaro ekspress yetkazib berish ✈️' : 'Международная экспресс-доставка ✈️'}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C2836B] shrink-0" />
                <span>{language === 'uz' ? 'Ombor: Seul, Janubiy Koreya' : 'Склад: Сеул, Южная Корея (Seoul, Korea)'}</span>
              </li>
              <li>{language === 'uz' ? 'Shaxsiy parvarish tanlash' : 'Индивидуальный подбор ухода'}</li>
              <li>{language === 'uz' ? 'Ulgurji va chakana savdo' : 'Оптовые и розничные поставки'}</li>
            </ul>
          </div>

          {/* Social Networks & Contacts */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              {t('footer_social_title')}
            </h3>
            <div className="space-y-3">
              <a
                href={BRAND_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-[#E2D8D0] hover:text-[#E1306C] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#E1306C]">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <span>Instagram {BRAND_CONFIG.instagramHandle}</span>
              </a>

              <a
                href={BRAND_CONFIG.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-[#E2D8D0] hover:text-[#229ED9] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#229ED9]">
                  <Send className="w-4 h-4" />
                </div>
                <span>Telegram {BRAND_CONFIG.telegramChannel}</span>
              </a>

              <a
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-[#E2D8D0] hover:text-[#25D366] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span>WhatsApp: {BRAND_CONFIG.phoneDisplay}</span>
              </a>

              <a
                href={`tel:${BRAND_CONFIG.phone}`}
                className="flex items-center gap-2.5 text-xs text-[#E2D8D0] hover:text-white transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-gray-300">
                  <Phone className="w-4 h-4" />
                </div>
                <span>{BRAND_CONFIG.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Live Visitor Statistics / Flag Counters */}
        <div className="pt-6 border-t border-white/10">
          <CountryVisitorCounter />
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7A6F68] gap-4">
          <p>© {new Date().getFullYear()} {BRAND_CONFIG.brandName}. {language === 'uz' ? 'Barcha huquqlar himoyalangan.' : 'Все права защищены.'}</p>
          <div className="flex items-center gap-4">
            <span>Direct Imports from Seoul, South Korea</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
