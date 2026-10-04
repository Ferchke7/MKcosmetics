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
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-base font-bold',
    xl: 'text-xl font-bold font-serif',
  };

  const hasDiscount = Boolean(oldAmount && oldAmount > (amount || 0));

  return (
    <div className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={`text-ink ${sizeClasses[size]}`}>
        {formatKrw(amount)}
      </span>
      {hasDiscount && (
        <span className="text-xs text-muted line-through font-normal">
          {formatKrw(oldAmount)}
        </span>
      )}
    </div>
  );
};
