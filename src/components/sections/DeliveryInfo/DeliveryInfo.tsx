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
    <section id="delivery" className="scroll-mt-20 bg-[#F7EDE8]/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Как заказать"
          badgeIcon={<PackageCheck className="h-3.5 w-3.5 text-[#C2836B]" />}
          title="От публикации до заказа"
          subtitle="Сначала уточним детали заказа и только потом согласуем доставку."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {ORDER_STEPS.map((step, index) => (
            <Card key={step.title} glass className="border-[#EED9CF] p-5 sm:p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#EED9CF] bg-[#FAF5EE] text-[#A96851]">
                {step.icon}
              </div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#A96851]">
                Шаг {index + 1}
              </p>
              <h3 className="font-serif text-lg font-medium text-[#2D2A2E]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6C635B]">{step.description}</p>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-5 max-w-3xl text-center text-sm text-[#6C635B]">
          Стоимость и срок доставки зависят от направления и подтверждаются при оформлении.
        </p>
      </div>
    </section>
  );
};
