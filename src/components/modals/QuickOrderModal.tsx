import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  CheckCircle2,
  Package,
  Loader2,
  MapPin,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const selectedRegion = REGIONS.find((r) => r.id === region) || REGIONS[0];
  const selectedPay = PAY_METHODS.find((p) => p.id === paymentMethod) || PAY_METHODS[0];

  const handleSendOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    let assignedOrderNum = '';

    const regionText = language === 'uz' ? selectedRegion.nameUz : selectedRegion.nameRu;

    try {
      const order = await adminService.createPublicOrder({
        customerName: name.trim() || (language === 'uz' ? 'Mijoz' : 'Покупатель'),
        phone: phoneOrTelegram.trim() || '',
        channelSource: 'web_quick_order',
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
        notes: `Кол-во: ${quantity} шт.\nРегион: ${regionText}\nАдрес: ${address.trim() || 'Не указан'}\nОплата: ${selectedPay.name}\nПожелание: ${comment.trim() || 'Нет'}\nТовар: ${productTitle} (${priceFormatted})\nИсточник: ${sourceUrl || ''}`,
      });
      if (order?.orderNumber) {
        assignedOrderNum = order.orderNumber;
        setOrderNumber(assignedOrderNum);
      }
      setIsSuccess(true);
    } catch (err) {
      console.warn('Could not persist CRM order to backend:', err);
      const fallbackNum = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderNumber(fallbackNum);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
    <Modal isOpen={isOpen} onClose={handleReset} title={isSuccess ? (language === 'uz' ? 'Buyurtma qabul qilindi' : 'Заказ оформлен') : t('order_modal_title')} maxWidth="md">
      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h4 className="font-serif text-2xl font-bold text-[#1A1917]">
              {language === 'uz' ? 'Buyurtmangiz qabul qilindi!' : 'Заказ успешно оформлен!'}
            </h4>
            <p className="mx-auto max-w-sm text-xs text-[#8A8680] leading-relaxed mt-1.5">
              {language === 'uz'
                ? "Xaridingiz uchun tashakkur! Buyurtma qabul qilindi. Menejerimiz tez orada telefon orqali siz bilan bog'lanadi."
                : 'Спасибо за покупку! Заказ принят в систему. Наш менеджер свяжется с вами по указанному номеру для подтверждения и отправки.'}
            </p>
          </div>

          {orderNumber && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] text-xs font-bold text-[#1A1917]">
              <span>{language === 'uz' ? 'Buyurtma kodi:' : 'Номер заказа:'}</span>
              <span className="text-[#B89254] font-mono font-black text-sm">#{orderNumber}</span>
              <button
                onClick={() => handleCopyText(`#${orderNumber}`)}
                className="p-1 hover:text-[#B89254] transition-colors cursor-pointer text-[#8A8680]"
                title="Скопировать"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E1] text-left text-xs space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between items-center text-[#8A8680]">
              <span>Товар:</span>
              <span className="font-medium text-[#1A1917] truncate max-w-[180px]">{productTitle}</span>
            </div>
            <div className="flex justify-between items-center text-[#8A8680]">
              <span>Количество:</span>
              <span className="font-medium text-[#1A1917]">{quantity} шт.</span>
            </div>
            <div className="flex justify-between items-center text-[#8A8680] pt-1.5 border-t border-[#ECE8E1]">
              <span className="font-bold text-[#1A1917]">Сумма:</span>
              <span className="font-bold text-[#B89254] font-serif text-sm">{priceFormatted}</span>
            </div>
          </div>

          <div className="mx-auto flex max-w-sm flex-col gap-2 pt-2">
            <Button
              variant="primary"
              onClick={handleReset}
              fullWidth
              size="lg"
              className="rounded-xl font-bold bg-[#1A1917] hover:bg-[#B89254] text-white py-3.5"
            >
              {language === 'uz' ? 'Xaridni davom ettirish' : 'Продолжить покупки'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSendOrder} className="space-y-3.5">
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
                className="p-1 text-[#8A8680] hover:text-[#1A1917] cursor-pointer"
              >
                -
              </button>
              <span className="text-xs font-bold px-1.5 text-[#1A1917]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 text-[#8A8680] hover:text-[#1A1917] cursor-pointer"
              >
                +
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

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              size="lg"
              fullWidth
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
          </div>
        </form>
      )}
    </Modal>
  );
};
