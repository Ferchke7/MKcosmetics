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
    primary: 'bg-[#1A1917] hover:bg-[#B89254] text-white shadow-soft hover:shadow-soft-lg focus:ring-[#B89254]',
    secondary: 'bg-[#FAF8F5] hover:bg-[#F7F4EF] text-[#1A1917] border border-[#ECE8E1] focus:ring-[#B89254]',
    outline: 'border border-[#ECE8E1] text-[#1A1917] hover:border-[#B89254] hover:text-[#B89254] focus:ring-[#B89254]',
    gold: 'bg-gradient-to-r from-[#B89254] via-[#DFCBA0] to-[#9E7B42] hover:brightness-105 text-white shadow-gold-glow focus:ring-[#B89254]',
    telegram: 'bg-[#0088cc] hover:bg-[#0077b5] text-white shadow-sm hover:shadow-md focus:ring-[#0088cc]',
    whatsapp: 'bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-sm hover:shadow-md focus:ring-[#25D366]',
    ghost: 'text-[#1A1917] hover:bg-[#FAF8F5] hover:text-[#B89254]',
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
