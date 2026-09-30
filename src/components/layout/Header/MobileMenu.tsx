import React from 'react';
import { X, Send, MessageCircle, Phone } from 'lucide-react';
import { InstagramIcon } from '../../ui/Icons';
import { NAV_ITEMS } from '../../../core/constants/navigation';
import { BRAND_CONFIG } from '../../../core/constants/brand';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Menu */}
      <div className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl z-10 flex flex-col justify-between p-6 animate-slide-up">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#F0E6DE]">
            <div>
              <span className="font-serif text-lg font-bold tracking-wider text-[#2D2A2E]">
                MK COSMET
              </span>
              <p className="text-[10px] text-[#A96851] tracking-widest uppercase">
                KOREA COSMETICS
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#8C827A] hover:text-[#4D2C20] rounded-full hover:bg-[#FAF5EE]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-2 py-6">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`px-4 py-3 rounded-2xl text-base font-medium transition-colors flex items-center justify-between ${
                  item.isSpecial
                    ? 'bg-[#229ED9]/10 text-[#1E8BC0] border border-[#229ED9]/20'
                    : 'text-[#2D2A2E] hover:bg-[#FAF5EE] hover:text-[#C2836B]'
                }`}
              >
                <span>{item.label}</span>
                {item.isSpecial && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#229ED9] text-white font-semibold">
                    Live
                  </span>
                )}
              </a>
            ))}
          </nav>
        </div>

        {/* Quick Social & Contact Footer */}
        <div className="pt-4 border-t border-[#F0E6DE] space-y-3">
          <p className="text-xs font-semibold text-[#8C827A] uppercase tracking-wider">
            Связь с Мухаббат Ким
          </p>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={BRAND_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366]/10 text-[#20BA5A] hover:bg-[#25D366]/20 font-medium text-xs border border-[#25D366]/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href={BRAND_CONFIG.telegramChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#229ED9]/10 text-[#1E8BC0] hover:bg-[#229ED9]/20 font-medium text-xs border border-[#229ED9]/20"
            >
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </a>
          </div>

          <a
            href={BRAND_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#E1306C]/10 text-[#C13584] hover:bg-[#E1306C]/20 font-medium text-xs border border-[#E1306C]/20 w-full"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>{BRAND_CONFIG.instagramHandle}</span>
          </a>

          <div className="text-center pt-2">
            <a
              href={`tel:${BRAND_CONFIG.phone}`}
              className="inline-flex items-center gap-1.5 text-xs text-[#8A503C] font-semibold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{BRAND_CONFIG.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
