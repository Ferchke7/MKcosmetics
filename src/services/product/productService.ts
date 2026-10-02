import { Product, ProductCategory, SkinConcern, ProductSortOption } from '../../core/types/product';
import { TelegramPost } from '../../core/types/telegram';
import { sanitizeTelegramText } from '../../utils/textSanitizer';

export class ProductService {
  /**
   * Converts a scraped Telegram post into a structured Product object.
   */
  public static telegramPostToProduct(post: TelegramPost): Product {
    const sanitized = sanitizeTelegramText(post.text, post.productTitle);
    const photos = Array.isArray(post.photos) && post.photos.length > 0
      ? post.photos
      : ['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800'];

    const priceKrw = post.prices?.krw || 0;
    const originalPriceKrw = post.prices?.originalKrw;
    const discountPercent =
      originalPriceKrw && priceKrw && originalPriceKrw > priceKrw
        ? Math.round(((originalPriceKrw - priceKrw) / originalPriceKrw) * 100)
        : undefined;

    const lowerText = `${post.text || ''} ${(post.tags || []).join(' ')} ${sanitized.title}`.toLowerCase();

    // Determine category
    let category: ProductCategory = 'all';
    if (lowerText.includes('anti-age') || lowerText.includes('омолож') || lowerText.includes('морщин') || lowerText.includes('лифтинг')) {
      category = 'anti-aging';
    } else if (lowerText.includes('очищен') || lowerText.includes('пилинг') || lowerText.includes('пенка') || lowerText.includes('гидрофил')) {
      category = 'peeling-cleansing';
    } else if (lowerText.includes('набор') || lowerText.includes('сет') || lowerText.includes('set')) {
      category = 'sets';
    } else if (lowerText.includes('сыворотк') || lowerText.includes('серум') || lowerText.includes('увлажн') || lowerText.includes('ампул')) {
      category = 'hydration-serums';
    } else if (lowerText.includes('spf') || lowerText.includes('спф') || lowerText.includes('солнц') || lowerText.includes('sun')) {
      category = 'sun-care';
    } else if (lowerText.includes('whoo') || lowerText.includes('sulwhasoo') || lowerText.includes('премиум') || lowerText.includes('люкс')) {
      category = 'premium-luxury';
    }

    // Determine skin concerns
    const skinConcerns: SkinConcern[] = [];
    if (lowerText.includes('морщин') || lowerText.includes('возраст') || lowerText.includes('anti-age') || lowerText.includes('зрел')) skinConcerns.push('anti-age');
    if (lowerText.includes('увлажн') || lowerText.includes('сухост') || lowerText.includes('обезвож') || lowerText.includes('гиалурон')) skinConcerns.push('hydration');
    if (lowerText.includes('осветл') || lowerText.includes('тон') || lowerText.includes('сияни') || lowerText.includes('витамин c') || lowerText.includes('ниацинамид')) skinConcerns.push('brightening');
    if (lowerText.includes('пор') || lowerText.includes('акне') || lowerText.includes('высыпан') || lowerText.includes('черн') || lowerText.includes('прыщ')) skinConcerns.push('pores-acne');
    if (lowerText.includes('чувствительн') || lowerText.includes('купероз') || lowerText.includes('покраснен') || lowerText.includes('центелл') || lowerText.includes('пантенол')) skinConcerns.push('sensitive');
    if (lowerText.includes('пигмент') || lowerText.includes('пятн')) skinConcerns.push('pigmentation');
    if (lowerText.includes('лифтинг') || lowerText.includes('упругост') || lowerText.includes('овал') || lowerText.includes('волюфилин')) skinConcerns.push('lifting');

    const totalReactions = (post.reactions || []).reduce((sum, r) => sum + (r.count || 0), 0);
    const viewsNum = parseInt((post.views || '').replace(/[^0-9]/g, ''), 10) || 0;
    const isBestseller = totalReactions > 3 || viewsNum > 400 || lowerText.includes('хит') || lowerText.includes('bestseller') || lowerText.includes('топ');
    const isNew = post.timestamp ? Date.now() - post.timestamp < 14 * 24 * 60 * 60 * 1000 : false;

    return {
      id: post.id,
      name: post.productTitle || sanitized.title,
      brand: sanitized.brand || 'Корейский уход',
      category,
      skinConcerns: skinConcerns.length > 0 ? skinConcerns : ['hydration'],
      description: sanitized.descriptionParagraphs.join('\n\n'),
      shortDescription: sanitized.descriptionParagraphs[0] || sanitized.title,
      priceKrw,
      originalPriceKrw,
      discountPercent,
      images: photos,
      volume: sanitized.volume,
      weight: sanitized.weight,
      rating: 4.8 + Math.min(0.2, (totalReactions % 3) * 0.1),
      reviewCount: Math.max(15, totalReactions * 4 + (viewsNum % 25)),
      isBestseller,
      isNew,
      inStock: true,
      keyIngredients: sanitized.keyIngredients,
      benefits: sanitized.benefits,
      howToUse: sanitized.howToUse,
      telegramPostUrl: post.postUrl,
      tags: post.tags || sanitized.rawTags || [],
      timestamp: post.timestamp,
      views: post.views,
      reactionsCount: totalReactions,
    };
  }

