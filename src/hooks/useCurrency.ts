import { useState, useEffect } from 'react';
import { CurrencyCode, CurrencyConfig } from '../core/types/currency';
import { CURRENCIES } from '../core/constants/currencies';
import { StorageService } from '../services/storage/storageService';

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>('RUB');

  useEffect(() => {
    const saved = StorageService.getCurrency();
    setCurrencyState(saved);
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    StorageService.saveCurrency(code);
  };

  const currentConfig: CurrencyConfig = CURRENCIES[currency];

  const formatPrice = (priceKrw: number): string => {
    return currentConfig.format(priceKrw);
  };

  return {
    currency,
    setCurrency,
    currentConfig,
    formatPrice,
    allCurrencies: Object.values(CURRENCIES),
  };
}
