import React from 'react';
import { Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../api/catalogApi';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../core/auth/AuthContext';

// Layout components
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CatalogBar } from '../components/layout/CatalogBar';
import { CartDrawer } from '../components/cart/CartDrawer';

// Pages
import { HomePage } from '../pages/Home/HomePage';
import { CatalogPage } from '../pages/Catalog/CatalogPage';
import { ProductDetailPage } from '../pages/Product/ProductDetailPage';
import { CheckoutPage } from '../pages/Checkout/CheckoutPage';
import { WishlistPage } from '../pages/Wishlist/WishlistPage';
import { DeliveryPage } from '../pages/Static/DeliveryPage';
import { ContactsPage } from '../pages/Static/ContactsPage';
import { AboutPage } from '../pages/Static/AboutPage';

// Admin components
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard';

// Storefront Layout Wrapper
const StorefrontLayout: React.FC = () => {
  const { totalCount: cartCount, isOpen: isCartOpen, setIsOpen: setIsCartOpen } = useCart();
  const { count: wishlistCount } = useWishlist();

  // Load categories and brands for the sticky CatalogBar
  const { data: categories = [] } = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => catalogApi.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['catalog', 'brands'],
    queryFn: () => catalogApi.getBrands(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-ink font-sans selection:bg-gold/20 selection:text-ink">
      {/* Luxury Korean Header */}
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Sticky Catalog Bar with search, dropdowns, and Cart */}
      <CatalogBar
        categories={categories}
        brands={brands}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Dynamic Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Shopping Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Floating Quick Cart Action Button (visible when cart has items) */}
      {cartCount > 0 && (
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#191A15] hover:bg-kraft text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 border border-white/20 animate-in fade-in slide-in-from-bottom-4 cursor-pointer"
          aria-label="Корзина"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <span className="absolute -top-2 -right-2.5 w-4 h-4 rounded-full bg-gold text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Корзина</span>
        </button>
      )}
    </div>
  );
};

// Admin Page Wrapper
const AdminRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <AdminLogin onBackToShop={() => navigate('/')} />;
  }

  return (
    <AdminDashboard
      onBackToShop={() => navigate('/')}
      posts={[]}
      onRefreshFeed={async () => {}}
    />
  );
};

export function App() {
  return (
    <Routes>
      {/* Storefront Layout */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/:categorySlug" element={<CatalogPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Dedicated Admin Route */}
      <Route path="/admin/*" element={<AdminRoute />} />

      {/* Fallback */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

export default App;
