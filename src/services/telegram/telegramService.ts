import { TelegramFeedResponse } from '../../core/types/telegram';
import { INITIAL_TELEGRAM_DATA } from './telegramMockData';

export class TelegramService {
  private static CACHE_KEY = 'mkcosmet_telegram_feed_cache';

  public static async fetchFeed(forceRefresh = false): Promise<TelegramFeedResponse> {
    try {
      const url = `/api/telegram/feed${forceRefresh ? '?refresh=true' : ''}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      if (json.success && json.data) {
        // Update local cache
        try {
          localStorage.setItem(this.CACHE_KEY, JSON.stringify({
            data: json.data,
            timestamp: Date.now(),
          }));
        } catch (e) {
          // ignore storage quota errors
        }
        return json.data;
      }

      throw new Error(json.error || 'Invalid API response format');
    } catch (error) {
      console.warn('Backend Telegram feed fetch failed or running standalone, checking local cache:', error);

      // Check local storage cache
      try {
        const cached = localStorage.getItem(this.CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.data && parsed.data.posts && parsed.data.posts.length > 0) {
            return parsed.data;
          }
        }
      } catch (e) {
        // ignore
      }

      // Return initial rich offline data
      return INITIAL_TELEGRAM_DATA;
    }
  }
}
