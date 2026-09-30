import { TelegramScraperService } from './telegramScraper.js';
import { DbService } from './dbService.js';

export class TelegramSyncWorker {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isSyncing = false;
  private static SYNC_INTERVAL_MS = 60 * 1000; // 60 seconds

  public static start(): void {
    console.log('🔄 Starting Telegram Background Sync Worker (interval: 60s)...');
    
    // Run initial sync immediately
    this.syncNow();

    // Schedule recurring sync
    this.intervalId = setInterval(() => {
      this.syncNow();
    }, this.SYNC_INTERVAL_MS);
  }

  public static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public static async syncNow(): Promise<{ addedCount: number; totalCount: number }> {
    if (this.isSyncing) {
      return { addedCount: 0, totalCount: DbService.getPosts().length };
    }

    this.isSyncing = true;
    try {
      const { channelInfo, posts } = await TelegramScraperService.scrapeLiveFeed();
      
      if (channelInfo) {
        DbService.saveChannel(channelInfo);
      }

      const added = DbService.upsertPosts(posts);
      const total = DbService.getPosts().length;

      if (added > 0) {
        console.log(`✨ Telegram Sync Worker: Saved ${added} new posts! Total in database: ${total}`);
      } else {
        console.log(`📡 Telegram Sync Worker: Feed up to date (Total: ${total} posts)`);
      }

      return { addedCount: added, totalCount: total };
    } catch (err: any) {
      console.warn(`⚠️ Telegram Sync Worker error (relying on persistent database): ${err.message}`);
      return { addedCount: 0, totalCount: DbService.getPosts().length };
    } finally {
      this.isSyncing = false;
    }
  }
}
