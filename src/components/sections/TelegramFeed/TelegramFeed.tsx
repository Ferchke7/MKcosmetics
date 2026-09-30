import React from 'react';
import { Send, Search, Sparkles } from 'lucide-react';
import { SectionHeading } from '../../ui/SectionHeading';
import { TelegramPostCard } from './TelegramPostCard';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { TelegramPost, ChannelInfo } from '../../../core/types/telegram';
import { BRAND_CONFIG } from '../../../core/constants/brand';

interface TelegramFeedProps {
  posts: TelegramPost[];
  channelInfo: ChannelInfo;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  allTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onOpenDetails: (post: TelegramPost) => void;
  onQuickOrder: (title: string, price: string, url: string) => void;
}

export const TelegramFeed: React.FC<TelegramFeedProps> = ({
  posts,
  channelInfo,
  isLoading,
  searchQuery,
  onSearchChange,
  allTags,
  selectedTag,
  onSelectTag,
  onOpenDetails,
  onQuickOrder,
}) => {
  return (
    <section id="telegram-feed" className="py-20 sm:py-28 bg-[#F5EDE6]/40 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Прямой эфир из Сеула"
          badgeIcon={<Send className="w-3.5 h-3.5 text-[#229ED9]" />}
          title="Свежие поступления & Обзоры в Telegram"
          subtitle="Актуальные цены, наличие, новинки и акции в режиме реального времени напрямую из нашего канала"
        />

        {/* Telegram Channel Info Banner */}
        <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white via-white to-[#FAF5EE] border border-[#EED9CF] shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative">
              <img
                src={channelInfo.avatarUrl || 'https://cdn5.telesco.pe/file/LrwC6ts6S58ITMMKK7AsAmMM0KVnQBrw7pNF9KPYX7pba5bmdN9U1Cmm7JrNP7fEF7yF-L1o_p9r17u7m2S9PKf50AnariV1_iyhY-GCU3ecNrWPIrPuenjXPwX6RsmWJm6JLoEQfkQ9jR9RRXkgfpEqZGp5uwOhzmpHwZqermQ8QBRyr4_ZUvRAEKFlVPvVN-EO_1-4bhRngkftolPVd2GEoq1MO-FBEu0L67A4CGK6t2TFZ1xocaN2LAeTLWwX2LPpe6F678ENUye6aFOiYWOh3MUe4MA3Ma5SM_-uamSjv-Tdp3ofj98VIKpXag3TF7BzvhBsGbnUw46HCIUDdw.jpg'}
                alt={channelInfo.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#C2836B]/30 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#229ED9] text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2D2A2E]">
                  {channelInfo.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#229ED9]/10 text-[#1E8BC0] text-xs font-semibold">
                  {channelInfo.subscribersCount} подписчиков
                </span>
              </div>
              <p className="text-xs text-[#8C827A] mt-1 line-clamp-1 max-w-xl">
                {channelInfo.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-[#6C3E2E] mt-2 font-medium">
                <span>📸 {channelInfo.photosCount} фото</span>
                <span>🎥 {channelInfo.videosCount} видео</span>
                <span className="text-emerald-600 font-semibold">● На связи 24/7</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={BRAND_CONFIG.telegramChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="telegram"
                size="md"
                icon={<Send className="w-4 h-4" />}
              >
                Подписаться на канал
              </Button>
            </a>
          </div>
        </div>

        {/* Filter & Search Bar without post count */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Поиск по товарам и новинкам (пилинг, CNP, ботокс, спф)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#EED9CF] text-xs sm:text-sm text-[#2D2A2E] placeholder-[#A89F97] focus:border-[#C2836B] focus:outline-none focus:ring-1 focus:ring-[#C2836B]"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8C827A] hover:text-[#4D2C20]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Tags */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => onSelectTag(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  selectedTag === null
                    ? 'bg-[#C2836B] text-white'
                    : 'bg-white text-[#6C3E2E] border border-[#EED9CF] hover:bg-[#FAF5EE]'
                }`}
              >
                Все темы
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag === selectedTag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                    selectedTag === tag
                      ? 'bg-[#C2836B] text-white'
                      : 'bg-white text-[#6C3E2E] border border-[#EED9CF] hover:bg-[#FAF5EE]'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 space-y-3 border border-[#F0E6DE]">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 rounded-xl" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#F0E6DE] space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF5EE] text-[#A89F97] flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-xl text-[#2D2A2E] font-medium">
              Посты не найдены
            </h4>
            <p className="text-xs text-[#8C827A] max-w-sm mx-auto">
              Попробуйте изменить запрос или сбросить фильтр по тегам
            </p>
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
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <TelegramPostCard
                key={post.id}
                post={post}
                onOpenDetails={onOpenDetails}
                onQuickOrder={onQuickOrder}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
