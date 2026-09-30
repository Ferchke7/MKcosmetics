import React, { useState } from 'react';
import { useTelegramFeed } from '../hooks/useTelegramFeed';
import { TelegramPost } from '../core/types/telegram';

// Layout
import { Header } from '../components/layout/Header/Header';
import { Footer } from '../components/layout/Footer/Footer';

// Sections
import { Hero } from '../components/sections/Hero/Hero';
import { TelegramFeed } from '../components/sections/TelegramFeed/TelegramFeed';
import { ConsultationQuiz } from '../components/sections/ConsultationQuiz/ConsultationQuiz';
import { DeliveryInfo } from '../components/sections/DeliveryInfo/DeliveryInfo';
import { FAQ } from '../components/sections/FAQ/FAQ';
import { Contact } from '../components/sections/Contact/Contact';

// Modals
import { QuickOrderModal } from '../components/modals/QuickOrderModal';
import { PostDetailModal } from '../components/modals/PostDetailModal';

export function App() {
  const {
    posts: telegramPosts,
    isLoading: isTgLoading,
    isRefreshing: isTgRefreshing,
    searchQuery: tgSearch,
    setSearchQuery: setTgSearch,
    allTags,
    selectedTag,
    setSelectedTag,
    dataSource,
    updatedAt,
    error: feedError,
    refreshFeed,
  } = useTelegramFeed();

  const [quickOrderData, setQuickOrderData] = useState<{
    isOpen: boolean;
    productTitle: string;
    priceFormatted: string;
    sourceUrl?: string;
  }>({
    isOpen: false,
    productTitle: '',
    priceFormatted: '',
  });

  const [detailPost, setDetailPost] = useState<TelegramPost | null>(null);

  const handleOpenQuickOrder = (
    productTitle: string,
    priceFormatted: string,
    sourceUrl?: string
  ) => {
    setQuickOrderData({ isOpen: true, productTitle, priceFormatted, sourceUrl });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#242120]">
      <Header />

      <main className="flex-1">
        <Hero />

        <TelegramFeed
          posts={telegramPosts}
          isLoading={isTgLoading}
          isRefreshing={isTgRefreshing}
          dataSource={dataSource}
          updatedAt={updatedAt}
          error={feedError}
          onRefresh={refreshFeed}
          searchQuery={tgSearch}
          onSearchChange={setTgSearch}
          allTags={allTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          onOpenDetails={setDetailPost}
          onQuickOrder={handleOpenQuickOrder}
        />

        <ConsultationQuiz />
        <DeliveryInfo />
        <FAQ />
        <Contact />
      </main>

      <Footer />

      <QuickOrderModal
        isOpen={quickOrderData.isOpen}
        onClose={() => setQuickOrderData((previous) => ({ ...previous, isOpen: false }))}
        productTitle={quickOrderData.productTitle}
        priceFormatted={quickOrderData.priceFormatted}
        sourceUrl={quickOrderData.sourceUrl}
      />

      <PostDetailModal
        post={detailPost}
        isOpen={!!detailPost}
        onClose={() => setDetailPost(null)}
        onQuickOrder={handleOpenQuickOrder}
      />
    </div>
  );
}

export default App;
