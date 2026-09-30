import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-[#6C3E2E] uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-xs">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`block w-full rounded-xl border border-[#EED9CF] bg-white px-4 py-2.5 text-sm text-[#2D2A2E] placeholder-[#A89F97] transition-colors focus:border-[#C2836B] focus:outline-none focus:ring-1 focus:ring-[#C2836B] disabled:bg-[#FAF5EE] ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};
