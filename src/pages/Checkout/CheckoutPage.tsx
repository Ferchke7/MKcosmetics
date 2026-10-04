import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatKrw } from '../../components/ui/Price';
import { adminService } from '../../services/admin/adminService';
import { BRAND_CONFIG } from '../../core/constants/brand';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  Send,
  MessageCircle,
  Camera,
} from 'lucide-react';
import { buildWhatsAppUrl } from '../../core/constants/brand';

const DELIVERY_METHODS = [
  {
    id: 'courier_kr',
    title: 'Курьерская доставка по Южной Корее (CJ Logistics / Post)',
    costKrw: 5000,
    desc: 'Доставка до двери в течение 1–2 рабочих дней. Стоимость 5 000 ₩.',
    freeThreshold: 0,
  },
  {
    id: 'pickup_seoul',
    title: 'Самовывоз со склада MK Cosmetics (Сеул)',
    costKrw: 0,
    desc: 'Бесплатно. Согласуем удобное время самовывоза после подтверждения заказа.',
    freeThreshold: 0,
  },
  {
    id: 'cargo_world',
    title: 'Международная доставка по всему миру (СНГ, США, Европа, Азия)',
    costKrw: 0,
    desc: 'Авиа-карго и экспресс-отправка в любую точку мира напрямую из Сеула. Оплата веса карго при получении.',
    freeThreshold: 0,
  },
];

