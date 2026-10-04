import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../api/catalogApi';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { formatKrw } from '../../components/ui/Price';
import { ProductCard } from '../../components/product/ProductCard';
import { BRAND_CONFIG } from '../../core/constants/brand';
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Share2,
  PackageCheck,
  MapPin,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, setIsOpen: setIsCartOpen } = useCart();
  const { isFavorite, toggleWishlist } = useWishlist();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch product by slug
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['catalog', 'product', slug],
    queryFn: () => catalogApi.getProductBySlug(slug!),
    enabled: Boolean(slug),
  });

  // Fetch related products (same category)
  const { data: relatedData } = useQuery({
    queryKey: ['catalog', 'related', product?.categorySlug],
    queryFn: () =>
      catalogApi.getProducts({
        categorySlug: product?.categorySlug,
        limit: 8,
      }),
    enabled: Boolean(product?.categorySlug),
  });

  useEffect(() => {
    setActiveImageIdx(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-line/40 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-4 w-28 bg-line/40 rounded" />
            <div className="h-8 w-3/4 bg-line/40 rounded" />
            <div className="h-8 w-1/3 bg-line/40 rounded" />
            <div className="h-24 w-full bg-line/40 rounded" />
            <div className="h-12 w-full bg-line/40 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] bg-[#FDFBF7] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-paper p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-cream text-gold mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-normal text-ink">Товар не найден</h2>
          <p className="text-xs text-ink/60 leading-relaxed">
            Возможно, этот товар был снят с продажи или ссылка устарела.
          </p>
          <Link
            to="/catalog"
            className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> В каталог
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[activeImageIdx] || '/placeholder.png';
  const hasDiscount = product.oldPriceKrw && product.oldPriceKrw > product.priceKrw;
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPriceKrw! - product.priceKrw) / product.oldPriceKrw!) * 100)
    : 0;
  const isFav = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const relatedProducts = (relatedData?.items || []).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-ink pb-24">
      {/* Breadcrumbs */}
      <div className="border-b border-line bg-paper/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-xs text-ink/50 tracking-wide flex-wrap">
            <Link to="/" className="hover:text-gold transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3 text-line" />
            <Link to="/catalog" className="hover:text-gold transition-colors">Каталог</Link>
            {product.categoryName && (
              <>
                <ChevronRight className="w-3 h-3 text-line" />
                <Link
                  to={`/catalog?category=${product.categorySlug}`}
                  className="hover:text-gold transition-colors"
                >
                  {product.categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3 text-line" />
            <span className="text-ink font-medium truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Left: Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square bg-cream rounded-3xl overflow-hidden border border-line shadow-sm group">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {product.isHit && (
                  <span className="px-3 py-1 bg-ink text-paper text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                    ХИТ
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-3 py-1 bg-sale text-paper text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full border border-line bg-paper/90 backdrop-blur-sm flex items-center justify-center transition-all shadow-sm ${
                  isFav ? 'text-sale border-sale/40' : 'text-ink/60 hover:text-sale'
                }`}
                title="В избранное"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-cream border transition-all flex-shrink-0 ${
                      idx === activeImageIdx
                        ? 'border-gold ring-2 ring-gold/20'
                        : 'border-line hover:border-gold/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Buying (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Brand and Actions */}
              <div className="flex items-center justify-between">
                {product.brand ? (
                  <Link
                    to={`/catalog?brand=${encodeURIComponent(product.brand)}`}
                    className="eyebrow text-gold hover:underline font-semibold"
                  >
                    {product.brand}
                  </Link>
                ) : (
                  <span className="eyebrow text-ink/50">KOREAN COSMETICS</span>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleShare}
                    className="text-xs text-ink/50 hover:text-gold flex items-center gap-1"
                    title="Поделиться"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Скопировано!' : 'Поделиться'}</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-ink leading-tight">
                {product.name}
              </h1>

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                {product.stock > 0 ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    В наличии в Сеуле ({product.stock} шт)
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Под заказ
                  </div>
                )}

                {product.code && (
                  <span className="text-xs text-ink/40 font-mono">Арт: {product.code}</span>
                )}
              </div>

              {/* Price Block */}
              <div className="bg-cream/50 rounded-2xl p-5 border border-line flex flex-wrap items-baseline gap-4">
                <div className="text-3xl sm:text-4xl font-serif font-bold text-ink tracking-tight">
                  {formatKrw(product.priceKrw)}
                </div>
                {hasDiscount && (
                  <>
                    <div className="text-lg text-ink/40 line-through">
                      {formatKrw(product.oldPriceKrw!)}
                    </div>
                    <div className="px-2.5 py-1 bg-sale/10 text-sale rounded-md text-xs font-bold">
                      Экономия {formatKrw(product.oldPriceKrw! - product.priceKrw)}
                    </div>
                  </>
                )}
              </div>

              {/* Excerpt */}
              {product.excerpt && (
                <p className="text-sm text-ink/70 leading-relaxed font-sans">
                  {product.excerpt}
                </p>
              )}

              {/* Quantity and Actions */}
              <div className="pt-2 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Stepper */}
                  <div className="inline-flex items-center border border-line rounded-full bg-paper p-1 w-fit">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-cream disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-semibold font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-cream transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 btn-gold py-3.5 px-8 rounded-full text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4" /> Добавлено в корзину
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> Добавить в корзину
                      </>
                    )}
                  </button>

                  {/* Buy Now Button */}
                  <button
                    onClick={handleBuyNow}
                    className="py-3.5 px-6 rounded-full border border-ink text-ink hover:bg-ink hover:text-paper text-xs uppercase tracking-widest font-semibold transition-colors"
                  >
                    Купить сейчас
                  </button>
                </div>
              </div>

              {/* Trust & Guarantee Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-line">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-paper border border-line">
                  <ShieldCheck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-ink">100% Оригинал</h5>
                    <p className="text-[11px] text-ink/60 mt-0.5 leading-snug">
                      Прямо с заводов Южной Кореи
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-paper border border-line">
                  <Truck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-ink">Быстрая доставка</h5>
                    <p className="text-[11px] text-ink/60 mt-0.5 leading-snug">
                      Курьер по Корее (5 000 ₩)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-paper border border-line">
                  <PackageCheck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-ink">Склад в Сеуле</h5>
                    <p className="text-[11px] text-ink/60 mt-0.5 leading-snug">
                      Самовывоз и отправка карго в СНГ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Description & Specs */}
            {product.description && (
              <div className="mt-10 pt-8 border-t border-line space-y-4">
                <h4 className="font-serif text-xl text-ink font-normal">Описание и свойства</h4>
                <div
                  className="prose prose-sm max-w-none text-ink/80 text-xs sm:text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-line space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow text-gold mb-1">РЕКОМЕНДАЦИИ</p>
                <h3 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
                  Вам также может подойти
                </h3>
              </div>
              {product.categorySlug && (
                <Link
                  to={`/catalog?category=${product.categorySlug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-gold hover:text-ink transition-colors flex items-center gap-1"
                >
                  Смотреть все <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
