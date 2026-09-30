import React from 'react';

export interface BadgeProps {
  variant?: 'brand' | 'gold' | 'rose' | 'sage' | 'outline' | 'dark' | 'discount';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'brand',
  size = 'sm',
  children,
  className = '',
  icon,
}) => {
  const base = 'inline-flex items-center font-medium rounded-full tracking-wider uppercase transition-colors';

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  const variantClasses = {
    brand: 'bg-[#F7EDE8] text-[#8A503C] border border-[#EED9CF]',
    gold: 'bg-[#FAF5EE] text-[#9F8058] border border-[#E5D3B3]',
    rose: 'bg-[#FFF0F2] text-[#C26B7E] border border-[#FAD3DB]',
    sage: 'bg-[#EEF5F1] text-[#426855] border border-[#CCE3D6]',
    outline: 'border border-[#D09E88] text-[#8A503C] bg-white/80 backdrop-blur-xs',
    dark: 'bg-[#2D2A2E] text-white',
    discount: 'bg-rose-500 text-white font-bold',
  };

  return (
    <span className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {icon && <span className="mr-1.5 inline-flex">{icon}</span>}
      {children}
    </span>
  );
};
