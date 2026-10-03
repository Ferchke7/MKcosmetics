import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  MessageCircle,
  CheckCircle2,
  Package,
  Loader2,
  Send,
  Plus,
  Minus,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { buildWhatsAppUrl, BRAND_CONFIG } from '../../core/constants/brand';
import { useLanguage } from '../../core/i18n/LanguageContext';
import { adminService } from '../../services/admin/adminService';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  priceFormatted: string;
  sourceUrl?: string;
  productPhoto?: string;
}

const REGIONS = [
  { id: 'tashkent', nameRu: '⚡ Ташкент — Экспресс курьер (2-4 часа)', nameUz: '⚡ Toshkent — Ekspress kuryer (2-4 soat)' },
  { id: 'samarkand', nameRu: '📦 Самарканд (1 день)', nameUz: '📦 Samarqand (1 kun)' },
  { id: 'bukhara', nameRu: '📦 Бухара (1-2 дня)', nameUz: '📦 Buxoro (1-2 kun)' },
  { id: 'fergana', nameRu: '📦 Ферганская долина (1-2 дня)', nameUz: "📦 Fargʻona vodiysi (1-2 kun)" },
  { id: 'uzb_other', nameRu: '🚚 Другие регионы Узбекистана (2-3 дня)', nameUz: "🚚 O'zbekistonning boshqa hududlari (2-3 kun)" },
  { id: 'cis_world', nameRu: '✈️ Международная доставка / СНГ', nameUz: '✈️ Xalqaro avia / MDH' },
];

