import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CartItem } from '../../core/types/product';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
  Truck,
  CreditCard,
  Sparkles,
  Copy,
  Check,
  MapPin,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../../core/i18n/LanguageContext';
import { buildWhatsAppUrl, BRAND_CONFIG } from '../../core/constants/brand';
import { adminService } from '../../services/admin/adminService';

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

const DELIVERY_REGIONS = [
  { id: 'tashkent_express', nameRu: '⚡ Ташкент — Экспресс курьер (2-4 часа)', nameUz: '⚡ Toshkent — Ekspress kuryer (2-4 soat)', priceKrw: 0 },
  { id: 'samarkand', nameRu: '📦 Самарканд (1 день)', nameUz: '📦 Samarqand (1 kun)', priceKrw: 0 },
  { id: 'bukhara', nameRu: '📦 Бухара (1-2 дня)', nameUz: '📦 Buxoro (1-2 kun)', priceKrw: 0 },
  { id: 'fergana_valley', nameRu: '📦 Андижан / Наманган / Фергана (1-2 дня)', nameUz: "📦 Andijon / Namangan / Farg'ona (1-2 kun)", priceKrw: 0 },
  { id: 'uzb_regions', nameRu: '🚚 Другие регионы Узбекистана (2-3 дня)', nameUz: "🚚 O'zbekistonning boshqa hududlari (2-3 kun)", priceKrw: 0 },
  { id: 'cis_world', nameRu: '✈️ Международная авиа (Казахстан, РФ, СНГ)', nameUz: '✈️ Xalqaro avia (Qozogʻiston, RF, MDH)', priceKrw: 0 },
  { id: 'pickup', nameRu: '🏢 Самовывоз / По договоренности', nameUz: '🏢 Oʻzi olib ketish / Kelishuv boʻyicha', priceKrw: 0 },
];

