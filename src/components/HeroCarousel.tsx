import { useState, useEffect } from 'react';
import type { CarouselSlide } from '../types';

interface HeroCarouselProps {
  slides: CarouselSlide[];
}

/**
 * HeroCarousel Component
 *
 * Displays promotional slides with auto-play and manual navigation.
 * Auto-advances every 5 seconds per FR-005.
 */
export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const sortedSlides = [...slides].sort((a, b) => a.displayOrder - b.displayOrder);

  // Auto-play logic: advance every 5 seconds
  useEffect(() => {
    if (sortedSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sortedSlides.length);
    }, 5000); // 5 seconds per spec FR-005

    return () => clearInterval(interval);
  }, [sortedSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? sortedSlides.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % sortedSlides.length);
  };

  const handleImageError = (slideId: string) => {
    setImageErrors((prev) => new Set(prev).add(slideId));
  };

  if (sortedSlides.length === 0) {
    return (
      <div className="w-full h-96 bg-base-200 flex items-center justify-center">
        <p className="text-base-content/50">슬라이드가 없습니다</p>
      </div>
    );
  }

  return (
    <section className="relative w-full" aria-label="프로모션 캐러셀">
      {/* Carousel Container */}
      <div className="carousel w-full h-96 md:h-[500px] relative overflow-hidden">
        {sortedSlides.map((slide, index) => {
          const hasError = imageErrors.has(slide.id);

          return (
            <div
              key={slide.id}
              id={`slide-${slide.id}`}
              className={`carousel-item relative w-full transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
            >
              {/* Slide Content */}
              {hasError ? (
                // Fallback for image load failures
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {slide.overlayText && (
                    <h2 className="text-4xl md:text-6xl font-bold text-white text-center px-4">
                      {slide.overlayText}
                    </h2>
                  )}
                </div>
              ) : (
                <>
                  <img
                    src={slide.imageUrl}
                    alt={slide.altText}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(slide.id)}
                  />
                  {/* Overlay Text */}
                  {slide.overlayText && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <h2 className="text-4xl md:text-6xl font-bold text-white text-center px-4 drop-shadow-lg">
                        {slide.overlayText}
                      </h2>
                    </div>
                  )}
                </>
              )}

              {/* Optional Link Wrapper */}
              {slide.linkUrl && !hasError && (
                <a
                  href={slide.linkUrl}
                  className="absolute inset-0"
                  aria-label={`${slide.altText} 자세히 보기`}
                >
                  <span className="sr-only">자세히 보기</span>
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      {sortedSlides.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            type="button"
            onClick={goToPrevious}
            className="btn btn-circle btn-sm md:btn-md absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
            aria-label="이전 슬라이드"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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

          {/* Next Button */}
          <button
            type="button"
            onClick={goToNext}
            className="btn btn-circle btn-sm md:btn-md absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
            aria-label="다음 슬라이드"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {sortedSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
                aria-current={index === currentSlide ? 'true' : 'false'}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
