import React, { createContext, useContext, useState, useEffect } from 'react';

const WISHLIST_KEY = 'mk_wishlist_ids';

export interface WishlistContextType {
  favoriteIds: number[];
  toggleWishlist: (id: number) => void;
  isFavorite: (id: number) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    const numId = Number(id);
    if (!numId) return;
    setFavoriteIds((prev) =>
      prev.includes(numId) ? prev.filter((item) => item !== numId) : [...prev, numId]
    );
  };

  const isFavorite = (id: number) => favoriteIds.includes(Number(id));

  return (
    <WishlistContext.Provider
      value={{
        favoriteIds,
        toggleWishlist,
        isFavorite,
        count: favoriteIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    return {
      favoriteIds: [],
      toggleWishlist: () => {},
      isFavorite: () => false,
      count: 0,
    };
  }
  return context;
}
