import { useState } from 'react';
import type { Region, ProductCategory, SearchFilters } from '../types';

interface SearchSectionProps {
  regions: Region[];
  categories: ProductCategory[];
  onSearch: (filters: SearchFilters) => void;
}

/**
 * SearchSection Component
 *
 * Provides dropdown filters for region and category selection with a search button.
 * Used in the main page to filter products.
 */
export default function SearchSection({
  regions,
  categories,
  onSearch,
}: SearchSectionProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleSearch = () => {
    onSearch({
      regionId: selectedRegionId,
      categoryId: selectedCategoryId,
    });
  };

  const selectedRegion = regions.find((r) => r.id === selectedRegionId);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <section className="bg-base-200 py-8" aria-label="상품 검색 필터">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-center">
          {/* Region Dropdown */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-outline w-full md:w-48">
              {selectedRegion ? selectedRegion.name : '지역 선택'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-full md:w-48 p-2 shadow"
            >
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedRegionId(null)}
                  className={selectedRegionId === null ? 'active' : ''}
                >
                  전체 지역
                </button>
              </li>
              {regions
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((region) => (
                  <li key={region.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedRegionId(region.id)}
                      className={selectedRegionId === region.id ? 'active' : ''}
                    >
                      {region.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Category Dropdown */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-outline w-full md:w-48">
              {selectedCategory ? selectedCategory.name : '상품 카테고리'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-full md:w-48 p-2 shadow"
            >
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className={selectedCategoryId === null ? 'active' : ''}
                >
                  전체 상품
                </button>
              </li>
              {categories
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((category) => (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={selectedCategoryId === category.id ? 'active' : ''}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            className="btn btn-primary w-full md:w-32"
            aria-label="검색"
          >
            검색
          </button>
        </div>
      </div>
    </section>
  );
}
