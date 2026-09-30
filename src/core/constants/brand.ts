import { ContactInfo } from '../types/contact';

export const BRAND_CONFIG: ContactInfo = {
  brandName: 'MK KOREA COSMETIC',
  phone: '+821083905577',
  whatsappUrl: 'https://wa.me/821083905577',
  telegramChannel: '@mkcosmetkor',
  telegramChannelUrl: 'https://t.me/mkcosmetkor',
};

export const buildWhatsAppUrl = (message: string): string => {
  const phone = BRAND_CONFIG.phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
