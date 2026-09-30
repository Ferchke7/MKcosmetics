import { ContactInfo } from '../types/contact';

export const BRAND_CONFIG: ContactInfo = {
  brandName: 'MK KOREA COSMETIC',
  shortName: 'mkcosmet',
  tagline: 'Премиальная корейская косметика напрямую из Южной Кореи',
  founderName: 'Мухаббат Ким',
  founderTitle: 'Основатель MK KOREA COSMETIC & Эксперт K-Beauty',
  founderBio: 'Живу и работаю в Южной Корее более 7 лет. Лично отбираю, тестирую и поставляю оригинальную премиальную косметику от ведущих корейских брендов и фарм-лабораторий (LG, Amorepacific, CNP Rx, Sulwhasoo, The History of Whoo).',
  phone: '+821083905577',
  phoneDisplay: '+82 10 8390 5577',
  whatsappUrl: 'https://wa.me/821083905577',
  telegramChannel: '@mkcosmetkor',
  telegramChannelUrl: 'https://t.me/mkcosmetkor',
  telegramDirect: '@mkcosmetkor',
  telegramDirectUrl: 'https://t.me/mkcosmetkor',
  instagramHandle: '@muhabbat.kim.mk',
  instagramUrl: 'https://www.instagram.com/muhabbat.kim.mk/',
  location: 'Сеул, Южная Корея (Доставка по всему миру)',
  workingHours: 'Консультации 24/7 без выходных',
  deliveryHighlights: [
    '✈️ Экспресс-доставка во все страны мира',
    '📦 Доставка прямо до дверей',
    '🗒 100% оригинальная и сертифицированная продукция',
    '💰 Продажа оптом и в розницу',
    '✨ Профессиональный подбор ухода под ваш тип кожи',
  ],
};

/**
 * Generate a pre-filled WhatsApp link with custom inquiry text
 */
export const buildWhatsAppUrl = (message: string): string => {
  const phone = BRAND_CONFIG.phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate a pre-filled Telegram link
 */
export const buildTelegramUrl = (message?: string): string => {
  if (!message) return BRAND_CONFIG.telegramChannelUrl;
  // If linking to channel/direct with text
  return `https://t.me/mkcosmetkor`;
};
