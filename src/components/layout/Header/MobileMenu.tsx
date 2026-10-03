import React from 'react';
import { X, ShoppingBag, Send, MessageCircle, Phone } from 'lucide-react';
import { InstagramIcon } from '../../ui/InstagramIcon';
import { NAV_ITEMS } from '../../../core/constants/navigation';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import { CurrencyCode, CurrencyConfig } from '../../../core/types/currency';
import { CurrencySelector } from './CurrencySelector';
import { useLanguage } from '../../../core/i18n/LanguageContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: 'home' | 'catalog';
  onNavigate: (view: 'home' | 'catalog', targetAnchor?: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentCurrency: CurrencyCode;
  currencies: CurrencyConfig[];
  onSelectCurrency: (code: CurrencyCode) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  activeView,
  onNavigate,
  cartCount,
  onOpenCart,
  currentCurrency,
  currencies,
  onSelectCurrency,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

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

  const handleNavClick = (href: string) => {
    onClose();
    if (href === '#catalog') {
      onNavigate('catalog');
    } else {
      onNavigate('home', href);
    }
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Меню сайта">
      <button
        type="button"
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Закрыть меню"
      />

      <div className="fixed inset-y-0 right-0 z-10 flex w-[88%] max-w-sm flex-col justify-between bg-white p-5 shadow-2xl sm:p-6 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#ECE8E1] pb-4">
            <span className="font-serif text-lg font-bold tracking-wide text-[#1A1917]">
              {BRAND_CONFIG.brandName}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#8A8680] transition-colors hover:bg-[#F7F4EF] hover:text-[#1A1917]"
              aria-label="Закрыть меню"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Currency and Cart actions */}
          <div className="py-4 border-b border-[#ECE8E1] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8A8680]">{t('nav_currency')}:</span>
              <CurrencySelector
                currentCurrency={currentCurrency}
                currencies={currencies}
                onSelect={onSelectCurrency}
              />
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="w-full relative inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A1917] hover:bg-[#B89254] text-xs font-bold text-white shadow-xs cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#B89254]" />
              <span>{t('nav_cart')}</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#E53935] text-white text-[11px] flex items-center justify-center font-black">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-2 py-4">
            {NAV_ITEMS.map((item) => {
              const isItemActive =
                (item.href === '#catalog' && activeView === 'catalog') ||
                (item.href !== '#catalog' && activeView === 'home' && item.href === '#top');

              const label = getLocalizedLabel(item.href, item.label);

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavClick(item.href)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-base font-semibold transition-colors ${
                    item.isSpecial
                      ? activeView === 'catalog'
                        ? 'bg-[#1A1917] text-[#B89254] shadow-xs'
                        : 'border border-[#ECE8E1] bg-[#F7F4EF] text-[#B89254]'
                      : isItemActive
                      ? 'bg-[#F7F4EF] text-[#1A1917] font-bold border border-[#ECE8E1]'
                      : 'text-[#1A1917] hover:bg-[#F7F4EF] hover:text-[#B89254]'
                  }`}
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Social Networks & Contact Bar */}
        <div className="pt-4 border-t border-[#F0E6DE] space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={BRAND_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#FDF2F4] text-[#E1306C] border border-[#FAD2DA] text-xs font-bold hover:bg-[#FBE4E9] transition-colors"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Instagram</span>
            </a>
            <a
              href={BRAND_CONFIG.telegramChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#F0F8FF] text-[#229ED9] border border-[#CDE5FA] text-xs font-bold hover:bg-[#E2F0FC] transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </a>
          </div>

          <a
            href={BRAND_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20BA5A] transition-colors shadow-2xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`tel:${BRAND_CONFIG.phone}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#F5EDE6] text-[#4D2C20] text-xs font-medium hover:bg-[#EED9CF] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#C2836B]" />
            <span>{BRAND_CONFIG.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
