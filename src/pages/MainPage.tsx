import { useState } from 'react';
import Navbar from '../components/Navbar';
import SearchSection from '../components/SearchSection';
import HeroCarousel from '../components/HeroCarousel';
import PopularProducts from '../components/PopularProducts';
import ProductCard from '../components/ProductCard';
import ProductsLoadingSkeleton from '../components/ProductsLoadingSkeleton';
import ProductsError from '../components/ProductsError';
import Footer from '../components/Footer';
import { useProducts } from '../hooks/queries/useProductsQueries';
import { useStoreLocations } from '../hooks/queries/useStoresQueries';
import { transformProductsFromAPI, uiCategoryToAPICategory } from '../utils/apiAdapters';
import {
  MOCK_CATEGORIES,
  MOCK_CAROUSEL_SLIDES,
  MOCK_NAV_ITEMS,
} from '../constants/mockData';
import type { SearchFilters, Region } from '../types';

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

  // Fetch store locations for regions (API call)
  const {
    data: locationsData,
    // isLoading and error states not currently used for locations
    // but available for future implementation
  } = useStoreLocations();

  // Convert UI filters to API parameters
  const apiCategory = uiCategoryToAPICategory(filters.categoryId);

  // TODO: Convert regionId to region/district
  // For now, we'll fetch all products and let the backend handle filtering
  // when proper region mapping is implemented

  // Fetch products with server-side filtering (API call)
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts({
    category: apiCategory,
    page: 1,
    page_size: 20,
  });

  // Transform API products to UI format
  const products = productsData
    ? transformProductsFromAPI(productsData.products)
    : [];

  // Transform API regions to UI format
  const regions: Region[] = locationsData
    ? locationsData.regions.flatMap((regionGroup) =>
        regionGroup.districts.map((district, index) => ({
          id: `${regionGroup.region}-${district}`.toLowerCase().replace(/\s+/g, '-'),
          name: `${regionGroup.region} ${district}`,
          city: regionGroup.region,
          displayOrder: index + 1,
        }))
      )
    : [];

  // Client-side region filtering (until backend supports it)
  const filteredProducts = filters.regionId
    ? products.filter((product) => product.regionId === filters.regionId)
    : products;

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
  const selectedRegion = regions.find((r) => r.id === filters.regionId);
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
          regions={regions}
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

        {/* Loading State */}
        {productsLoading ? (
          <ProductsLoadingSkeleton count={8} />
        ) : productsError ? (
          /* Error State */
          <ProductsError
            error={productsError}
            onRetry={() => {
              void refetchProducts();
            }}
          />
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
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
