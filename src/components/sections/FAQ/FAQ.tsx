import React, { useState } from 'react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQ_ITEMS = [
  {
    question: 'Оригинальная ли косметика и откуда осуществляются отправки?',
    answer: '100% оригинальная сертифицированная продукция с внутреннего рынка Южной Кореи. Все заказы комплектуются и отправляются напрямую с нашего оптового склада в Сеуле со свежими сроками годности и заводскими батч-кодами.',
  },
  {
    question: 'Как осуществляется доставка в Россию, Казахстан, Узбекистан и СНГ?',
    answer: 'Мы отправляем заказы авиалиниями напрямую из Сеула. Средний срок доставки составляет 7-14 рабочих дней в зависимости от города назначения (Москва, Алматы, Ташкент, Астана и др.). Каждому отправлению присваивается международный трек-номер для круглосуточного отслеживания.',
  },
  {
    question: 'Работаете ли вы оптом для магазинов, студий и косметологов?',
    answer: 'Да, MK KOREA COSMETIC — прямой оптовый поставщик. Мы предоставляем прозрачный оптовый прайс-лист в вонах (KRW), гибкую систему накопительных и объемных скидок, а также быструю сборку и отправку партий любого масштаба.',
  },
  {
    question: 'Какие способы оплаты принимаются?',
    answer: 'Мы принимаем оплату удобными для вас методами: безналичный перевод, банковские карты (в рублях, тенге, сумах или долларах), оплата в корейских вонах (KRW), а также криптовалюта (USDT).',
  },
  {
    question: 'Как оформить заказ через сайт?',
    answer: 'Добавьте интересующие товары в корзину и нажмите «Оформить заказ». Вы можете подтвердить заказ через сайт или связаться с нашим персональным менеджером в WhatsApp / Telegram для быстрой консультации.',
  },
  {
    question: 'Помогаете ли вы с подбором ухода?',
    answer: 'Да! Наши эксперты находятся в Корее и отлично знают составы и совместимость компонентов. Напишите нам в WhatsApp или Telegram свой тип кожи и задачи — мы составим индивидуальную программу ухода.',
  },
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-[#FAF8F5] py-16 sm:py-24 border-t border-[#ECE8E1]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Частые вопросы"
          badgeIcon={<HelpCircle className="h-3.5 w-3.5 text-[#B89254]" />}
          title="Вопросы и ответы о покупке и доставке"
          subtitle="Всё о подлинности, оптовых поставках, сроках авиадоставки из Сеула и оплате."
        />

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;

            return (
              <Card key={item.question} className="overflow-hidden border-[#ECE8E1] bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[#FAF8F5]/60 sm:p-6 cursor-pointer"
                >
                  <span className="font-serif text-base font-semibold text-[#1A1917] sm:text-lg">
                    {item.question}
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ECE8E1] bg-[#FAF8F5] text-[#8A8680] transition-transform ${
                      isOpen ? 'rotate-180 bg-[#1A1917] text-[#B89254]' : ''
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={answerId}
                    role="region"
                    className="border-t border-[#ECE8E1] px-5 pb-5 pt-3 text-sm leading-relaxed text-[#8A8680] sm:px-6 sm:pb-6"
                  >
                    {item.answer}
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
