/**
 * API Adapters
 * Transform API responses to UI-compatible formats
 * Handles type conversions, field naming, and missing data
 */

import type { Product as APIProduct } from '@/schemas/products';
import type { Product as UIProduct } from '@/types';

/**
 * Category mapping: API enum → UI category IDs
 */
const CATEGORY_MAPPING: Record<string, string> = {
  gold: 'gold',
  silver: 'silver',
  jewelry: 'jewelry',
  // Add more mappings as needed
};

/**
 * Reverse mapping: UI category IDs → API enum
 */
const CATEGORY_REVERSE_MAPPING: Record<string, 'gold' | 'silver' | 'jewelry'> = {
  gold: 'gold',
  silver: 'silver',
  jewelry: 'jewelry',
  rings: 'jewelry',
  necklaces: 'jewelry',
  bracelets: 'jewelry',
  earrings: 'jewelry',
};

/**
 * Generate region ID from store location
 * Converts "서울 강남구" → "seoul-gangnam"
 */
function generateRegionId(region?: string, district?: string): string {
  if (!region && !district) return 'unknown';

  const regionSlug = region?.toLowerCase().replace(/\s+/g, '-') || '';
  const districtSlug = district?.toLowerCase().replace(/\s+/g, '-') || '';

  return districtSlug ? `${regionSlug}-${districtSlug}` : regionSlug;
}

/**
 * Transform API Product to UI Product
 * Handles all field conversions and missing data
 */
export function transformProductFromAPI(apiProduct: APIProduct): UIProduct {
  const regionId = generateRegionId(
    apiProduct.store.region,
    apiProduct.store.district
  );

  return {
    id: String(apiProduct.id), // number → string
    name: apiProduct.name,
    price: apiProduct.price,
    imageUrl: apiProduct.image_url || '', // snake_case → camelCase, with fallback
    imageAlt: `${apiProduct.name} 상품 이미지`, // Generate alt text
    categoryId: CATEGORY_MAPPING[apiProduct.category] || apiProduct.category,
    regionId,
    isWishlisted: false, // Client-side state (default false)
    isInCart: false, // Client-side state (default false)
    storeName: apiProduct.store.name,
  };
}

/**
 * Transform array of API Products to UI Products
 */
export function transformProductsFromAPI(apiProducts: APIProduct[]): UIProduct[] {
  return apiProducts.map(transformProductFromAPI);
}

/**
 * Convert UI category ID to API category enum
 * Used when making API requests with category filter
 */
export function uiCategoryToAPICategory(
  categoryId: string | null
): 'gold' | 'silver' | 'jewelry' | undefined {
  if (!categoryId) return undefined;
  return CATEGORY_REVERSE_MAPPING[categoryId];
}

/**
 * Convert UI region ID to API region/district params
 * "seoul-gangnam" → { region: "서울", district: "강남구" }
 *
 * Note: This is a temporary solution. Ideally, the UI should store
 * the actual region/district names, not slugified IDs.
 */
export function uiRegionToAPIParams(regionId: string | null): {
  region?: string;
  district?: string;
} {
  if (!regionId) return {};

  // This is a simplified version - you may need a proper lookup table
  // or fetch regions from API first
  const parts = regionId.split('-');

  if (parts.length === 2) {
    // For now, return empty - proper implementation needs region mapping
    // TODO: Create region lookup table or fetch from API
    return {};
  }

  return {};
}
