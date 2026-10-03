import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'right' | 'left';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
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

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 ${position === 'right' ? 'right-0' : 'left-0'} max-w-full flex pl-10 z-10`}>
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#ECE8E1] bg-[#FAF8F5]">
            <h2 className="font-serif text-xl text-[#1A1917] font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8A8680] hover:text-[#1A1917] hover:bg-[#F7F4EF] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
