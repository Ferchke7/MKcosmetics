import React, { useState } from 'react';

export interface LogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'dark' | 'light' | 'gold';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  theme = 'dark',
  showSubtitle = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: { imgClass: 'w-8 h-8', sizePx: 32, titleClass: 'text-sm font-bold', subClass: 'text-[9px]' },
    md: { imgClass: 'w-10 h-10 sm:w-11 sm:h-11', sizePx: 44, titleClass: 'text-base sm:text-lg font-bold', subClass: 'text-[10px]' },
    lg: { imgClass: 'w-14 h-14 sm:w-16 sm:h-16', sizePx: 64, titleClass: 'text-xl sm:text-2xl font-bold', subClass: 'text-xs' },
    xl: { imgClass: 'w-20 h-20 sm:w-24 sm:h-24', sizePx: 96, titleClass: 'text-2xl sm:text-3xl font-extrabold', subClass: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  // Official Emblem Render
  const EmblemImage = !imgError ? (
    <div className={`relative shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-[#B89254] via-[#DFCBA0] to-[#9E7B42] shadow-xs transition-transform duration-300 group-hover:scale-105 ${currentSize.imgClass}`}>
      <img
        src="/logo.png"
        alt="MK KOREA COSMETIC"
        className="w-full h-full object-cover rounded-full bg-[#FAF8F5]"
        onError={() => setImgError(true)}
      />
    </div>
  ) : (
    <div className={`relative shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-[#B89254] via-[#DFCBA0] to-[#9E7B42] shadow-xs flex items-center justify-center bg-[#FAF8F5] text-[#B89254] font-serif font-bold ${currentSize.imgClass}`}>
      MK
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{EmblemImage}</div>;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 group ${className}`}>
        {EmblemImage}
        <div>
          <span className="font-serif font-black tracking-wider text-[#1A1917] block leading-tight">
            MK KOREA
          </span>
          {showSubtitle && (
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#B89254] block mt-0.5">
              COSMETIC • SEOUL
            </span>
          )}
        </div>
      </div>
    );
  }

  // Horizontal / Default
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      {EmblemImage}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className={`font-serif tracking-wider text-[#1A1917] group-hover:text-[#B89254] transition-colors leading-tight ${currentSize.titleClass}`}>
            MK KOREA
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-[#B89254] to-[#9E7B42] text-white rounded-xs shadow-2xs">
            Direct
          </span>
        </div>
        {showSubtitle && (
          <span className={`text-[#B89254] tracking-[0.18em] font-bold uppercase leading-none mt-0.5 ${currentSize.subClass}`}>
            Cosmetic • Seoul
          </span>
        )}
      </div>
    </div>
  );
};
