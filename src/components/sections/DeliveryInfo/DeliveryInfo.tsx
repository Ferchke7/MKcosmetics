import React from 'react';
import { MessageCircle, PackageCheck, Send } from 'lucide-react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';

const ORDER_STEPS = [
  {
    icon: <Send className="h-5 w-5" />,
    title: 'Выберите публикацию',
    description: 'Откройте предложение и нажмите «Заказать».',
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: 'Напишите в WhatsApp',
    description: 'В сообщении будут товар, цена из публикации и ссылка на пост.',
  },
  {
    icon: <PackageCheck className="h-5 w-5" />,
    title: 'Подтвердите детали',
    description: 'Консультант уточнит наличие, актуальную цену и доставку.',
  },
];

export const DeliveryInfo: React.FC = () => {
  return (
    <section id="delivery" className="scroll-mt-20 bg-[#FAF8F5] py-16 sm:py-24 border-t border-[#ECE8E1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Как заказать"
          badgeIcon={<PackageCheck className="h-3.5 w-3.5 text-[#B89254]" />}
          title="От публикации до заказа"
          subtitle="Сначала уточним детали заказа и только потом согласуем доставку."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {ORDER_STEPS.map((step, index) => (
            <Card key={step.title} glass className="border-[#ECE8E1] bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#ECE8E1] bg-[#FAF8F5] text-[#B89254]">
                {step.icon}
              </div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#B89254]">
                Шаг {index + 1}
              </p>
              <h3 className="font-serif text-lg font-bold text-[#1A1917]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8A8680]">{step.description}</p>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-5 max-w-3xl text-center text-sm text-[#8A8680]">
          Стоимость и срок доставки зависят от направления и подтверждаются при оформлении.
        </p>
      </div>
    </section>
  );
};
