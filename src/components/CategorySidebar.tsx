import type { ProductCategory } from '@/types';

interface RegionOption {
  id: string;
  label: string;
  region?: string;
  district?: string;
}

interface CategorySidebarProps {
  regions: RegionOption[];
  categories: ProductCategory[];
  selectedRegionId: string | null;
  selectedCategoryId: string | null;
  onRegionChange: (regionId: string | null) => void;
  onCategoryChange: (categoryId: string | null) => void;
}

/**
 * CategorySidebar Component
 *
 * Sticky sidebar for region and category navigation.
 * Follows scroll on desktop, collapses on mobile.
 */
export default function CategorySidebar({
  regions,
  categories,
  selectedRegionId,
  selectedCategoryId,
  onRegionChange,
  onCategoryChange,
}: CategorySidebarProps) {
  return (
    <aside className="h-fit space-y-4 lg:sticky lg:top-20">
      {/* Region Filter */}
      <div className="rounded-lg bg-[var(--color-secondary)] p-4">
        <h2 className="mb-3 text-sm font-bold text-[var(--color-text)]">지역</h2>
        <select
          className="select select-sm w-full bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20"
          value={selectedRegionId ?? ''}
          onChange={(e) => onRegionChange(e.target.value || null)}
        >
          <option value="">전체 지역</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div className="rounded-lg bg-[var(--color-secondary)] p-4">
        <h2 className="mb-3 text-sm font-bold text-[var(--color-text)]">카테고리</h2>
        <ul className="menu menu-sm gap-1 p-0">
          {/* All products */}
          <li>
            <button
              type="button"
              className={selectedCategoryId === null ? 'bg-[var(--color-gold)] text-[var(--color-primary)]' : 'text-[var(--color-text)]'}
              onClick={() => onCategoryChange(null)}
            >
              전체 상품
            </button>
          </li>

          {/* Category list */}
          {categories
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  className={selectedCategoryId === category.id ? 'bg-[var(--color-gold)] text-[var(--color-primary)]' : 'text-[var(--color-text)]'}
                  onClick={() => onCategoryChange(category.id)}
                >
                  {category.name}
                </button>
              </li>
            ))}
        </ul>
      </div>
    </aside>
  );
}