const PAY_METHODS = [
  { id: 'payme_click', name: 'Payme / Click' },
  { id: 'card', name: 'Банковская карта (Uzcard/Humo/Visa)' },
  { id: 'cash', name: 'Наличными при получении' },
  { id: 'kaspi_usdt', name: 'Kaspi / USDT (Crypto)' },
];

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  productTitle,
  priceFormatted,
  sourceUrl,
  productPhoto,
}) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [phoneOrTelegram, setPhoneOrTelegram] = useState('');
  const [region, setRegion] = useState(REGIONS[0].id);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAY_METHODS[0].id);
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRegion = REGIONS.find((r) => r.id === region) || REGIONS[0];
  const selectedPay = PAY_METHODS.find((p) => p.id === paymentMethod) || PAY_METHODS[0];

  const handleSendOrder = async (channel: 'whatsapp' | 'telegram') => {
    setIsSubmitting(true);
    let assignedOrderNum = '';

    const regionText = language === 'uz' ? selectedRegion.nameUz : selectedRegion.nameRu;

    try {
      const order = await adminService.createPublicOrder({
        customerName: name || (language === 'uz' ? 'Mijoz' : 'Покупатель'),
        phone: phoneOrTelegram,
        channelSource: channel === 'whatsapp' ? 'quick_order_whatsapp' : 'quick_order_telegram',
        type: 'quick_order',
        items: [
          {
            productId: 'quick-order',
            title: productTitle,
            price: 0,
            currency: 'KRW',
            quantity: quantity,
            photoUrl: productPhoto || '',
          },
        ],
        notes: `Кол-во: ${quantity} шт.\nРегион: ${regionText}\nАдрес: ${address || 'Не указан'}\nОплата: ${selectedPay.name}\nПожелание: ${comment || 'Нет'}\nТовар: ${productTitle} (${priceFormatted})\nИсточник: ${sourceUrl || ''}`,
      });
      if (order?.orderNumber) {
        assignedOrderNum = order.orderNumber;
        setOrderNumber(assignedOrderNum);
      }
    } catch (err) {
      console.warn('Could not persist CRM order to backend:', err);
    } finally {
      setIsSubmitting(false);
    }

    let message = language === 'uz'
      ? `🌸 *Assalomu alaykum, Muhabbat! Kosmetika buyurtma qilmoqchiman:*\n\n`
      : `🌸 *Здравствуйте, Мухаббат! Хочу оформить быстрый заказ:*\n\n`;

    if (assignedOrderNum) {
      message += `📋 *${language === 'uz' ? 'Buyurtma kodi' : 'Номер заказа'}:* #${assignedOrderNum}\n`;
    }
    message += `🛍️ *${language === 'uz' ? 'Mahsulot' : 'Товар'}:* ${productTitle}\n`;
    message += `🔢 *${language === 'uz' ? 'Soni' : 'Количество'}:* ${quantity} шт.\n`;
    message += `💰 *${language === 'uz' ? 'Narx' : 'Цена'}:* ${priceFormatted}\n`;
    if (name) message += `👤 *${language === 'uz' ? 'Ism' : 'Имя'}:* ${name}\n`;
    message += `📍 *${language === 'uz' ? 'Hudud' : 'Регион'}:* ${regionText}\n`;
    if (address) message += `🏠 *${language === 'uz' ? 'Manzil' : 'Адрес'}:* ${address}\n`;
    if (phoneOrTelegram) message += `📱 *${language === 'uz' ? 'Aloqa' : 'Контакты'}:* ${phoneOrTelegram}\n`;
    message += `💳 *${language === 'uz' ? "To'lov" : 'Оплата'}:* ${selectedPay.name}\n`;
    if (comment) message += `💬 *${language === 'uz' ? 'Izoh' : 'Пожелание/Вопрос'}:* ${comment}\n`;
    if (sourceUrl) message += `🔗 *${language === 'uz' ? 'Havola' : 'Ссылка'}:* ${sourceUrl}\n`;

    message += language === 'uz'
      ? `\nIltimos, mavjudligini tasdiqlang va jo'natishni tayyorlang ✨`
      : `\nПожалуйста, подтвердите наличие и рассчитайте доставку ✨`;

    if (channel === 'whatsapp') {
      const url = buildWhatsAppUrl(message);
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const tgUrl = `https://t.me/mkcosmetkor?text=${encodeURIComponent(message)}`;
      window.open(tgUrl, '_blank', 'noopener,noreferrer');
    }

    setIsSuccess(true);
  };

  const handleReset = () => {
    setName('');
    setAddress('');
    setPhoneOrTelegram('');
    setQuantity(1);
    setComment('');
    setOrderNumber('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title={t('order_modal_title')} maxWidth="md">
      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h4 className="font-serif text-2xl font-bold text-[#1A1917]">
            {t('order_success_title')}
          </h4>
          {orderNumber && (
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#ECE8E1] text-xs font-bold text-[#1A1917]">
              {language === 'uz' ? 'Buyurtma' : 'Заказ'} <span className="text-[#B89254]">#{orderNumber}</span>
            </div>
          )}
          <p className="mx-auto max-w-sm text-xs text-[#8A8680] leading-relaxed">
            {t('order_success_desc')}
          </p>
          <div className="mx-auto flex max-w-sm flex-col gap-2 pt-2">
            <a
              href={BRAND_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#20BA5A]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <Button variant="ghost" onClick={handleReset} fullWidth className="rounded-xl border border-[#ECE8E1] text-[#1A1917] hover:border-[#B89254]">
              OK
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSendOrder('whatsapp'); }} className="space-y-3.5">
          {/* Product Summary Box */}
          <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white text-[#B89254] shadow-2xs shrink-0 border border-[#ECE8E1]">
                <Package className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h5 className="text-[11px] font-bold text-[#B89254] uppercase tracking-wider">
                  {t('order_modal_selected')}
                </h5>
                <p className="text-xs font-bold text-[#1A1917] truncate">
                  {productTitle}
                </p>
                <span className="text-xs font-extrabold text-[#B89254]">
                  {priceFormatted}
                </span>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-[#ECE8E1] p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 text-[#8A8680] hover:text-[#1A1917]"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold px-1.5 text-[#1A1917]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 text-[#8A8680] hover:text-[#1A1917]"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <Input
              label={t('order_name')}
              placeholder={t('order_name_placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label={t('order_contact')}
              placeholder={t('order_contact_placeholder')}
              value={phoneOrTelegram}
              onChange={(e) => setPhoneOrTelegram(e.target.value)}
              required
            />

            {/* Region Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8A8680] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B89254]" />
                <span>{language === 'uz' ? 'Yetkazib berish hududi' : 'Регион доставки'}</span>
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-[#ECE8E1] rounded-xl p-2.5 text-[#1A1917] outline-none focus:border-[#B89254]"
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {language === 'uz' ? r.nameUz : r.nameRu}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={language === 'uz' ? 'Manzil' : 'Адрес доставки'}
              placeholder={t('order_city_placeholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8A8680] flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#B89254]" />
                <span>{language === 'uz' ? "To'lov usuli" : 'Способ оплаты'}</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-[#ECE8E1] rounded-xl p-2.5 text-[#1A1917] outline-none focus:border-[#B89254]"
              >
                {PAY_METHODS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8A8680] uppercase tracking-wider mb-1">
                {t('order_comment')}
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('order_comment_placeholder')}
                className="w-full rounded-xl border border-[#ECE8E1] bg-white px-3 py-2 text-xs text-[#1A1917] placeholder-[#8A8680] focus:border-[#B89254] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSendOrder('whatsapp')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold shadow-md transition-transform active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              <span>{isSubmitting ? 'Оформление...' : (language === 'uz' ? 'WhatsApp orqali buyurtma' : 'Заказать через WhatsApp')}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSendOrder('telegram')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{language === 'uz' ? 'Telegram orqali buyurtma' : 'Заказать через Telegram @mkcosmetkor'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
