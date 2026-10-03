import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-3xl shadow-2xl z-10 overflow-hidden transform transition-all duration-300 animate-slide-up border border-[#ECE8E1]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECE8E1] bg-[#FAF8F5]">
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1917]">
            {title || ''}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8A8680] hover:text-[#1A1917] hover:bg-[#F7F4EF] rounded-full transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};
