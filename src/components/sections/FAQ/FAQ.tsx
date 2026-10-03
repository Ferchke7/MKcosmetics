import React, { useState } from 'react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'Как заказать товар из публикации?',
    answer: 'Нажмите «Заказать» в карточке товара. WhatsApp откроется с подготовленным сообщением и ссылкой на публикацию. Проверьте текст и отправьте его консультанту.',
  },
  {
    question: 'Цена и наличие в публикации актуальны?',
    answer: 'В карточке указана цена из публикации. Перед оформлением заказа консультант подтвердит актуальную стоимость и наличие.',
  },
  {
    question: 'Как узнать стоимость и срок доставки?',
    answer: 'Напишите в WhatsApp и укажите страну и город. Условия доставки подтвердят перед оформлением заказа.',
  },
  {
    question: 'Как попросить подобрать уход?',
    answer: 'Ответьте на три вопроса в тесте на сайте. WhatsApp откроется с краткой сводкой ваших ответов — отправьте её, чтобы обсудить уход с консультантом.',
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
          title="Перед заказом"
          subtitle="Коротко о заказе, ценах и доставке."
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
