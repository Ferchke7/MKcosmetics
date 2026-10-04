import { useState, useEffect } from 'react';

const WISHLIST_KEY = 'mk_wishlist_ids';

export function useWishlist() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(favoriteIds));
    } catch (e) {
      console.warn('Failed to persist wishlist:', e);
    }
  }, [favoriteIds]);

  const toggleWishlist = (id: number) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: number) => favoriteIds.includes(id);

  return {
    favoriteIds,
    toggleWishlist,
    isFavorite,
    count: favoriteIds.length,
  };
}
