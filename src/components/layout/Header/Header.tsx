import React, { useEffect, useState } from 'react';
import { Menu, MessageCircle, ShoppingBag, Send } from 'lucide-react';
import { InstagramIcon } from '../../ui/InstagramIcon';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';
import { CurrencySelector } from './CurrencySelector';
import { Logo } from '../../ui/Logo';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import { CurrencyCode, CurrencyConfig } from '../../../core/types/currency';

interface HeaderProps {
  activeView: 'home' | 'catalog';
  onNavigate: (view: 'home' | 'catalog', targetAnchor?: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentCurrency: CurrencyCode;
  currencies: CurrencyConfig[];
  onSelectCurrency: (code: CurrencyCode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  cartCount,
  onOpenCart,
  currentCurrency,
  currencies,
  onSelectCurrency,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate('home', '#top');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-soft border-b border-[#F0E6DE]/80 py-2'
            : 'bg-white/85 backdrop-blur-sm py-2.5 border-b border-[#F0E6DE]/40'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <a
              href="#top"
              onClick={handleLogoClick}
              className="flex shrink-0 items-center cursor-pointer"
              aria-label={BRAND_CONFIG.brandName}
            >
              <Logo size="md" variant="horizontal" />
            </a>

            {/* Desktop Navbar */}
            <Navbar activeView={activeView} onNavigate={onNavigate} />

            {/* Right Action Icons & Socials */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              {/* Currency Selector */}
              <div className="hidden sm:block">
                <CurrencySelector
                  currentCurrency={currentCurrency}
                  currencies={currencies}
                  onSelect={onSelectCurrency}
                />
              </div>

              {/* Social Icons (Instagram & Telegram) */}
              <div className="hidden xl:flex items-center gap-1.5 border-l border-r border-[#EED9CF] px-2.5">
                <a
                  href={BRAND_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#E1306C] hover:bg-[#FAF5EE] transition-colors"
                  title="Наш Instagram"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href={BRAND_CONFIG.telegramChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#229ED9] hover:bg-[#FAF5EE] transition-colors"
                  title="Наш Telegram"
                  aria-label="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              </div>

              {/* Cart Button with Counter */}
              <button
                type="button"
                onClick={onOpenCart}
                className="relative inline-flex h-10 w-10 sm:w-auto sm:px-3.5 items-center justify-center gap-1.5 rounded-full bg-[#FAF5EE] hover:bg-[#F2E8DC] border border-[#EED9CF] text-[#4D2C20] transition-colors shadow-2xs"
                aria-label={`Корзина (${cartCount} товаров)`}
              >
                <ShoppingBag className="h-4 w-4 text-[#8A503C]" />
                <span className="hidden sm:inline text-xs font-semibold">Корзина</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 sm:static sm:top-auto sm:right-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[11px] font-black text-white shadow-xs animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* WhatsApp Quick Link */}
              <a
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать в WhatsApp"
                className="hidden md:inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3.5 text-white shadow-xs transition-colors hover:bg-[#20BA5A] font-semibold text-xs"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Консультация</span>
              </a>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-xl p-2 text-[#4D2C20] transition-colors hover:bg-[#FAF5EE] lg:hidden"
                aria-label="Открыть меню"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeView={activeView}
        onNavigate={onNavigate}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        currentCurrency={currentCurrency}
        currencies={currencies}
        onSelectCurrency={onSelectCurrency}
      />
    </>
  );
};
