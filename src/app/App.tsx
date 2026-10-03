import React, { useState, useEffect } from 'react';
import { useTelegramFeed } from '../hooks/useTelegramFeed';
import { useProducts } from '../hooks/useProducts';
import { useCurrency } from '../hooks/useCurrency';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../core/auth/AuthContext';
import { TelegramPost } from '../core/types/telegram';
import { Product } from '../core/types/product';

// Layout
import { Header } from '../components/layout/Header/Header';
import { Footer } from '../components/layout/Footer/Footer';

// Sections
import { Hero } from '../components/sections/Hero/Hero';
import { LatestShowcase } from '../components/sections/Showcase/LatestShowcase';
import { BrandSpotlight } from '../components/sections/Showcase/BrandSpotlight';
import { CatalogPage } from '../components/sections/Catalog/CatalogPage';
import { ConsultationQuiz } from '../components/sections/ConsultationQuiz/ConsultationQuiz';
import { DeliveryInfo } from '../components/sections/DeliveryInfo/DeliveryInfo';
import { FAQ } from '../components/sections/FAQ/FAQ';
import { Contact } from '../components/sections/Contact/Contact';
import { BeautyBlogView } from '../components/blog/BeautyBlogView';

// Admin & CRM
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard';

// Modals
import { QuickOrderModal } from '../components/modals/QuickOrderModal';
import { PostDetailModal } from '../components/modals/PostDetailModal';
import { ProductQuickViewModal } from '../components/modals/ProductQuickViewModal';
import { CartDrawer } from '../components/modals/CartDrawer';

