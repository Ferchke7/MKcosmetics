import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ScrapedTelegramPost, ChannelInfo } from './telegramScraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const CHANNEL_FILE = path.join(DATA_DIR, 'channel.json');

// Default initial fallback channel profile
const DEFAULT_CHANNEL: ChannelInfo = {
  title: 'MK KOREA COSMETIC',
  username: '@mkcosmetkor',
  description: '👑 Корейская косметика премиум-класса • Прямые поставки из Сеула • Доставка до дверей во все страны ✈️ • 100% оригинал • Оптом и в розницу • Консультации 24/7',
  avatarUrl: 'https://cdn5.telesco.pe/file/LrwC6ts6S58ITMMKK7AsAmMM0KVnQBrw7pNF9KPYX7pba5bmdN9U1Cmm7JrNP7fEF7yF-L1o_p9r17u7m2S9PKf50AnariV1_iyhY-GCU3ecNrWPIrPuenjXPwX6RsmWJm6JLoEQfkQ9jR9RRXkgfpEqZGp5uwOhzmpHwZqermQ8QBRyr4_ZUvRAEKFlVPvVN-EO_1-4bhRngkftolPVd2GEoq1MO-FBEu0L67A4CGK6t2TFZ1xocaN2LAeTLWwX2LPpe6F678ENUye6aFOiYWOh3MUe4MA3Ma5SM_-uamSjv-Tdp3ofj98VIKpXag3TF7BzvhBsGbnUw46HCIUDdw.jpg',
  subscribersCount: '1.5K',
  photosCount: '8.2K',
  videosCount: '2.9K',
};

export class DbService {
  private static inMemoryPosts: ScrapedTelegramPost[] = [];
  private static inMemoryChannel: ChannelInfo = DEFAULT_CHANNEL;
  private static lastSyncTime: number = 0;

  public static init(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // Load Channel Info
      if (fs.existsSync(CHANNEL_FILE)) {
        const raw = fs.readFileSync(CHANNEL_FILE, 'utf-8');
        this.inMemoryChannel = JSON.parse(raw);
      } else {
        this.saveChannel(DEFAULT_CHANNEL);
      }

      // Load Posts
      if (fs.existsSync(POSTS_FILE)) {
        const raw = fs.readFileSync(POSTS_FILE, 'utf-8');
        this.inMemoryPosts = JSON.parse(raw);
        console.log(`💾 Loaded ${this.inMemoryPosts.length} posts from local JSON database (${POSTS_FILE})`);
      } else {
        console.log('💾 Initializing new posts database...');
        this.inMemoryPosts = [];
      }
    } catch (err) {
      console.error('Failed to initialize DbService from disk:', err);
    }
  }

  public static getPosts(): ScrapedTelegramPost[] {
    return this.inMemoryPosts;
  }

  public static getChannel(): ChannelInfo {
    return this.inMemoryChannel;
  }

  public static getLastSync(): number {
    return this.lastSyncTime;
  }

  public static saveChannel(channel: ChannelInfo): void {
    this.inMemoryChannel = channel;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(CHANNEL_FILE, JSON.stringify(channel, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving channel.json:', err);
    }
  }

  /**
   * Merges incoming posts with existing ones by ID, deduplicating and sorting newest first.
   * Returns the count of newly added posts.
   */
  public static upsertPosts(newPosts: ScrapedTelegramPost[]): number {
    const map = new Map<string, ScrapedTelegramPost>();

    // 1. Add existing posts
    for (const p of this.inMemoryPosts) {
      map.set(p.id, p);
    }

    let addedCount = 0;

    // 2. Upsert new posts
    for (const p of newPosts) {
      if (!map.has(p.id)) {
        addedCount++;
      }
      // Update with latest scraped details (preserving photo arrays if incoming has more)
      const existing = map.get(p.id);
      if (existing && existing.photos.length > p.photos.length) {
        map.set(p.id, { ...p, photos: existing.photos });
      } else {
        map.set(p.id, p);
      }
    }

    // 3. Sort newest first
    const sorted = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
    this.inMemoryPosts = sorted;
    this.lastSyncTime = Date.now();

    // 4. Persist to disk
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(POSTS_FILE, JSON.stringify(sorted, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving posts.json:', err);
    }

    return addedCount;
  }
}
