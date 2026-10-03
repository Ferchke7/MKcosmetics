import React, { useEffect, useState } from 'react';
import { Menu, MessageCircle, ShoppingBag, Search } from 'lucide-react';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';
import { CurrencySelector } from './CurrencySelector';
import { SocialChannelsBar } from './SocialChannelsBar';
import { GlobalSearchBar } from './GlobalSearchBar';
import { Logo } from '../../ui/Logo';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import { CurrencyCode, CurrencyConfig } from '../../../core/types/currency';
import { useLanguage } from '../../../core/i18n/LanguageContext';
import { Product } from '../../../core/types/product';

interface HeaderProps {
  activeView: 'home' | 'catalog';
  onNavigate: (view: 'home' | 'catalog', targetAnchor?: string) => void;
  cartCount: number;
  cartTotalFormatted?: string;
  onOpenCart: () => void;
  currentCurrency: CurrencyCode;
  currencies: CurrencyConfig[];
  onSelectCurrency: (code: CurrencyCode) => void;
  products?: Product[];
  onSelectProduct?: (p: Product) => void;
  onOpenCatalogWithQuery?: (query: string) => void;
  formatPrice?: (amt: number) => string;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  cartCount,
  cartTotalFormatted,
  onOpenCart,
  currentCurrency,
  currencies,
  onSelectCurrency,
  products = [],
  onSelectProduct = () => {},
  onOpenCatalogWithQuery = () => {},
  formatPrice = (amt) => `${amt} ₩`,
}) => {
  const { t } = useLanguage();
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
            ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-[#ECE8E1]'
            : 'bg-white/90 backdrop-blur-xs border-b border-[#ECE8E1]/80'
        }`}
      >
        {/* Main Header Container */}
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-3 lg:gap-6">
            {/* Logo */}
            <a
              href="#top"
              onClick={handleLogoClick}
              className="flex shrink-0 items-center cursor-pointer"
              aria-label={BRAND_CONFIG.brandName}
            >
              <Logo size="md" variant="horizontal" />
            </a>

            {/* Desktop & Tablet Wide Global Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl mx-2">
              <GlobalSearchBar
                products={products}
                onSelectProduct={onSelectProduct}
                onOpenCatalogWithQuery={onOpenCatalogWithQuery}
                formatPrice={formatPrice}
              />
            </div>

            {/* Desktop Navbar (Nav Links) */}
            <div className="hidden xl:flex items-center shrink-0">
              <Navbar activeView={activeView} onNavigate={onNavigate} />
            </div>

            {/* Right Action Icons & Selectors */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
              {/* Currency Selector */}
              <div className="hidden sm:block">
                <CurrencySelector
                  currentCurrency={currentCurrency}
                  currencies={currencies}
                  onSelect={onSelectCurrency}
                />
              </div>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={onOpenCart}
                className="relative inline-flex h-10 sm:h-11 items-center justify-center gap-2 rounded-full bg-[#1A1917] hover:bg-[#B89254] text-white px-3.5 sm:px-5 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                aria-label={`${t('nav_cart')} (${cartCount})`}
              >
                <ShoppingBag className="h-4 w-4 text-[#B89254]" />
                <span className="hidden sm:inline font-semibold">Корзина</span>
                {cartCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E53935] px-1 text-[11px] font-black text-white shadow-xs">
                    {cartCount}
                  </span>
                )}
                {cartTotalFormatted && cartCount > 0 && (
                  <span className="hidden xl:inline-block pl-1.5 text-[11px] font-semibold text-[#DFCBA0] border-l border-white/20">
                    {cartTotalFormatted}
                  </span>
                )}
              </button>

              {/* WhatsApp Quick Link */}
              <a
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="hidden lg:inline-flex h-10 sm:h-11 items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-4 text-white shadow-xs transition-colors hover:bg-[#20BA5A] font-bold text-xs"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-xl p-2 text-[#1A1917] transition-colors hover:bg-[#F7F4EF] lg:hidden cursor-pointer"
                aria-label="Открыть меню"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Full-width Mobile Search Bar */}
          <div className="pt-2 pb-0.5 md:hidden">
            <GlobalSearchBar
              products={products}
              onSelectProduct={onSelectProduct}
              onOpenCatalogWithQuery={onOpenCatalogWithQuery}
              formatPrice={formatPrice}
            />
          </div>
        </div>

        {/* Social Channels Bar */}
        <SocialChannelsBar />
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
