export interface ContactInfo {
  brandName: string;
  phone: string;
  phoneDisplay: string;
  whatsappUrl: string;
  telegramChannel: string;
  telegramChannelUrl: string;
  telegramConsultant?: string;
  telegramConsultantUrl?: string;
  instagramHandle: string;
  instagramUrl: string;
}

export interface QuickOrderPayload {
  productTitle: string;
  priceFormatted: string;
  sourceUrl?: string;
  clientName?: string;
  clientPhone?: string;
  comment?: string;
}
