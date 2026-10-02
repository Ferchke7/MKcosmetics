import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MessageCircle, CheckCircle2, Package, Loader2 } from 'lucide-react';
import { buildWhatsAppUrl } from '../../core/constants/brand';
import { useLanguage } from '../../core/i18n/LanguageContext';
import { adminService } from '../../services/admin/adminService';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  priceFormatted: string;
  sourceUrl?: string;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  productTitle,
  priceFormatted,
  sourceUrl,
}) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [countryCity, setCountryCity] = useState('');
  const [phoneOrTelegram, setPhoneOrTelegram] = useState('');
  const [comment, setComment] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [preparedUrl, setPreparedUrl] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let assignedOrderNum = '';
    try {
      const order = await adminService.createPublicOrder({
        customerName: name || 'Клиент',
        phone: phoneOrTelegram,
        channelSource: 'quick_order',
        type: 'quick_order',
        items: [
          {
            productId: 'quick-order',
            title: productTitle,
            price: 0,
            currency: 'KRW',
            quantity: 1,
          },
        ],
        notes: `Город/Страна: ${countryCity}\nПожелание: ${comment}\nТовар: ${productTitle} (${priceFormatted})\nИсточник: ${sourceUrl || ''}`,
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
      : `🌸 *Здравствуйте, Мухаббат! Хочу заказать косметику:*\n\n`;

    if (assignedOrderNum) {
      message += `📋 *${language === 'uz' ? 'Buyurtma raqami' : 'Номер заказа'}:* ${assignedOrderNum}\n`;
    }
    message += `🛍️ *${language === 'uz' ? 'Mahsulot' : 'Товар'}:* ${productTitle}\n`;
    message += `💰 *${language === 'uz' ? 'Narx' : 'Цена'}:* ${priceFormatted}\n`;
    if (name) message += `👤 *${language === 'uz' ? 'Ism' : 'Имя'}:* ${name}\n`;
    if (countryCity) message += `📍 *${language === 'uz' ? 'Yetkazib berish manzili' : 'Город/Страна доставки'}:* ${countryCity}\n`;
    if (phoneOrTelegram) message += `📱 *${language === 'uz' ? 'Aloqa' : 'Контакты'}:* ${phoneOrTelegram}\n`;
    if (comment) message += `💬 *${language === 'uz' ? 'Izoh' : 'Пожелание/Вопрос'}:* ${comment}\n`;
    if (sourceUrl) message += `🔗 *${language === 'uz' ? 'Havola' : 'Ссылка'}:* ${sourceUrl}\n`;
    message += language === 'uz'
      ? `\nIltimos, mavjudligini tasdiqlang va yetkazib berish narxini hisoblab bering ✨`
      : `\nПожалуйста, подтвердите наличие и рассчитайте доставку ✨`;

    const url = buildWhatsAppUrl(message);
    setPreparedUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsSuccess(true);
  };

  const handleReset = () => {
    setName('');
    setCountryCity('');
    setPhoneOrTelegram('');
    setComment('');
    setPreparedUrl('');
    setOrderNumber('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title={t('order_modal_title')} maxWidth="md">
      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h4 className="font-serif text-2xl font-medium text-[#2D2A2E]">
            {t('order_success_title')}
          </h4>
          {orderNumber && (
            <div className="inline-block px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#EED9CF] text-xs font-bold text-[#8A503C]">
              {language === 'uz' ? 'Buyurtma' : 'Заказ'} #{orderNumber}
            </div>
          )}
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-[#8C827A]">
            {t('order_success_desc')}
          </p>
          <div className="mx-auto flex max-w-sm flex-col gap-2 pt-2">
            <a
              href={preparedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#20BA5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <Button variant="ghost" onClick={handleReset} fullWidth>
              OK
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSendWhatsApp} className="space-y-4">
          {/* Product Summary Box */}
          <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#EED9CF] flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white text-[#C2836B] shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className="text-xs font-semibold text-[#8A503C] uppercase tracking-wider">
                {t('order_modal_selected')}
              </h5>
              <p className="text-sm font-medium text-[#2D2A2E] line-clamp-2 mt-0.5">
                {productTitle}
              </p>
              <span className="mt-1 inline-block text-sm font-semibold text-[#C2836B]">
                {priceFormatted}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              label={t('order_name')}
              placeholder={t('order_name_placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label={t('order_city')}
              placeholder={t('order_city_placeholder')}
              value={countryCity}
              onChange={(e) => setCountryCity(e.target.value)}
              required
            />

            <Input
              label={t('order_contact')}
              placeholder={t('order_contact_placeholder')}
              value={phoneOrTelegram}
              onChange={(e) => setPhoneOrTelegram(e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium text-[#6C3E2E] uppercase tracking-wider mb-1.5">
                {t('order_comment')}
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('order_comment_placeholder')}
                className="w-full rounded-xl border border-[#EED9CF] bg-white px-4 py-2 text-sm text-[#2D2A2E] placeholder-[#A89F97] focus:border-[#C2836B] focus:outline-none focus:ring-1 focus:ring-[#C2836B]"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="whatsapp"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              icon={isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
            >
              {isSubmitting ? 'Оформление...' : t('order_btn_whatsapp')}
            </Button>
            <p className="text-[11px] text-center text-[#8C827A] mt-2">
              {t('order_disclaimer')}
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};
