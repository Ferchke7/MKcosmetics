import { useState, useEffect, useCallback } from 'react';
import { TelegramFeedResponse, TelegramPost } from '../core/types/telegram';
import { TelegramService } from '../services/telegram/telegramService';
import { INITIAL_TELEGRAM_DATA } from '../services/telegram/telegramMockData';

export function useTelegramFeed() {
  const [data, setData] = useState<TelegramFeedResponse>(INITIAL_TELEGRAM_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Не удалось обновить Telegram ленту');
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
    new Set(data.posts.flatMap((p) => p.tags || []))
  ).filter(Boolean);

  // Filter posts
  const filteredPosts: TelegramPost[] = data.posts.filter((post) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      post.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.productTitle &&
        post.productTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  return {
    channelInfo: data.channelInfo,
    posts: filteredPosts,
    rawPosts: data.posts,
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
