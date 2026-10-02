export interface SanitizedPostContent {
  title: string;
  brand: string;
  volume?: string;
  weight?: string;
  priceKrw?: number;
  originalPriceKrw?: number;
  discountPercent?: number;
  rubPrice?: number;
  usdPrice?: number;
  eurPrice?: number;
  kztPrice?: number;
  uzsPrice?: number;
  descriptionParagraphs: string[];
  benefits: string[];
  keyIngredients: string[];
  howToUse?: string;
  rawTags: string[];
}

const KNOWN_BRANDS = [
  'The History of Whoo',
  'Whoo',
  'Sulwhasoo',
  'Oshiaree',
  'Ryo',
  'Medi-Peel',
  'MediPeel',
  'Manyo Factory',
  'Manyo',
  'Round Lab',
  'Anua',
  'Beauty of Joseon',
  'Laneige',
  'Dr.Jart+',
  'Innisfree',
  'Skin1004',
  'Torriden',
  'Cosrx',
  'VT Cosmetics',
  'VT',
  'Missha',
  'Hera',
  'Iope',
  'OHUI',
  'SU:M37',
  'Sum37',
  'AHC',
  'Banila Co',
  'Heimish',
  'Pyunkang Yul',
  'Clio',
  'Peripera',
  'Rom&nd',
  'Tirtir',
  'D\'Alba',
  'Dalba',
  'CNP Rx',
  'CNP',
  'Abib',
  'Isoi',
  'Hanyul',
  'Illiyoon',
  'Etude',
  'TonyMoly',
];

const INGREDIENT_KEYWORDS = [
  'PHA комплекс',
  'PHA-кислоты',
  'AHA/BHA',
  'Волюфилин',
  'Volufiline',
  'Пептидный комплекс',
  '5 пептидов',
  'Экстракт женьшеня',
  'Красный женьшень',
  'Дикий женьшень',
  'Золото 24К',
  '24K золото',
  'Бифидобактерии',
  'Bifida Biome',
  'Пробиотики',
  'Березовый сок',
  'Гиалуроновая кислота',
  'Экстракт хауттюйнии',
  'Хауттюйния 77%',
  'Экстракт прополиса',
  'Прополис 60%',
  'Ниацинамид',
  'Центелла азиатская',
  'Пантенол',
  'Коллаген',
  'Ретинол',
  'Витамин C',
  'Стволовые клетки',
  'PST-CELL',
  'Экстракт софоры',
  'Экстракт зеленого чая',
];

/**
 * Strips flags, currency dumps, and duplicate descriptions from the raw title.
 */
