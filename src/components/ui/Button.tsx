import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'telegram' | 'whatsapp' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100';

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs tracking-wide',
    md: 'px-5 py-2.5 text-sm tracking-wide',
    lg: 'px-7 py-3.5 text-base tracking-wide shadow-sm',
  };

  const variantClasses = {
    primary: 'bg-[#C2836B] hover:bg-[#A96851] text-white shadow-soft hover:shadow-soft-lg focus:ring-[#C2836B]',
    secondary: 'bg-[#FAF5EE] hover:bg-[#F2E8DC] text-[#4D2C20] border border-[#EED9CF] focus:ring-[#E1BEAF]',
    outline: 'border border-[#C2836B] text-[#C2836B] hover:bg-[#C2836B] hover:text-white focus:ring-[#C2836B]',
    gold: 'bg-gradient-to-r from-[#C5A880] to-[#B3936A] hover:from-[#B3936A] hover:to-[#9F8058] text-white shadow-gold-glow focus:ring-[#C5A880]',
    telegram: 'bg-[#229ED9] hover:bg-[#1E8BC0] text-white shadow-sm hover:shadow-md focus:ring-[#229ED9]',
    whatsapp: 'bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-sm hover:shadow-md focus:ring-[#25D366]',
    ghost: 'text-[#4D2C20] hover:bg-[#FAF5EE] hover:text-[#C2836B]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="mr-2 inline-flex items-center">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="ml-2 inline-flex items-center">{icon}</span>}
    </button>
  );
};
