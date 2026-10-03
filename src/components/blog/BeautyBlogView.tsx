import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Clock, Tag, Search, RefreshCw, ArrowRight, Send, Flame } from 'lucide-react';
import { ArticleData, ArticleReaderModal } from './ArticleReaderModal';

interface BeautyBlogViewProps {
  onOpenProduct?: (productId: string) => void;
}

export const BeautyBlogView: React.FC<BeautyBlogViewProps> = ({ onOpenProduct }) => {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [syncing, setSyncing] = useState(false);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/articles?limit=50');
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSyncFromTelegram = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/admin/articles/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('mk_admin_token') || ''}`,
        },
      });
      if (res.ok) {
        await fetchArticles();
      }
    } catch (err) {
      console.error('Failed to sync articles:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Collect unique tags
  const allTags = Array.from(
    new Set(articles.flatMap((a) => a.tags || []).filter(Boolean))
  ).slice(0, 10);

  // Filtered articles
  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      !search ||
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.contentMarkdown.toLowerCase().includes(search.toLowerCase());

    const matchesTag =
      selectedTag === 'all' || (art.tags && art.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#ECE8E1] text-[#B89254] text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Бьюти-Журнал & Гайды по Уходу</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1917] tracking-tight">
          Секреты Корейского Ухода от MK Cosmetics
        </h2>
        <p className="text-[#8A8680] text-sm sm:text-base leading-relaxed">
          Экспертные разборы этапов ухода, трендов корейской косметики и персональные рекомендации напрямую из нашего Telegram-канала.
        </p>
      </div>

      {/* Toolbar: Search & Tag Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8A8680] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск статей, ингредиентов..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#ECE8E1] rounded-xl text-sm text-[#1A1917] placeholder-[#8A8680] focus:outline-none focus:border-[#B89254]"
          />
        </div>

        {/* Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTag === 'all'
                ? 'bg-[#1A1917] text-[#B89254] shadow-xs'
                : 'bg-[#FAF8F5] text-[#8A8680] hover:text-[#1A1917] border border-[#ECE8E1]'
            }`}
          >
            Все темы
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === t
                  ? 'bg-[#1A1917] text-[#B89254] shadow-xs'
                  : 'bg-[#FAF8F5] text-[#8A8680] hover:text-[#1A1917] border border-[#ECE8E1]'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>

        {/* Telegram Direct Sync */}
        <button
          onClick={handleSyncFromTelegram}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-[#FAF8F5] hover:bg-[#F7F4EF] border border-[#0088cc]/30 text-[#0088cc] text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{syncing ? 'Синхронизация...' : 'Обновить из Telegram'}</span>
        </button>
      </div>

      {/* Grid of Magazine Articles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-5 border border-[#ECE8E1] animate-pulse space-y-4">
              <div className="w-full h-48 bg-[#FAF8F5] rounded-2xl" />
              <div className="h-5 bg-[#FAF8F5] rounded w-3/4" />
              <div className="h-4 bg-[#FAF8F5] rounded w-full" />
              <div className="h-4 bg-[#FAF8F5] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#ECE8E1] space-y-3 p-8">
          <BookOpen className="w-12 h-12 text-[#B89254]/40 mx-auto" />
          <h3 className="text-lg font-bold text-[#1A1917]">Статьи пока не загружены</h3>
          <p className="text-[#8A8680] text-sm max-w-md mx-auto">
            Нажмите кнопку «Обновить из Telegram», чтобы автоматически сформировать бьюти-статьи из постов канала @mkcosmetkor.
          </p>
          <button
            onClick={handleSyncFromTelegram}
            disabled={syncing}
            className="mt-2 px-5 py-2.5 bg-[#1A1917] hover:bg-[#B89254] text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Загрузить статьи из Telegram
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="group bg-white border border-[#ECE8E1] hover:border-[#B89254] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
            >
              {/* Card Cover */}
              <div className="relative w-full h-52 overflow-hidden bg-[#FAF8F5]">
                {art.coverImage ? (
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FAF8F5] to-[#F7F4EF] text-[#B89254]/40">
                    <BookOpen className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#1A1917]/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#DFCBA0]" />
                  <span>{art.readingTimeMinutes || 3} мин.</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {/* Tag Chips */}
                  {art.tags && art.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {art.tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-[11px] font-medium text-[#B89254] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#ECE8E1]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="font-serif font-bold text-[#1A1917] text-base group-hover:text-[#B89254] transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>

                  {art.subtitle && (
                    <p className="text-xs text-[#8A8680] line-clamp-2 leading-relaxed">
                      {art.subtitle}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#ECE8E1] flex items-center justify-between text-xs text-[#8A8680]">
                  <span className="font-medium text-[#1A1917]">{art.author || 'MK Editorial'}</span>
                  <div className="flex items-center gap-1 text-[#B89254] font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Читать</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Article Reader Modal */}
      {selectedArticle && (
        <ArticleReaderModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onOpenProduct={onOpenProduct}
        />
      )}
    </section>
  );
};
