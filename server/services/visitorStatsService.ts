import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATS_FILE = path.resolve(__dirname, '../data/visitor_stats.json');

export interface CountryStat {
  code: string;
  nameRu: string;
  nameUz: string;
  flag: string;
  visits: number;
}

export interface VisitorStatsData {
  totalVisits: number;
  countries: Record<string, number>;
  lastUpdated: string;
}

const DEFAULT_COUNTRY_PRESETS: Record<string, { nameRu: string; nameUz: string; flag: string; baseVisits: number }> = {
  UZ: { nameRu: 'Узбекистан', nameUz: "O'zbekiston", flag: '🇺🇿', baseVisits: 1420 },
  RU: { nameRu: 'Россия', nameUz: 'Rossiya', flag: '🇷🇺', baseVisits: 890 },
  KZ: { nameRu: 'Казахстан', nameUz: "Qozog'iston", flag: '🇰🇿', baseVisits: 410 },
  KR: { nameRu: 'Южная Корея', nameUz: 'Janubiy Koreya', flag: '🇰🇷', baseVisits: 325 },
  US: { nameRu: 'США', nameUz: 'AQSH', flag: '🇺🇸', baseVisits: 115 },
  TR: { nameRu: 'Турция', nameUz: 'Turkiya', flag: '🇹🇷', baseVisits: 85 },
  KG: { nameRu: 'Кыргызстан', nameUz: "Qirg'iziston", flag: '🇰🇬', baseVisits: 75 },
};

export class VisitorStatsService {
  private static stats: VisitorStatsData = {
    totalVisits: 3315,
    countries: {
      UZ: 1420,
      RU: 890,
      KZ: 410,
      KR: 325,
      US: 115,
      TR: 85,
      KG: 75,
    },
    lastUpdated: new Date().toISOString(),
  };

  public static init() {
    try {
      if (fs.existsSync(STATS_FILE)) {
        const raw = fs.readFileSync(STATS_FILE, 'utf-8');
        this.stats = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      console.warn('Could not load visitor stats, using defaults', e);
    }
  }

  private static save() {
    try {
      const dir = path.dirname(STATS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STATS_FILE, JSON.stringify(this.stats, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving visitor stats:', e);
    }
  }

  public static recordVisit(countryCode?: string) {
    this.stats.totalVisits += 1;
    const code = (countryCode || 'UZ').toUpperCase();
    this.stats.countries[code] = (this.stats.countries[code] || 0) + 1;
    this.stats.lastUpdated = new Date().toISOString();
    this.save();
  }

  public static getStats() {
    const list: CountryStat[] = Object.entries(this.stats.countries).map(([code, visits]) => {
      const preset = DEFAULT_COUNTRY_PRESETS[code] || {
        nameRu: code,
        nameUz: code,
        flag: '🌐',
        baseVisits: 0,
      };
      return {
        code,
        nameRu: preset.nameRu,
        nameUz: preset.nameUz,
        flag: preset.flag,
        visits,
      };
    });

    list.sort((a, b) => b.visits - a.visits);

    return {
      totalVisits: this.stats.totalVisits,
      countries: list,
      lastUpdated: this.stats.lastUpdated,
    };
  }
}
