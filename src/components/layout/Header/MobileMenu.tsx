import React from 'react';
import { X, ShoppingBag, Send } from 'lucide-react';
import { NAV_ITEMS } from '../../../core/constants/navigation';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import { CurrencyCode, CurrencyConfig } from '../../../core/types/currency';
import { CurrencySelector } from './CurrencySelector';

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
  if (!isOpen) return null;

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
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Закрыть меню"
      />

      <div className="fixed inset-y-0 right-0 z-10 flex w-[88%] max-w-sm flex-col justify-between bg-white p-5 shadow-2xl sm:p-6 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F0E6DE] pb-4">
            <span className="font-serif text-lg font-bold tracking-wide text-[#2D2A2E]">
              {BRAND_CONFIG.brandName}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#8C827A] transition-colors hover:bg-[#FAF5EE] hover:text-[#4D2C20]"
              aria-label="Закрыть меню"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Currency and Cart fast actions in mobile menu */}
          <div className="flex items-center justify-between py-4 border-b border-[#F0E6DE]/60 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8C827A]">Валюта:</span>
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
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5EE] border border-[#EED9CF] text-xs font-semibold text-[#8A503C]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Корзина</span>
              {cartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#C2836B] text-white text-[10px] flex items-center justify-center font-bold">
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

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavClick(item.href)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-base font-semibold transition-colors ${
                    item.isSpecial
                      ? activeView === 'catalog'
                        ? 'bg-[#C2836B] text-white shadow-xs'
                        : 'border border-[#EED9CF] bg-[#FAF5EE] text-[#8A503C]'
                      : isItemActive
                      ? 'bg-[#FAF5EE] text-[#4D2C20]'
                      : 'text-[#2D2A2E] hover:bg-[#FAF5EE] hover:text-[#C2836B]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom channel link */}
        <div className="pt-4 border-t border-[#F0E6DE]">
          <a
            href={BRAND_CONFIG.telegramChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#229ED9] text-white text-sm font-medium hover:bg-[#1E8BC0] transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Канал {BRAND_CONFIG.telegramChannel}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
