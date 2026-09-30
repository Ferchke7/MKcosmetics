import React from 'react';

export interface LogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'dark' | 'light' | 'gold';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  theme = 'dark',
}) => {
  const sizeMap = {
    sm: { iconSize: 32, textClass: 'text-sm' },
    md: { iconSize: 42, textClass: 'text-base' },
    lg: { iconSize: 54, textClass: 'text-xl' },
    xl: { iconSize: 72, textClass: 'text-2xl' },
  };

  const currentSize = sizeMap[size];

  // Bespoke Royal Crest SVG Icon
  const CrestIcon = (
    <svg
      width={currentSize.iconSize}
      height={currentSize.iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
    >
      <defs>
        {/* Luxury Gold & Rose Gold Gradients */}
        <linearGradient id="mkGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E5C79E" />
          <stop offset="35%" stopColor="#C5A880" />
          <stop offset="70%" stopColor="#D49B88" />
          <stop offset="100%" stopColor="#A96851" />
        </linearGradient>

        <linearGradient id="mkCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2D6" />
          <stop offset="50%" stopColor="#E5C79E" />
          <stop offset="100%" stopColor="#C5A880" />
        </linearGradient>

        <linearGradient id="mkBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D2825" />
          <stop offset="100%" stopColor="#1A1614" />
        </linearGradient>
      </defs>

      {/* Dark Luxury Shield / Circle Background */}
      <circle cx="50" cy="50" r="47" fill="url(#mkBgGrad)" stroke="url(#mkGoldGrad)" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="#EED9CF" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" />

      {/* Crown (👑) at top */}
      <g transform="translate(32, 16) scale(0.72)">
        <path
          d="M25 0L32 15L48 5L40 25H10L2 5L18 15L25 0Z"
          fill="url(#mkCrownGrad)"
          stroke="#9F8058"
          strokeWidth="0.8"
        />
        {/* Crown Jewels */}
        <circle cx="2" cy="5" r="2.2" fill="#E8A598" />
        <circle cx="25" cy="0" r="2.5" fill="#FFF2D6" />
        <circle cx="48" cy="5" r="2.2" fill="#E8A598" />
        <rect x="12" y="22" width="26" height="3.5" rx="1.5" fill="url(#mkCrownGrad)" />
      </g>

      {/* Intertwined Monogram "M K" */}
      <g id="MK-Monogram">
        {/* Letter M */}
        <text
          x="36"
          y="68"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="36"
          fontWeight="bold"
          fontStyle="italic"
          fill="url(#mkGoldGrad)"
          textAnchor="middle"
          letterSpacing="-1"
        >
          M
        </text>

        {/* Letter K */}
        <text
          x="62"
          y="72"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="38"
          fontWeight="bold"
          fill="url(#mkCrownGrad)"
          textAnchor="middle"
        >
          K
        </text>
      </g>

      {/* Subtle Laurel Sprigs at bottom */}
      <path
        d="M25 78 C35 88, 65 88, 75 78"
        fill="none"
        stroke="url(#mkGoldGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="85" r="2" fill="#E8A598" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{CrestIcon}</div>;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 group ${className}`}>
        {CrestIcon}
        <div>
          <span className="font-serif font-bold text-xl tracking-widest text-[#2D2A2E] block leading-tight">
            MK COSMET
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#A96851] block mt-0.5">
            KOREA COSMETICS
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal
  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      {CrestIcon}
      <div className="flex flex-col">
        <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-[#2D2A2E] group-hover:text-[#C2836B] transition-colors leading-none">
          MK COSMET
        </span>
        <span className="text-[9px] sm:text-[10px] text-[#A96851] tracking-[0.2em] font-semibold uppercase mt-1">
          Korea Cosmetics
        </span>
      </div>
    </div>
  );
};
