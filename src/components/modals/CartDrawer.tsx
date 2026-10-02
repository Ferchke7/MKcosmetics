import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CartItem } from '../../core/types/product';
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../core/i18n/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  formattedTotal: string;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  formatPrice: (amt: number) => string;
  onCheckoutWhatsApp: (clientName?: string, address?: string) => string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  formattedTotal,
  onUpdateQty,
  onRemove,
  onClear,
  formatPrice,
  onCheckoutWhatsApp,
}) => {
  const { t } = useLanguage();
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');

  const handleCheckout = () => {
    const url = onCheckoutWhatsApp(clientName, address);
    window.open(url, '_blank');
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={t('cart_title')}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF5EE] text-[#A89F97] flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-serif text-lg text-[#2D2A2E] font-medium">
              {t('cart_empty_title')}
            </h4>
            <p className="text-xs text-[#8C827A] mt-1 max-w-xs">
              {t('cart_empty_desc')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('nav_catalog')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between space-y-6">
          {/* Items List */}
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF7F2] border border-[#F0E6DE]"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-[#A96851] uppercase tracking-wider block">
                    {product.brand}
                  </span>
                  <h5 className="text-xs font-medium text-[#2D2A2E] truncate">
                    {product.name}
                  </h5>
                  <div className="text-xs font-bold text-[#C2836B] mt-1">
                    {formatPrice(product.priceKrw * quantity)}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 bg-white rounded-lg border border-[#EED9CF] p-0.5">
                      <button
                        onClick={() => onUpdateQty(product.id, quantity - 1)}
                        className="p-1 text-[#8C827A] hover:text-[#4D2C20]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold px-1.5">{quantity}</span>
                      <button
                        onClick={() => onUpdateQty(product.id, quantity + 1)}
                        className="p-1 text-[#8C827A] hover:text-[#4D2C20]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemove(product.id)}
                      className="text-xs text-[#A89F97] hover:text-red-500 p-1"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Info & Actions */}
          <div className="border-t border-[#F0E6DE] pt-4 space-y-4">
            <div className="space-y-2">
              <Input
                placeholder={t('order_name_placeholder')}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
              <Input
                placeholder={t('order_city_placeholder')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-sm py-2 border-t border-[#F0E6DE]/60">
              <span className="text-[#6C635B] font-medium">{t('cart_total')}</span>
              <span className="font-serif text-xl font-bold text-[#C2836B]">
                {formattedTotal}
              </span>
            </div>

            <div className="space-y-2">
              <Button
                variant="whatsapp"
                size="lg"
                fullWidth
                onClick={handleCheckout}
                icon={<MessageCircle className="w-5 h-5" />}
              >
                {t('cart_checkout_whatsapp')}
              </Button>

              <button
                onClick={onClear}
                className="w-full text-center text-xs text-[#A89F97] hover:text-[#4D2C20] py-1 cursor-pointer"
              >
                {t('cart_clear')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};
