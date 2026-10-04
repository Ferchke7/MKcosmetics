import React, { useEffect, useState } from 'react';
import { catalogApi } from '../../api/catalogApi';
import { HomeCatalogData } from '../../core/types/catalog';
import { HeroSlider } from '../../components/sections/HeroSlider';
import { FeatureBadgesBar } from '../../components/sections/FeatureBadgesBar';
import { SpotlightRail } from '../../components/sections/SpotlightRail';
import { BrandStage } from '../../components/sections/BrandStage';
import { CategoryTiles } from '../../components/sections/CategoryTiles';
import { StoryInNumbers } from '../../components/sections/StoryInNumbers';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

export const HomePage: React.FC = () => {
  const [data, setData] = useState<HomeCatalogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart, items: cartItems, setIsOpen: setIsCartOpen } = useCart();
  const { isFavorite, toggleWishlist } = useWishlist();

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  useEffect(() => {
    let isMounted = true;
    catalogApi.getHome()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Home load error:', err);
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const getInCartCount = (id: number) => {
    const found = cartItems.find((i) => i.product.id === id);
    return found ? found.quantity : 0;
  };

  if (isLoading || !data) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs uppercase tracking-wider text-muted font-semibold">Загрузка каталога...</p>
      </div>
    );
  }

  const firstBrand = data.brandSpotlights?.[0];
  const secondBrand = data.brandSpotlights?.[1];

  const hitsToDisplay = (data.hits && data.hits.length > 0) ? data.hits : (data.newArrivals || []);
  const setsToDisplay = (data.sets && data.sets.length > 0) ? data.sets : (data.newArrivals && data.newArrivals.length > 4 ? data.newArrivals.slice(4) : data.newArrivals || []);

  return (
    <div>
      {/* 1. Hero Luxury Slider */}
      <HeroSlider />

      {/* 1.5. Wellbeing X Feature Badges Bar */}
      <FeatureBadgesBar />

      {/* 2. Spotlight: Hits / Хиты каталога */}
      <SpotlightRail
        eyebrow="Выбор MK Cosmetics"
        title="Хиты продаж"
        lead="То, что чаще всего заказывают повторно — проверенные формулы и топовые бестселлеры."
        ritualText="Спрос · Доверие · Оригинал"
        catalogLink="/catalog"
        catalogLinkText="Все хиты"
        products={hitsToDisplay}
        watermarkText="Hits"
        accentPosition="left"
        onAddToCart={handleAddToCart}
        isFavorite={isFavorite}
        onToggleFavorite={toggleWishlist}
        cartItemsCount={getInCartCount}
      />

      {/* 3. Brand Spotlight Stage #1 */}
      {firstBrand && (
        <BrandStage
          brand={firstBrand.brand}
          brandSlug={firstBrand.slug}
          count={firstBrand.count}
          products={firstBrand.products}
          onAddToCart={handleAddToCart}
          isFavorite={isFavorite}
          onToggleFavorite={toggleWishlist}
          cartItemsCount={getInCartCount}
        />
      )}

      {/* 4. Category Grid Navigation */}
      <CategoryTiles categories={data.categories} />

      {/* 5. Spotlight: Ready Sets / Наборы */}
      <SpotlightRail
        eyebrow="Комплексный уход"
        title="Наборы и сеты"
        lead="Готовые программы ухода от ведущих корейских брендов — удобный старт и выгода по сравнению с покупкой по отдельности."
        ritualText="Комплект · Выгода · Уход"
        catalogLink="/catalog?categorySlug=nabory-588136"
        catalogLinkText="Все наборы"
        products={setsToDisplay}
        watermarkText="Sets"
        accentPosition="right"
        onAddToCart={handleAddToCart}
        isFavorite={isFavorite}
        onToggleFavorite={toggleWishlist}
        cartItemsCount={getInCartCount}
      />

      {/* 6. Brand Spotlight Stage #2 */}
      {secondBrand && (
        <BrandStage
          brand={secondBrand.brand}
          brandSlug={secondBrand.slug}
          count={secondBrand.count}
          products={secondBrand.products}
          onAddToCart={handleAddToCart}
          isFavorite={isFavorite}
          onToggleFavorite={toggleWishlist}
          cartItemsCount={getInCartCount}
        />
      )}

      {/* 7. Wellbeing X: Our Story In Numbers */}
      <StoryInNumbers />
    </div>
  );
};
