import { TelegramScraperService } from './telegramScraper.js';
import { DbService } from './dbService.js';

export class TelegramSyncWorker {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isSyncing = false;
  private static SYNC_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes

  public static start(): void {
    console.log('🔄 Starting Telegram Background Sync Worker...');
    
    // Initial deep sync on server startup (up to 15 pages)
    this.syncNow(15);

    // Schedule periodic recurring sync (3 pages)
    this.intervalId = setInterval(() => {
      this.syncNow(3);
    }, this.SYNC_INTERVAL_MS);
  }

  public static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public static async syncNow(pages = 4): Promise<{ addedCount: number; totalCount: number }> {
    if (this.isSyncing) {
      return { addedCount: 0, totalCount: DbService.getPosts().length };
    }

    this.isSyncing = true;
    try {
      const { channelInfo, posts } = await TelegramScraperService.scrapeLiveFeed(pages);
      
      if (channelInfo) {
        DbService.saveChannel(channelInfo);
      }

      const added = DbService.upsertPosts(posts);
      const total = DbService.getPosts().length;

      if (added > 0) {
        console.log(`✨ Sync Worker: Added/updated ${added} posts. Total in database: ${total}`);
      } else {
        console.log(`📡 Sync Worker: Feed up to date (Total: ${total} posts)`);
      }

      return { addedCount: added, totalCount: total };
    } catch (err: any) {
      console.warn(`⚠️ Sync Worker error (fallback to local database): ${err.message}`);
      return { addedCount: 0, totalCount: DbService.getPosts().length };
    } finally {
      this.isSyncing = false;
    }
  }
}
