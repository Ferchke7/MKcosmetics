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
    ? 'bg-white/90 backdrop-blur-md border-[#ECE8E1] shadow-soft'
    : 'bg-white border-[#ECE8E1] shadow-soft';

  const hoverClasses = hoverEffect
    ? 'hover:shadow-soft-lg hover:-translate-y-1 hover:border-[#B89254]'
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
