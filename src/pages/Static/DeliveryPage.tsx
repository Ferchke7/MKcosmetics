import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '../../core/constants/brand';
import { Truck, ShieldCheck, MapPin, Clock, Phone, ChevronRight, PackageCheck } from 'lucide-react';

export const DeliveryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-ink pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-line bg-paper/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-xs text-ink/50 tracking-wide">
            <Link to="/" className="hover:text-gold transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3 text-line" />
            <span className="text-ink font-medium">Доставка и оплата</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="text-center space-y-2 mb-12">
          <p className="eyebrow text-gold">SEOUL • DIRECT LOGISTICS</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-ink">
            Доставка и оплата
          </h1>
          <p className="text-xs sm:text-sm text-ink/60 max-w-xl mx-auto">
            Прямые поставки оригинальной косметики из Южной Кореи без посредников.
          </p>
        </div>

        <div className="space-y-8">
          {/* Card 1: Доставка по Южной Корее */}
          <div className="bg-paper rounded-3xl border border-line p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cream text-gold flex items-center justify-center border border-line">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-normal text-ink">Доставка по Южной Корее</h3>
                <p className="text-xs text-ink/50">Курьерскими службами CJ Logistics, Post Office, Lotte</p>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-ink/80 leading-relaxed space-y-2 font-sans">
              <p>• <strong>Сроки:</strong> 1–2 рабочих дня по всей территории Республики Корея.</p>
              <p>• <strong>Стоимость:</strong> 5 000 ₩ по всей Корее.</p>
              <p>• <strong>Отправка:</strong> Ежедневно в день заказа или на следующее утро с понедельника по субботу.</p>
            </div>
          </div>

          {/* Card 2: Самовывоз в Сеуле */}
          <div className="bg-paper rounded-3xl border border-line p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cream text-gold flex items-center justify-center border border-line">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-normal text-ink">Самовывоз со склада в Сеуле</h3>
                <p className="text-xs text-ink/50">Прямой доступ к основному складу MK Cosmetics</p>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-ink/80 leading-relaxed space-y-2 font-sans">
              <p>• <strong>Стоимость:</strong> Бесплатно (0 ₩).</p>
              <p>• <strong>Адрес склада:</strong> {BRAND_CONFIG.address}</p>
              <p>• <strong>График:</strong> Пн–Сб с 10:00 до 19:00 (по предварительному согласованию).</p>
            </div>
          </div>

          {/* Card 3: Международное карго */}
          <div className="bg-paper rounded-3xl border border-line p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cream text-gold flex items-center justify-center border border-line">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-normal text-ink">Международная доставка по всему миру</h3>
                <p className="text-xs text-ink/50">Экспресс авиа-карго и отправка в СНГ, США, Европу, ОАЭ и страны Азии</p>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-ink/80 leading-relaxed space-y-2 font-sans">
              <p>• <strong>Сроки авиадоставки:</strong> 2–5 рабочих дней с момента вылета из Инчхона (в зависимости от страны назначения).</p>
              <p>• <strong>Оплата доставки:</strong> Рассчитывается и оплачивается по фактическому весу карго при получении в пункте выдачи.</p>
              <p>• <strong>Упаковка:</strong> Профессиональная ударопрочная термоупаковка со стикерами осторожно/хрупко.</p>
            </div>
          </div>

          {/* Card 4: Способы оплаты */}
          <div className="bg-paper rounded-3xl border border-line p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cream text-gold flex items-center justify-center border border-line">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-normal text-ink">Способы оплаты (KRW ₩)</h3>
                <p className="text-xs text-ink/50">Прозрачный и безопасный расчет</p>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-ink/80 leading-relaxed space-y-2 font-sans">
              <p>• <strong>Банковский перевод в Южной Корее (무통장입금):</strong> Перевод на корейский расчетный счет (KB Kookmin, Shinhan, Woori).</p>
              <p>• <strong>Банковские карты:</strong> Принимаются основные международные и корейские карты.</p>
              <p>• <strong>Наличный расчет:</strong> Возможен при самовывозе со склада в Сеуле.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/catalog"
            className="btn-gold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider font-semibold inline-block"
          >
            Перейти к выбору косметики
          </Link>
        </div>
      </div>
    </div>
  );
};
