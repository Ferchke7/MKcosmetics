import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Grid } from 'lucide-react';
import { CatalogCategory } from '../../core/types/catalog';

interface CategoryTilesProps {
  categories: CatalogCategory[];
}

export const CategoryTiles: React.FC<CategoryTilesProps> = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-14 sm:py-16 bg-cream-soft border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex items-end justify-between mb-8 pb-4 border-b border-line">
          <div>
            <p className="eyebrow">Категории ухода</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-1">
              Направления каталога
            </h2>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:underline"
          >
            <span>Весь каталог</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {categories.slice(0, 12).map((c) => (
            <Link
              key={c.id}
              to={`/catalog/${c.slug}`}
              className="group flex flex-col items-center text-center p-4 rounded-card bg-paper border border-line hover:border-gold hover:shadow-soft transition-all duration-300"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-cream-soft mb-3 shrink-0 flex items-center justify-center">
                {c.photo ? (
                  <img
                    src={c.photo}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <Grid className="w-6 h-6 text-muted group-hover:text-gold transition-colors" />
                )}
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-ink group-hover:text-gold transition-colors line-clamp-1">
                {c.title}
              </h3>
              <span className="text-[11px] text-muted mt-0.5">{c.count} товаров</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
