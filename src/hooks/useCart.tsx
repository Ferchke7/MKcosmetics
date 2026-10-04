import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CatalogProduct } from '../core/types/catalog';

const CART_STORAGE_KEY = 'mk_cart_krw_v3';

export interface CartContextType {
  items: CartItem[];
  totalCount: number;
  totalAmountKrw: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: CatalogProduct, qty?: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem('mk_cart_krw_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist cart:', e);
    }
  }, [items]);

  const addToCart = (product: CatalogProduct, qty = 1) => {
    // Ensure product object has title/name and photos/images aliases
    const images = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : Array.isArray(product.photos) && product.photos.length > 0
      ? product.photos.map((p) => p.w300 || p.w600 || p.full).filter(Boolean)
      : [];

    const normalizedProduct: CatalogProduct = {
      ...product,
      name: product.name || product.title || 'Товар',
      title: product.title || product.name || 'Товар',
      images,
      priceKrw: product.priceKrw || 0,
    };

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { product: normalizedProduct, quantity: qty }];
    });
  };

  const updateQuantity = (productId: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
    );
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmountKrw = items.reduce(
    (sum, i) => sum + (i.product.priceKrw || 0) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        totalAmountKrw,
        isOpen,
        setIsOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    // Fallback if rendered outside provider so it never crashes
    return {
      items: [],
      totalCount: 0,
      totalAmountKrw: 0,
      isOpen: false,
      setIsOpen: () => {},
      openCart: () => {},
      closeCart: () => {},
      addToCart: () => {},
      updateQuantity: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
    };
  }
  return context;
}
