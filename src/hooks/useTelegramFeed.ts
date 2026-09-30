import { useState, useEffect, useCallback } from 'react';
import { TelegramFeedResult, TelegramPost } from '../core/types/telegram';
import { TelegramService } from '../services/telegram/telegramService';

export function useTelegramFeed() {
  const [feed, setFeed] = useState<TelegramFeedResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const loadFeed = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const result = await TelegramService.fetchFeed(isSilent);
      setFeed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить Telegram ленту');
      setFeed((previous) => previous ? { ...previous, source: 'cache' } : null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFeed(false);

    // Auto-refresh in background every 5 minutes silently
    const interval = setInterval(() => {
      loadFeed(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
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
    refreshFeed: () => loadFeed(feed !== null),
  };
}