  /**
   * Transforms an array of Telegram posts into products.
   */
  public static fromTelegramPosts(posts: TelegramPost[]): Product[] {
    return (posts || []).map((post) => this.telegramPostToProduct(post));
  }

  /**
   * Filters and sorts an array of products based on comprehensive options.
   */
  public static filterAndSort(
    products: Product[],
    params: {
      category?: ProductCategory | string;
      brand?: string;
      skinConcern?: SkinConcern | 'all';
      searchQuery?: string;
      sortBy?: ProductSortOption;
      onlyDiscount?: boolean;
      onlyWithPrice?: boolean;
    }
  ): Product[] {
    let result = [...products];

    // Filter by Category or Tag
    if (params.category && params.category !== 'all') {
      const catLower = params.category.toLowerCase();
      result = result.filter((p) => {
        if (p.category === params.category) return true;
        if (p.tags && p.tags.some((t) => t.toLowerCase() === catLower)) return true;
        return false;
      });
    }

    // Filter by Brand
    if (params.brand && params.brand !== 'all') {
      const brandLower = params.brand.toLowerCase();
      result = result.filter((p) => p.brand.toLowerCase() === brandLower);
    }

    // Filter by Skin Concern
    if (params.skinConcern && params.skinConcern !== 'all') {
      result = result.filter((p) => p.skinConcerns.includes(params.skinConcern as SkinConcern));
    }

    // Filter by Discount
    if (params.onlyDiscount) {
      result = result.filter((p) => Boolean(p.discountPercent && p.discountPercent > 0));
    }

    // Filter by Price presence
    if (params.onlyWithPrice) {
      result = result.filter((p) => p.priceKrw > 0);
    }

    // Filter by Search Query
    if (params.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const brandMatch = p.brand.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        const ingMatch = p.keyIngredients.some((ing) => ing.toLowerCase().includes(q));
        const tagMatch = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        return nameMatch || brandMatch || descMatch || ingMatch || tagMatch;
      });
    }

    // Sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'newest':
          result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          break;
        case 'oldest':
          result.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          break;
        case 'price-asc':
          result.sort((a, b) => {
            if (a.priceKrw === 0) return 1;
            if (b.priceKrw === 0) return -1;
            return a.priceKrw - b.priceKrw;
          });
          break;
        case 'price-desc':
          result.sort((a, b) => b.priceKrw - a.priceKrw);
          break;
        case 'discount':
          result.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
          break;
        case 'popular':
          result.sort((a, b) => {
            const scoreA = (a.isBestseller ? 100 : 0) + (a.reactionsCount || 0) * 10;
            const scoreB = (b.isBestseller ? 100 : 0) + (b.reactionsCount || 0) * 10;
            return scoreB - scoreA;
          });
          break;
        case 'name-asc':
          result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
          break;
        default:
          result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          break;
      }
    } else {
      result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }

    return result;
  }
}
