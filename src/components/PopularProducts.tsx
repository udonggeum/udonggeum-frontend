import { useState } from 'react';
import ProductCard from './ProductCard';
import type { Product, ProductCategory } from '../types';

interface PopularProductsProps {
  products: Product[];
  categories: ProductCategory[];
  onWishlist?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

/**
 * PopularProducts Component
 *
 * Displays popular products organized by category tabs.
 * Shows 3-4 products per category in a responsive grid.
 */
export default function PopularProducts({
  products,
  categories,
  onWishlist,
  onAddToCart,
}: PopularProductsProps) {
  // Filter to show only the 3 main categories for tabs: 반지, 목걸이, 팔찌
  const featuredCategoryIds = ['rings', 'necklaces', 'bracelets'];
  const featuredCategories = categories
    .filter((cat) => featuredCategoryIds.includes(cat.id))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const [activeCategory, setActiveCategory] = useState<string>(
    featuredCategories[0]?.id || 'rings'
  );

  // Filter products by selected category and limit to 3-4 items
  const filteredProducts = products
    .filter((product) => product.categoryId === activeCategory)
    .slice(0, 4);

  return (
    <section className="bg-base-200 py-12" aria-label="인기 상품">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">인기 상품</h2>
          <p className="text-base-content/70">
            카테고리별 인기 상품을 만나보세요
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-8">
          <div
            role="tablist"
            className="tabs tabs-boxed bg-base-100 p-1"
          >
            {featuredCategories.map((category) => (
              <button
                key={category.id}
                role="tab"
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`tab tab-lg ${
                  activeCategory === category.id ? 'tab-active' : ''
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
        {filteredProducts.length > 0 ? (
          <div
            id={`panel-${activeCategory}`}
            role="tabpanel"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onWishlist={onWishlist}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-base-content/50">
              이 카테고리에 인기 상품이 없습니다.
            </p>
          </div>
        )}

        {/* View All Button */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-8">
            <a
              href={`/products?category=${activeCategory}`}
              className="btn btn-outline btn-primary"
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
