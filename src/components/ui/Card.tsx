import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  glass = false,
  onClick,
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-300 overflow-hidden';
  
  const glassClasses = glass
    ? 'bg-white/85 backdrop-blur-md border-white/60 shadow-soft'
    : 'bg-white border-[#F0E6DE] shadow-soft';

  const hoverClasses = hoverEffect
    ? 'hover:shadow-soft-lg hover:-translate-y-1 hover:border-[#E1BEAF]'
    : '';

  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${glassClasses} ${hoverClasses} ${cursorClass} ${className}`}
    >
      {children}
    </div>
  );
};