export function cleanProductTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  let t = rawTitle;

  // 1. Cut off at "Описание:" if concatenated
  const opIdx = t.indexOf('Описание:');
  if (opIdx > 0) {
    t = t.substring(0, opIdx);
  }

  // 2. Cut off at first flag or price indicator: 🇰🇷 🇷🇺 🇺🇸 🇺🇲 🇪🇺 🇰🇿 ❌ ✅ ₩ ₽ $ € ₸
  const flagMatch = t.match(/(?:🇰🇷|🇷🇺|🇺🇸|🇺🇲|🇪🇺|🇰🇿|🇺🇿|❌|✅|₩|₽|\$|€|₸|\b\d{2,3}[.,]\d{3}\s*(?:вон|won|руб|₽|usd|\$|eur|€|т|kzt))/i);
  if (flagMatch && flagMatch.index !== undefined && flagMatch.index > 3) {
    t = t.substring(0, flagMatch.index);
  }

  // 3. Remove emoji symbols and bullets at start & end
  t = t.replace(/^[👑✨🌸💥💎🔥✔️❌▫️•—\-–\s]+/, '');
  t = t.replace(/[👑✨🌸💥💎🔥✔️❌▫️•—\-–\s]+$/, '');

  // 4. Remove leading/trailing quotes
  t = t.replace(/^["'«]+|["'»]+$/g, '');

  return t.trim() || 'Корейский уход';
}

/**
 * Extracts prices, discounts, and clean metadata from raw post text.
 */
export function sanitizeTelegramText(rawText: string, fallbackTitle?: string): SanitizedPostContent {
  if (!rawText || rawText.trim() === '') {
    return {
      title: cleanProductTitle(fallbackTitle || 'Корейская косметика'),
      brand: 'Корея (Премиум)',
      descriptionParagraphs: ['Оригинальная премиальная косметика из Южной Кореи.'],
      benefits: [],
      keyIngredients: [],
      rawTags: [],
    };
  }

  const rawTags: string[] = (rawText.match(/#[a-zA-Zа-яА-Я0-9_]+/g) || []).map((t) => t.replace('#', ''));

  // Parse prices and discounts from text
  let originalPriceKrw: number | undefined;
  let priceKrw: number | undefined;
  let rubPrice: number | undefined;
  let usdPrice: number | undefined;
  let eurPrice: number | undefined;
  let kztPrice: number | undefined;

  // 1. Check crossed-out original KRW price (with ❌)
  const oldKrwMatch = rawText.match(/❌\s*([0-9.,]+)\s*(?:вон|₩|won)/i);
  if (oldKrwMatch) {
    const parsed = parseInt(oldKrwMatch[1].replace(/[.,]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 500) {
      originalPriceKrw = parsed;
    }
  }

  // 2. Check active sale KRW price (preceded by ✅ or standard)
  const saleKrwMatch = rawText.match(/(?:✅|✔️)\s*([0-9.,]+)\s*(?:вон|₩|won)/i);
  if (saleKrwMatch) {
    const parsed = parseInt(saleKrwMatch[1].replace(/[.,]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 500) {
      priceKrw = parsed;
    }
  } else {
    // If no ✅, find any KRW price not preceded by ❌
    const generalKrwMatch = rawText.match(/(?<!❌\s*)([0-9.,]+)\s*(?:вон|₩|won)/i);
    if (generalKrwMatch) {
      const parsed = parseInt(generalKrwMatch[1].replace(/[.,]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 500) {
        priceKrw = parsed;
      }
    }
  }

  // If we only found one KRW price and it was tagged as original, use it as regular price
  if (!priceKrw && originalPriceKrw) {
    priceKrw = originalPriceKrw;
    originalPriceKrw = undefined;
  }

  // Calculate discount percentage
  let discountPercent: number | undefined;
  if (originalPriceKrw && priceKrw && originalPriceKrw > priceKrw) {
    discountPercent = Math.round(((originalPriceKrw - priceKrw) / originalPriceKrw) * 100);
  }

  // Parse other currencies
  const rubMatch = rawText.match(/(?:✅|✔️)?\s*([0-9\s.,]+)\s*(?:₽|руб|rub)/i);
  if (rubMatch) {
    const parsed = parseInt(rubMatch[1].replace(/[^\d]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 50) rubPrice = parsed;
  }

  const usdMatch = rawText.match(/(?:✅|✔️)?\s*([0-9.,]+)\s*(?:\$|usd|долл)/i);
  if (usdMatch) {
    const parsed = parseFloat(usdMatch[1].replace(/[^\d.]/g, ''));
    if (!isNaN(parsed) && parsed > 0) usdPrice = parsed;
  }

  const eurMatch = rawText.match(/(?:✅|✔️)?\s*([0-9.,]+)\s*(?:€|eur|евро)/i);
  if (eurMatch) {
    const parsed = parseFloat(eurMatch[1].replace(/[^\d.]/g, ''));
    if (!isNaN(parsed) && parsed > 0) eurPrice = parsed;
  }

  const kztMatch = rawText.match(/(?:✅|✔️)?\s*([0-9\s.,]+)\s*(?:т|тг|kzt|тенге)/i);
  if (kztMatch) {
    const parsed = parseInt(kztMatch[1].replace(/[^\d]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 100) kztPrice = parsed;
  }

  // 3. Extract Clean Title from first non-price line
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let rawTitleLine = lines.length > 0 ? lines[0] : '';
  let title = cleanProductTitle(rawTitleLine || fallbackTitle || '');

  // 4. Extract Brand
  let brand: string | undefined;
  for (const b of KNOWN_BRANDS) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(rawText) || new RegExp(`\\b${b}\\b`, 'i').test(title)) {
      brand = b;
      break;
    }
  }

  if (!brand && title) {
    const firstWord = title.split(' ')[0];
    if (firstWord && firstWord.length > 2 && /^[A-Za-zА-Яа-я0-9\-]+$/.test(firstWord)) {
      brand = firstWord.toUpperCase();
    } else {
      brand = 'Корейский уход';
    }
  }

  // 5. Extract Volume / Weight
  let volume: string | undefined;
  let weight: string | undefined;
  let howToUse: string | undefined;
  const descriptionParagraphs: string[] = [];
  const benefits: string[] = [];

  const weightMatch = rawText.match(/(?:ВЕС|вес|weight):\s*([0-9\s.,]+(?:гр|г|g|ml|мл))/i);
  if (weightMatch) {
    weight = weightMatch[1].trim();
  }

  const volumeMatch = rawText.match(/(?:Объем|Объём|кол-во|состав набора|volume|упаковке):\s*([^\n]+)/i);
  if (volumeMatch) {
    volume = volumeMatch[1].trim();
  }

  const howToMatch = rawText.match(/(?:способ применения|применение):\s*([^\n]+)/i);
  if (howToMatch) {
    howToUse = howToMatch[1].trim();
  }

  // 6. Clean and deduplicate description paragraphs
  const seenParagraphs = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip price dumps and headers
    if (
      line.match(/^(?:🇰🇷|🇷🇺|🇺🇸|🇺🇲|🇪🇺|🇰🇿|🇺🇿|✔️|❌|✅|₩|₽|\$|€|₸|вон|руб)/i) ||
      line.includes('Цены актуальны на день') ||
      line.includes('обращайтесь к нашим консультантам') ||
      line.includes('На связи 24/7') ||
      line.includes('ватсап') ||
      line.includes('Доставка во все страны') ||
      line.includes('Доставка до дверей') ||
      line.startsWith('#') ||
      line.toLowerCase().startsWith('описание:')
    ) {
      continue;
    }

    // Bullet points / benefits
    if (line.startsWith('-') || line.startsWith('•') || line.startsWith('▫️') || line.startsWith('—') || line.match(/^[1-9]\./)) {
      const cleanBullet = line.replace(/^[-•▫️—\d.\s]+/, '').replace(/^[👑✨🌸💎🔥✔️❌\s]+/, '').trim();
      if (cleanBullet.length > 5 && !seenParagraphs.has(cleanBullet)) {
        seenParagraphs.add(cleanBullet);
        benefits.push(cleanBullet);
      }
      continue;
    }

    // Normal paragraph
    const cleaned = line.replace(/<[^>]*>/g, '').replace(/^[👑✨🌸💥💎🔥✔️❌\s]+/, '').trim();
    if (cleaned.length > 15 && !cleaned.toLowerCase().includes('нажмите') && !cleaned.toLowerCase().includes('подписывайтесь') && cleaned !== rawTitleLine) {
      if (!seenParagraphs.has(cleaned)) {
        seenParagraphs.add(cleaned);
        descriptionParagraphs.push(cleaned);
      }
    }
  }

  // 7. Extract Key Ingredients
  const keyIngredients: string[] = [];
  for (const ing of INGREDIENT_KEYWORDS) {
    if (new RegExp(ing, 'i').test(rawText) && !keyIngredients.includes(ing)) {
      keyIngredients.push(ing);
    }
  }

  return {
    title: title || 'Корейская косметика',
    brand: brand || 'Корейский уход',
    volume: volume || weight,
    weight,
    priceKrw,
    originalPriceKrw,
    discountPercent,
    rubPrice,
    usdPrice,
    eurPrice,
    kztPrice,
    descriptionParagraphs: descriptionParagraphs.length > 0 ? descriptionParagraphs : ['Оригинальный премиальный уход прямо из Сеула.'],
    benefits: benefits.slice(0, 5),
    keyIngredients: keyIngredients.slice(0, 6),
    howToUse,
    rawTags,
  };
}
