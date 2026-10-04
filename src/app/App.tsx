import React from 'react';
import { Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
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

      {/* Sticky Catalog Bar with search and dropdowns */}
      <CatalogBar categories={categories} brands={brands} />

      {/* Dynamic Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Shopping Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
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