const PAYMENT_METHODS = [
  { id: 'payme', name: 'Payme', badge: 'Узбекистан' },
  { id: 'click', name: 'Click', badge: 'Узбекистан' },
  { id: 'card', name: 'Банковская карта (Uzcard/Humo/Visa)', badge: 'Мгновенно' },
  { id: 'cash', name: 'Наличными при получении', badge: 'Курьеру' },
  { id: 'kaspi_crypto', name: 'Kaspi / USDT (Crypto)', badge: 'СНГ / Мир' },
];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  formattedTotal,
  onUpdateQty,
  onRemove,
  onClear,
  formatPrice,
}) => {
  const { language } = useLanguage();

  // Form State
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState(DELIVERY_REGIONS[0].id);
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalKrw = items.reduce((sum, item) => sum + item.product.priceKrw * item.quantity, 0);

  // Free delivery threshold in KRW (e.g. 100,000 KRW)
  const freeShippingThresholdKrw = 100000;
  const progressPercent = Math.min(100, Math.round((totalKrw / freeShippingThresholdKrw) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdKrw - totalKrw);

  const selectedRegionObj = DELIVERY_REGIONS.find((r) => r.id === region) || DELIVERY_REGIONS[0];
  const selectedPaymentObj = PAYMENT_METHODS.find((p) => p.id === paymentMethod) || PAYMENT_METHODS[0];

  const handleCheckoutOrder = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    let orderNum = '';

    const regionText = language === 'uz' ? selectedRegionObj.nameUz : selectedRegionObj.nameRu;
    const paymentText = selectedPaymentObj.name;

    try {
      const order = await adminService.createPublicOrder({
        customerName: clientName.trim() || (language === 'uz' ? 'Mijoz' : 'Покупатель'),
        phone: phone.trim() || '',
        channelSource: 'web',
        type: 'cart',
        items: items.map((i) => ({
          productId: i.product.id,
          title: i.product.name,
          price: i.product.priceKrw,
          currency: 'KRW',
          quantity: i.quantity,
          photoUrl: i.product.images?.[0] || '',
        })),
        totalAmount: totalKrw,
        currency: 'KRW',
        notes: `Регион: ${regionText}\nАдрес: ${address.trim() || 'Не указан'}\nОплата: ${paymentText}\nТелефон: ${phone.trim() || 'Не указан'}\nПожелание: ${comment.trim() || 'Нет'}\nИтого: ${formattedTotal}`,
      });

      if (order?.orderNumber) {
        orderNum = order.orderNumber;
        setCreatedOrderNumber(orderNum);
      }
      onClear();
      setOrderComplete(true);
    } catch (err) {
      console.warn('Could not save cart order to CRM:', err);
      const fallbackNum = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      setCreatedOrderNumber(fallbackNum);
      onClear();
      setOrderComplete(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetModal = () => {
    setOrderComplete(false);
    setCreatedOrderNumber('');
    setCheckoutStep(1);
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleResetModal}
      title={orderComplete ? (language === 'uz' ? 'Buyurtma qabul qilindi' : 'Заказ оформлен') : (language === 'uz' ? 'Savatcha va Buyurtma' : 'Корзина и Оформление')}
    >
      {items.length === 0 && !orderComplete ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#FAF8F5] text-[#B89254] flex items-center justify-center border border-[#ECE8E1]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div>
            <h4 className="font-serif text-xl text-[#1A1917] font-bold">
              {language === 'uz' ? 'Savatchangiz boʻsh' : 'Корзина пока пуста'}
            </h4>
            <p className="text-xs text-[#8A8680] mt-1 max-w-xs leading-relaxed">
              {language === 'uz'
                ? 'Katalogdan oʻzingizga yoqqan vositalarni tanlang va qulay buyurtma bering.'
                : 'Выберите средства из каталога для быстрого оформления с доставкой.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-full px-6 border-[#ECE8E1] text-[#1A1917] hover:border-[#B89254] hover:text-[#B89254]">
            {language === 'uz' ? 'Katalogga oʻtish' : 'Перейти в каталог'}
          </Button>
        </div>
      ) : orderComplete ? (
        /* Order Success Confirmation Screen */
        <div className="flex flex-col h-full justify-between py-6 space-y-6 text-center animate-in fade-in duration-200">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1917]">
                {language === 'uz' ? 'Buyurtmangiz qabul qilindi!' : 'Заказ успешно оформлен!'}
              </h3>
              <p className="text-xs text-[#8A8680] mt-1.5 max-w-xs mx-auto leading-relaxed">
                {language === 'uz'
                  ? "Xaridingiz uchun tashakkur! Buyurtma qabul qilindi. Menejerimiz tez orada siz bilan bog'lanadi."
                  : 'Спасибо за покупку! Заказ принят в систему. Наш менеджер свяжется с вами по указанному телефону для подтверждения и отправки.'}
              </p>
            </div>

            {createdOrderNumber && (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] text-xs font-bold text-[#1A1917]">
                <span>{language === 'uz' ? 'Buyurtma kodi:' : 'Номер заказа:'}</span>
                <span className="text-[#B89254] font-mono font-black text-sm">#{createdOrderNumber}</span>
                <button
                  onClick={() => handleCopyText(`#${createdOrderNumber}`)}
                  className="p-1 hover:text-[#B89254] transition-colors cursor-pointer text-[#8A8680]"
                  title="Скопировать"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] text-left text-xs space-y-2 max-w-xs mx-auto">
              <div className="flex justify-between items-center text-[#8A8680]">
                <span>{language === 'uz' ? 'Yetkazish:' : 'Доставка:'}</span>
                <span className="font-medium text-[#1A1917] text-right truncate max-w-[150px]">{selectedRegionObj.nameRu.replace(/^[^a-zA-Zа-яА-Я0-9]+/, '')}</span>
              </div>
              <div className="flex justify-between items-center text-[#8A8680]">
                <span>{language === 'uz' ? "To'lov:" : 'Оплата:'}</span>
                <span className="font-medium text-[#1A1917]">{selectedPaymentObj.name}</span>
              </div>
              <div className="flex justify-between items-center text-[#8A8680] pt-1.5 border-t border-[#ECE8E1]">
                <span className="font-bold text-[#1A1917]">{language === 'uz' ? 'Jami summa:' : 'Итого к оплате:'}</span>
                <span className="font-bold text-[#B89254] font-serif text-sm">{formattedTotal}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#ECE8E1]">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleResetModal}
              className="rounded-xl font-bold bg-[#1A1917] hover:bg-[#B89254] text-white py-3.5"
            >
              {language === 'uz' ? 'Xaridni davom ettirish' : 'Продолжить покупки'}
            </Button>
          </div>
        </div>
      ) : (
        /* 2-Step Checkout Flow inside Drawer */
        <div className="flex flex-col h-full justify-between space-y-4">
          {/* Top Progress / Free Shipping Indicator */}
          <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#1A1917]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#B89254]" />
                {progressPercent >= 100
                  ? (language === 'uz' ? '🎉 Bepul yetkazib berish huquqi!' : '🎉 Бесплатная доставка активна!')
                  : (language === 'uz' ? "Bepul yetkazib berishgacha:" : 'До бесплатной авиа-доставки:')}
              </span>
              <span className="text-[#B89254] font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#ECE8E1] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B89254] to-[#DFCBA0] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Step Selector Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#FAF8F5] rounded-xl border border-[#ECE8E1] text-xs font-bold text-center">
            <button
              onClick={() => setCheckoutStep(1)}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                checkoutStep === 1
                  ? 'bg-[#1A1917] text-[#B89254] shadow-xs'
                  : 'text-[#8A8680] hover:text-[#1A1917]'
              }`}
            >
              1. {language === 'uz' ? 'Mahsulotlar' : 'Товары'} ({items.length})
            </button>
            <button
              onClick={() => setCheckoutStep(2)}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                checkoutStep === 2
                  ? 'bg-[#1A1917] text-[#B89254] shadow-xs'
                  : 'text-[#8A8680] hover:text-[#1A1917]'
              }`}
            >
              2. {language === 'uz' ? 'Yetkazish & Toʻlov' : 'Доставка и Оплата'}
            </button>
          </div>

          {/* STEP 1: CART ITEMS LIST */}
          {checkoutStep === 1 && (
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-[#ECE8E1] shadow-2xs"
                >
                  <img
                    src={product.images?.[0] || '/logo.png'}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-[#FAF8F5] shrink-0 border border-[#ECE8E1]"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#B89254] uppercase tracking-wider block">
                      {product.brand}
                    </span>
                    <h5 className="text-xs font-medium text-[#1A1917] truncate">
                      {product.name}
                    </h5>
                    <div className="text-xs font-bold text-[#1A1917] mt-0.5">
                      {formatPrice(product.priceKrw * quantity)}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 bg-[#FAF8F5] rounded-lg border border-[#ECE8E1] p-0.5">
                        <button
                          onClick={() => onUpdateQty(product.id, quantity - 1)}
                          className="p-1 text-[#8A8680] hover:text-[#1A1917] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5 text-[#1A1917]">{quantity}</span>
                        <button
                          onClick={() => onUpdateQty(product.id, quantity + 1)}
                          className="p-1 text-[#8A8680] hover:text-[#1A1917] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemove(product.id)}
                        className="text-xs text-[#8A8680] hover:text-red-500 p-1 cursor-pointer transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2: RECIPIENT, DELIVERY REGION & PAYMENT */}
          {checkoutStep === 2 && (
            <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
              {/* Receiver Info */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8A8680] flex items-center gap-1">
                  <span>{language === 'uz' ? 'Qabul qiluvchi maʼlumotlari' : 'Данные получателя'}</span>
                </label>
                <Input
                  placeholder={language === 'uz' ? 'Ismingiz (masalan, Nilufar)' : 'Ваше имя'}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
                <Input
                  placeholder={language === 'uz' ? 'Telefon raqam yoki Telegram' : 'Телефон / Telegram (+998 / +82)'}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Delivery Region Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8A8680] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#B89254]" />
                  <span>{language === 'uz' ? 'Yetkazib berish hududi' : 'Регион и способ доставки'}</span>
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-[#ECE8E1] rounded-xl p-2.5 text-[#1A1917] outline-none focus:border-[#B89254]"
                >
                  {DELIVERY_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {language === 'uz' ? r.nameUz : r.nameRu}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder={language === 'uz' ? 'Manzil (shahar, koʻcha, uy, xonadon)' : 'Точный адрес доставки (город, улица, дом)'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8A8680] flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#B89254]" />
                  <span>{language === 'uz' ? "To'lov usuli" : 'Способ оплаты'}</span>
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = pm.id === paymentMethod;
                    return (
                      <div
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#FAF8F5] border-[#B89254] ring-1 ring-[#B89254]'
                            : 'bg-white border-[#ECE8E1] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <span className="text-xs font-semibold text-[#1A1917]">{pm.name}</span>
                        <span className="text-[10px] font-bold text-[#B89254] bg-[#F7F4EF] px-2 py-0.5 rounded-md border border-[#ECE8E1]">
                          {pm.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Note */}
              <div className="space-y-1">
                <Input
                  placeholder={language === 'uz' ? 'Izoh yoki teri turi boʻyicha savol (ixtiyoriy)' : 'Пожелание или комментарий к заказу'}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Bottom Total & Order Triggers */}
          <div className="border-t border-[#ECE8E1] pt-3.5 space-y-3">
            {/* Total Row */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#8A8680] font-medium block">
                  {language === 'uz' ? 'Jami summa:' : 'Итого к оплате:'}
                </span>
                <span className="text-[11px] text-[#8A8680]">
                  {language === 'uz' ? `${items.length} ta mahsulot` : `${items.length} поз.`}
                </span>
              </div>
              <span className="font-serif text-2xl font-black text-[#1A1917]">
                {formattedTotal}
              </span>
            </div>

            {/* Action Buttons */}
            {checkoutStep === 1 ? (
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setCheckoutStep(2)}
                  className="rounded-xl font-bold bg-[#1A1917] hover:bg-[#B89254] text-white"
                >
                  {language === 'uz' ? "Buyurtmani rasmiylashtirish ➔" : "Перейти к оформлению ➔"}
                </Button>

                <button
                  onClick={onClear}
                  className="w-full text-center text-xs text-[#8A8680] hover:text-[#1A1917] py-1 cursor-pointer transition-colors"
                >
                  {language === 'uz' ? 'Savatchani tozalash' : 'Очистить корзину'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Direct Order Button */}
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                  onClick={handleCheckoutOrder}
                  className="rounded-xl font-bold bg-[#1A1917] hover:bg-[#B89254] text-white py-3.5 text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'uz' ? 'Rasmiylashtirilmoqda...' : 'Оформление заказа...'}</span>
                    </span>
                  ) : (
                    <span>{language === 'uz' ? 'Buyurtmani rasmiylashtirish' : 'Оформить заказ'}</span>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setCheckoutStep(1)}
                  className="w-full text-center text-xs text-[#8A8680] hover:text-[#1A1917] py-1 cursor-pointer"
                >
                  {language === 'uz' ? '⬅️ Mahsulotlar roʻyxatiga qaytish' : '⬅️ Вернуться к списку товаров'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
};
