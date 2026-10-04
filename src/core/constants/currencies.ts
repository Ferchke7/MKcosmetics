import { CurrencyCode, CurrencyConfig } from '../types/currency';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  KRW: {
    code: 'KRW',
    symbol: '₩',
    label: 'Вон (KRW)',
    flag: '🇰🇷',
    rateToKrw: 1,
    format: (amt?: number | null) => `${Math.round(amt || 0).toLocaleString('ru-RU')} ₩`,
  },
  RUB: {
    code: 'RUB',
    symbol: '₽',
    label: 'Рубль (RUB)',
    flag: '🇷🇺',
    rateToKrw: 0.071, // 1 KRW ≈ 0.071 RUB (~14 KRW per RUB)
    format: (amt?: number | null) => `${Math.round((amt || 0) * 0.071).toLocaleString('ru-RU')} ₽`,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'USD ($)',
    flag: '🇺🇸',
    rateToKrw: 0.00074, // 1 KRW ≈ $0.00074 (~1350 KRW per USD)
    format: (amt?: number | null) => {
      const v = (amt || 0) * 0.00074;
      return `$${v.toFixed(v < 10 ? 1 : 0)}`;
    },
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    label: 'EUR (€)',
    flag: '🇪🇺',
    rateToKrw: 0.00069, // 1 KRW ≈ 0.00069 EUR
    format: (amt?: number | null) => {
      const v = (amt || 0) * 0.00069;
      return `€${v.toFixed(v < 10 ? 1 : 0)}`;
    },
  },
  KZT: {
    code: 'KZT',
    symbol: '₸',
    label: 'Тенге (KZT)',
    flag: '🇰🇿',
    rateToKrw: 0.36, // 1 KRW ≈ 0.36 KZT
    format: (amt?: number | null) => `${Math.round((amt || 0) * 0.36).toLocaleString('ru-RU')} ₸`,
  },
  UZS: {
    code: 'UZS',
    symbol: 'so\'m',
    label: 'UZS (so\'m)',
    flag: '🇺🇿',
    rateToKrw: 9.3, // 1 KRW ≈ 9.3 UZS
    format: (amt?: number | null) => `${Math.round((amt || 0) * 9.3).toLocaleString('ru-RU')} сум`,
  },
};
