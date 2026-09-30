import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MessageCircle, Send, CheckCircle2, Package, Sparkles } from 'lucide-react';
import { buildWhatsAppUrl } from '../../core/constants/brand';

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
  const [name, setName] = useState('');
  const [countryCity, setCountryCity] = useState('');
  const [phoneOrTelegram, setPhoneOrTelegram] = useState('');
  const [comment, setComment] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    let message = `🌸 *Здравствуйте, Мухаббат! Хочу заказать косметику:*\n\n`;
    message += `🛍️ *Товар:* ${productTitle}\n`;
    message += `💰 *Цена:* ${priceFormatted}\n`;
    if (name) message += `👤 *Имя:* ${name}\n`;
    if (countryCity) message += `📍 *Город/Страна доставки:* ${countryCity}\n`;
    if (phoneOrTelegram) message += `📱 *Контакты:* ${phoneOrTelegram}\n`;
    if (comment) message += `💬 *Пожелание/Вопрос:* ${comment}\n`;
    if (sourceUrl) message += `🔗 *Ссылка:* ${sourceUrl}\n`;
    message += `\nПожалуйста, подтвердите наличие и рассчитайте доставку ✨`;

    const url = buildWhatsAppUrl(message);
    window.open(url, '_blank');
    setIsSuccess(true);
  };

  const handleReset = () => {
    setName('');
    setCountryCity('');
    setPhoneOrTelegram('');
    setComment('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Быстрый заказ косметики" maxWidth="md">
      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h4 className="font-serif text-2xl text-[#2D2A2E] font-medium">
            Чат в WhatsApp открыт!
          </h4>
          <p className="text-sm text-[#8C827A] leading-relaxed max-w-sm mx-auto">
            Ваше сообщение сформировано и отправлено Мухаббат Ким. Консультант свяжется с вами в течение 5 минут.
          </p>
          <Button variant="primary" onClick={handleReset} fullWidth className="mt-4">
            Готово
          </Button>
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
                Выбранный товар
              </h5>
              <p className="text-sm font-medium text-[#2D2A2E] line-clamp-2 mt-0.5">
                {productTitle}
              </p>
              <span className="inline-block mt-1 font-semibold text-sm text-[#C2836B]">
                {priceFormatted}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              label="Ваше имя"
              placeholder="Например, Анна"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Город и страна доставки"
              placeholder="Например, Москва / Ташкент / Алматы"
              value={countryCity}
              onChange={(e) => setCountryCity(e.target.value)}
              required
            />

            <Input
              label="Телефон / Telegram для связи"
              placeholder="+7 / +998 / @username"
              value={phoneOrTelegram}
              onChange={(e) => setPhoneOrTelegram(e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium text-[#6C3E2E] uppercase tracking-wider mb-1.5">
                Комментарий или вопрос (необязательно)
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Укажите тип кожи или вопрос по товару..."
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
              icon={<MessageCircle className="w-5 h-5" />}
            >
              Заказать через WhatsApp
            </Button>
            <p className="text-[11px] text-center text-[#8C827A] mt-2">
              Откроется прямой чат с основателем бренда Мухаббат Ким
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};
