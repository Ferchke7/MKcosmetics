import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Phone, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { BRAND_CONFIG } from '../../core/constants/brand';
import { InstagramIcon } from '../ui/InstagramIcon';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Главная' },
    { to: '/catalog', label: 'Магазин' },
    { to: '/delivery', label: 'Доставка' },
    { to: '/contacts', label: 'Контакты' },
    { to: '/about', label: 'О компании' },
  ];

  return (
    <header className="bg-paper border-b border-line text-ink">
      {/* 1. Top Bar: Contacts / Socials / Guarantee */}
      <div className="bg-cream-deep/60 border-b border-line/60 text-xs text-muted py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-ink font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Офис и склад в Сеуле (Южная Корея)</span>
            </span>
            <span className="hidden sm:inline text-line">•</span>
            <span className="hidden sm:inline">Прямые оптовые поставки оригинальной косметики</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={BRAND_CONFIG.telegramChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors flex items-center gap-1"
              title="Telegram канал"
            >
              <Send className="w-3 h-3 text-[#229ED9]" />
              <span className="hidden md:inline">Telegram</span>
            </a>
            <a
              href={BRAND_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors flex items-center gap-1"
              title="WhatsApp консультация"
            >
              <Phone className="w-3 h-3 text-[#25D366]" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>
            <a
              href={BRAND_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors flex items-center gap-1"
              title="Instagram"
            >
              <InstagramIcon className="w-3 h-3 text-[#E1306C]" />
              <span className="hidden md:inline">Instagram</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Header: Centered Logo + Currency + Right Icons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          {/* Left: Currency badge (fixed KRW) + Mobile trigger */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-card border border-line text-ink hover:text-gold hover:border-gold"
              aria-label="Меню"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Currency Chip (Styled like EvaCode's KRW chip) */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-card bg-cream-soft border border-line text-xs font-semibold text-ink">
              <span className="text-gold font-bold">₩</span>
              <span>KRW</span>
            </div>
          </div>

          {/* Center: Brand Logo */}
          <Link to="/" className="text-center group">
            <div className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.18em] text-ink group-hover:text-gold transition-colors uppercase">
              MK KOREA
            </div>
            <div className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-muted font-semibold mt-0.5">
              COSMETIC • SEOUL
            </div>
          </Link>

          {/* Right: Contacts / Wishlist / Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/contacts"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-ink hover:text-gold transition-colors"
            >
              <Phone className="w-4 h-4 text-gold" />
              <span>Контакты</span>
            </Link>

            <Link
              to="/catalog?favorite=true"
              className="relative p-2 rounded-card text-ink hover:text-gold transition-colors"
              title="Избранное"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-sale text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-card bg-gold text-white hover:bg-gold-hover transition-colors shadow-sm"
              title="Открыть корзину"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">Корзина</span>
              <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[11px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navigation Menu Bar (Desktop) */}
      <nav className="hidden lg:block border-t border-line/60 bg-cream-soft/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center gap-8 py-3 text-xs uppercase tracking-[0.14em] font-semibold text-ink">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `transition-colors hover:text-gold pb-1 border-b-2 ${
                      isActive ? 'text-gold border-gold' : 'border-transparent text-ink/80'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-4/5 max-w-xs bg-paper h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
                <div>
                  <div className="font-serif text-xl font-bold tracking-wider text-ink">MK KOREA</div>
                  <div className="text-[9px] uppercase tracking-widest text-muted">Cosmetics Seoul</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-card hover:bg-cream-soft text-muted hover:text-ink"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ul className="space-y-3 text-sm font-medium">
                {navLinks.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block py-2 px-3 rounded-card transition-colors ${
                          isActive ? 'bg-gold/10 text-gold font-bold' : 'text-ink hover:bg-cream-soft'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-line space-y-3 text-xs text-muted">
              <div>
                <div className="font-bold text-ink mb-1">Свяжитесь с нами:</div>
                <div className="font-mono text-ink">{BRAND_CONFIG.phoneDisplay}</div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <a href={BRAND_CONFIG.telegramChannelUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-cream-soft text-ink hover:text-gold">
                  <Send className="w-4 h-4" />
                </a>
                <a href={BRAND_CONFIG.whatsappUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-cream-soft text-ink hover:text-gold">
                  <Phone className="w-4 h-4" />
                </a>
                <a href={BRAND_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-cream-soft text-ink hover:text-gold">
                  <InstagramIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
