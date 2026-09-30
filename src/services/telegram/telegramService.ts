import { TelegramFeedResponse, TelegramFeedResult } from '../../core/types/telegram';

export class TelegramService {
  private static CACHE_KEY = 'mkcosmet_telegram_feed_cache';

  public static async fetchFeed(forceRefresh = false): Promise<TelegramFeedResult> {
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
        const updatedAt = Date.now();
        // Update local cache
        try {
          localStorage.setItem(this.CACHE_KEY, JSON.stringify({
            data: json.data,
            timestamp: updatedAt,
          }));
        } catch (e) {
          // ignore storage quota errors
        }
        return { data: json.data as TelegramFeedResponse, source: 'live', updatedAt };
      }

      throw new Error(json.error || 'Invalid API response format');
    } catch (error) {
      console.warn('Telegram feed refresh failed, checking the saved feed:', error);

      // Check local storage cache
      try {
        const cached = localStorage.getItem(this.CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.data && Array.isArray(parsed.data.posts) && Number.isFinite(parsed.timestamp)) {
            return {
              data: parsed.data as TelegramFeedResponse,
              source: 'cache',
              updatedAt: parsed.timestamp,
            };
          }
        }
      } catch (e) {
        // ignore
      }

      throw new Error('Не удалось загрузить предложения из Telegram. Попробуйте ещё раз или откройте канал.');
    }
  }
}
