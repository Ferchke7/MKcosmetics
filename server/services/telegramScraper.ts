import axios from 'axios';
import * as cheerio from 'cheerio';

export interface TelegramPriceInfo {
  krw?: number;
  rub?: number;
  usd?: number;
  eur?: number;
  kzt?: number;
  uzs?: number;
  originalKrw?: number;
}

export interface ScrapedTelegramPost {
  id: string;
  channel: string;
  postUrl: string;
  date: string;
  timestamp: number;
  text: string;
  htmlContent: string;
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

export class TelegramScraperService {
  private static CHANNEL_HANDLE = 'mkcosmetkor';

  public static async scrapeLiveFeed(): Promise<{ channelInfo: ChannelInfo; posts: ScrapedTelegramPost[] }> {
    const url = `https://t.me/s/${this.CHANNEL_HANDLE}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      },
      timeout: 12000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 1. Channel Profile Info
    const title = $('.tgme_channel_info_header_title span').text().trim() || 'MK KOREA COSMETIC';
    const username = '@' + this.CHANNEL_HANDLE;
    const description = $('.tgme_channel_info_description').text().trim() || 'Корейская косметика премиум-класса с доставкой во все страны';
    
    let avatarUrl = $('.tgme_page_photo_image img').attr('src') || '';
    if (!avatarUrl && $('.tgme_channel_info_header img').length) {
      avatarUrl = $('.tgme_channel_info_header img').attr('src') || '';
    }

    const counters: { [key: string]: string } = {};
    $('.tgme_channel_info_counter').each((_, el) => {
      const val = $(el).find('.counter_value').text().trim();
      const type = $(el).find('.counter_type').text().trim();
      if (type && val) {
        counters[type] = val;
      }
    });

    const channelInfo: ChannelInfo = {
      title,
      username,
      description,
      avatarUrl,
      subscribersCount: counters['subscribers'] || '1.5K',
      photosCount: counters['photos'] || '8.2K',
      videosCount: counters['videos'] || '2.9K',
    };

    // 2. Parse Posts & Albums
    const posts: ScrapedTelegramPost[] = [];

    $('.tgme_widget_message_wrap').each((_, elem) => {
      try {
        const $post = $(elem).find('.tgme_widget_message');
        const dataPost = $post.attr('data-post') || '';
        if (!dataPost) return;

        const postId = dataPost.split('/')[1] || dataPost;
        const postUrl = `https://t.me/${dataPost}`;

        // Date & Time
        const timeElem = $post.find('time');
        const dateStr = timeElem.attr('datetime') || new Date().toISOString();
        const timestamp = new Date(dateStr).getTime() || Date.now();

        // Views
        const views = $post.find('.tgme_widget_message_views').text().trim() || '100+';

        // Author
        const author = $post.find('.tgme_widget_message_from_author').text().trim() || 'Мухаббат Ким';

        // Text content
        const textElem = $post.find('.tgme_widget_message_text');
        const rawHtml = textElem.html() || '';
        const text = textElem.text().trim();

        // Extract photos (including background-image and img tags)
        const photos: string[] = [];

        // Check single or grouped photo styles
        $post.find('.tgme_widget_message_photo_wrap').each((_, photoElem) => {
          const style = $(photoElem).attr('style') || '';
          const match = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
          if (match && match[1] && !photos.includes(match[1])) {
            photos.push(match[1]);
          }
        });

        // Check any img tags
        $post.find('img').each((_, imgElem) => {
          const src = $(imgElem).attr('src') || '';
          if (src && src.includes('telesco.pe') && !photos.includes(src) && !src.includes('emoji')) {
            photos.push(src);
          }
        });

        // Parse prices
        const prices: TelegramPriceInfo = this.extractPrices(text);

        // Parse tags
        const tags = (text.match(/#[a-zA-Zа-яА-Я0-9_]+/g) || []).map(t => t.replace('#', ''));
        
        // Extract title
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const productTitle = lines.length > 0 ? lines[0].replace(/^[👑✨🌸💥💎🔥✔️❌\s]+/, '').trim() : undefined;

        // Reactions
        const reactions: { emoji: string; count: number }[] = [];
        $post.find('.tgme_reaction').each((_, rElem) => {
          const rText = $(rElem).text().trim();
          const countMatch = rText.match(/\d+/);
          const count = countMatch ? parseInt(countMatch[0], 10) : 1;
          const emoji = $(rElem).find('b').text() || '❤️';
          reactions.push({ emoji, count });
        });

        if (text || photos.length > 0) {
          posts.push({
            id: postId,
            channel: this.CHANNEL_HANDLE,
            postUrl,
            date: dateStr,
            timestamp,
            text,
            htmlContent: rawHtml,
            photos,
            views,
            reactions,
            prices,
            author,
            tags,
            productTitle,
          });
        }
      } catch (err) {
        console.warn('Error parsing single telegram post:', err);
      }
    });

