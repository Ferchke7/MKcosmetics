import React, { useState } from 'react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Как я могу быть уверен(а) в 100% оригинальности косметики?',
      answer: 'Мы находимся непосредственно в Южной Корее (г. Сеул) и работаем только с официальными фармацевтическими заводами, дистрибьюторами брендов (LG Household & Health Care, Amorepacific) и крупными сетями. Вся продукция сертифицирована, имеет актуальные батч-коды и максимальные сроки годности.',
    },
    {
      question: 'Как осуществляется доставка и сколько времени она занимает?',
      answer: 'Доставка осуществляется авиа-сообщением из Сеула с последующим вручением курьером до вашей двери. Сроки доставки в Россию — 7-12 дней, в Казахстан и Узбекистан — 5-9 дней, в Европу и США — 5-10 дней. После отправки мы предоставляем трек-номер для круглосуточного отслеживания.',
    },
    {
      question: 'Можно ли заказать косметику оптом для магазина или салона красоты?',
      answer: 'Да! Мы работаем как в розницу, так и мелким/крупным оптом. Для оптовых клиентов действуют специальные фабричные прайс-листы и помощь с таможенным оформлением. Напишите нам в WhatsApp или Telegram для получения оптового каталога.',
    },
    {
      question: 'Как оплатить заказ?',
      answer: 'Оплата производится удобным для вас способом: банковской картой (РФ, СНГ, Международные карты), через СБП, переводом или электронными платежными системами. Все детали согласовываются с консультантом в чате перед отправкой.',
    },
    {
      question: 'Что делать, если я не знаю, какая косметика мне подойдет?',
      answer: 'Пройдите наш экспресс-тест на сайте или напишите напрямую Мухаббат Ким в WhatsApp (+82 10 8390 5577). Расскажите о типе кожи и текущих пожеланиях — мы бесплатно подберем индивидуальную пошаговую схему ухода.',
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#FAF7F2] scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Частые вопросы"
          badgeIcon={<HelpCircle className="w-3.5 h-3.5 text-[#C2836B]" />}
          title="Ответы на популярные вопросы"
          subtitle="Все, что нужно знать о заказе, оригинальности, сроках и оплате"
        />

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Card
                key={idx}
                className="bg-white border-[#F0E6DE] transition-all overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition-colors hover:bg-[#FAF5EE]/50"
                >
                  <span className="font-serif text-base sm:text-lg font-medium text-[#2D2A2E]">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-[#FAF5EE] border border-[#EED9CF] flex items-center justify-center text-[#8A503C] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#C2836B] text-white border-[#C2836B]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#6C635B] leading-relaxed border-t border-[#F0E6DE]/60 pt-3 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
