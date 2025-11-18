import type { ProductCategory } from '@/types';

interface RegionOption {
  id: string;
  label: string;
  region?: string;
  district?: string;
}

interface ProductsFilterBarProps {
  regions: RegionOption[];
  categories: ProductCategory[];
  selectedRegionId: string | null;
  selectedCategoryId: string | null;
  onRegionChange: (regionId: string | null) => void;
  onCategoryChange: (categoryId: string | null) => void;
}

/**
 * ProductsFilterBar Component
 *
 * Renders region and category dropdowns.
 * Designed for the products listing page.
 */
export default function ProductsFilterBar({
  regions,
  categories,
  selectedRegionId,
  selectedCategoryId,
  onRegionChange,
  onCategoryChange,
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
        </div>
      </div>
    </section>
  );
}
