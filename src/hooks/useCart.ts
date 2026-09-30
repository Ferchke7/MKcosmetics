import { useState, useEffect } from 'react';
import { CartItem, Product } from '../core/types/product';
import { StorageService } from '../services/storage/storageService';
import { buildWhatsAppUrl } from '../core/constants/brand';

export function useCart(formatPrice: (amt: number) => string) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setItems(StorageService.getCart());
  }, []);

  const saveAndSetItems = (newItems: CartItem[]) => {
    setItems(newItems);
    StorageService.saveCart(newItems);
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existingIndex = items.findIndex((item) => item.product.id === product.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...items, { product, quantity }];
    }
    saveAndSetItems(updated);
    setIsDrawerOpen(true);
  };

  const removeFromCart = (productId: string) => {
    const updated = items.filter((item) => item.product.id !== productId);
    saveAndSetItems(updated);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = items.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveAndSetItems(updated);
  };

  const clearCart = () => {
    saveAndSetItems([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalKrw = items.reduce((sum, item) => sum + item.product.priceKrw * item.quantity, 0);

  const generateWhatsAppOrderLink = (clientName?: string, address?: string): string => {
    let text = `🌸 *Здравствуйте, Мухаббат! Хочу оформить заказ в MK KOREA COSMETIC:*\n\n`;
    items.forEach((item, index) => {
      text += `${index + 1}. *${item.product.name}*\n   Кол-во: ${item.quantity} шт. | ${formatPrice(item.product.priceKrw * item.quantity)}\n`;
    });
    text += `\n💰 *Итого:* ${formatPrice(totalKrw)}\n`;
    if (clientName) text += `👤 *Имя:* ${clientName}\n`;
    if (address) text += `📍 *Адрес / Страна доставки:* ${address}\n`;
    text += `\nПожалуйста, подтвердите наличие и стоимость доставки ✨`;

    return buildWhatsAppUrl(text);
  };

  return {
    items,
    totalCount,
    totalKrw,
    formattedTotal: formatPrice(totalKrw),
    isDrawerOpen,
    setIsDrawerOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    generateWhatsAppOrderLink,
  };
}
