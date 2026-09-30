export interface TelegramPriceInfo {
  krw?: number;
  rub?: number;
  usd?: number;
  eur?: number;
  kzt?: number;
  uzs?: number;
  originalKrw?: number;
}

export interface TelegramPost {
  id: string;
  channel: string;
  postUrl: string;
  date: string;
  timestamp: number;
  text: string;
  htmlContent?: string;
  photos: string[];
  views: string;
  reactions: { emoji: string; count: number }[];
  prices: TelegramPriceInfo;
  author?: string;
  tags: string[];
  productTitle?: string;
}

export interface ChannelInfo {
  title: string;
  username: string;
  description: string;
  avatarUrl: string;
  subscribersCount: string;
  photosCount: string;
  videosCount: string;
}

export interface TelegramFeedResponse {
  channelInfo: ChannelInfo;
  posts: TelegramPost[];
}
