import React from 'react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { InstagramIcon } from '../../ui/Icons';
import { Send, ShieldCheck, Heart, Sparkles, MapPin, CheckCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../../../core/constants/brand';

export const AboutFounder: React.FC = () => {
  return (
    <section id="about" className="py-20 sm:py-28 bg-[#FAF7F2] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Founder Photo & Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="rounded-3xl overflow-hidden shadow-soft-lg bg-white p-3 border border-[#EED9CF]">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#FAF5EE] relative">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
                    alt={BRAND_CONFIG.founderName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[11px] uppercase tracking-widest text-[#E8A598] font-bold block">
                      Основатель & Эксперт
                    </span>
                    <h3 className="font-serif text-2xl font-medium leading-tight">
                      {BRAND_CONFIG.founderName}
                    </h3>
                    <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E8A598]" />
                      <span>Сеул, Южная Корея</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Instagram Proof Badge */}
              <a
                href={BRAND_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -bottom-5 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-soft-lg border border-[#EED9CF] flex items-center gap-3 hover:scale-105 transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D2A2E]">
                    {BRAND_CONFIG.instagramHandle}
                  </div>
                  <span className="text-[11px] text-[#8C827A]">Смотреть Instagram</span>
                </div>
              </a>
            </div>
          </div>

          {/* Right: Founder Bio & Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <Badge variant="brand" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
                История бренда
              </Badge>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#242120] font-normal leading-tight">
                «Красота начинается с правильного, осознанного ухода»
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#6C635B] leading-relaxed">
              Приветствую! Меня зовут <strong className="text-[#2D2A2E]">Мухаббат Ким</strong>. Я живу и работаю в сердце мировой бьюти-индустрии — в Сеуле, Южная Корея.
            </p>

            <p className="text-sm sm:text-base text-[#6C635B] leading-relaxed">
              Проект <strong className="text-[#8A503C]">MK KOREA COSMETIC</strong> родился из страсти к настоящей, работающей корейской косметике. Моя главная миссия — предоставить вам доступ к оригинальным премиальным и фарм-брендам Кореи без лишних наценок и риска подделок.
            </p>

            {/* Core Values / Bullet points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#F0E6DE]">
                <CheckCircle className="w-5 h-5 text-[#C2836B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#2D2A2E]">Прямые закупки</h4>
                  <p className="text-[11px] text-[#8C827A] mt-0.5">Только официальные заводы и дистрибьюторы в Сеуле</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#F0E6DE]">
                <CheckCircle className="w-5 h-5 text-[#C2836B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#2D2A2E]">Личный контроль</h4>
                  <p className="text-[11px] text-[#8C827A] mt-0.5">Каждая посылка проверяется и упаковывается вручную</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#F0E6DE]">
                <CheckCircle className="w-5 h-5 text-[#C2836B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#2D2A2E]">Свежие партии</h4>
                  <p className="text-[11px] text-[#8C827A] mt-0.5">Максимальные сроки годности свежевыпущенной продукции</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#F0E6DE]">
                <CheckCircle className="w-5 h-5 text-[#C2836B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#2D2A2E]">Индивидуальность</h4>
                  <p className="text-[11px] text-[#8C827A] mt-0.5">Бесплатный подбор средств под вашу кожу 24/7</p>
                </div>
              </div>
            </div>

            {/* Social Links Row */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <a
                href={BRAND_CONFIG.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="telegram" size="sm" icon={<Send className="w-4 h-4" />}>
                  Telegram @mkcosmetkor
                </Button>
              </a>

              <a
                href={BRAND_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm" icon={<InstagramIcon className="w-4 h-4 text-[#E1306C]" />}>
                  Instagram {BRAND_CONFIG.instagramHandle}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
