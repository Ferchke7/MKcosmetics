export type CurrencyCode = 'KRW' | 'RUB' | 'USD' | 'EUR' | 'KZT' | 'UZS';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
  rateToKrw: number; // KRW per 1 unit of currency (or inverse)
  format: (amount: number) => string;
}
