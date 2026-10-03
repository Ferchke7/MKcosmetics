import React from 'react';
import { NAV_ITEMS } from '../../../core/constants/navigation';
import { useLanguage } from '../../../core/i18n/LanguageContext';

interface NavbarProps {
  activeView: 'home' | 'catalog';
  onNavigate: (view: 'home' | 'catalog', targetAnchor?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, onNavigate }) => {
  const { t } = useLanguage();

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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === '#catalog') {
      onNavigate('catalog');
    } else {
      onNavigate('home', href);
    }
  };

  return (
    <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
      {NAV_ITEMS.map((item) => {
        const isItemActive =
          (item.href === '#catalog' && activeView === 'catalog') ||
          (item.href !== '#catalog' && activeView === 'home' && item.href === '#top');

        const label = getLocalizedLabel(item.href, item.label);

        return (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => handleClick(e, item.href)}
            className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-all xl:text-sm ${
              item.isSpecial
                ? activeView === 'catalog'
                  ? 'bg-[#1A1917] text-[#B89254] shadow-xs'
                  : 'bg-[#F7F4EF] text-[#B89254] hover:bg-[#ECE8E1] border border-[#ECE8E1]'
                : isItemActive
                ? 'bg-[#F7F4EF] text-[#1A1917] font-bold border border-[#ECE8E1]'
                : 'text-[#1A1917] hover:text-[#B89254] hover:bg-[#F7F4EF]'
            }`}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
};
