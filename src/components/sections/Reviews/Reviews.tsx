import React from 'react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { Star, MessageCircle, Heart, CheckCircle2, Sparkles } from 'lucide-react';

export const Reviews: React.FC = () => {
  const reviews = [
    {
      name: 'Елена Смирнова',
      city: 'Москва',
      rating: 5,
      date: '2 дня назад',
      product: 'The History of Whoo Cheongidan Set',
      text: 'Заказываю у Мухаббат уже третий раз! Королевский набор Whoo просто восхитителен. Кожа напиталась, морщинки разгладились, а в посылке было еще 6 пробников сывороток. Доставка СДЭК до двери за 8 дней из Сеула!',
    },
    {
      name: 'Динара Каримова',
      city: 'Ташкент',
      rating: 5,
      date: '1 неделю назад',
      product: 'CNP Rx PHA Peeling Pads + Sulwhasoo',
      text: 'Спасибо огромное за консультацию в WhatsApp! Пилинг-диски CNP избавили от черных точек и шелушений за неделю. Очень приятно, что Мухаббат подробно расписала очередность нанесения. 100% оригиналы!',
    },
    {
      name: 'Айгерим Нурланова',
      city: 'Алматы',
      rating: 5,
      date: '2 недели назад',
      product: 'Medi-Peel Bor-Tox Kit',
      text: 'Пептидный комплекс просто бомба! Действительно работает как мягкий ботокс, но без уколов. Упаковка была супер надежная, ничего не помялось. Буду заказывать теперь только здесь напрямую.',
    },
    {
      name: 'Ольга Васильева',
      city: 'Санкт-Петербург',
      rating: 5,
      date: '3 недели назад',
      product: 'Round Lab Sunscreen + Manyo Ampoule',
      text: 'Солнцезащитный крем Round Lab — лучший, что я пробовала в жизни. Не белит и увлажняет на 10/10. Цены намного приятнее, чем в наших магазинах, а качество оригинальное корейское!',
    },
  ];

  return (
    <section id="reviews" className="py-20 sm:py-28 bg-[#FAF7F2] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Отзывы клиентов"
          badgeIcon={<Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />}
          title="Что говорят о нас наши покупатели"
          subtitle="Более 500 постоянных клиентов по всему миру доверяют свою красоту MK KOREA COSMETIC"
        />

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev, idx) => (
            <Card key={idx} className="p-6 flex flex-col justify-between bg-white border-[#F0E6DE]">
              <div className="space-y-3">
                {/* Rating & Verified badge */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Заказ получен
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-[#4D2C20] leading-relaxed italic">
                  «{rev.text}»
                </p>

                {/* Product Tag */}
                <span className="inline-block text-[11px] font-semibold text-[#A96851] bg-[#FAF5EE] px-2.5 py-1 rounded-lg border border-[#EED9CF]/60">
                  {rev.product}
                </span>
              </div>

              {/* Author */}
              <div className="pt-4 border-t border-[#F0E6DE]/80 mt-4 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-[#2D2A2E]">{rev.name}</h5>
                  <span className="text-[10px] text-[#8C827A]">{rev.city}</span>
                </div>
                <span className="text-[10px] text-[#A89F97]">{rev.date}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
