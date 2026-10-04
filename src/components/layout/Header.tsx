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
      {/* 1. Top Bar: Social Networks & Key Status in Soft Warm Palette */}
      <div className="bg-[#F7F3EC] text-ink border-b border-line py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          {/* Status badge: Clean & Minimal (without office/warehouse) */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-ink/75 flex-wrap justify-center md:justify-start">
            <span className="inline-flex items-center gap-1.5 font-medium text-ink">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Оригинальная корейская косметика</span>
            </span>
            <span className="hidden sm:inline text-line">•</span>
            <span className="hidden sm:inline text-ink/60">Прямые поставки из Кореи в ₩ KRW</span>
          </div>

          {/* Social Network Channels with soft, harmonious badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            {/* Telegram Channel */}
            <a
              href={BRAND_CONFIG.telegramChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#229ED9]/10 hover:bg-[#229ED9] text-[#1E77A8] hover:text-white border border-[#229ED9]/25 hover:border-[#229ED9] text-xs transition-all shadow-xs group"
              title="Наш Telegram-канал"
            >
              <Send className="w-3.5 h-3.5 text-[#229ED9] group-hover:text-white transition-colors" />
              <span className="text-[11px] font-normal text-ink/60 group-hover:text-white">Telegram:</span>
              <span className="font-mono font-bold text-[#1E77A8] group-hover:text-white">
                {BRAND_CONFIG.telegramChannel || '@mkcosmetkor'}
              </span>
            </a>

            {/* Instagram */}
            <a
              href={BRAND_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1306C]/10 hover:bg-[#E1306C] text-[#C1275B] hover:text-white border border-[#E1306C]/25 hover:border-[#E1306C] text-xs transition-all shadow-xs group"
              title="Наш Instagram"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C] group-hover:text-white transition-colors" />
              <span className="text-[11px] font-normal text-ink/60 group-hover:text-white">Insta:</span>
              <span className="font-mono font-bold text-[#C1275B] group-hover:text-white">
                {BRAND_CONFIG.instagramHandle || '@muhabbat.kim.mk'}
              </span>
            </a>

            {/* WhatsApp */}
            <a
              href={BRAND_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#1E824C] hover:text-white border border-[#25D366]/25 hover:border-[#25D366] text-xs transition-all shadow-xs group"
              title="WhatsApp для заказов и консультаций"
            >
              <Phone className="w-3.5 h-3.5 text-[#25D366] group-hover:text-white transition-colors" />
              <span className="text-[11px] font-normal text-ink/60 group-hover:text-white">WA:</span>
              <span className="font-mono font-bold text-[#1E824C] group-hover:text-white">
                {BRAND_CONFIG.phoneDisplay || '+82 10 8390 5577'}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Header: Perfectly Balanced Symmetrical Luxury Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left: Desktop Nav Links or Mobile Hamburger */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-card border border-line text-ink hover:text-gold hover:border-gold"
              aria-label="Меню"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-[0.14em] font-semibold text-ink">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `transition-colors hover:text-gold pb-0.5 border-b-2 ${
                    isActive ? 'text-gold border-gold' : 'border-transparent text-ink/80'
                  }`
                }
              >
                Главная
              </NavLink>
              <NavLink
                to="/catalog"
                className={({ isActive }) =>
                  `transition-colors hover:text-gold pb-0.5 border-b-2 ${
                    isActive ? 'text-gold border-gold' : 'border-transparent text-ink/80'
                  }`
                }
              >
                Каталог
              </NavLink>
              <NavLink
                to="/delivery"
                className={({ isActive }) =>
                  `transition-colors hover:text-gold pb-0.5 border-b-2 ${
                    isActive ? 'text-gold border-gold' : 'border-transparent text-ink/80'
                  }`
                }
              >
                Доставка
              </NavLink>
            </nav>
          </div>

          {/* Center: Brand Logo Emblem */}
          <Link to="/" className="flex items-center justify-center group py-0.5" title="MK KOREA COSMETIC">
            <img
              src="/logo.png"
              alt="MK KOREA COSMETIC"
              className="h-16 w-16 sm:h-20 sm:w-20 md:h-22 md:w-22 object-contain rounded-full shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300 border border-line/60 bg-paper"
            />
          </Link>

          {/* Right: Company Info & Wishlist */}
          <div className="flex items-center gap-5 sm:gap-7">
            <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-[0.14em] font-semibold text-ink">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `transition-colors hover:text-gold pb-0.5 border-b-2 ${
                    isActive ? 'text-gold border-gold' : 'border-transparent text-ink/80'
                  }`
                }
              >
                О бренде
              </NavLink>
              <NavLink
                to="/contacts"
                className={({ isActive }) =>
                  `transition-colors hover:text-gold pb-0.5 border-b-2 ${
                    isActive ? 'text-gold border-gold' : 'border-transparent text-ink/80'
                  }`
                }
              >
                Контакты
              </NavLink>
            </nav>

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
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-4/5 max-w-xs bg-paper h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="MK KOREA"
                    className="w-12 h-12 rounded-full object-contain border border-line shadow-sm"
                  />
                  <div>
                    <div className="font-serif text-lg font-bold tracking-wider text-ink">MK KOREA</div>
                    <div className="text-[9px] uppercase tracking-widest text-muted font-semibold">Cosmetic Seoul</div>
                  </div>
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
                {onOpenCart && (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenCart();
                      }}
                      className="w-full text-left py-2 px-3 rounded-card text-ink hover:bg-cream-soft flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gold" />
                        <span>Корзина</span>
                      </span>
                      {cartCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-gold text-white text-xs font-bold font-mono">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  </li>
                )}
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
