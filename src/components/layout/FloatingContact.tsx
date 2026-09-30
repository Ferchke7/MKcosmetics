import React, { useState } from 'react';
import { MessageCircle, Send, X, Sparkles } from 'lucide-react';
import { BRAND_CONFIG } from '../../core/constants/brand';

export const FloatingContact: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Expanded Quick Options */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-1 animate-slide-up">
          {/* Telegram Channel / Direct */}
          <a
            href={BRAND_CONFIG.telegramChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#229ED9] hover:bg-[#1E8BC0] text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-x-1"
          >
            <span>Telegram (@mkcosmetkor)</span>
            <Send className="w-4 h-4" />
          </a>

          {/* WhatsApp Direct Chat */}
          <a
            href={BRAND_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-x-1"
          >
            <span>WhatsApp (+82 10 8390 5577)</span>
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-soft-lg transition-all duration-300 transform hover:scale-105 ${
          isOpen ? 'bg-[#2D2A2E] rotate-90' : 'bg-gradient-to-tr from-[#25D366] via-[#229ED9] to-[#C2836B]'
        }`}
        aria-label="Связаться с нами"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
};
