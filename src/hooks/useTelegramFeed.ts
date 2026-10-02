import { useState, useEffect, useCallback, useRef } from 'react';
import { TelegramFeedResult, TelegramPost } from '../core/types/telegram';
import { TelegramService } from '../services/telegram/telegramService';

export function useTelegramFeed() {
  const [feed, setFeed] = useState<TelegramFeedResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const isFetchingRef = useRef(false);

  const loadFeed = useCallback(async (isSilent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isSilent && !feed) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const result = await TelegramService.fetchFeed(isSilent);
      if (result && result.data && Array.isArray(result.data.posts)) {
        setFeed(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить данные');
      setFeed((previous) => previous ? { ...previous, source: 'cache' } : null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [feed]);

  // Initial load + Automatic SWR Background Polling
  useEffect(() => {
    loadFeed(false);

    // 1. Periodic background sync every 90 seconds (seamless, automatic)
    const interval = setInterval(() => {
      loadFeed(true);
    }, 90 * 1000);

    // 2. Window focus & Tab visibility revalidation (like Musinsa / Coupang apps)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadFeed(true);
      }
    };

    const handleWindowFocus = () => {
      loadFeed(true);
    };

    const handleOnline = () => {
      loadFeed(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [loadFeed]);

  // Extract unique tags
  const allTags = Array.from(
    new Set((feed?.data.posts ?? []).flatMap((p) => p.tags || []))
  ).filter(Boolean);

  // Filter posts
  const filteredPosts: TelegramPost[] = (feed?.data.posts ?? []).filter((post) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      post.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.productTitle &&
        post.productTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  return {
    posts: filteredPosts,
    dataSource: feed?.source ?? null,
    updatedAt: feed?.updatedAt ?? null,
    allTags,
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
    isLoading,
    isRefreshing,
    error,
    refreshFeed: () => loadFeed(true),
  };
}
