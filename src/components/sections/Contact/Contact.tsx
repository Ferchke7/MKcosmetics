import React, { useState } from 'react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { InstagramIcon } from '../../ui/Icons';
import { MessageCircle, Send, Phone, MapPin, Clock, Sparkles, SendHorizontal } from 'lucide-react';
import { BRAND_CONFIG, buildWhatsAppUrl } from '../../../core/constants/brand';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [messageText, setMessageText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let msg = `🌸 *Здравствуйте, Мухаббат! Обращение с сайта MK KOREA COSMETIC:*\n\n`;
    if (name) msg += `👤 *Имя:* ${name}\n`;
    if (contactInfo) msg += `📱 *Контакт для ответа:* ${contactInfo}\n`;
    if (messageText) msg += `💬 *Сообщение:* ${messageText}\n`;
    msg += `\nБуду ждать ответа! ✨`;

    const url = buildWhatsAppUrl(msg);
    window.open(url, '_blank');
    setSubmitted(true);
  };

  return (
    <section id="contacts" className="py-20 sm:py-28 bg-[#F7EDE8]/40 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Связаться с нами"
          badgeIcon={<Phone className="w-3.5 h-3.5 text-[#C2836B]" />}
          title="Контакты и прямая связь"
          subtitle="Мы на связи 24/7 в любимых мессенджерах для консультаций, заказов и оптовых предложений"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Channels */}
          <div className="lg:col-span-5 space-y-4">
            {/* WhatsApp Card */}
            <a
              href={BRAND_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card glass className="p-5 flex items-center justify-between border-[#EED9CF] group-hover:border-[#25D366]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#20BA5A] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors shadow-xs">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider block">
                      WhatsApp чат & консультации
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#2D2A2E] mt-0.5">
                      {BRAND_CONFIG.phoneDisplay}
                    </h4>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#20BA5A] group-hover:translate-x-1 transition-transform">
                  Написать ›
                </span>
              </Card>
            </a>

            {/* Telegram Channel Card */}
            <a
              href={BRAND_CONFIG.telegramChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card glass className="p-5 flex items-center justify-between border-[#EED9CF] group-hover:border-[#229ED9]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#229ED9]/15 text-[#1E8BC0] flex items-center justify-center group-hover:bg-[#229ED9] group-hover:text-white transition-colors shadow-xs">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider block">
                      Telegram канал
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#2D2A2E] mt-0.5">
                      {BRAND_CONFIG.telegramChannel}
                    </h4>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#1E8BC0] group-hover:translate-x-1 transition-transform">
                  Открыть ›
                </span>
              </Card>
            </a>

            {/* Instagram Card */}
            <a
              href={BRAND_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card glass className="p-5 flex items-center justify-between border-[#EED9CF] group-hover:border-[#E1306C]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E1306C]/15 text-[#C13584] flex items-center justify-center group-hover:bg-[#E1306C] group-hover:text-white transition-colors shadow-xs">
                    <InstagramIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider block">
                      Instagram профиль
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#2D2A2E] mt-0.5">
                      {BRAND_CONFIG.instagramHandle}
                    </h4>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#C13584] group-hover:translate-x-1 transition-transform">
                  Перейти ›
                </span>
              </Card>
            </a>

            {/* Location & Hours */}
            <Card className="p-5 bg-white/70 border-[#EED9CF] space-y-2.5">
              <div className="flex items-center gap-3 text-xs text-[#6C635B]">
                <MapPin className="w-4 h-4 text-[#C2836B] shrink-0" />
                <span>{BRAND_CONFIG.location}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#6C635B]">
                <Clock className="w-4 h-4 text-[#C2836B] shrink-0" />
                <span>{BRAND_CONFIG.workingHours}</span>
              </div>
            </Card>
          </div>

          {/* Right: Direct Inquiry Form */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 bg-white border-[#F0E6DE] shadow-soft">
              <h3 className="font-serif text-xl sm:text-2xl text-[#2D2A2E] font-medium mb-1">
                Напишите нам напрямую
              </h3>
              <p className="text-xs sm:text-sm text-[#8C827A] mb-6">
                Задайте любой вопрос по косметике, доставке, ценам или оптовым закупкам
              </p>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <h4 className="text-sm font-bold text-emerald-800">
                    Сообщение сформировано!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Мы открыли WhatsApp с вашим текстом. Нажмите кнопку отправки в приложении.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setMessageText('');
                    }}
                  >
                    Отправить еще вопрос
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Ваше имя"
                      placeholder="Как к вам обращаться"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="Телефон / Telegram / Email"
                      placeholder="+7 999 000-00-00 или @username"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#6C3E2E] uppercase tracking-wider mb-1.5">
                      Ваш вопрос или пожелание
                    </label>
                    <textarea
                      rows={4}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Например: Хочу заказать набор Whoo и пилинг CNP с доставкой в Москву, подскажите точную стоимость..."
                      className="w-full rounded-xl border border-[#EED9CF] bg-white px-4 py-2.5 text-sm text-[#2D2A2E] placeholder-[#A89F97] focus:border-[#C2836B] focus:outline-none focus:ring-1 focus:ring-[#C2836B]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={<SendHorizontal className="w-4 h-4" />}
                  >
                    Отправить вопрос в WhatsApp
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
