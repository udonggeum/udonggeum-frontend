interface CategoryChip {
  id: string;
  label: string;
}

interface CategoryFilterChipsProps {
  categories: CategoryChip[];
  selectedCategories: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
}

/**
 * CategoryFilterChips Component
 *
 * Horizontal scrollable multi-select category filter bar.
 * - "전체" chip resets all filters when clicked
 * - Other chips can be toggled on/off independently
 * - Multiple selections use OR logic (show products matching any selected category)
 */
export default function CategoryFilterChips({
  categories,
  selectedCategories,
  onCategoriesChange,
}: CategoryFilterChipsProps) {
  const isAllSelected = selectedCategories.length === 0;

  const handleChipClick = (categoryId: string) => {
    if (categoryId === 'all') {
      // "전체" clicked - reset all filters
      onCategoriesChange([]);
      return;
    }

    // Toggle individual category
    if (selectedCategories.includes(categoryId)) {
      // Remove from selection
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      // Add to selection
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 pb-2">
        {/* "전체" chip */}
        <button
          type="button"
          onClick={() => handleChipClick('all')}
          className={`btn btn-sm flex-shrink-0 rounded-full px-4 transition-all ${
            isAllSelected
              ? 'bg-primary text-primary-content hover:bg-primary-focus'
              : 'bg-base-100 text-base-content hover:bg-base-200 border border-base-300'
          }`}
          aria-pressed={isAllSelected}
        >
          전체
        </button>

        {/* Category chips */}
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleChipClick(category.id)}
              className={`btn btn-sm flex-shrink-0 rounded-full px-4 transition-all ${
                isSelected
                  ? 'bg-primary text-primary-content hover:bg-primary-focus'
                  : 'bg-base-100 text-base-content hover:bg-base-200 border border-base-300'
              }`}
              aria-pressed={isSelected}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
