import { useRef } from 'react';
import type { Product } from '../types';

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

/**
 * ProductCarousel Component
 *
 * Horizontal scrollable product carousel.
 * Displays products in a single row with scroll navigation.
 */
export default function ProductCarousel({
  title,
  products,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 border-t border-[var(--color-text)]/10 bg-[var(--color-primary)]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-gold)]">{title}</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="btn btn-circle btn-sm btn-ghost hover:bg-opacity-10 text-[var(--color-text)]"
              aria-label="이전 상품"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="btn btn-circle btn-sm btn-ghost hover:bg-opacity-10 text-[var(--color-text)]"
              aria-label="다음 상품"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Product List */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {products.map((product) => (
            <a
              key={product.id}
              href={`/products/${product.id}`}
              className="flex-none group"
              aria-label={product.name}
            >
              {/* Product Card */}
              <div className="w-32 md:w-40">
                {/* Product Image */}
                <div
                  className="aspect-square rounded-lg overflow-hidden mb-2 border-2 transition-all bg-[var(--color-secondary)] border-[var(--color-text)]/10"
                  onMouseEnter={(e) => {
                    const goldColor = getComputedStyle(document.documentElement).getPropertyValue('--color-gold').trim();
                    e.currentTarget.style.borderColor = goldColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                  }}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-[var(--color-text)]/20"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-1">
                  {/* Store Name */}
                  <p className="text-xs truncate text-[var(--color-text)] opacity-60">
                    {product.storeName || '우동금'}
                  </p>

                  {/* Product Name */}
                  <h3
                    className="text-sm font-medium line-clamp-2 transition-colors group-hover:opacity-80 text-[var(--color-text)]"
                    onMouseEnter={(e) => {
                      const goldColor = getComputedStyle(document.documentElement).getPropertyValue('--color-gold').trim();
                      e.currentTarget.style.color = goldColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '';
                    }}
                  >
                    {product.name}
                  </h3>

                  {/* Price */}
                  <p className="text-sm font-bold text-[var(--color-gold)]">
                    {product.price.toLocaleString('ko-KR')}원
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
