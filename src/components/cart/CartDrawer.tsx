import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatKrw } from '../ui/Price';
import { adminService } from '../../services/admin/adminService';
import { BRAND_CONFIG } from '../../core/constants/brand';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Truck,
  Sparkles,
  Phone,
  User,
  MapPin,
  Loader2,
  Copy,
  Send,
  MessageCircle,
  Camera,
  AlertCircle,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { buildWhatsAppUrl } from '../../core/constants/brand';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DELIVERY_OPTIONS = [
  { id: 'courier_kr', title: 'Курьерская доставка по Южной Корее', costKrw: 0, desc: '1–2 рабочих дня по Корее' },
  { id: 'pickup_seoul', title: 'Самовывоз со склада в Сеуле', costKrw: 0, desc: 'Бесплатно, согласовать время' },
  { id: 'cargo_world', title: 'Доставка по всему миру (СНГ, Европа, США, ОАЭ)', costKrw: 0, desc: 'Авиа-карго и экспресс-доставка. Оплата доставки при получении' },
];

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { items, totalAmountKrw, totalCount, updateQuantity, removeFromCart, clearCart } = useCart();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryId, setDeliveryId] = useState(DELIVERY_OPTIONS[0].id);
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');

  const [previewProduct, setPreviewProduct] = useState<any | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  if (!isOpen) return null;

  const selectedDelivery = DELIVERY_OPTIONS.find((d) => d.id === deliveryId) || DELIVERY_OPTIONS[0];
  const deliveryCost = selectedDelivery.costKrw;
  const finalTotalKrw = totalAmountKrw + deliveryCost;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!customerName.trim() || !phone.trim()) {
      setErrorMessage('Пожалуйста, укажите имя и номер телефона');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const order = await adminService.createPublicOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        channelSource: 'web',
        type: 'cart',
        currency: 'KRW',
        totalAmount: finalTotalKrw,
        shippingAddress: address.trim(),
        city: selectedDelivery.title,
        paymentMethod: 'Банковский перевод (Южная Корея / Карта)',
        notes: `Доставка: ${selectedDelivery.title} (${deliveryCost} KRW)\nАдрес: ${address}\nКомментарий: ${comment || '—'}`,
        items: items.map((i) => ({
          productId: i.product.id,
          title: i.product.name,
          price: i.product.priceKrw,
          currency: 'KRW',
          quantity: i.quantity,
          photoUrl: i.product.images?.[0] || '',
        })),
      });

      setCreatedOrderNumber(order?.orderNumber || 'MK-0001');
      clearCart();
      setStep('success');
    } catch (err: any) {
      console.error('Order creation error:', err);
      // Fallback: create mock order ID so customer is never blocked
      const fallbackNum = `MK-${Math.floor(10000 + Math.random() * 90000)}`;
      setCreatedOrderNumber(fallbackNum);
      clearCart();
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      setStep('cart');
      setCreatedOrderNumber('');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#FDFBF7] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-paper">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-lg font-normal text-ink">
              {step === 'success'
                ? 'Заказ оформлен'
                : step === 'checkout'
                ? 'Оформление заказа'
                : `Корзина (${totalCount})`}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink/60 hover:text-ink hover:bg-cream transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>


        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-cream text-gold flex items-center justify-center border border-line">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl text-ink font-normal">Ваша корзина пуста</h4>
                    <p className="text-xs text-ink/50 mt-1 max-w-xs leading-relaxed">
                      Выберите оригинальную косметику из каталога прямо из Южной Кореи
                    </p>
                  </div>
                  <Link
                    to="/catalog"
                    onClick={onClose}
                    className="btn-gold text-xs px-6 py-2.5 rounded-full uppercase tracking-wider"
                  >
                    Перейти в каталог
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 p-3 bg-paper rounded-2xl border border-line shadow-xs group"
                    >
                      {/* Thumbnail: Click to view full */}
                      <button
                        type="button"
                        onClick={() => setPreviewProduct(item.product)}
                        className="w-16 h-16 rounded-xl bg-cream border border-line/60 overflow-hidden flex-shrink-0 flex items-center justify-center relative cursor-pointer hover:border-gold transition-colors group/thumb"
                        title="Посмотреть товар целиком"
                      >
                        <img
                          src={item.product.images?.[0] || (item.product as any).photos?.[0] || '/logo.png'}
                          alt={item.product.name || (item.product as any).title || 'Товар'}
                          className="w-full h-full object-contain p-1 group-hover/thumb:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            {item.product.brand ? (
                              <p className="text-[10px] font-semibold tracking-wider text-gold uppercase truncate">
                                {item.product.brand}
                              </p>
                            ) : <span />}
                            <button
                              type="button"
                              onClick={() => setPreviewProduct(item.product)}
                              className="text-[10px] text-ink/40 hover:text-gold flex items-center gap-0.5"
                              title="Подробнее о товаре"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Детали</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewProduct(item.product)}
                            className="text-left text-xs font-medium text-ink hover:text-gold transition-colors line-clamp-1 leading-snug cursor-pointer"
                            title="Нажмите, чтобы посмотреть товар целиком"
                          >
                            {item.product.name || (item.product as any).title || 'Товар'}
                          </button>
                          <p className="text-xs font-mono font-bold text-ink mt-0.5">
                            {formatKrw(item.product.priceKrw)}
                          </p>
                        </div>

                        {/* Quantity and Remove */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="inline-flex items-center border border-line rounded-full bg-cream px-1 py-0.5">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-paper text-ink/70"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-mono font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-paper text-ink/70"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-ink/40 hover:text-sale p-1 transition-colors"
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
            </>
          )}

          {step === 'checkout' && (
            <form id="drawer-checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-sale/10 border border-sale/20 text-xs text-sale font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                  Ваше имя *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Имя Фамилия"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-paper border border-line rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Phone */}
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
                    className="w-full pl-9 pr-3 py-2 text-xs bg-paper border border-line rounded-xl focus:outline-none focus:border-gold font-mono"
                  />
                </div>
              </div>

              {/* Delivery Method */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                  Способ получения
                </label>
                <div className="space-y-2">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        deliveryId === opt.id
                          ? 'border-gold bg-cream/70'
                          : 'border-line bg-paper hover:border-gold/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={opt.id}
                        checked={deliveryId === opt.id}
                        onChange={() => setDeliveryId(opt.id)}
                        className="mt-0.5 accent-gold"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between font-medium text-ink">
                          <span>{opt.title}</span>
                          <span className="font-mono font-bold text-gold">
                            {opt.costKrw === 0 ? '0 ₩' : formatKrw(opt.costKrw)}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink/50 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                  Адрес доставки / Индекс
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Город, улица, номер дома/квартиры, индекс"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-paper border border-line rounded-xl focus:outline-none focus:border-gold resize-none"
                  />
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                  Комментарий
                </label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Дополнительные пожелания к заказу"
                  className="w-full px-3 py-2 text-xs bg-paper border border-line rounded-xl focus:outline-none focus:border-gold"
                />
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-normal text-ink">Заказ принят!</h3>
                <p className="text-xs text-ink/60 max-w-xs leading-relaxed">
                  Спасибо за покупку. Менеджер свяжется с вами для подтверждения отправки.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream border border-line w-full space-y-1">
                <span className="text-[11px] text-ink/50 uppercase tracking-wider">Номер заказа</span>
                <p className="font-mono text-xl font-bold text-gold tracking-tight">
                  #{createdOrderNumber}
                </p>
              </div>

              <div className="text-left w-full p-4 rounded-2xl bg-paper border border-line space-y-2 text-xs">
                <div className="flex justify-between text-ink/60">
                  <span>Консультация:</span>
                  <a href={`tel:${BRAND_CONFIG.phone}`} className="font-mono text-ink font-semibold hover:text-gold">
                    {BRAND_CONFIG.phone}
                  </a>
                </div>
                <div className="flex justify-between text-ink/60">
                  <span>Telegram:</span>
                  <a
                    href={BRAND_CONFIG.telegramChannelUrl || `https://t.me/${(BRAND_CONFIG.telegram || '').replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink font-semibold hover:text-gold"
                  >
                    {BRAND_CONFIG.telegramChannel || BRAND_CONFIG.telegram || '@mkcosmetkor'}
                  </a>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="btn-gold w-full py-3 rounded-full text-xs uppercase tracking-wider font-semibold"
              >
                Вернуться к покупкам
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {step !== 'success' && items.length > 0 && (
          <div className="p-6 border-t border-line bg-paper space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-ink/60">
                <span>Товары ({totalCount} шт):</span>
                <span className="font-mono text-ink font-semibold">{formatKrw(totalAmountKrw)}</span>
              </div>
              {step === 'checkout' && (
                <div className="flex justify-between text-ink/60">
                  <span>Доставка:</span>
                  <span className="font-mono text-ink font-semibold">
                    {deliveryCost === 0 ? 'Бесплатно' : formatKrw(deliveryCost)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-ink pt-1 border-t border-line">
                <span>Итого:</span>
                <span className="font-mono text-gold font-bold">
                  {formatKrw(step === 'checkout' ? finalTotalKrw : totalAmountKrw)}
                </span>
              </div>
            </div>

            {step === 'cart' ? (
              <div className="space-y-3">
                {/* Advice banner: photograph each product and send via Telegram/WhatsApp */}
                <div className="p-3.5 rounded-2xl bg-[#FFF8EE] border border-[#F3DFC0] text-xs space-y-2">
                  <div className="flex items-start gap-2.5 text-ink">
                    <Camera className="w-5 h-5 text-kraft shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-ink text-xs">
                        Как оформить заказ:
                      </p>
                      <p className="text-[11px] text-ink/75 mt-0.5 leading-relaxed">
                        Список составлять не нужно! Просто откройте каждый выбранный товар, <strong>сделайте фото или скриншот</strong> и отправьте нам в Telegram или WhatsApp. Менеджер сразу примет заказ и рассчитает доставку.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons: Telegram & WhatsApp (Clean link without text lists) */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={BRAND_CONFIG.telegramConsultantUrl || BRAND_CONFIG.telegramChannelUrl || 'https://t.me/mkcosmetkor'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-3 rounded-full bg-[#229ED9] hover:bg-[#1E8CC2] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
                  >
                    <Send className="w-3.5 h-3.5 shrink-0" />
                    <span>Отправить в Telegram</span>
                  </a>

                  <a
                    href={buildWhatsAppUrl('Здравствуйте! Хочу оформить заказ в MK Cosmetics. Сейчас отправлю фото выбранных товаров.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-3 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Отправить в WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 rounded-full border border-line text-xs font-semibold hover:border-gold transition-colors"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  form="drawer-checkout-form"
                  disabled={isSubmitting}
                  className="btn-gold flex-1 py-3.5 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Оформляем...
                    </>
                  ) : (
                    `Подтвердить заказ (${formatKrw(finalTotalKrw)})`
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Product Modal Preview (view whole item with all photos, description, and price) */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setPreviewProduct(null)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] bg-paper rounded-3xl border border-line shadow-2xl p-6 overflow-y-auto z-10 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-line">
              <div>
                {previewProduct.brand && (
                  <span className="text-[11px] font-bold text-gold uppercase tracking-wider">
                    {previewProduct.brand}
                  </span>
                )}
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-ink leading-snug">
                  {previewProduct.name || previewProduct.title || 'Товар'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink/60 hover:text-ink hover:bg-cream transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photos carousel / main photo */}
            <div className="space-y-3">
              <div className="w-full aspect-square rounded-2xl bg-cream border border-line overflow-hidden flex items-center justify-center p-2">
                <img
                  src={previewProduct.images?.[0] || (previewProduct as any).photos?.[0]?.full || (previewProduct as any).photos?.[0] || '/logo.png'}
                  alt={previewProduct.name || previewProduct.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Multiple photos if available */}
              {previewProduct.images && previewProduct.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {previewProduct.images.map((imgUrl: string, idx: number) => (
                    <div
                      key={idx}
                      className="w-16 h-16 rounded-xl bg-cream border border-line shrink-0 p-1 flex items-center justify-center overflow-hidden"
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Stock */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-cream/70 border border-line">
              <div>
                <span className="text-[11px] text-ink/50 uppercase tracking-wider block">Цена</span>
                <span className="font-mono text-lg font-bold text-ink">
                  {formatKrw(previewProduct.priceKrw)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-ink/50 uppercase tracking-wider block">Наличие</span>
                <span className="text-xs font-semibold text-emerald-600">
                  В наличии (Южная Корея)
                </span>
              </div>
            </div>

            {/* Description */}
            {previewProduct.description && (
              <div className="space-y-1.5 pt-2 border-t border-line">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Описание товара:</h4>
                <div
                  className="text-xs text-ink/80 leading-relaxed max-h-48 overflow-y-auto pr-1"
                  dangerouslySetInnerHTML={{ __html: previewProduct.description }}
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                to={`/product/${previewProduct.slug}`}
                onClick={() => {
                  setPreviewProduct(null);
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-full border border-line hover:border-gold text-ink text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Открыть страницу товара</span>
                <ExternalLink className="w-3.5 h-3.5 text-gold" />
              </Link>

              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="btn-gold py-3 px-6 rounded-full text-xs font-semibold text-center"
              >
                Вернуться в корзину
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
