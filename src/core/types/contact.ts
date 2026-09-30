export interface ContactInfo {
  brandName: string;
  phone: string;
  whatsappUrl: string;
  telegramChannel: string;
  telegramChannelUrl: string;
}

export interface QuickOrderPayload {
  productTitle: string;
  priceFormatted: string;
  sourceUrl?: string;
  clientName?: string;
  clientPhone?: string;
  comment?: string;
}
