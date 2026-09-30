import React, { useState, useEffect } from 'react';
import { Menu, MessageCircle, Send } from 'lucide-react';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';
import { CurrencySelector } from './CurrencySelector';
import { Logo } from '../../ui/Logo';
import { CurrencyCode, CurrencyConfig } from '../../../core/types/currency';
import { BRAND_CONFIG } from '../../../core/constants/brand';

interface HeaderProps {
  currentCurrency: CurrencyCode;
  currencies: CurrencyConfig[];
  onSelectCurrency: (code: CurrencyCode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCurrency,
  currencies,
  onSelectCurrency,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-soft border-b border-[#F0E6DE]/80 py-2.5'
            : 'bg-gradient-to-b from-white/80 via-white/50 to-transparent backdrop-blur-xs py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Bespoke Royal Crest Logo */}
            <a href="#" className="flex items-center group shrink-0">
              <Logo size="md" variant="horizontal" />
            </a>

            {/* Desktop Navigation */}
            <Navbar />

            {/* Actions: Currency Selector, Telegram Channel, WhatsApp Consultation, Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Currency Selector */}
              <CurrencySelector
                currentCurrency={currentCurrency}
                currencies={currencies}
                onSelect={onSelectCurrency}
              />

              {/* Telegram Channel Quick Link */}
              <a
                href={BRAND_CONFIG.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#1E8BC0] text-xs font-semibold border border-[#229ED9]/25 transition-colors"
                title="Telegram канал"
              >
                <Send className="w-3.5 h-3.5" />
                <span>@mkcosmetkor</span>
              </a>

              {/* WhatsApp Consultation Direct Button */}
              <a
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold shadow-xs hover:shadow-soft transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Консультация</span>
              </a>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-2xl text-[#4D2C20] hover:bg-[#FAF5EE] border border-transparent hover:border-[#EED9CF] transition-colors"
                aria-label="Открыть меню"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};
