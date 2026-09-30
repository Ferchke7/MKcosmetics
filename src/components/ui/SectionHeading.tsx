import React from 'react';
import { Badge } from './Badge';

export interface SectionHeadingProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  badgeIcon,
  title,
  subtitle,
  align = 'center',
  className = '',
}) => {
  const alignClasses = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-3xl mb-12 sm:mb-16 ${alignClasses} ${className}`}>
      {badge && (
        <div className="mb-3.5">
          <Badge variant="brand" size="md" icon={badgeIcon}>
            {badge}
          </Badge>
        </div>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#242120] font-normal tracking-tight leading-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-[#6C635B] font-light leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className={`mt-4 flex items-center gap-2 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
        <span className="w-12 h-[1.5px] bg-[#C5A880]/60 rounded-full" />
        <span className="w-2 h-2 rounded-full bg-[#C2836B]" />
        <span className="w-12 h-[1.5px] bg-[#C5A880]/60 rounded-full" />
      </div>
    </div>
  );
};
