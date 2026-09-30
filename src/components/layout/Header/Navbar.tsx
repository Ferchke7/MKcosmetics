import React from 'react';
import { NAV_ITEMS } from '../../../core/constants/navigation';
import { Send } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium transition-all duration-200 ${
            item.isSpecial
              ? 'bg-[#229ED9]/10 text-[#1E8BC0] hover:bg-[#229ED9]/20 border border-[#229ED9]/25 flex items-center gap-1.5 font-semibold'
              : 'text-[#4D2C20] hover:text-[#C2836B] hover:bg-[#FAF5EE]'
          }`}
        >
          {item.isSpecial && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#229ED9] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#229ED9]"></span>
            </span>
          )}
          {item.label}
        </a>
      ))}
    </nav>
  );
};
