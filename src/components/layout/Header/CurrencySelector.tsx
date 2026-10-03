import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { CurrencyCode, CurrencyConfig } from '../../../core/types/currency';

interface CurrencySelectorProps {
  currentCurrency: CurrencyCode;
  currencies: CurrencyConfig[];
  onSelect: (code: CurrencyCode) => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currentCurrency,
  currencies,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const active = currencies.find((c) => c.code === currentCurrency) || currencies[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F7F4EF] border border-[#ECE8E1] text-xs font-medium text-[#1A1917] transition-colors"
        aria-label="Выбрать валюту"
      >
        <span className="text-sm">{active.flag}</span>
        <span>{active.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#8A8680] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-[#ECE8E1] py-1.5 z-50 animate-slide-up">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8A8680] flex items-center gap-1 border-b border-[#ECE8E1] mb-1">
            <Globe className="w-3 h-3" />
            <span>Валюта цен</span>
          </div>
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => {
                onSelect(curr.code);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                curr.code === currentCurrency
                  ? 'bg-[#F7F4EF] text-[#B89254] font-semibold'
                  : 'text-[#1A1917] hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{curr.flag}</span>
                <span>{curr.label}</span>
              </div>
              <span className="text-[11px] text-[#8A8680]">{curr.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
