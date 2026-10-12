import React from 'react';

interface PriceProps {
  amount: number;
  oldAmount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const formatKrw = (val?: number | null): string => {
  if (val === undefined || val === null || isNaN(val)) {
    return '0 ₩';
  }
  return Math.round(val).toLocaleString('ru-RU') + ' ₩';
};

export const Price: React.FC<PriceProps> = ({
  amount = 0,
  oldAmount,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs sm:text-sm font-bold',
    md: 'text-sm sm:text-base font-semibold',
    lg: 'text-base sm:text-lg font-bold',
    xl: 'text-xl sm:text-2xl font-bold font-serif',
  };

  const hasDiscount = Boolean(oldAmount && oldAmount > (amount || 0));

  return (
    <div className={`flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5 leading-tight ${className}`}>
      <span className={`text-ink font-semibold tracking-tight whitespace-nowrap ${sizeClasses[size]}`}>
        {formatKrw(amount)}
      </span>
      {hasDiscount && (
        <span className="text-[10px] sm:text-xs text-muted line-through font-normal whitespace-nowrap">
          {formatKrw(oldAmount)}
        </span>
      )}
    </div>
  );
};
