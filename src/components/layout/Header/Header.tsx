import React, { useEffect, useState } from 'react';
import { Menu, MessageCircle } from 'lucide-react';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';
import { Logo } from '../../ui/Logo';
import { BRAND_CONFIG } from '../../../core/constants/brand';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-soft border-b border-[#F0E6DE]/80 py-2'
            : 'bg-white/75 backdrop-blur-sm py-2.5'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <a href="#top" className="flex shrink-0 items-center" aria-label={BRAND_CONFIG.brandName}>
              <Logo size="md" variant="horizontal" />
            </a>

            <Navbar />

            <div className="flex shrink-0 items-center gap-2">
              <a
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать в WhatsApp"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#25D366] px-3 text-white shadow-xs transition-colors hover:bg-[#20BA5A] sm:px-4"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden text-xs font-semibold sm:inline">Написать</span>
              </a>

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

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};