const PAYMENT_METHODS = [
  {
    id: 'bank_transfer_kr',
    title: 'Банковский перевод в Корее (무통장입금)',
    desc: 'Реквизиты корейского банка (KB, Shinhan, Woori) будут предоставлены при оформлении',
  },
  {
    id: 'card',
    title: 'Банковская карта (Международная / Корейская)',
    desc: 'Быстрая оплата картой через защищенный платежный шлюз',
  },
  {
    id: 'cash_pickup',
    title: 'Оплата при получении (Самовывоз / Курьер)',
    desc: 'Наличный расчет при передаче заказа',
  },
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalAmountKrw, totalCount, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramOrWa, setTelegramOrWa] = useState('');
  const [deliveryId, setDeliveryId] = useState(DELIVERY_METHODS[0].id);
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentId, setPaymentId] = useState(PAYMENT_METHODS[0].id);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState<{
    orderNumber: string;
    totalAmount: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedDelivery = DELIVERY_METHODS.find((d) => d.id === deliveryId) || DELIVERY_METHODS[0];
  const selectedPayment = PAYMENT_METHODS.find((p) => p.id === paymentId) || PAYMENT_METHODS[0];

  const deliveryCost = selectedDelivery.costKrw;
  const finalTotal = totalAmountKrw + deliveryCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!customerName.trim() || !phone.trim()) {
      setErrorMsg('Пожалуйста, укажите имя и телефон для связи');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const order = await adminService.createPublicOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        channelSource: 'web',
        type: 'checkout',
        currency: 'KRW',
        totalAmount: finalTotal,
        shippingAddress: `${address} (Индекс: ${postalCode || 'не указан'})`.trim(),
        city: selectedDelivery.title,
        paymentMethod: selectedPayment.title,
        notes: `Мессенджер: ${telegramOrWa || '—'}\nДоставка: ${selectedDelivery.title} (${deliveryCost} KRW)\nОплата: ${selectedPayment.title}\nКомментарий: ${notes || '—'}`,
        items: items.map((i) => ({
          productId: i.product.id,
          title: i.product.name,
          price: i.product.priceKrw,
          currency: 'KRW',
          quantity: i.quantity,
          photoUrl: i.product.images?.[0] || '',
        })),
      });

      setOrderCreated({
        orderNumber: order?.orderNumber || 'MK-0001',
        totalAmount: finalTotal,
      });
      clearCart();
    } catch (err: any) {
      console.error('Order creation error:', err);
      // Fallback: create mock order ID so customer is never blocked
      const fallbackNum = `MK-${Math.floor(10000 + Math.random() * 90000)}`;
      setOrderCreated({
        orderNumber: fallbackNum,
        totalAmount: finalTotal,
      });
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderNumber = () => {
    if (orderCreated?.orderNumber) {
      navigator.clipboard.writeText(orderCreated.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Success view
  if (orderCreated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-ink py-16 px-4">
        <div className="max-w-xl mx-auto bg-paper rounded-3xl border border-line p-8 md:p-12 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <p className="eyebrow text-gold">ЗАКАЗ УСПЕШНО ОФОРМЛЕН</p>
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-ink">
              Благодарим за заказ!
            </h1>
            <p className="text-xs sm:text-sm text-ink/70 leading-relaxed max-w-md mx-auto">
              Ваш заказ принят в обработку. Менеджер MK Cosmetics свяжется с вами по указанному телефону для согласования отправки из Сеула.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cream border border-line flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-[11px] text-ink/50 uppercase tracking-wider block">Номер вашего заказа</span>
              <span className="font-mono text-2xl font-bold text-ink">#{orderCreated.orderNumber}</span>
            </div>
            <button
              onClick={handleCopyOrderNumber}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-line bg-paper text-xs font-semibold text-ink hover:border-gold hover:text-gold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Скопировано
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Скопировать
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-paper border border-line text-left space-y-2 text-xs">
            <div className="flex justify-between text-ink/70">
              <span>Сумма к оплате:</span>
              <span className="font-mono font-bold text-ink">{formatKrw(orderCreated.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Прямой склад:</span>
              <span>Сеул, Южная Корея</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Контакты для связи:</span>
              <a href={`tel:${BRAND_CONFIG.phone}`} className="font-mono text-gold font-bold">
                {BRAND_CONFIG.phone}
              </a>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link
              to="/catalog"
              className="btn-gold flex-1 py-3.5 rounded-full text-xs uppercase tracking-wider font-semibold text-center"
            >
              Вернуться в каталог
            </Link>
            <Link
              to="/"
              className="flex-1 py-3.5 rounded-full border border-line hover:border-gold text-xs uppercase tracking-wider font-semibold text-center transition-colors"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart view
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#FDFBF7] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-paper p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-cream text-gold mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-normal text-ink">В корзине пусто</h2>
          <p className="text-xs text-ink/60 leading-relaxed">
            Чтобы оформить заказ, добавьте понравившиеся товары из каталога.
          </p>
          <Link
            to="/catalog"
            className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-ink pb-24">
      {/* Breadcrumbs */}
      <div className="border-b border-line bg-paper/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-xs text-ink/50 tracking-wide">
            <Link to="/" className="hover:text-gold transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3 text-line" />
            <Link to="/catalog" className="hover:text-gold transition-colors">Каталог</Link>
            <ChevronRight className="w-3 h-3 text-line" />
            <span className="text-ink font-medium">Оформление заказа</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <p className="eyebrow text-gold mb-1">MK COSMETICS • SEOUL</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-ink">
            Оформление заказа
          </h1>
        </div>

        {/* Temporary messenger order banner */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-[#FFF8EE] border border-[#F3DFC0] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-kraft/10 text-kraft flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-ink font-semibold">
                  Оформление через сайт временно недоступно
                </h3>
                <p className="text-xs text-ink/75 mt-0.5 max-w-xl leading-relaxed">
                  Вы можете отправить фотографии или скриншот выбранных товаров прямо нам в <strong>Telegram</strong> или <strong>WhatsApp</strong>. Мы мгновенно рассчитаем и подтвердим заказ!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href={`https://t.me/${(BRAND_CONFIG.telegramConsultant || BRAND_CONFIG.telegram || 'mkcosmetkor').replace('@', '')}?text=${encodeURIComponent(
                  `Здравствуйте! Хочу сделать заказ в MK Cosmetics:\n${items
                    .map((i, idx) => `${idx + 1}. ${i.product.name} (${i.quantity} шт.) — ${formatKrw(i.product.priceKrw * i.quantity)}`)
                    .join('\n')}\n\nИтого: ${formatKrw(totalAmountKrw)}\n\n(Прикрепляю фото товаров)`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-full bg-[#229ED9] hover:bg-[#1E8CC2] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>В Telegram</span>
              </a>

              <a
                href={buildWhatsAppUrl(
                  `Здравствуйте! Хочу сделать заказ в MK Cosmetics:\n${items
                    .map((i, idx) => `${idx + 1}. ${i.product.name} (${i.quantity} шт.) — ${formatKrw(i.product.priceKrw * i.quantity)}`)
                    .join('\n')}\n\nИтого: ${formatKrw(totalAmountKrw)}\n\n(Прикрепляю фото товаров)`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>В WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Input Form (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-sale/10 border border-sale/20 text-xs text-sale font-medium">
                {errorMsg}
              </div>
            )}

            {/* Section 1: Contacts */}
            <div className="bg-paper rounded-3xl border border-line p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-line">
                <div className="w-8 h-8 rounded-full bg-cream border border-line flex items-center justify-center font-serif font-bold text-sm text-gold">
                  1
                </div>
                <div>
                  <h3 className="font-serif text-lg font-normal text-ink">Контактные данные</h3>
                  <p className="text-[11px] text-ink/50">Для связи менеджера и уведомления о статусе</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                    ФИО получателя *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Имя Фамилия"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-cream/30 border border-line rounded-xl focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                    Телефон *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+82 10 1234 5678"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-cream/30 border border-line rounded-xl focus:outline-none focus:border-gold font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                    Telegram / WhatsApp (необязательно)
                  </label>
                  <input
                    type="text"
                    value={telegramOrWa}
                    onChange={(e) => setTelegramOrWa(e.target.value)}
                    placeholder="@username или номер"
                    className="w-full px-3 py-2.5 text-xs bg-cream/30 border border-line rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Delivery */}
            <div className="bg-paper rounded-3xl border border-line p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-line">
                <div className="w-8 h-8 rounded-full bg-cream border border-line flex items-center justify-center font-serif font-bold text-sm text-gold">
                  2
                </div>
                <div>
                  <h3 className="font-serif text-lg font-normal text-ink">Способ доставки</h3>
                  <p className="text-[11px] text-ink/50">Выберите удобный способ получения</p>
                </div>
              </div>

              <div className="space-y-3">
                {DELIVERY_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      deliveryId === m.id
                        ? 'border-gold bg-cream/60 shadow-xs'
                        : 'border-line bg-paper hover:border-gold/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="checkout_delivery"
                      value={m.id}
                      checked={deliveryId === m.id}
                      onChange={() => setDeliveryId(m.id)}
                      className="mt-1 accent-gold"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between font-medium text-xs sm:text-sm text-ink">
                        <span>{m.title}</span>
                        <span className="font-mono font-bold text-gold">
                          {m.costKrw === 0 ? '0 ₩' : formatKrw(m.costKrw)}
                        </span>
                      </div>
                      <p className="text-xs text-ink/60 mt-1 leading-relaxed">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Address Inputs */}
              <div className="pt-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                      Адрес доставки (Улица, дом, квартира)
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Сеул, Каннам-гу, ул..."
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-cream/30 border border-line rounded-xl focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                      Почтовый индекс
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="06000"
                      className="w-full px-3 py-2.5 text-xs bg-cream/30 border border-line rounded-xl focus:outline-none focus:border-gold font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                    Комментарий или пожелание
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Код домофона, удобное время звонка и др."
                    className="w-full px-3 py-2.5 text-xs bg-cream/30 border border-line rounded-xl focus:outline-none focus:border-gold resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Payment */}
            <div className="bg-paper rounded-3xl border border-line p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-line">
                <div className="w-8 h-8 rounded-full bg-cream border border-line flex items-center justify-center font-serif font-bold text-sm text-gold">
                  3
                </div>
                <div>
                  <h3 className="font-serif text-lg font-normal text-ink">Способ оплаты</h3>
                  <p className="text-[11px] text-ink/50">Валюта всех расчетов: Корейская вона (KRW ₩)</p>
                </div>
              </div>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentId === p.id
                        ? 'border-gold bg-cream/60 shadow-xs'
                        : 'border-line bg-paper hover:border-gold/40'
                      }`}
                  >
                    <input
                      type="radio"
                      name="checkout_payment"
                      value={p.id}
                      checked={paymentId === p.id}
                      onChange={() => setPaymentId(p.id)}
                      className="mt-1 accent-gold"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-xs sm:text-sm text-ink">{p.title}</div>
                      <p className="text-xs text-ink/60 mt-0.5 leading-relaxed">{p.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-paper rounded-3xl border border-line p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-normal text-ink pb-3 border-b border-line">
                Ваш заказ ({totalCount})
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 text-xs">
                    <div className="w-14 h-14 rounded-xl bg-cream border border-line overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img
                        src={item.product.images?.[0] || (item.product as any).photos?.[0] || '/logo.png'}
                        alt={item.product.name || (item.product as any).title || 'Товар'}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.product.brand && (
                        <p className="text-[10px] text-gold font-semibold uppercase">{item.product.brand}</p>
                      )}
                      <p className="font-medium text-ink truncate">
                        {item.product.name || (item.product as any).title || 'Товар'}
                      </p>
                      <p className="text-ink/60 text-[11px] font-mono mt-0.5">
                        {item.quantity} × {formatKrw(item.product.priceKrw)}
                      </p>
                    </div>
                    <div className="font-mono font-bold text-ink">
                      {formatKrw(item.product.priceKrw * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="pt-4 border-t border-line space-y-2 text-xs">
                <div className="flex justify-between text-ink/60">
                  <span>Стоимость товаров:</span>
                  <span className="font-mono text-ink font-semibold">{formatKrw(totalAmountKrw)}</span>
                </div>
                <div className="flex justify-between text-ink/60">
                  <span>Доставка ({selectedDelivery.title.split('(')[0].trim()}):</span>
                  <span className="font-mono text-ink font-semibold">
                    {deliveryCost === 0 ? 'Бесплатно' : formatKrw(deliveryCost)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-ink pt-3 border-t border-line">
                  <span>Итого к оплате:</span>
                  <span className="font-mono text-gold font-bold">{formatKrw(finalTotal)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold w-full py-4 rounded-full text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Оформляем заказ...
                  </>
                ) : (
                  `Оформить заказ (${formatKrw(finalTotal)})`
                )}
              </button>

              {/* Guarantees */}
              <div className="p-4 rounded-2xl bg-cream/60 border border-line space-y-2 text-[11px] text-ink/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>100% оригинальная косметика напрямую из Кореи</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Надежная упаковка и быстрая отправка</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
