import React from 'react';
import { Send, MessageCircle, Phone, Plane, Sparkles } from 'lucide-react';
import { InstagramIcon } from '../../ui/InstagramIcon';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import { useLanguage } from '../../../core/i18n/LanguageContext';

export const SocialChannelsBar: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="border-t border-[#EED9CF]/60 bg-[#FAF5EE]/95 backdrop-blur-xs py-1.5 px-4 text-xs">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        {/* Left: Direct Social & Messenger Links */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A503C] hidden sm:inline">
            {language === 'uz' ? 'Ijtimoiy tarmoqlar:' : 'Наши соцсети:'}
          </span>

          {/* Instagram Link */}
          <a
            href={BRAND_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#FAD2DA] text-[#E1306C] hover:bg-[#FFF0F3] transition-all font-semibold shadow-2xs hover:scale-102"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span className="text-[11px]">Instagram {BRAND_CONFIG.instagramHandle}</span>
          </a>

          {/* Telegram Link */}
          <a
            href={BRAND_CONFIG.telegramChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#CDE5FA] text-[#229ED9] hover:bg-[#F0F8FF] transition-all font-semibold shadow-2xs hover:scale-102"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="text-[11px]">Telegram {BRAND_CONFIG.telegramChannel}</span>
          </a>

          {/* WhatsApp Link */}
          <a
            href={BRAND_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#C6F6D5] text-[#25D366] hover:bg-[#F0FFF4] transition-all font-semibold shadow-2xs hover:scale-102"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="text-[11px]">WhatsApp: {BRAND_CONFIG.phoneDisplay}</span>
          </a>

          {/* Phone Link */}
          <a
            href={`tel:${BRAND_CONFIG.phone}`}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#EED9CF] text-[#4D2C20] hover:bg-[#FAF5EE] transition-all font-semibold shadow-2xs"
          >
            <Phone className="w-3 h-3 text-[#A96851]" />
            <span className="text-[11px]">{BRAND_CONFIG.phoneDisplay}</span>
          </a>
        </div>

        {/* Right: Guarantee & Direct from Seoul Pill */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A96851]">
            <Plane className="w-3 h-3 text-[#C5A880]" />
            <span>
              {language === 'uz'
                ? "Seuldan to'g'ridan-to'g'ri yetkazib berish • 100% Original"
                : 'Прямые поставки из Сеула • 100% Оригинал'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
