export interface SanitizedPostContent {
  title: string;
  brand?: string;
  volume?: string;
  weight?: string;
  descriptionParagraphs: string[];
  benefits: string[];
  keyIngredients: string[];
  howToUse?: string;
  rawTags: string[];
}

const KNOWN_BRANDS = [
  'CNP Rx',
  'CNP',
  'The History of Whoo',
  'Whoo',
  'Sulwhasoo',
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
  'Ниацинамид 2%',
  'Центелла азиатская',
  'Пантенол',
  'Коллаген',
  'Ретинол',
  'Витамин C',
];

export function sanitizeTelegramText(rawText: string, fallbackTitle?: string): SanitizedPostContent {
  if (!rawText || rawText.trim() === '') {
    return {
      title: fallbackTitle || 'Публикация из Telegram',
      descriptionParagraphs: ['Описание в публикации отсутствует.'],
      benefits: [],
      keyIngredients: [],
      rawTags: [],
    };
  }

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let title = fallbackTitle || '';
  let volume: string | undefined;
  let weight: string | undefined;
  let howToUse: string | undefined;
  const descriptionParagraphs: string[] = [];
  const benefits: string[] = [];
  const rawTags: string[] = (rawText.match(/#[a-zA-Zа-яА-Я0-9_]+/g) || []).map((t) => t.replace('#', ''));

  // Detect brand
  let brand: string | undefined;
  for (const b of KNOWN_BRANDS) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(rawText)) {
      brand = b;
      break;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Skip raw price dumps and channel disclaimer lines
    if (
      line.match(/^(?:🇰🇷|🇷🇺|🇺🇸|🇪🇺|🇰🇿|🇺🇿|✔️|❌|₩|₽|\$|€|₸|вон|руб)/i) ||
      line.includes('Цены актуальны на день') ||
      line.includes('обращайтесь к нашим консультантам') ||
      line.includes('На связи 24/7') ||
      line.includes('ватсап') ||
      line.includes('Доставка во все страны') ||
      line.includes('Доставка до дверей') ||
      line.startsWith('#')
    ) {
      continue;
    }

    // 2. Extract Volume / Weight
    const weightMatch = line.match(/(?:ВЕС|вес|weight):\s*([0-9\s.,]+(?:гр|г|g|ml|мл))/i);
    if (weightMatch) {
      weight = weightMatch[1].trim();
      continue;
    }

    const volumeMatch = line.match(/(?:Объем|Объём|кол-во|состав набора|volume):\s*(.+)/i);
    if (volumeMatch) {
      volume = volumeMatch[1].trim();
      continue;
    }

    // 3. Extract How to Use
    if (line.toLowerCase().startsWith('способ применения:') || line.toLowerCase().startsWith('применение:')) {
      howToUse = line.replace(/^(?:способ применения|применение):\s*/i, '').trim();
      continue;
    }

    // 4. First valid non-empty line as Title
    if (!title && line.length > 3) {
      title = line.replace(/^[👑✨🌸💥💎🔥✔️❌▫️•\s]+/, '').trim();
      continue;
    }

    // 5. Extract Benefits / Bullet points
    if (
      line.startsWith('-') ||
      line.startsWith('•') ||
      line.startsWith('▫️') ||
      line.startsWith('—') ||
      line.match(/^[1-9]\./)
    ) {
      const cleanBullet = line
        .replace(/^[-•▫️—\d.\s]+/, '')
        .replace(/^[👑✨🌸💎🔥✔️❌\s]+/, '')
        .trim();
      if (cleanBullet.length > 3) {
        benefits.push(cleanBullet);
      }
      continue;
    }

    // 6. Clean regular paragraph
    const cleaned = line
      .replace(/<[^>]*>/g, '')
      .replace(/^[👑✨🌸💥💎🔥✔️❌\s]+/, '')
      .trim();

    if (cleaned.length > 10 && !cleaned.toLowerCase().includes('нажмите') && !cleaned.toLowerCase().includes('подписывайтесь')) {
      descriptionParagraphs.push(cleaned);
    }
  }

  // Detect Key Active Ingredients from entire text
  const keyIngredients: string[] = [];
  for (const ing of INGREDIENT_KEYWORDS) {
    if (new RegExp(ing, 'i').test(rawText) && !keyIngredients.includes(ing)) {
      keyIngredients.push(ing);
    }
  }

  return {
    title: title || fallbackTitle || 'Публикация из Telegram',
    brand,
    volume: volume || weight,
    weight,
    descriptionParagraphs: descriptionParagraphs.length > 0 ? descriptionParagraphs : ['Описание в публикации отсутствует.'],
    benefits,
    keyIngredients,
    howToUse,
    rawTags,
  };
}
