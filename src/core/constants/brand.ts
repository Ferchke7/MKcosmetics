import { ContactInfo } from '../types/contact';

export const BRAND_CONFIG: ContactInfo = {
  brandName: 'MK KOREA COSMETIC',
  phone: '+821083905577',
  phoneDisplay: '+82 10 8390 5577',
  whatsappUrl: 'https://wa.me/821083905577',
  telegram: '@mkcosmetkor',
  telegramChannel: '@mkcosmetkor',
  telegramChannelUrl: 'https://t.me/mkcosmetkor',
  telegramConsultant: '@mkcosmetkor',
  telegramConsultantUrl: 'https://t.me/mkcosmetkor',
  instagram: '@muhabbat.kim.mk',
  instagramHandle: '@muhabbat.kim.mk',
  instagramUrl: 'https://www.instagram.com/muhabbat.kim.mk/',
  address: 'Республика Корея, Сеул (Склад и офис прямых поставок)',
};

export const buildWhatsAppUrl = (message: string): string => {
  const phone = (BRAND_CONFIG.phone || '+821083905577').replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
