import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Logo } from '../../ui/Logo';
import { BRAND_CONFIG } from '../../../core/constants/brand';
import { NAV_ITEMS } from '../../../core/constants/navigation';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#332E2B] bg-[#1C1917] py-10 text-[#FAF5EE] sm:py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <a href="#top" className="inline-flex items-center gap-3" aria-label={`${BRAND_CONFIG.brandName}, наверх`}>
            <Logo size="md" variant="icon" />
            <span className="font-serif text-lg font-semibold tracking-wide text-white">
              {BRAND_CONFIG.brandName}
            </span>
          </a>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#A89F97]">
            Актуальные предложения публикуются в Telegram-канале.
          </p>
        </div>

        <nav aria-label="Навигация в подвале">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">Разделы</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#A89F97]">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="transition-colors hover:text-[#D09E88]">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">Связаться</h2>
          <div className="flex flex-col items-start gap-3 text-sm">
            <a
              href={BRAND_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#D6CEC7] transition-colors hover:text-white"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-[#332E2B] px-4 pt-5 text-xs text-[#8C827A] sm:px-6 lg:px-8">
        {BRAND_CONFIG.brandName}
      </div>
    </footer>
  );
};