    // Group multi-photo album messages (Telegram web preview sometimes puts album photos in subsequent sibling messages)
    const consolidatedPosts = this.consolidateAlbums(posts);

    return {
      channelInfo,
      posts: consolidatedPosts,
    };
  }

  private static consolidateAlbums(posts: ScrapedTelegramPost[]): ScrapedTelegramPost[] {
    const result: ScrapedTelegramPost[] = [];

    for (let i = 0; i < posts.length; i++) {
      const current = posts[i];
      // If a post has no text and only photos, check if it belongs to adjacent post
      if (!current.text && current.photos.length > 0 && result.length > 0) {
        const prev = result[result.length - 1];
        if (Math.abs(prev.timestamp - current.timestamp) < 60000) {
          // Merge photos into previous post
          for (const ph of current.photos) {
            if (!prev.photos.includes(ph)) {
              prev.photos.push(ph);
            }
          }
          continue;
        }
      }
      result.push(current);
    }

    return result;
  }

  private static extractPrices(text: string): TelegramPriceInfo {
    const prices: TelegramPriceInfo = {};

    // Current KRW
    const krwMatch = text.match(/(?:✔️|цена|стоимость)?\s*([0-9.,]+)\s*(?:вон|₩|krw|won)/i);
    if (krwMatch) {
      const numStr = krwMatch[1].replace(/[.,]/g, '');
      const parsed = parseInt(numStr, 10);
      if (!isNaN(parsed) && parsed > 500) {
        prices.krw = parsed;
      }
    }

    // Original Crossed KRW (with ❌)
    const oldKrwMatch = text.match(/❌\s*([0-9.,]+)\s*(?:вон|₩)/i);
    if (oldKrwMatch) {
      const numStr = oldKrwMatch[1].replace(/[.,]/g, '');
      const parsed = parseInt(numStr, 10);
      if (!isNaN(parsed) && parsed > 500) {
        prices.originalKrw = parsed;
      }
    }

    // RUB
    const rubMatch = text.match(/(?:✔️)?\s*([0-9\s.,]+)\s*(?:₽|руб|rub)/i);
    if (rubMatch) {
      const numStr = rubMatch[1].replace(/[^\d]/g, '');
      const parsed = parseInt(numStr, 10);
      if (!isNaN(parsed) && parsed > 50) {
        prices.rub = parsed;
      }
    }

    // USD
    const usdMatch = text.match(/(?:✔️)?\s*([0-9.,]+)\s*(?:\$|usd|долл)/i);
    if (usdMatch) {
      const numStr = usdMatch[1].replace(/[^\d.]/g, '');
      const parsed = parseFloat(numStr);
      if (!isNaN(parsed) && parsed > 0) {
        prices.usd = parsed;
      }
    }

    // EUR
    const eurMatch = text.match(/(?:✔️)?\s*([0-9.,]+)\s*(?:€|eur|евро)/i);
    if (eurMatch) {
      const numStr = eurMatch[1].replace(/[^\d.]/g, '');
      const parsed = parseFloat(numStr);
      if (!isNaN(parsed) && parsed > 0) {
        prices.eur = parsed;
      }
    }

    // KZT
    const kztMatch = text.match(/(?:✔️)?\s*([0-9\s.,]+)\s*(?:т|тг|kzt|тенге)/i);
    if (kztMatch) {
      const numStr = kztMatch[1].replace(/[^\d]/g, '');
      const parsed = parseInt(numStr, 10);
      if (!isNaN(parsed) && parsed > 100) {
        prices.kzt = parsed;
      }
    }

    return prices;
  }
}
