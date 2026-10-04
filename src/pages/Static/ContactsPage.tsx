import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG, buildWhatsAppUrl } from '../../core/constants/brand';
import { Phone, Send, MapPin, Clock, Mail, ChevronRight, MessageCircle } from 'lucide-react';
import { InstagramIcon } from '../../components/ui/InstagramIcon';

export const ContactsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-ink pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-line bg-paper/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-xs text-ink/50 tracking-wide">
            <Link to="/" className="hover:text-gold transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3 text-line" />
            <span className="text-ink font-medium">Контакты</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="text-center space-y-2 mb-12">
          <p className="eyebrow text-gold">СВЯЗЬ С НАМИ</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-ink">
            Контакты MK Cosmetics
          </h1>
          <p className="text-xs sm:text-sm text-ink/60 max-w-xl mx-auto">
            Мы всегда рады ответить на любые вопросы по подбору ухода, наличию и оптовым заказам.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone / WhatsApp */}
          <div className="bg-paper rounded-3xl border border-line p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cream text-gold flex items-center justify-center border border-line">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-normal text-ink">Телефон & WhatsApp</h3>
            <p className="text-xs text-ink/60">
              Звонки и сообщения через мессенджеры для оперативной связи
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`tel:${BRAND_CONFIG.phone}`}
                className="font-mono text-base font-bold text-ink hover:text-gold transition-colors"
              >
                {BRAND_CONFIG.phone}
              </a>
              <a
                href={buildWhatsAppUrl('Здравствуйте! Хочу уточнить детали заказа в MK Cosmetics.')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:underline"
              >
                <MessageCircle className="w-4 h-4" /> Написать в WhatsApp
              </a>
            </div>
          </div>

          {/* Telegram */}
          <div className="bg-paper rounded-3xl border border-line p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cream text-gold flex items-center justify-center border border-line">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-normal text-ink">Telegram</h3>
            <p className="text-xs text-ink/60">
              Канал новинок, обзоров и персональная поддержка менеджера
            </p>
            <div className="pt-2">
              <a
                href={BRAND_CONFIG.telegramChannelUrl || `https://t.me/${(BRAND_CONFIG.telegram || '').replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-base font-bold text-gold hover:underline inline-flex items-center gap-1.5"
              >
                {BRAND_CONFIG.telegramChannel || BRAND_CONFIG.telegram || '@mkcosmetkor'}
              </a>
            </div>
          </div>

          {/* Instagram */}
          <div className="bg-paper rounded-3xl border border-line p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cream text-gold flex items-center justify-center border border-line">
              <InstagramIcon className="w-6 h-6 text-[#E1306C]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-ink">Instagram</h3>
            <p className="text-xs text-ink/60">
              Эстетика, видео распаковок из Сеула и живые отзывы
            </p>
            <div className="pt-2">
              <a
                href={BRAND_CONFIG.instagramUrl || `https://instagram.com/${(BRAND_CONFIG.instagram || '').replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-base font-bold text-ink hover:text-gold transition-colors"
              >
                {BRAND_CONFIG.instagramHandle || BRAND_CONFIG.instagram || '@muhabbat.kim.mk'}
              </a>
            </div>
          </div>

          {/* Warehouse Address */}
          <div className="bg-paper rounded-3xl border border-line p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cream text-gold flex items-center justify-center border border-line">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-normal text-ink">Склад в Сеуле</h3>
            <p className="text-xs text-ink/60">
              Республика Корея, Сеул. Доставка по Корее и авиа-карго
            </p>
            <div className="pt-2">
              <p className="text-xs font-medium text-ink leading-relaxed">
                {BRAND_CONFIG.address}
              </p>
              <p className="text-[11px] text-ink/50 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gold" /> Пн–Сб: 10:00 – 19:00 (KST)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
