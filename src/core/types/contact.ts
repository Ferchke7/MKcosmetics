export interface ContactInfo {
  brandName: string;
  phone: string;
  phoneDisplay: string;
  whatsappUrl: string;
  telegram?: string;
  telegramChannel: string;
  telegramChannelUrl: string;
  telegramConsultant?: string;
  telegramConsultantUrl?: string;
  instagram?: string;
  instagramHandle: string;
  instagramUrl: string;
  address?: string;
}

export interface QuickOrderPayload {
  productTitle: string;
  priceFormatted: string;
  sourceUrl?: string;
  clientName?: string;
  clientPhone?: string;
  comment?: string;
}
