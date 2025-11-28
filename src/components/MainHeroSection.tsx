import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CATEGORIES } from '../constants/mockData';
import { useStoreLocations } from '@/hooks/queries/useStoresQueries';
import { useProductFilters } from '@/hooks/queries/useProductsQueries';
import { getRegionOptions } from '@/utils/regionOptions';
import { adaptFiltersToCategories } from '@/utils/filterAdapters';

interface MainHeroSectionProps {
  onSearch?: (region?: string, category?: string) => void;
}

/**
 * MainHeroSection Component
 *
 * Full-screen hero section for main page with region/category selection.
 * Displays "우리 동네 금은방 소식을 확인해보세요." with indexed search filters.
 */
export default function MainHeroSection({ onSearch }: MainHeroSectionProps) {
  const navigate = useNavigate();
  const { data: locationsData } = useStoreLocations();
  const { data: filtersData } = useProductFilters();
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const regionOptions = useMemo(() => getRegionOptions(locationsData), [locationsData]);

  const categories = useMemo(
    () => (filtersData ? adaptFiltersToCategories(filtersData) : MOCK_CATEGORIES),
    [filtersData]
  );

  const selectedRegion = regionOptions.find((region) => region.id === selectedRegionId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    // "all"이 아닌 경우에만 지역 필터 적용
    if (selectedRegion && selectedRegionId !== 'all') {
      params.append('regionId', selectedRegion.id);
      if (selectedRegion.region) {
        params.append('region', selectedRegion.region);
      }
      if (selectedRegion.district) {
        params.append('district', selectedRegion.district);
      }
    }

    // "all"이 아닌 경우에만 카테고리 필터 적용
    if (selectedCategoryId && selectedCategoryId !== 'all') {
      params.append('category', selectedCategoryId);
    }

    if (onSearch) {
      onSearch(
        selectedRegionId && selectedRegionId !== 'all' ? selectedRegionId : undefined,
        selectedCategoryId && selectedCategoryId !== 'all' ? selectedCategoryId : undefined
      );
      return;
    }

    const queryString = params.toString();
    void navigate(queryString ? `/products?${queryString}` : '/products');
  };

  const handleCategoryClick = (category: string) => {
    if (category === 'stores') {
      void navigate('/stores');
    } else if (category === 'gold') {
      void navigate('/products?category=gold');
    } else if (category === 'order') {
      void navigate('/orders');
    } else {
      void navigate('/products');
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[var(--color-primary)]">
      <div className="container mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-[var(--color-gold)]" style={{ fontFamily: "'Gmarket Sans', -apple-system, sans-serif" }}>
            우리 동네 금은방
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-text)] opacity-70">
            가까운 금은방의 상품/시세/매장을 한 번에.
          </p>
        </div>

        {/* Primary: Search Section */}
        <div className="max-w-4xl mx-auto mb-16">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row gap-3">
            {/* Region Select */}
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              className="select flex-1 h-16 text-lg px-5 rounded-xl bg-[var(--color-secondary)] text-[var(--color-text)] border-2 border-[var(--color-text)]/30 hover:border-[var(--color-gold)] focus:outline-none focus:border-[var(--color-gold)] transition-colors shadow-lg"
              aria-label="지역 선택"
            >
              <option value="" disabled hidden>
                지역 선택
              </option>
              <option value="all">전체 지역</option>
              {regionOptions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>

            {/* Category Select */}
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="select flex-1 h-16 text-lg px-5 rounded-xl bg-[var(--color-secondary)] text-[var(--color-text)] border-2 border-[var(--color-text)]/30 hover:border-[var(--color-gold)] focus:outline-none focus:border-[var(--color-gold)] transition-colors shadow-lg"
              aria-label="카테고리 선택"
            >
              <option value="" disabled hidden>
                카테고리 선택
              </option>
              <option value="all">전체 카테고리</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Search Button */}
            <button
              type="submit"
              className="h-16 md:w-16 rounded-xl bg-[var(--color-gold)] hover:opacity-90 transition-all flex items-center justify-center gap-2 border-none shadow-lg hover:shadow-xl font-semibold text-[var(--color-primary)]"
              aria-label="검색하기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>
        </div>

        {/* Secondary: Quick Links */}
        <div className="max-w-2xl mx-auto">
        <div className="flex justify-center gap-4 md:gap-6">
          <button
            type="button"
            onClick={() => handleCategoryClick('products')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-secondary)] transition-colors group"
            aria-label="상품 전체 보기"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-colors bg-[var(--color-secondary)] group-hover:bg-[var(--color-gold)]/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 md:h-8 md:w-8 transition-colors text-[var(--color-text)] group-hover:text-[var(--color-gold)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <span className="text-sm md:text-base font-medium text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors">
              상품 전체
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryClick('stores')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-secondary)] transition-colors group"
            aria-label="매장 찾기"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-colors bg-[var(--color-secondary)] group-hover:bg-[var(--color-gold)]/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 md:h-8 md:w-8 transition-colors text-[var(--color-text)] group-hover:text-[var(--color-gold)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="text-sm md:text-base font-medium text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors">
              매장 찾기
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryClick('gold')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-secondary)] transition-colors group"
            aria-label="금시세 확인"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-colors bg-[var(--color-secondary)] group-hover:bg-[var(--color-gold)]/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 md:h-8 md:w-8 transition-colors text-[var(--color-text)] group-hover:text-[var(--color-gold)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-sm md:text-base font-medium text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors">
              금시세 확인
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryClick('order')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-secondary)] transition-colors group"
            aria-label="주문 내역"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-colors bg-[var(--color-secondary)] group-hover:bg-[var(--color-gold)]/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 md:h-8 md:w-8 transition-colors text-[var(--color-text)] group-hover:text-[var(--color-gold)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-sm md:text-base font-medium whitespace-nowrap text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors">
              주문 내역
            </span>
          </button>
        </div>
        </div>
      </div>
    </section>
  );
}
