import React from 'react';
import { Truck, ShieldCheck, Warehouse, Send } from 'lucide-react';
import { BRAND_CONFIG } from '../../core/constants/brand';

export const FeatureBadgesBar: React.FC = () => {
  const features = [
    {
      icon: <Truck className="w-5 h-5 text-kraft" />,
      title: 'Доставка по Корее и СНГ',
      desc: 'Курьер по Корее (5 000 ₩), авиа-карго в Узбекистан/СНГ',
    },
    {
      icon: <Warehouse className="w-5 h-5 text-kraft" />,
      title: 'Склад в Сеуле',
      desc: 'Прямые отгрузки из Южной Кореи без посредников',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-kraft" />,
      title: '100% Оригинал',
      desc: 'Сертифицированная продукция с корейскими батч-кодами',
    },
    {
      icon: <Send className="w-5 h-5 text-[#229ED9]" />,
      title: 'Связь в Telegram',
      desc: `${BRAND_CONFIG.telegramChannel || '@mkcosmetkor'} — консультации 24/7`,
      link: BRAND_CONFIG.telegramChannelUrl,
    },
  ];

  return (
    <div className="bg-[#FAF7F2] border-b border-line py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => {
          const content = (
            <div className="flex items-start gap-3.5 p-3 rounded-2xl transition-all hover:bg-white/80">
              <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center shrink-0 border border-line">
                {f.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                  {f.title}
                </h4>
                <p className="text-xs text-muted mt-0.5 leading-snug">
                  {f.desc}
                </p>
              </div>
            </div>
          );

          if (f.link) {
            return (
              <a
                key={i}
                href={f.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                {content}
              </a>
            );
          }

          return <div key={i}>{content}</div>;
        })}
      </div>
    </div>
  );
};
