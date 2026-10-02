import React from 'react';
import { Search, Send } from 'lucide-react';
import { SectionHeading } from '../../ui/SectionHeading';
import { TelegramPostCard } from './TelegramPostCard';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { TelegramPost } from '../../../core/types/telegram';
import { BRAND_CONFIG } from '../../../core/constants/brand';

const TELEGRAM_LINK_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[#229ED9] px-5 py-2.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[#1E8BC0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9]';

interface TelegramFeedProps {
  posts: TelegramPost[];
  isLoading: boolean;
  isRefreshing: boolean;
  dataSource: 'live' | 'cache' | null;
  updatedAt: number | null;
  error: string | null;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  allTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onOpenDetails: (post: TelegramPost) => void;
  onQuickOrder: (title: string, price: string, url: string) => void;
  onOpenCatalog?: () => void;
  totalProductsCount?: number;
}

export const TelegramFeed: React.FC<TelegramFeedProps> = ({
  posts,
  isLoading,
  isRefreshing,
  dataSource,
  updatedAt,
  error,
  onRefresh,
  searchQuery,
  onSearchChange,
  allTags,
  selectedTag,
  onSelectTag,
  onOpenDetails,
  onQuickOrder,
  onOpenCatalog,
  totalProductsCount,
}) => {
  const dateText = updatedAt
    ? new Date(updatedAt).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
    : null;
  const hasFilters = Boolean(searchQuery.trim() || selectedTag);

  return (
    <section id="telegram-feed" className="scroll-mt-20 bg-[#F5EDE6]/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Предложения"
          badgeIcon={<Send className="h-3.5 w-3.5 text-[#229ED9]" />}
          title="Товары из Telegram"
          subtitle="Если цена указана в публикации, перед заказом мы подтвердим актуальную стоимость и наличие."
        />

        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#EED9CF] bg-white p-5 sm:flex-row sm:p-6">
          <div className="text-center sm:text-left">
            <h3 className="font-serif text-lg font-semibold text-[#2D2A2E]">
              {BRAND_CONFIG.telegramChannel}
            </h3>
            <p className="mt-1 text-sm text-[#6C635B]">
              Свежие публикации и предложения — в канале.
            </p>
          </div>
          <a
            href={BRAND_CONFIG.telegramChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={TELEGRAM_LINK_CLASSES}
          >
            <Send className="h-4 w-4" />
            Открыть канал
          </a>
        </div>

        {dataSource === 'live' && dateText && (
          <p className="mb-4 text-xs text-[#8C827A]" role="status">
            Данные получены {dateText}
          </p>
        )}

        {dataSource === 'cache' && dateText && (
          <div className="mb-5 flex flex-col items-start justify-between gap-3 rounded-xl border border-[#EED9CF] bg-[#FAF5EE] p-4 text-sm text-[#6C3E2E] sm:flex-row sm:items-center">
            <p role="status">
              Сохранённые публикации на {dateText}. Telegram временно недоступен; уточните цену и наличие перед заказом.
              {error ? ` ${error}` : ''}
            </p>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="shrink-0 font-semibold text-[#8A503C] underline underline-offset-4 disabled:opacity-60"
            >
              {isRefreshing ? 'Обновляем…' : 'Повторить'}
            </button>
          </div>
        )}

        <div className="mb-7 space-y-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C827A]" />
            <input
              type="search"
              aria-label="Поиск по публикациям"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Поиск по товарам и публикациям…"
              className="w-full rounded-2xl border border-[#EED9CF] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2D2A2E] placeholder-[#A89F97] focus:border-[#C2836B] focus:outline-none focus:ring-1 focus:ring-[#C2836B]"
            />
          </div>

          {allTags.length > 0 && (
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => onSelectTag(null)}
                aria-pressed={selectedTag === null}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-[#C2836B] text-white'
                    : 'border border-[#EED9CF] bg-white text-[#6C3E2E] hover:bg-[#FAF5EE]'
                }`}
              >
                Все темы
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag(tag === selectedTag ? null : tag)}
                  aria-pressed={selectedTag === tag}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-[#C2836B] text-white'
                      : 'border border-[#EED9CF] bg-white text-[#6C3E2E] hover:bg-[#FAF5EE]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-[#F0E6DE] bg-white p-4">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error && posts.length === 0 ? (
          <div className="space-y-4 rounded-3xl border border-[#F0E6DE] bg-white px-5 py-12 text-center sm:py-16">
            <h3 className="font-serif text-xl font-medium text-[#2D2A2E]">Предложения не загрузились</h3>
            <p className="mx-auto max-w-md text-sm text-[#6C635B]">
              Попробуйте обновить ленту или откройте канал Telegram.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="outline" size="md" onClick={onRefresh}>
                {isRefreshing ? 'Обновляем…' : 'Повторить'}
              </Button>
              <a
                href={BRAND_CONFIG.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={TELEGRAM_LINK_CLASSES}
              >
                <Send className="h-4 w-4" />
                Открыть канал
              </a>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="space-y-4 rounded-3xl border border-[#F0E6DE] bg-white px-5 py-12 text-center sm:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF5EE] text-[#A89F97]">
              <Search className="h-7 w-7" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#2D2A2E]">
              {hasFilters ? 'Ничего не найдено' : 'Публикаций пока нет'}
            </h3>
            <p className="mx-auto max-w-sm text-sm text-[#6C635B]">
              {hasFilters
                ? 'Измените поиск или сбросьте фильтр, чтобы посмотреть другие публикации.'
                : 'Новые предложения можно посмотреть в Telegram-канале.'}
            </p>
            {hasFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onSearchChange('');
                  onSelectTag(null);
                }}
              >
                Сбросить фильтры
              </Button>
            ) : (
              <a
                href={BRAND_CONFIG.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={TELEGRAM_LINK_CLASSES}
              >
                Открыть канал
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
              {posts.map((post) => (
                <TelegramPostCard
                  key={post.id}
                  post={post}
                  onOpenDetails={onOpenDetails}
                  onQuickOrder={onQuickOrder}
                />
              ))}
            </div>

            {onOpenCatalog && (
              <div className="text-center pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onOpenCatalog}
                >
                  Перейти в полный каталог {totalProductsCount ? `(${totalProductsCount} товаров)` : ''} с сортировкой →
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
