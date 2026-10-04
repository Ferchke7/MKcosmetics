import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '../../core/constants/brand';
import { Sparkles, ShieldCheck, Heart, Award, ChevronRight, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-ink pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-line bg-paper/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-xs text-ink/50 tracking-wide">
            <Link to="/" className="hover:text-gold transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3 text-line" />
            <span className="text-ink font-medium">О бренде</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="text-center space-y-3 mb-14">
          <p className="eyebrow text-gold">PHILOSOPHY OF K-BEAUTY</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-ink">
            О бренде MK Cosmetics
          </h1>
          <p className="text-xs sm:text-sm text-ink/60 max-w-xl mx-auto leading-relaxed">
            Мы находимся в самом сердце Южной Кореи — Сеуле, и отбираем только эффективные, подлинные и клинически доказанные формулы красоты.
          </p>
        </div>

        {/* Narrative */}
        <div className="bg-paper rounded-3xl border border-line p-8 md:p-12 space-y-6 shadow-sm mb-12">
          <div className="max-w-2xl mx-auto space-y-4 text-xs sm:text-sm text-ink/80 leading-relaxed font-sans">
            <p className="first-letter:font-serif first-letter:text-4xl first-letter:float-left first-letter:mr-3 first-letter:text-gold">
              Корейский уход за кожей — это не просто тренд, а глубокая культура бережного отношения к здоровью и сиянию кожи изнутри. MK Cosmetics была основана с одной ключевой целью: предоставить клиентам доступ к 100% оригинальной косметике напрямую со складов производителей и официальных дистрибьюторов в Южной Корее.
            </p>
            <p>
              Мы исключаем длинные цепочки перекупщиков, сомнительные каналы поставок и наценки посредников. Каждый продукт в нашем каталоге синхронизируется в реальном времени со складом, проверяется на сроки годности и стандарты качества K-FDA.
            </p>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-paper rounded-3xl border border-line p-6 space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-cream text-gold mx-auto flex items-center justify-center border border-line">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-normal text-ink">100% Подлинность</h4>
            <p className="text-xs text-ink/60 leading-relaxed">
              Прямые контракты и поставки из Сеула гарантируют абсолютную оригинальность каждой баночки.
            </p>
          </div>

          <div className="bg-paper rounded-3xl border border-line p-6 space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-cream text-gold mx-auto flex items-center justify-center border border-line">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-normal text-ink">Корейские цены</h4>
            <p className="text-xs text-ink/60 leading-relaxed">
              Прямой расчет в южнокорейской воне (KRW ₩) без лишних конвертаций и скрытых комиссий.
            </p>
          </div>

          <div className="bg-paper rounded-3xl border border-line p-6 space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-cream text-gold mx-auto flex items-center justify-center border border-line">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-normal text-ink">Экспертный отбор</h4>
            <p className="text-xs text-ink/60 leading-relaxed">
              Только проверенные бренды: Round Lab, Anua, Medicube, Manyo, Skin1004, Cosrx, Torriden и др.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/catalog"
            className="btn-gold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2"
          >
            Исследовать каталог <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
