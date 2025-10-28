import { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import SearchSection from '../components/SearchSection';
import HeroCarousel from '../components/HeroCarousel';
import PopularProducts from '../components/PopularProducts';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import {
  MOCK_REGIONS,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_CAROUSEL_SLIDES,
  MOCK_NAV_ITEMS,
} from '../constants/mockData';
import type { SearchFilters } from '../types';

/**
 * MainPage Component
 *
 * The main landing page for the jewelry marketplace.
 * Features search/filter functionality and displays products in a responsive grid.
 */
export default function MainPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    regionId: null,
    categoryId: null,
  });

  // Client-side filtering logic
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      const matchesRegion =
        !filters.regionId || product.regionId === filters.regionId;
      const matchesCategory =
        !filters.categoryId || product.categoryId === filters.categoryId;
      return matchesRegion && matchesCategory;
    });
  }, [filters]);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleWishlist = (productId: string) => {
    // TODO: Implement wishlist functionality when user authentication is added
    console.log('Toggle wishlist for product:', productId);
  };

  const handleAddToCart = (productId: string) => {
    // TODO: Implement cart functionality when shopping cart feature is added
    console.log('Add to cart:', productId);
  };

  // Get filter labels for display
  const selectedRegion = MOCK_REGIONS.find((r) => r.id === filters.regionId);
  const selectedCategory = MOCK_CATEGORIES.find(
    (c) => c.id === filters.categoryId
  );

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Navigation Bar */}
      <Navbar navigationItems={MOCK_NAV_ITEMS} />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Search Section */}
        <SearchSection
          regions={MOCK_REGIONS}
          categories={MOCK_CATEGORIES}
          onSearch={handleSearch}
        />

      {/* Hero Carousel */}
      <HeroCarousel slides={MOCK_CAROUSEL_SLIDES} />

      {/* Products Section */}
      <section className="container mx-auto px-4 py-12" aria-label="상품 목록">
        {/* Filter Summary */}
        {(filters.regionId || filters.categoryId) && (
          <div className="mb-6">
            <p className="text-lg text-base-content/70">
              검색 결과:{' '}
              {selectedRegion && <span className="font-semibold">{selectedRegion.name}</span>}
              {selectedRegion && selectedCategory && ' · '}
              {selectedCategory && (
                <span className="font-semibold">{selectedCategory.name}</span>
              )}
            </p>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 text-base-content/30 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2">상품이 없습니다</h2>
            <p className="text-base-content/70 max-w-md">
              해당 지역에 상품이 없습니다. 다른 지역을 선택해주세요.
            </p>
            <button
              type="button"
              onClick={() => setFilters({ regionId: null, categoryId: null })}
              className="btn btn-primary mt-6"
            >
              전체 상품 보기
            </button>
          </div>
        ) : (
          <>
            {/* Product Count */}
            <div className="mb-6">
              <p className="text-sm text-base-content/70">
                총 {filteredProducts.length}개의 상품
              </p>
            </div>

            {/* Product Grid - Responsive: 1 col mobile → 2-4 cols desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onWishlist={handleWishlist}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </>
        )}
      </section>

        {/* Popular Products Section */}
        <PopularProducts
          products={MOCK_PRODUCTS}
          categories={MOCK_CATEGORIES}
          onWishlist={handleWishlist}
          onAddToCart={handleAddToCart}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
