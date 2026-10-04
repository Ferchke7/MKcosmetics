import React from 'react';
import { Link } from 'react-router-dom';
import { Send, Phone, MapPin, ShieldCheck, Clock, Award } from 'lucide-react';
import { BRAND_CONFIG } from '../../core/constants/brand';
import { InstagramIcon } from '../ui/InstagramIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ink text-paper/80 pt-16 pb-12 border-t border-line/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 3 Trust Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-paper/10 text-center md:text-left">
          <div className="flex items-start gap-4 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-paper font-bold">100% Оригинальная косметика</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Поставки напрямую от сертифицированных производителей и дистрибьюторов Южной Кореи.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-paper font-bold">Собственный склад в Сеуле</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Сборка и упаковка заказов в Южной Корее с авиа- и карго-доставкой по всему миру.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-paper font-bold">Опт и розница</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Выгодные оптовые цены для магазинов и косметологов, а также штучные заказы.
              </p>
            </div>
          </div>
        </div>

        {/* Main 4 Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12 border-b border-paper/10 text-xs">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="MK KOREA"
                className="w-14 h-14 rounded-full object-contain bg-white p-0.5 border border-line/40 shadow-sm shrink-0"
              />
              <div>
                <div className="font-serif text-lg font-bold tracking-wider text-paper uppercase">
                  MK KOREA
                </div>
                <div className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                  COSMETIC • SEOUL
                </div>
              </div>
            </div>
            <p className="text-muted leading-relaxed">
              Интернет-магазин и оптовый отдел люксовой и профессиональной корейской косметики со склада в Сеуле.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <a
                href={BRAND_CONFIG.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper/10 hover:bg-[#229ED9] hover:text-white text-paper transition-all text-xs w-fit"
                title="Telegram"
              >
                <Send className="w-3.5 h-3.5 text-[#229ED9]" />
                <span className="font-mono font-medium">{BRAND_CONFIG.telegramChannel || '@mkcosmetkor'}</span>
              </a>
              <a
                href={BRAND_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper/10 hover:bg-[#E1306C] hover:text-white text-paper transition-all text-xs w-fit"
                title="Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
                <span className="font-mono font-medium">{BRAND_CONFIG.instagramHandle || '@muhabbat.kim.mk'}</span>
              </a>
              <a
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper/10 hover:bg-[#25D366] hover:text-white text-paper transition-all text-xs w-fit"
                title="WhatsApp"
              >
                <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                <span className="font-mono font-medium">{BRAND_CONFIG.phoneDisplay || '+82 10 8390 5577'}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Catalog Links */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-bold text-paper uppercase tracking-wider">Каталог</h5>
            <ul className="space-y-2 text-muted">
              <li><Link to="/catalog" className="hover:text-gold transition-colors">Все товары</Link></li>
              <li><Link to="/catalog?categorySlug=krema-588144" className="hover:text-gold transition-colors">Крема для лица</Link></li>
              <li><Link to="/catalog?categorySlug=nabory-588136" className="hover:text-gold transition-colors">Наборы ухода</Link></li>
              <li><Link to="/catalog?categorySlug=maski-588137" className="hover:text-gold transition-colors">Маски</Link></li>
              <li><Link to="/catalog?categorySlug=ochishchenie-588146" className="hover:text-gold transition-colors">Очищение</Link></li>
              <li><Link to="/catalog?discount=true" className="text-sale hover:underline font-semibold">Специальные скидки</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-bold text-paper uppercase tracking-wider">Покупателям</h5>
            <ul className="space-y-2 text-muted">
              <li><Link to="/delivery" className="hover:text-gold transition-colors">Условия доставки и оплаты</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors">О компании</Link></li>
              <li><Link to="/contacts" className="hover:text-gold transition-colors">Контакты</Link></li>
              <li><Link to="/#admin" className="text-paper/40 hover:text-gold transition-colors">Вход для сотрудников (CRM)</Link></li>
            </ul>
          </div>

          {/* Col 4: Contacts & Address */}
          <div id="footer-contacts" className="space-y-3">
            <h5 className="font-serif text-sm font-bold text-paper uppercase tracking-wider">Контакты в Корее</h5>
            <div className="space-y-2 text-muted">
              <p>
                <span className="text-paper block font-semibold">Телефон / WhatsApp:</span>
                <a href={`tel:${BRAND_CONFIG.phone}`} className="text-gold font-mono hover:underline">
                  {BRAND_CONFIG.phoneDisplay}
                </a>
              </p>
              <p>
                <span className="text-paper block font-semibold">Telegram канал:</span>
                <a href={BRAND_CONFIG.telegramChannelUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold underline">
                  {BRAND_CONFIG.telegramChannel}
                </a>
              </p>
              <p>
                <span className="text-paper block font-semibold">Instagram:</span>
                <a href={BRAND_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold underline">
                  {BRAND_CONFIG.instagramHandle}
                </a>
              </p>
              <p className="text-[11px] text-muted/80 pt-1">
                Склад: Сеул, Южная Корея (Seoul, Republic of Korea)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} MK KOREA COSMETIC. Все права защищены.</p>
          <p className="text-muted/60">
            Оригинальная косметика напрямую из Южной Кореи
          </p>
        </div>
      </div>
    </footer>
  );
};
