import React, { useState } from 'react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { MessageCircle, SendHorizontal, Phone, Send } from 'lucide-react';
import { InstagramIcon } from '../../ui/InstagramIcon';
import { BRAND_CONFIG, buildWhatsAppUrl } from '../../../core/constants/brand';
import { useLanguage } from '../../../core/i18n/LanguageContext';

export const Contact: React.FC = () => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [preparedUrl, setPreparedUrl] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const greeting = language === 'uz'
      ? 'Assalomu alaykum! MK KOREA COSMETIC saytidan yozmoqdaman.'
      : 'Здравствуйте! Пишу с сайта MK KOREA COSMETIC.';

    const message = [
      greeting,
      name.trim() ? `${language === 'uz' ? 'Ism' : 'Имя'}: ${name.trim()}` : '',
      `${language === 'uz' ? 'Savol' : 'Вопрос'}: ${messageText.trim()}`,
    ].filter(Boolean).join('\n\n');
    const url = buildWhatsAppUrl(message);

    setPreparedUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const resetForm = () => {
    setPreparedUrl('');
    setMessageText('');
    setName('');
  };

  const socialChannels = [
    {
      title: 'Instagram',
      subtitle: BRAND_CONFIG.instagramHandle || '@muhabbat.kim.mk',
      url: BRAND_CONFIG.instagramUrl || 'https://www.instagram.com/muhabbat.kim.mk/',
      icon: InstagramIcon,
      color: 'hover:border-[#E1306C] hover:text-[#E1306C]',
      iconBg: 'bg-[#E1306C]/10 text-[#E1306C]',
      btnText: language === 'uz' ? "Obuna bo'lish" : 'Подписаться',
    },
    {
      title: 'Telegram',
      subtitle: BRAND_CONFIG.telegramChannel,
      url: BRAND_CONFIG.telegramChannelUrl,
      icon: Send,
      color: 'hover:border-[#229ED9] hover:text-[#229ED9]',
      iconBg: 'bg-[#229ED9]/10 text-[#229ED9]',
      btnText: language === 'uz' ? 'Yozish' : 'Написать нам',
    },
    {
      title: 'WhatsApp',
      subtitle: BRAND_CONFIG.phoneDisplay,
      url: BRAND_CONFIG.whatsappUrl,
      icon: MessageCircle,
      color: 'hover:border-[#25D366] hover:text-[#25D366]',
      iconBg: 'bg-[#25D366]/10 text-[#25D366]',
      btnText: 'WhatsApp',
    },
    {
      title: language === 'uz' ? 'Telefon' : 'Телефон',
      subtitle: BRAND_CONFIG.phoneDisplay,
      url: `tel:${BRAND_CONFIG.phone}`,
      icon: Phone,
      color: 'hover:border-[#C2836B] hover:text-[#C2836B]',
      iconBg: 'bg-[#C2836B]/10 text-[#C2836B]',
      btnText: language === 'uz' ? "Qo'ng'iroq" : 'Позвонить',
    },
  ];

  return (
    <section id="contacts" className="scroll-mt-20 bg-[#FAF8F5] py-16 sm:py-24 border-t border-[#ECE8E1]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge={t('contact_badge')}
          badgeIcon={<MessageCircle className="h-3.5 w-3.5 text-[#B89254]" />}
          title={t('contact_title')}
          subtitle={t('contact_subtitle')}
        />

        {/* Social channels grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {socialChannels.map((ch) => {
            const Icon = ch.icon;
            return (
              <a
                key={ch.title}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 rounded-2xl bg-white border border-[#ECE8E1] transition-all duration-200 hover:shadow-md flex flex-col items-center text-center group ${ch.color}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${ch.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm text-[#1A1917] group-hover:text-inherit">
                  {ch.title}
                </h4>
                <p className="text-xs text-[#8A8680] mt-0.5 truncate max-w-full">
                  {ch.subtitle}
                </p>
                <span className="mt-3 text-[11px] font-bold text-[#B89254] group-hover:underline">
                  {ch.btnText} →
                </span>
              </a>
            );
          })}
        </div>

        {/* Fast question form */}
        <Card className="border-[#ECE8E1] bg-white p-6 shadow-soft sm:p-8 max-w-2xl mx-auto">
          {preparedUrl ? (
            <div className="space-y-4 text-center" role="status">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/10 text-[#20BA5A]">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1A1917]">
                  {t('order_success_title')}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#8A8680]">
                  {t('order_success_desc')}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={preparedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium tracking-wide text-white shadow-sm transition-colors hover:bg-[#20BA5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <Button variant="ghost" size="md" onClick={resetForm} className="border border-[#ECE8E1] text-[#1A1917]">
                  OK
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-serif text-xl font-bold text-[#1A1917]">
                  {t('contact_quick_question')}
                </h3>
                <p className="text-xs text-[#8A8680] mt-1">
                  {t('contact_quick_question_desc')}
                </p>
              </div>

              <Input
                label={t('order_name')}
                placeholder={t('order_name_placeholder')}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-xs font-bold text-[#8A8680] uppercase tracking-wider">
                  {t('contact_your_question')}
                </label>
                <textarea
                  id="contact-message"
                  rows={3}
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder={t('contact_question_placeholder')}
                  required
                  className="w-full rounded-xl border border-[#ECE8E1] bg-white px-4 py-2.5 text-sm text-[#1A1917] placeholder-[#8A8680] focus:border-[#B89254] focus:outline-none focus:ring-1 focus:ring-[#B89254]"
                />
              </div>

              <Button
                type="submit"
                variant="whatsapp"
                size="lg"
                fullWidth
                icon={<SendHorizontal className="h-4 w-4" />}
              >
                {t('contact_btn_send')}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
};
