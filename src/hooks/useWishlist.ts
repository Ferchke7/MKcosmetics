import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage/storageService';

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    setWishlistIds(StorageService.getWishlist());
  }, []);

  const toggleWishlist = (productId: string) => {
    let updated: string[];
    if (wishlistIds.includes(productId)) {
      updated = wishlistIds.filter((id) => id !== productId);
    } else {
      updated = [...wishlistIds, productId];
    }
    setWishlistIds(updated);
    StorageService.saveWishlist(updated);
  };

  const isFavorite = (productId: string) => wishlistIds.includes(productId);

  return {
    wishlistIds,
    toggleWishlist,
    isFavorite,
    count: wishlistIds.length,
  };
}
