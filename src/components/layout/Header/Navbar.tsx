import React from 'react';
import { NAV_ITEMS } from '../../../core/constants/navigation';

export const Navbar: React.FC = () => {
  return (
    <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition-colors xl:text-sm ${
            item.isSpecial
              ? 'bg-[#FAF5EE] text-[#8A503C] hover:bg-[#F2E8DC]'
              : 'text-[#4D2C20] hover:text-[#C2836B] hover:bg-[#FAF5EE]'
          }`}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};
