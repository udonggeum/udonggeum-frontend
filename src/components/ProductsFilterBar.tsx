import type { ProductCategory } from '@/types';

interface RegionOption {
  id: string;
  label: string;
  region?: string;
  district?: string;
}

interface SortOption {
  id: string;
  label: string;
  value: 'popularity' | 'price_asc' | 'price_desc' | 'latest';
}

interface ProductsFilterBarProps {
  regions: RegionOption[];
  categories: ProductCategory[];
  sortOptions: SortOption[];
  selectedRegionId: string | null;
  selectedCategoryId: string | null;
  selectedSortValue: SortOption['value'];
  onRegionChange: (regionId: string | null) => void;
  onCategoryChange: (categoryId: string | null) => void;
  onSortChange: (sortValue: SortOption['value']) => void;
  onToggleAdvancedFilters?: () => void;
  isAdvancedOpen?: boolean;
}

/**
 * ProductsFilterBar Component
 *
 * Renders region, category, and sort dropdowns with an optional advanced filter toggle.
 * Designed for the products listing page.
 */
export default function ProductsFilterBar({
  regions,
  categories,
  sortOptions,
  selectedRegionId,
  selectedCategoryId,
  selectedSortValue,
  onRegionChange,
  onCategoryChange,
  onSortChange,
  onToggleAdvancedFilters,
  isAdvancedOpen,
}: ProductsFilterBarProps) {
  return (
    <section className="bg-base-200 py-6" aria-label="상품 필터">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            {/* Region select */}
            <label className="form-control w-full lg:w-52">
              <div className="label">
                <span className="label-text text-sm font-semibold">지역</span>
              </div>
              <select
                className="select select-bordered"
                value={selectedRegionId ?? ''}
                onChange={(event) =>
                  onRegionChange(event.target.value ? event.target.value : null)
                }
              >
                <option value="">전체 지역</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Category select */}
            <label className="form-control w-full lg:w-52">
              <div className="label">
                <span className="label-text text-sm font-semibold">상품</span>
              </div>
              <select
                className="select select-bordered"
                value={selectedCategoryId ?? ''}
                onChange={(event) =>
                  onCategoryChange(event.target.value ? event.target.value : null)
                }
              >
                <option value="">전체 상품</option>
                {categories
                  .slice()
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            {/* Sort select */}
            <label className="form-control w-full lg:w-52">
              <div className="label">
                <span className="label-text text-sm font-semibold">정렬 기준</span>
              </div>
              <select
                className="select select-bordered"
                value={selectedSortValue}
                onChange={(event) => onSortChange(event.target.value as SortOption['value'])}
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Advanced filters toggle */}
            {onToggleAdvancedFilters && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={onToggleAdvancedFilters}
              >
                상세 필터 {isAdvancedOpen ? '닫기' : '열기'}
              </button>
            )}
          </div>
        </div>

        {isAdvancedOpen && (
          <div className="mt-4 rounded-lg border border-base-300 bg-base-100 p-4 text-sm text-base-content/70">
            <p>추가 필터 기능이 준비 중입니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}
