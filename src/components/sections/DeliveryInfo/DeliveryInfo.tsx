import React from 'react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { Plane, Package, ShieldCheck, MapPin, Clock, ArrowRight } from 'lucide-react';
import { BRAND_CONFIG } from '../../../core/constants/brand';

export const DeliveryInfo: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Подбор & Оформление',
      desc: 'Вы выбираете средства на сайте, в Telegram или проходите тест. Консультант подтверждает заказ в WhatsApp/TG.',
    },
    {
      step: '02',
      title: 'Сборка в Сеуле',
      desc: 'Мы бережно упаковываем заказ в многослойную пупырчатую пленку и вкладываем подарки и пробники.',
    },
    {
      step: '03',
      title: 'Экспресс Авиадоставка',
      desc: 'Посылка отправляется самолетом. Вы получаете персональный трек-номер для круглосуточного отслеживания.',
    },
    {
      step: '04',
      title: 'Вручение до двери',
      desc: 'Курьерская служба доставляет заказ прямо к вашей двери в оговоренное время в полной сохранности.',
    },
  ];

  const regions = [
    { name: 'Россия (все города)', time: '7-12 дней', note: 'СДЭК / EMS до двери' },
    { name: 'Казахстан & Узбекистан', time: '5-9 дней', note: 'Авиа-курьер' },
    { name: 'Кыргызстан & СНГ', time: '6-10 дней', note: 'Экспресс-доставка' },
    { name: 'Европа, Турция, США', time: '5-10 дней', note: 'Международная курьерская служба' },
  ];

  return (
    <section id="delivery" className="py-20 sm:py-28 bg-[#F7EDE8]/30 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Международная логистика"
          badgeIcon={<Plane className="w-3.5 h-3.5 text-[#C2836B]" />}
          title="Доставка до двери по всему миру"
          subtitle="Надежные авиа-маршруты из Южной Кореи прямо в руки покупателю"
        />

        {/* 4 Steps Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((item, idx) => (
            <Card key={idx} glass className="p-6 relative border-[#EED9CF]">
              <div className="text-3xl font-serif font-bold text-[#E1BEAF] mb-3">
                {item.step}
              </div>
              <h4 className="font-serif text-base font-semibold text-[#2D2A2E] mb-1.5">
                {item.title}
              </h4>
              <p className="text-xs text-[#6C635B] leading-relaxed">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>

        {/* Geography & Guarantees */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-[#F0E6DE] shadow-soft">
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-serif text-2xl text-[#2D2A2E] font-medium">
              География и сроки доставки
            </h3>
            <p className="text-xs sm:text-sm text-[#6C635B] leading-relaxed">
              Мы отправляем заказы ежедневно из нашего склада в Сеуле. Каждое отправление застраховано и защищено специальной термо-упаковкой для сохранения формул косметики в идеальном виде.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {regions.map((reg, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#F0E6DE]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D2A2E]">{reg.name}</span>
                    <span className="text-[11px] font-semibold text-[#C2836B]">{reg.time}</span>
                  </div>
                  <span className="text-[10px] text-[#8C827A] block mt-0.5">{reg.note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-3 lg:pl-6 lg:border-l lg:border-[#F0E6DE]">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF5EE] border border-[#EED9CF]">
              <ShieldCheck className="w-5 h-5 text-[#C2836B] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-[#2D2A2E]">100% Гарантия целостности</h5>
                <p className="text-xs text-[#6C635B] mt-0.5">В случае повреждения при доставке мы отправляем замену за наш счет.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#EEF5F1] border border-[#CCE3D6]">
              <Package className="w-5 h-5 text-[#426855] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-[#2D2A2E]">Подарки в каждом заказе</h5>
                <p className="text-xs text-[#6C635B] mt-0.5">Кладем премиальные пробники и маски для лица к каждой посылке.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FDF8F6] border border-[#EED9CF]">
              <Clock className="w-5 h-5 text-[#8A503C] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-[#2D2A2E]">Круглосуточный трекинг</h5>
                <p className="text-xs text-[#6C635B] mt-0.5">Вы всегда знаете, где находится ваша посылка на каждом этапе пути.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
