import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { catalogApi } from '../../api/catalogApi';
import { ProductCard } from '../../components/product/ProductCard';
import { Heart, ChevronRight, ArrowLeft, ShoppingBag } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { favoriteIds, count, toggleWishlist, isFavorite } = useWishlist();
  const { addToCart, items: cartItems, setIsOpen: setIsCartOpen } = useCart();

  // Load products to display favorite items
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['catalog', 'all_for_wishlist'],
    queryFn: () => catalogApi.getProducts({ pageSize: 500 }),
    staleTime: 5 * 60 * 1000,
  });

  const allProducts = productsData?.items || [];
  const favoriteProducts = allProducts.filter((p) =>
    favoriteIds.some((favId) => String(favId) === String(p.id))
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-ink pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-line bg-paper/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-xs text-ink/50 tracking-wide">
            <Link to="/" className="hover:text-gold transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3 text-line" />
            <span className="text-ink font-medium">Избранное</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <p className="eyebrow text-gold mb-1">MK COSMETICS</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-ink">
            Избранные товары ({count})
          </h1>
        </div>

        {count === 0 ? (
          <div className="max-w-md mx-auto text-center py-20 bg-paper rounded-3xl border border-line p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-cream text-gold mx-auto flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-normal text-ink">Список желаний пуст</h2>
            <p className="text-xs text-ink/60 leading-relaxed">
              Нажимайте на сердечко на карточке товара, чтобы сохранить понравившиеся средства.
            </p>
            <Link
              to="/catalog"
              className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> В каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {favoriteProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isFavorite={isFavorite(p.id)}
                onToggleFavorite={toggleWishlist}
                onAddToCart={(prod) => {
                  addToCart(prod, 1);
                  setIsCartOpen(true);
                }}
                inCartCount={cartItems.find((i) => i.product.id === p.id)?.quantity || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
