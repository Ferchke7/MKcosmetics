import React, { useState } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import { useTelegramFeed } from '../hooks/useTelegramFeed';
import { TelegramPost } from '../core/types/telegram';
import { Product } from '../core/types/product';

// Layout
import { Header } from '../components/layout/Header/Header';
import { Footer } from '../components/layout/Footer/Footer';
import { FloatingContact } from '../components/layout/FloatingContact';

// Sections
import { Hero } from '../components/sections/Hero/Hero';
import { Features } from '../components/sections/Features/Features';
import { TelegramFeed } from '../components/sections/TelegramFeed/TelegramFeed';
import { ConsultationQuiz } from '../components/sections/ConsultationQuiz/ConsultationQuiz';
import { AboutFounder } from '../components/sections/About/AboutFounder';
import { DeliveryInfo } from '../components/sections/DeliveryInfo/DeliveryInfo';
import { Reviews } from '../components/sections/Reviews/Reviews';
import { FAQ } from '../components/sections/FAQ/FAQ';
import { Contact } from '../components/sections/Contact/Contact';

// Modals
import { QuickOrderModal } from '../components/modals/QuickOrderModal';
import { ProductQuickViewModal } from '../components/modals/ProductQuickViewModal';
import { PostDetailModal } from '../components/modals/PostDetailModal';

export function App() {
  // 1. Currency Hook
  const { currency, setCurrency, allCurrencies, formatPrice } = useCurrency();

  // 2. Live Telegram Feed Hook (auto fetches and silently auto-refreshes every 5 mins)
  const {
    channelInfo,
    posts: telegramPosts,
    isLoading: isTgLoading,
    searchQuery: tgSearch,
    setSearchQuery: setTgSearch,
    allTags,
    selectedTag,
    setSelectedTag,
  } = useTelegramFeed();

  // 3. Modal States
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

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [detailPost, setDetailPost] = useState<TelegramPost | null>(null);

  // Handlers
  const handleOpenQuickOrder = (
    productTitle: string,
    priceFormatted: string,
    sourceUrl?: string
  ) => {
    setQuickOrderData({
      isOpen: true,
      productTitle,
      priceFormatted,
      sourceUrl,
    });
  };

  const handleCloseQuickOrder = () => {
    setQuickOrderData((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#242120]">
      {/* Refined Luxury Header */}
      <Header
        currentCurrency={currency}
        currencies={allCurrencies}
        onSelectCurrency={setCurrency}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onExploreCatalog={() => {
            const el = document.getElementById('telegram-feed');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onStartQuiz={() => {
            const el = document.getElementById('skin-quiz');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 2. Live Telegram Stream & Showcase */}
        <TelegramFeed
          posts={telegramPosts}
          channelInfo={channelInfo}
          isLoading={isTgLoading}
          searchQuery={tgSearch}
          onSearchChange={setTgSearch}
          allTags={allTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          onOpenDetails={(post) => setDetailPost(post)}
          onQuickOrder={handleOpenQuickOrder}
        />

        {/* 3. Skin Care Consultant Diagnostic Quiz */}
        <ConsultationQuiz
          formatPrice={formatPrice}
          onQuickView={(p) => setQuickViewProduct(p)}
        />

        {/* 4. Benefits & Features */}
        <Features />

        {/* 5. About Founder & Korean Quality Guarantee */}
        <AboutFounder />

        {/* 6. Global Logistics & Delivery Info */}
        <DeliveryInfo />

        {/* 7. Verified Reviews */}
        <Reviews />

        {/* 8. FAQ Accordion */}
        <FAQ />

        {/* 9. Contacts & Direct Inquiry */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating CTA WhatsApp & Telegram */}
      <FloatingContact />

      {/* Modals */}
      <QuickOrderModal
        isOpen={quickOrderData.isOpen}
        onClose={handleCloseQuickOrder}
        productTitle={quickOrderData.productTitle}
        priceFormatted={quickOrderData.priceFormatted}
        sourceUrl={quickOrderData.sourceUrl}
      />

      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        formatPrice={formatPrice}
        onAddToCart={() => {}}
        onQuickBuy={handleOpenQuickOrder}
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
