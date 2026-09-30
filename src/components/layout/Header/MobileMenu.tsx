import React from 'react';
import { X } from 'lucide-react';
import { NAV_ITEMS } from '../../../core/constants/navigation';
import { BRAND_CONFIG } from '../../../core/constants/brand';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Меню сайта">
      <button
        type="button"
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Закрыть меню"
      />

      <div className="fixed inset-y-0 right-0 z-10 flex w-[88%] max-w-sm flex-col bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between border-b border-[#F0E6DE] pb-4">
          <div>
            <span className="font-serif text-lg font-bold tracking-wide text-[#2D2A2E]">
              {BRAND_CONFIG.brandName}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#8C827A] transition-colors hover:bg-[#FAF5EE] hover:text-[#4D2C20]"
            aria-label="Закрыть меню"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 py-6">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-base font-medium transition-colors ${
                item.isSpecial
                  ? 'border border-[#EED9CF] bg-[#FAF5EE] text-[#8A503C]'
                  : 'text-[#2D2A2E] hover:bg-[#FAF5EE] hover:text-[#C2836B]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};
