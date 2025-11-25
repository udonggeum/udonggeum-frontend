import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FallbackImage } from '@/components';
import { MOCK_CATEGORIES } from '@/constants/mockData';
import type { Product } from '@/types';

interface PopularProductsCarouselProps {
  products: Product[];
  isLoading?: boolean;
}

/**
 * PopularProductsCarousel component
 * Auto-sliding banner carousel for popular products
 *
 * Extracted from ProductsPage.tsx lines 245-354
 */
export function PopularProductsCarousel({
  products,
  isLoading = false,
}: PopularProductsCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide carousel
  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 5000); // 5초마다 자동 슬라이드

    return () => clearInterval(interval);
  }, [products.length]);

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };

  if (products.length === 0) return null;

  return (
    <section
      className="py-8"
      style={{
        background: `linear-gradient(to bottom, var(--color-secondary), var(--color-primary))`,
      }}
    >
      {isLoading ? (
        <div className="container mx-auto px-4">
          <div className="skeleton h-96 w-full rounded-3xl bg-[var(--color-secondary)]"></div>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <div className="group relative h-96 w-full overflow-hidden rounded-3xl bg-[var(--color-primary)] shadow-2xl">
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="block h-full w-full flex-shrink-0"
                >
                  <div className="card card-side h-96 w-full cursor-pointer bg-[var(--color-primary)] transition-transform hover:scale-[1.01]">
                    <figure className="w-1/2">
                      <FallbackImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </figure>
                    <div className="card-body w-1/2 justify-center p-10">
                      <div className="space-y-4">
                        <div className="badge border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-primary)]">
                          인기
                        </div>
                        <h3 className="line-clamp-2 text-3xl font-bold text-[var(--color-text)]">
                          {product.name}
                        </h3>
                        <p className="text-base text-[var(--color-text)]/70">
                          {product.storeName && `${product.storeName} · `}
                          {MOCK_CATEGORIES.find((c) => c.id === product.categoryId)?.name}
                        </p>
                        <p className="text-4xl font-bold text-[var(--color-gold)]">
                          {product.price.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Navigation Arrows */}
            {products.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-primary)]/60 p-2 text-[var(--color-text)] opacity-0 shadow-lg backdrop-blur-sm transition-opacity hover:bg-[var(--color-primary)]/80 group-hover:opacity-100"
                  aria-label="이전 상품"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-primary)]/60 p-2 text-[var(--color-text)] opacity-0 shadow-lg backdrop-blur-sm transition-opacity hover:bg-[var(--color-primary)]/80 group-hover:opacity-100"
                  aria-label="다음 상품"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Carousel Indicators */}
      {products.length > 1 && (
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2 py-6">
            {products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSlideClick(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? 'w-8 bg-[var(--color-gold)]'
                    : 'w-2 bg-[var(--color-text)]/30'
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
