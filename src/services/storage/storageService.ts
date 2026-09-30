import { CartItem } from '../../core/types/product';
import { CurrencyCode } from '../../core/types/currency';

const CART_KEY = 'mkcosmet_cart';
const WISHLIST_KEY = 'mkcosmet_wishlist';
const CURRENCY_KEY = 'mkcosmet_currency';

export class StorageService {
  // Cart
  public static getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveCart(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }

  // Wishlist
  public static getWishlist(): string[] {
    try {
      const data = localStorage.getItem(WISHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveWishlist(ids: string[]): void {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }

  // Currency
  public static getCurrency(): CurrencyCode {
    try {
      const data = localStorage.getItem(CURRENCY_KEY) as CurrencyCode;
      if (data && ['KRW', 'RUB', 'USD', 'EUR', 'KZT', 'UZS'].includes(data)) {
        return data;
      }
    } catch {
      // ignore
    }
    return 'RUB'; // Default to RUB or USD as primary international audience
  }

  public static saveCurrency(code: CurrencyCode): void {
    try {
      localStorage.setItem(CURRENCY_KEY, code);
    } catch {
      // ignore
    }
  }
}
