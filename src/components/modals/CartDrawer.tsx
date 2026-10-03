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

  const handleCheckoutOrder = async (channel: 'whatsapp' | 'telegram') => {
    setIsSubmitting(true);
    let orderNum = '';

    const regionText = language === 'uz' ? selectedRegionObj.nameUz : selectedRegionObj.nameRu;
    const paymentText = selectedPaymentObj.name;

    try {
      const order = await adminService.createPublicOrder({
        customerName: clientName || (language === 'uz' ? 'Mijoz' : 'Покупатель'),
        phone: phone || '',
        channelSource: channel,
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
        notes: `Регион: ${regionText}\nАдрес: ${address || 'Не указан'}\nОплата: ${paymentText}\nТелефон: ${phone || 'Не указан'}\nПожелание: ${comment || 'Нет'}\nИтого: ${formattedTotal}`,
      });

      if (order?.orderNumber) {
        orderNum = order.orderNumber;
        setCreatedOrderNumber(orderNum);
      }
    } catch (err) {
      console.warn('Could not save cart order to CRM:', err);
    } finally {
      setIsSubmitting(false);
    }

    // Build structured luxury invoice text
    let text = language === 'uz'
      ? `🌸 *Assalomu alaykum, Muhabbat! MK KOREA COSMETIC buyurtmasi:*\n\n`
      : `🌸 *Здравствуйте, Мухаббат! Оформляю заказ в MK KOREA COSMETIC:*\n\n`;

    if (orderNum) {
      text += `📋 *${language === 'uz' ? 'Buyurtma raqami' : 'Номер заказа'}:* #${orderNum}\n\n`;
    }

    items.forEach((item, index) => {
      text += `${index + 1}. *${item.product.name}*\n   ${language === 'uz' ? 'Brend' : 'Бренд'}: ${item.product.brand} | ${language === 'uz' ? 'Soni' : 'Кол-во'}: ${item.quantity} шт. | ${formatPrice(item.product.priceKrw * item.quantity)}\n`;
    });

    text += `\n💰 *${language === 'uz' ? 'Jami summa' : 'Итого к оплате'}:* ${formattedTotal}\n`;
    text += `👤 *${language === 'uz' ? 'Mijoz' : 'Получатель'}:* ${clientName || (language === 'uz' ? 'Mijoz' : 'Покупатель')}\n`;
    if (phone) text += `📱 *${language === 'uz' ? 'Telefon' : 'Телефон / Telegram'}:* ${phone}\n`;
    text += `📍 *${language === 'uz' ? 'Yetkazib berish hududi' : 'Регион доставки'}:* ${regionText}\n`;
    if (address) text += `🏠 *${language === 'uz' ? 'Manzil' : 'Адрес доставки'}:* ${address}\n`;
    text += `💳 *${language === 'uz' ? "To'lov usuli" : 'Способ оплаты'}:* ${paymentText}\n`;
    if (comment) text += `💬 *${language === 'uz' ? 'Izoh' : 'Пожелание'}:* ${comment}\n`;

    text += language === 'uz'
      ? `\nIltimos, buyurtmani tasdiqlang va jo'natish tafsilotlarini yuboring ✨`
      : `\nПожалуйста, подтвердите заказ и отправку ✨`;

    if (channel === 'whatsapp') {
      const url = buildWhatsAppUrl(text);
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const tgUrl = `https://t.me/mkcosmetkor?text=${encodeURIComponent(text)}`;
      window.open(tgUrl, '_blank', 'noopener,noreferrer');
    }

    setOrderComplete(true);
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
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#FAF5EE] text-[#D4AF37] flex items-center justify-center border border-[#EED9CF]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div>
            <h4 className="font-serif text-xl text-[#1F1615] font-bold">
              {language === 'uz' ? 'Savatchangiz boʻsh' : 'Корзина пока пуста'}
            </h4>
            <p className="text-xs text-[#7A6F68] mt-1 max-w-xs leading-relaxed">
              {language === 'uz'
                ? 'Katalogdan oʻzingizga yoqqan vositalarni tanlang va qulay buyurtma bering.'
                : 'Выберите средства из каталога для быстрого оформления с доставкой.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-full px-6">
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
              <h3 className="font-serif text-2xl font-bold text-[#1F1615]">
                {language === 'uz' ? 'Buyurtmangiz qabul qilindi!' : 'Ваш заказ успешно принят!'}
              </h3>
              <p className="text-xs text-[#7A6F68] mt-1 max-w-xs mx-auto">
                {language === 'uz'
                  ? "Menejerimiz tez orada siz bilan bog'lanadi va jo'natmani tayyorlaydi."
                  : 'Мы уже готовим ваш заказ. Менеджер ответит вам в мессенджере.'}
              </p>
            </div>

            {createdOrderNumber && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF5EE] border border-[#EED9CF] text-xs font-bold text-[#1F1615]">
                <span>{language === 'uz' ? 'Buyurtma kodi' : 'Код заказа'}:</span>
                <span className="text-[#C2836B] font-mono font-black text-sm">#{createdOrderNumber}</span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2 max-w-xs mx-auto pt-2">
              <a
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold shadow-sm transition-transform active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === 'uz' ? 'WhatsApp da yozish' : 'Открыть чат WhatsApp'}</span>
              </a>

              <a
                href="https://t.me/mkcosmetkor"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold shadow-sm transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'uz' ? 'Telegram kanalga oʻtish' : 'Открыть Telegram @mkcosmetkor'}</span>
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EFE8E2]">
            <Button
              variant="outline"
              fullWidth
              size="md"
              onClick={() => {
                onClear();
                handleResetModal();
              }}
              className="rounded-xl"
            >
              {language === 'uz' ? 'Xaridni davom ettirish' : 'Продолжить покупки'}
            </Button>
          </div>
        </div>
      ) : (
        /* 2-Step Checkout Flow inside Drawer */
        <div className="flex flex-col h-full justify-between space-y-4">
          {/* Top Progress / Free Shipping Indicator */}
          <div className="p-3 rounded-2xl bg-[#FAF5EE] border border-[#EED9CF]/70 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#1F1615]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                {progressPercent >= 100
                  ? (language === 'uz' ? '🎉 Bepul yetkazib berish huquqi!' : '🎉 Бесплатная доставка активна!')
                  : (language === 'uz' ? "Bepul yetkazib berishgacha:" : 'До бесплатной авиа-доставки:')}
              </span>
              <span className="text-[#C2836B] font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E8DCD5] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#C2836B] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Step Selector Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#FAF7F2] rounded-xl border border-[#E8DCD5] text-xs font-bold text-center">
            <button
              onClick={() => setCheckoutStep(1)}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                checkoutStep === 1
                  ? 'bg-[#1F1615] text-white shadow-2xs'
                  : 'text-[#7A6F68] hover:text-[#1F1615]'
              }`}
            >
              1. {language === 'uz' ? 'Mahsulotlar' : 'Товары'} ({items.length})
            </button>
            <button
              onClick={() => setCheckoutStep(2)}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                checkoutStep === 2
                  ? 'bg-[#1F1615] text-white shadow-2xs'
                  : 'text-[#7A6F68] hover:text-[#1F1615]'
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
                  className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-[#EFE8E2] shadow-2xs"
                >
                  <img
                    src={product.images?.[0] || '/logo.png'}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-[#FAF7F2] shrink-0 border border-[#EAE2DC]"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#C2836B] uppercase tracking-wider block">
                      {product.brand}
                    </span>
                    <h5 className="text-xs font-medium text-[#1F1615] truncate">
                      {product.name}
                    </h5>
                    <div className="text-xs font-bold text-[#1F1615] mt-0.5">
                      {formatPrice(product.priceKrw * quantity)}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 bg-[#FAF7F2] rounded-lg border border-[#E8DCD5] p-0.5">
                        <button
                          onClick={() => onUpdateQty(product.id, quantity - 1)}
                          className="p-1 text-[#7A6F68] hover:text-[#1F1615] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5 text-[#1F1615]">{quantity}</span>
                        <button
                          onClick={() => onUpdateQty(product.id, quantity + 1)}
                          className="p-1 text-[#7A6F68] hover:text-[#1F1615] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemove(product.id)}
                        className="text-xs text-[#A89F97] hover:text-red-500 p-1 cursor-pointer transition-colors"
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F68] flex items-center gap-1">
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F68] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{language === 'uz' ? 'Yetkazib berish hududi' : 'Регион и способ доставки'}</span>
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-[#E8DCD5] rounded-xl p-2.5 text-[#1F1615] outline-none focus:border-[#C2836B]"
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F68] flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
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
                            ? 'bg-[#FAF5EE] border-[#C2836B] ring-1 ring-[#C2836B]'
                            : 'bg-white border-[#E8DCD5] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span className="text-xs font-semibold text-[#1F1615]">{pm.name}</span>
                        <span className="text-[10px] font-bold text-[#A96851] bg-white px-2 py-0.5 rounded-md border border-[#EED9CF]">
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
          <div className="border-t border-[#EAE2DC] pt-3.5 space-y-3">
            {/* Total Row */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#7A6F68] font-medium block">
                  {language === 'uz' ? 'Jami summa:' : 'Итого к оплате:'}
                </span>
                <span className="text-[11px] text-[#A89F97]">
                  {language === 'uz' ? `${items.length} ta mahsulot` : `${items.length} поз.`}
                </span>
              </div>
              <span className="font-serif text-2xl font-black text-[#1F1615]">
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
                  className="rounded-xl font-bold bg-[#1F1615] hover:bg-[#381F23] text-white"
                >
                  {language === 'uz' ? "Buyurtmani rasmiylashtirish ➔" : "Перейти к оформлению ➔"}
                </Button>

                <button
                  onClick={onClear}
                  className="w-full text-center text-xs text-[#A89F97] hover:text-[#1F1615] py-1 cursor-pointer transition-colors"
                >
                  {language === 'uz' ? 'Savatchani tozalash' : 'Очистить корзину'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* 1-Click WhatsApp Order */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleCheckoutOrder('whatsapp')}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MessageCircle className="w-5 h-5" />
                  )}
                  <span>{isSubmitting ? 'Оформление...' : (language === 'uz' ? 'WhatsApp orqali yuborish' : 'Оформить через WhatsApp')}</span>
                </button>

                {/* 1-Click Telegram Order */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleCheckoutOrder('telegram')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'uz' ? 'Telegram orqali yuborish' : 'Оформить через Telegram @mkcosmetkor'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutStep(1)}
                  className="w-full text-center text-xs text-[#7A6F68] hover:text-[#1F1615] py-1 cursor-pointer"
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
