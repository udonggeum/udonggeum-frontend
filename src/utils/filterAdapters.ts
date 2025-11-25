import type { ProductFiltersResponse } from '@/schemas/products';
import type { ProductCategory } from '@/types';

/**
 * Category translation map (backend value -> Korean label)
 */
const CATEGORY_LABELS: Record<string, string> = {
  ring: '반지',
  bracelet: '팔찌',
  necklace: '목걸이',
  earring: '귀걸이',
  other: '기타',
};

/**
 * Material translation map (backend value -> Korean label)
 */
const MATERIAL_LABELS: Record<string, string> = {
  gold: '골드',
  silver: '실버',
  other: '기타',
};

/**
 * Category display order map
 */
const CATEGORY_ORDER: Record<string, number> = {
  ring: 1,
  necklace: 2,
  bracelet: 3,
  earring: 4,
  other: 5,
};

/**
 * Material display order map
 */
const MATERIAL_ORDER: Record<string, number> = {
  gold: 1,
  silver: 2,
  other: 3,
};

/**
 * Convert backend filter response to ProductCategory format
 * @param filters - Backend product filters response
 * @returns Array of ProductCategory with Korean labels
 */
export function adaptFiltersToCategories(
  filters: ProductFiltersResponse
): ProductCategory[] {
  return filters.categories
    .map((categoryId) => ({
      id: categoryId,
      name: CATEGORY_LABELS[categoryId] || categoryId,
      displayOrder: CATEGORY_ORDER[categoryId] || 99,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Convert backend materials to formatted material options
 * @param filters - Backend product filters response
 * @returns Array of material options with Korean labels
 */
export function adaptFiltersToMaterials(
  filters: ProductFiltersResponse
): Array<{ id: string; name: string; displayOrder: number }> {
  return filters.materials
    .map((materialId) => ({
      id: materialId,
      name: MATERIAL_LABELS[materialId] || materialId,
      displayOrder: MATERIAL_ORDER[materialId] || 99,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Get category label by ID
 * @param categoryId - Category ID from backend
 * @returns Korean label for the category
 */
export function getCategoryLabel(categoryId: string): string {
  return CATEGORY_LABELS[categoryId] || categoryId;
}

/**
 * Get material label by ID
 * @param materialId - Material ID from backend
 * @returns Korean label for the material
 */
export function getMaterialLabel(materialId: string): string {
  return MATERIAL_LABELS[materialId] || materialId;
}