export function App() {
  // 1. Navigation View State: 'home' | 'catalog' | 'admin'
  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'admin'>('home');

  // 2. Auth Context
  const { isAuthenticated } = useAuth();

  // 3. Telegram Feed hook (loads live/cache posts)
  const {
    posts: telegramPosts,
    isLoading: isTgLoading,
    isRefreshing: isTgRefreshing,
    refreshFeed,
  } = useTelegramFeed();

  // 4. Currency hook
  const {
    currency,
    setCurrency,
    formatPrice,
    allCurrencies,
  } = useCurrency();

  // 5. Cart hook
  const {
    items: cartItems,
    totalCount: cartCount,
    formattedTotal: cartFormattedTotal,
    isDrawerOpen: isCartOpen,
    setIsDrawerOpen: setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    generateWhatsAppOrderLink,
  } = useCart(formatPrice);

  // 6. Wishlist hook
  const { isFavorite, toggleWishlist } = useWishlist();

  // 7. Products hook (derived directly from Telegram posts)
  const {
    products,
    allProducts,
    allBrands,
    allTags: catalogTags,
    totalCount: catalogTotalCount,
    filteredCount: catalogFilteredCount,
    discountCount,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    searchQuery: catalogSearch,
    setSearchQuery: setCatalogSearch,
    sortBy,
    setSortBy,
    onlyDiscount,
    setOnlyDiscount,
    onlyWithPrice,
    setOnlyWithPrice,
    resetFilters: resetCatalogFilters,
    hasActiveFilters,
  } = useProducts(telegramPosts);

  // 8. Modals state
  const [quickOrderData, setQuickOrderData] = useState<{
    isOpen: boolean;
    productTitle: string;
    priceFormatted: string;
    sourceUrl?: string;
    productPhoto?: string;
  }>({
    isOpen: false,
    productTitle: '',
    priceFormatted: '',
  });

  const [detailPost, setDetailPost] = useState<TelegramPost | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Listen to hash and URL changes for SPA direct links (#admin, #catalog, #products, #top)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      if (hash === '#admin' || pathname.startsWith('/admin')) {
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#catalog' || hash === '#products') {
        setCurrentView('catalog');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const handleNavigate = (view: 'home' | 'catalog' | 'admin', targetAnchor?: string) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.location.hash = 'admin';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'catalog') {
      window.location.hash = 'catalog';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (targetAnchor && targetAnchor !== '#catalog' && targetAnchor !== '#admin') {
        window.location.hash = targetAnchor.replace('#', '');
        const elem = document.querySelector(targetAnchor);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        window.location.hash = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleOpenQuickOrder = (
    productTitle: string,
    priceFormatted: string,
    sourceUrl?: string,
    productPhoto?: string
  ) => {
    setQuickOrderData({ isOpen: true, productTitle, priceFormatted, sourceUrl, productPhoto });
  };

  const handleOpenProductDetails = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleOpenCatalogWithQuery = (query: string) => {
    setCatalogSearch(query);
    handleNavigate('catalog');
  };

  const handleSelectCategoryFromHero = (cat: string) => {
    if (cat === 'all') {
      resetCatalogFilters();
    } else {
      setSelectedCategory(cat);
    }
    handleNavigate('catalog');
  };

  const handleOpenBrandInCatalog = (brandName: string) => {
    setSelectedBrand(brandName);
    handleNavigate('catalog');
  };

  // ADMIN VIEW ROUTING
  if (currentView === 'admin') {
    if (!isAuthenticated) {
      return <AdminLogin onBackToShop={() => handleNavigate('home', '#top')} />;
    }
    return (
      <AdminDashboard
        onBackToShop={() => handleNavigate('home', '#top')}
        posts={telegramPosts}
        onRefreshFeed={refreshFeed}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#242120]">
      <Header
        activeView={currentView}
        onNavigate={handleNavigate}
        cartCount={cartCount}
        cartTotalFormatted={cartFormattedTotal}
        onOpenCart={() => setIsCartOpen(true)}
        currentCurrency={currency}
        currencies={allCurrencies}
        onSelectCurrency={setCurrency}
        products={allProducts}
        onSelectProduct={handleOpenProductDetails}
        onOpenCatalogWithQuery={handleOpenCatalogWithQuery}
        formatPrice={formatPrice}
      />

      <main className="flex-1">
        {currentView === 'catalog' ? (
          <CatalogPage
            products={products}
            allProducts={allProducts}
            allBrands={allBrands}
            allTags={catalogTags}
            totalCount={catalogTotalCount}
            filteredCount={catalogFilteredCount}
            discountCount={discountCount}
            isLoading={isTgLoading}
            isRefreshing={isTgRefreshing}
            onRefresh={refreshFeed}
            searchQuery={catalogSearch}
            onSearchChange={setCatalogSearch}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedBrand={selectedBrand}
            onBrandChange={setSelectedBrand}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onlyDiscount={onlyDiscount}
            onToggleDiscount={setOnlyDiscount}
            onlyWithPrice={onlyWithPrice}
            onToggleWithPrice={setOnlyWithPrice}
            onResetFilters={resetCatalogFilters}
            hasActiveFilters={hasActiveFilters}
            formatPrice={formatPrice}
            isFavorite={isFavorite}
            onToggleFavorite={toggleWishlist}
            onAddToCart={addToCart}
            onQuickView={handleOpenProductDetails}
            onQuickBuy={handleOpenQuickOrder}
            onBackToHome={() => handleNavigate('home', '#top')}
          />
        ) : (
          <>
            {/* EvaCode Inspired Hero Carousel */}
            <Hero
              onOpenCatalog={() => handleNavigate('catalog')}
              onSelectCategory={handleSelectCategoryFromHero}
              totalProductsCount={allProducts.length}
            />

            {/* Top 10 Bestsellers / Latest Arrivals Rail */}
            <LatestShowcase
              products={allProducts}
              totalCount={allProducts.length}
              isLoading={isTgLoading}
              formatPrice={formatPrice}
              isFavorite={isFavorite}
              onToggleFavorite={toggleWishlist}
              onAddToCart={addToCart}
              onQuickView={handleOpenProductDetails}
              onQuickBuy={handleOpenQuickOrder}
              onOpenFullCatalog={() => handleNavigate('catalog')}
            />

            {/* EvaCode Inspired Brand Spotlight (Curación, JOGABI, Sulwhasoo, etc.) */}
            <BrandSpotlight
              products={allProducts}
              formatPrice={formatPrice}
              isFavorite={isFavorite}
              onToggleFavorite={toggleWishlist}
              onAddToCart={addToCart}
              onQuickView={handleOpenProductDetails}
              onQuickBuy={handleOpenQuickOrder}
              onOpenBrandInCatalog={handleOpenBrandInCatalog}
            />

            {/* Telegram Beauty Articles & Magazine */}
            <section id="magazine">
              <BeautyBlogView
                onOpenProduct={(id) => {
                  const found = allProducts.find((p) => p.id === id);
                  if (found) handleOpenProductDetails(found);
                }}
              />
            </section>

            <ConsultationQuiz />
            <DeliveryInfo />
            <FAQ />
            <Contact />
          </>
        )}
      </main>

      <Footer />

      {/* Quick Order Modal */}
      <QuickOrderModal
        isOpen={quickOrderData.isOpen}
        onClose={() => setQuickOrderData((previous) => ({ ...previous, isOpen: false }))}
        productTitle={quickOrderData.productTitle}
        priceFormatted={quickOrderData.priceFormatted}
        sourceUrl={quickOrderData.sourceUrl}
        productPhoto={quickOrderData.productPhoto}
      />

      {/* Post Detail Modal */}
      <PostDetailModal
        post={detailPost}
        isOpen={!!detailPost}
        onClose={() => setDetailPost(null)}
        onQuickOrder={handleOpenQuickOrder}
      />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        formatPrice={formatPrice}
        onAddToCart={addToCart}
        onQuickBuy={handleOpenQuickOrder}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        formattedTotal={cartFormattedTotal}
        onUpdateQty={updateQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
        formatPrice={formatPrice}
        onCheckoutWhatsApp={generateWhatsAppOrderLink}
      />
    </div>
  );
}

export default App;
