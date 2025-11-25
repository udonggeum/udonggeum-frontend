import { useState } from 'react';
import ProductCard from './ProductCard';
import ProductsLoadingSkeleton from './ProductsLoadingSkeleton';
import { usePopularProducts } from '../hooks/queries/useProductsQueries';
import { transformProductsFromAPI, uiCategoryToAPICategory } from '../utils/apiAdapters';
import type { ProductCategory } from '../types';

interface PopularProductsProps {
  categories: ProductCategory[];
}

/**
 * PopularProducts Component
 *
 * Displays popular products organized by category tabs.
 * Shows 3-4 products per category in a responsive grid.
 */
export default function PopularProducts({
  categories,
}: PopularProductsProps) {
  // Filter to show only the 3 main categories for tabs: 반지, 목걸이, 팔찌
  const featuredCategoryIds = ['rings', 'necklaces', 'bracelets'];
  const featuredCategories = categories
    .filter((cat) => featuredCategoryIds.includes(cat.id))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const [activeCategory, setActiveCategory] = useState<string>(
    featuredCategories[0]?.id || 'rings'
  );

  // Convert UI category to API category
  const apiCategory = uiCategoryToAPICategory(activeCategory);

  // Fetch popular products for active category (API call)
  const { data, isLoading, error } = usePopularProducts({
    category: apiCategory,
    page: 1,
    page_size: 4,
  });

  // Transform API products to UI format
  const products = data ? transformProductsFromAPI(data.products) : [];

  // Filter by categoryId for UI (temporary until API supports exact matching)
  const filteredProducts = products
    .filter((product) => product.categoryId === activeCategory)
    .slice(0, 4);

  return (
    <section className="bg-[var(--color-secondary)] py-12" aria-label="인기 상품">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-[var(--color-gold)]">인기 상품</h2>
          <p className="text-[var(--color-text)]/70">
            카테고리별 인기 상품을 만나보세요
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-8">
          <div
            role="tablist"
            className="tabs tabs-boxed bg-[var(--color-primary)] p-1"
          >
            {featuredCategories.map((category) => (
              <button
                key={category.id}
                role="tab"
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`tab tab-lg ${
                  activeCategory === category.id
                    ? 'bg-[var(--color-gold)] text-[var(--color-primary)] font-semibold'
                    : 'text-[var(--color-text)] hover:text-[var(--color-gold)]'
                }`}
                aria-selected={activeCategory === category.id}
                aria-controls={`panel-${category.id}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <ProductsLoadingSkeleton count={4} />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-error mb-2">인기 상품을 불러올 수 없습니다.</p>
            <p className="text-[var(--color-text)]/50 text-sm">
              {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div
            id={`panel-${activeCategory}`}
            role="tabpanel"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                hideActions={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--color-text)]/50">
              이 카테고리에 인기 상품이 없습니다.
            </p>
          </div>
        )}

        {/* View All Button */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-8">
            <a
              href={`/products?category=${activeCategory}`}
              className="btn border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-primary)]"
            >
              {featuredCategories.find((c) => c.id === activeCategory)?.name} 전체
              보기
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
