import React from 'react';
import { ShieldCheck, Plane, Sparkles, Award, HeartHandshake, Box } from 'lucide-react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';

export const Features: React.FC = () => {
  const benefits = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#C2836B]" />,
      title: '100% Оригинал из Кореи',
      description: 'Только подлинная продукция от официальных дистрибьюторов и фарм-концернов (LG, Amorepacific) со свежими сроками годности.',
    },
    {
      icon: <Plane className="w-6 h-6 text-[#C2836B]" />,
      title: 'Доставка прямо до двери',
      description: 'Быстрая и надежная международная доставка во все страны мира (РФ, Казахстан, Узбекистан, Европа, США) с трек-номером.',
    },
    {
      icon: <Award className="w-6 h-6 text-[#C2836B]" />,
      title: 'Премиум & Люкс сегмент',
      description: 'Эксклюзивные линейки королевской косметики (Whoo, Sulwhasoo, CNP Rx), доступные по самым выгодным ценам напрямую из Сеула.',
    },
    {
      icon: <Box className="w-6 h-6 text-[#C2836B]" />,
      title: 'Оптом и в розницу',
      description: 'Работаем как с розничными ценителями K-Beauty, так и с оптовыми покупателями, салонами красоты и косметологами.',
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-[#C2836B]" />,
      title: 'Индивидуальный подбор 24/7',
      description: 'Мухаббат Ким лично помогает составить работающую схему ухода с учетом типа кожи, возраста и климатических условий.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#C2836B]" />,
      title: 'Подарки и пробники в посылке',
      description: 'К каждому заказу мы заботливо вкладываем оригинальные корейские пробники новинок и миниатюры люксового ухода.',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 bg-[#FAF7F2] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Наши преимущества"
          badgeIcon={<Sparkles className="w-3.5 h-3.5" />}
          title="Почему выбирают MK KOREA COSMETIC"
          subtitle="Мы соединяем вас с лучшими косметическими лабораториями Сеула без посредников и наценок"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((item, idx) => (
            <Card key={idx} className="p-6 sm:p-7 flex flex-col justify-between" glass>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FAF5EE] border border-[#EED9CF] flex items-center justify-center mb-5 shadow-xs">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2D2A2E] mb-2.5">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6C635B] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
