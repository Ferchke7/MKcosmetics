import React, { useState } from 'react';
import { ShieldCheck, Truck, Sparkles, Building2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SeoContentSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="bg-white py-16 sm:py-20 border-t border-line/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream border border-gold/20 text-gold text-xs font-semibold tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Оригинальная корейская косметика</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink font-normal leading-tight tracking-tight">
            Косметика из Кореи напрямую со склада в Сеуле — оптом и в розницу
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink/70 leading-relaxed">
            <strong>MK KOREA COSMETIC</strong> — прямой поставщик оригинальной косметики из Южной Кореи.
            Наш склад расположен непосредственно в Сеуле, что гарантирует подлинность каждого флакона,
            свежие заводские батч-коды и максимально выгодные условия без посреднических наценок.
          </p>
        </div>

        {/* 4 Key Strategic Advantages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-[#FDFBF7] border border-line/70 hover:border-gold/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-ink mb-2">100% Оригинал из Сеула</h3>
            <p className="text-xs text-ink/70 leading-relaxed">
              Закупки напрямую у корейских дистрибьюторов и фабрик. Вся продукция сертифицирована для внутреннего рынка Кореи.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FDFBF7] border border-line/70 hover:border-gold/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-4">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-ink mb-2">Оптовый склад в Корее</h3>
            <p className="text-xs text-ink/70 leading-relaxed">
              Собственный склад в Сеуле. Прямые оптовые цены для интернет-магазинов, бьюти-студий, салонов и косметологов.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FDFBF7] border border-line/70 hover:border-gold/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-4">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-ink mb-2">Авиадоставка по СНГ</h3>
            <p className="text-xs text-ink/70 leading-relaxed">
              Быстрая авиадоставка в Россию, Казахстан, Узбекистан, Кыргызстан и Беларусь за 7-14 дней с международным трек-номером.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FDFBF7] border border-line/70 hover:border-gold/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-ink mb-2">Люкс и популярные хиты</h3>
            <p className="text-xs text-ink/70 leading-relaxed">
              Официальные линейки Sulwhasoo, The History of Whoo, Medi-Peel, Manyo, JOGABI, CURACION, Dr.Jart+ и новинки K-Beauty.
            </p>
          </div>
        </div>

        {/* Semantic Long-Tail Article Block */}
        <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-line/80 relative">
          <div className={`space-y-4 text-xs sm:text-sm text-ink/75 leading-relaxed overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[2500px]' : 'max-h-56'}`}>
            <h3 className="font-serif text-xl sm:text-2xl text-ink font-medium">
              Преимущества покупки корейской косметики напрямую из Кореи
            </h3>
            <p>
              Корейская косметика (K-Beauty) завоевала мировое признание благодаря передовым биотехнологиям, уникальным натуральным ингредиентам
              (пептидные комплексы, центелла азиатская, муцин улитки, экстракт ферментированного дикого женьшеня) и видимой результативности.
              Однако с ростом популярности на локальных маркетплейсах участились случаи подделок и поставок партий с истекающими сроками годности.
            </p>
            <p>
              Заказывая в <strong>MK KOREA COSMETIC</strong>, вы получаете товар непосредственно с логистического склада в Сеуле.
              Каждая позиция проходит строгий контроль качества перед отправкой.
            </p>

            <h3 className="font-serif text-xl sm:text-2xl text-ink font-medium pt-3">
              Корейская косметика оптом для бизнеса
            </h3>
            <p>
              Мы предлагаем прозрачные условия для оптовых покупателей в РФ, Казахстане (Алматы, Астана, Шымкент), Узбекистане (Ташкент, Самарканд) и других регионах СНГ.
              Нашим партнерам доступны:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 pb-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                <span>Прямой сеульский оптовый прайс-лист в вонах (KRW)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                <span>Индивидуальные скидки на крупнооптовые партии</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                <span>Оперативное формирование сборных грузов любого объема</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                <span>Поддержка персонального менеджера в Telegram и WhatsApp</span>
              </li>
            </ul>

            <h3 className="font-serif text-xl sm:text-2xl text-ink font-medium pt-3">
              Популярные бренды в нашем каталоге
            </h3>
            <p>
              В нашем каталоге представлены как премиальные бренды императорского ухода (
              <strong>Sulwhasoo</strong>, <strong>The History of Whoo</strong>, <strong>AMORE PACIFIC</strong>), так и признанные клинические бренды
              (<strong>Medi-Peel</strong>, <strong>Manyo Factory</strong>, <strong>Dr.Jart+</strong>), а также эксклюзивная профессиональная косметика (
              <strong>JOGABI</strong>, <strong>CURACION</strong>).
            </p>
          </div>

          {/* Fade effect when collapsed */}
          {!isExpanded && (
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/80 to-transparent rounded-b-3xl pointer-events-none" />
          )}

          {/* Toggle Button */}
          <div className="mt-4 pt-2 flex items-center justify-between flex-wrap gap-4 relative z-10">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-dark transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Свернуть подробности' : 'Читать подробнее о доставке и опте'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            <Link
              to="/catalog"
              className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider shadow-sm"
            >
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
