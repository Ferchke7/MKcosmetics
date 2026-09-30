export interface ContactInfo {
  brandName: string;
  shortName: string;
  tagline: string;
  founderName: string;
  founderTitle: string;
  founderBio: string;
  phone: string;
  phoneDisplay: string;
  whatsappUrl: string;
  telegramChannel: string;
  telegramChannelUrl: string;
  telegramDirect: string;
  telegramDirectUrl: string;
  instagramHandle: string;
  instagramUrl: string;
  location: string;
  workingHours: string;
  deliveryHighlights: string[];
}

export interface QuickOrderPayload {
  productTitle: string;
  priceFormatted: string;
  sourceUrl?: string;
  clientName?: string;
  clientPhone?: string;
  comment?: string;
}
