import React from 'react';
import { useLanguage } from '../../../core/i18n/LanguageContext';
import { Language } from '../../../core/i18n/translations';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-lg bg-[#F5F5F5] p-0.5 border border-[#E5E5E5]">
      <button
        type="button"
        onClick={() => setLanguage('ru')}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
          language === 'ru'
            ? 'bg-white text-[#111111] shadow-2xs'
            : 'text-[#777777] hover:text-[#111111]'
        }`}
        title="Русский язык"
      >
        <span>🇷🇺</span>
        <span>RU</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('uz')}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
          language === 'uz'
            ? 'bg-white text-[#111111] shadow-2xs'
            : 'text-[#777777] hover:text-[#111111]'
        }`}
        title="O'zbek tili"
      >
        <span>🇺🇿</span>
        <span>UZ</span>
      </button>
    </div>
  );
};
