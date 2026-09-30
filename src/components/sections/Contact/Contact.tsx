import React, { useState } from 'react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { MessageCircle, SendHorizontal } from 'lucide-react';
import { buildWhatsAppUrl } from '../../../core/constants/brand';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [preparedUrl, setPreparedUrl] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const message = [
      'Здравствуйте! Пишу с сайта MK KOREA COSMETIC.',
      name.trim() ? `Имя: ${name.trim()}` : '',
      `Вопрос: ${messageText.trim()}`,
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

  return (
    <section id="contacts" className="scroll-mt-20 bg-[#F7EDE8]/40 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Связаться"
          badgeIcon={<MessageCircle className="h-3.5 w-3.5 text-[#C2836B]" />}
          title="Остались вопросы?"
          subtitle="Напишите нам в WhatsApp, чтобы уточнить цену, наличие или доставку."
        />

        <Card className="border-[#F0E6DE] bg-white p-6 shadow-soft sm:p-8">
          {preparedUrl ? (
            <div className="space-y-4 text-center" role="status">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/10 text-[#20BA5A]">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-medium text-[#2D2A2E]">Черновик сообщения готов</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#6C635B]">
                  Проверьте текст в WhatsApp и нажмите «Отправить».
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
                  Открыть WhatsApp
                </a>
                <Button variant="ghost" size="md" onClick={resetForm}>
                  Задать ещё вопрос
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Ваше имя (необязательно)"
                placeholder="Как к вам обращаться"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium text-[#6C3E2E]">
                  Ваш вопрос
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Напишите, чем мы можем помочь…"
                  required
                  className="w-full rounded-xl border border-[#EED9CF] bg-white px-4 py-2.5 text-sm text-[#2D2A2E] placeholder-[#A89F97] focus:border-[#C2836B] focus:outline-none focus:ring-1 focus:ring-[#C2836B]"
                />
              </div>

              <Button
                type="submit"
                variant="whatsapp"
                size="lg"
                fullWidth
                icon={<SendHorizontal className="h-4 w-4" />}
              >
                Продолжить в WhatsApp
              </Button>
              <p className="text-center text-xs text-[#8C827A]">
                Сообщение откроется в WhatsApp как черновик.
              </p>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
};
