import React from 'react';
import { MessageCircle, Send, Phone, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { InstagramIcon } from '../../ui/InstagramIcon';
import { Logo } from '../../ui/Logo';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import { NAV_ITEMS } from '../../../core/constants/navigation';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#332E2B] bg-[#111827] py-12 text-[#FAF5EE]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4">
            <a href="#top" className="inline-flex items-center gap-3" aria-label={`${BRAND_CONFIG.brandName}, наверх`}>
              <Logo size="md" variant="icon" />
              <span className="font-serif text-lg font-bold tracking-wide text-white">
                {BRAND_CONFIG.brandName}
              </span>
            </a>
            <p className="text-xs leading-relaxed text-[#9CA3AF] max-w-xs">
              Премиальная корейская косметика напрямую из Сеула. 100% оригинальная продукция ведущих брендов Южной Кореи с экспресс-доставкой до двери.
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% гарантия подлинности</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              Навигация
            </h3>
            <ul className="space-y-2.5 text-xs text-[#9CA3AF]">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery & Assurance */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              Доставка и сервис
            </h3>
            <ul className="space-y-2.5 text-xs text-[#9CA3AF]">
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Международная доставка ✈️</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#0073E9] shrink-0" />
                <span>Прямой склад: Сеул, Южная Корея</span>
              </li>
              <li>Индивидуальный подбор ухода</li>
              <li>Оптовые и розничные заказы</li>
            </ul>
          </div>

          {/* Social Networks & Contacts */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              Мы в соцсетях
            </h3>
            <div className="space-y-3">
              <a
                href={BRAND_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-[#D1D5DB] hover:text-[#E1306C] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#E1306C]">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <span>Instagram {BRAND_CONFIG.instagramHandle}</span>
              </a>

              <a
                href={BRAND_CONFIG.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-[#D1D5DB] hover:text-[#229ED9] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#229ED9]">
                  <Send className="w-4 h-4" />
                </div>
                <span>Telegram {BRAND_CONFIG.telegramChannel}</span>
              </a>

              <a
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-[#D1D5DB] hover:text-[#25D366] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span>WhatsApp: {BRAND_CONFIG.phoneDisplay}</span>
              </a>

              <a
                href={`tel:${BRAND_CONFIG.phone}`}
                className="flex items-center gap-2.5 text-xs text-[#D1D5DB] hover:text-white transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-gray-300">
                  <Phone className="w-4 h-4" />
                </div>
                <span>Тел: {BRAND_CONFIG.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            © {new Date().getFullYear()} {BRAND_CONFIG.brandName}. Все права защищены.
          </div>
          <div>
            Основатель и эксперт по K-Beauty: Мухаббат Ким
          </div>
        </div>
      </div>
    </footer>
  );
};
