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
  반지: 'rings',
  목걸이: 'necklaces',
  팔찌: 'bracelets',
  귀걸이: 'earrings',
  기타: 'anklets',
  ring: 'rings',
  necklace: 'necklaces',
  bracelet: 'bracelets',
  earring: 'earrings',
  others: 'anklets',
  other: 'anklets',
  anklet: 'anklets',
};

/**
 * Reverse mapping: UI category IDs → API enum
 */
const CATEGORY_REVERSE_MAPPING: Record<string, '반지' | '목걸이' | '팔찌' | '귀걸이' | '기타'> = {
  rings: '반지',
  necklaces: '목걸이',
  bracelets: '팔찌',
  earrings: '귀걸이',
  anklets: '기타',
  others: '기타',
};

/**
 * Convert API category identifier to UI category ID
 * Handles Korean labels, English keywords, and lowercase variants.
 */
export function apiCategoryToUICategory(
  category: string | null | undefined
): string | undefined {
  if (!category) return undefined;

  const raw = category.toString().trim();
  if (!raw) return undefined;

  const directMatch = CATEGORY_MAPPING[raw];
  if (directMatch) {
    return directMatch;
  }

  const normalized = raw.toLowerCase();
  return CATEGORY_MAPPING[normalized];
}

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
    apiProduct.store?.region,
    apiProduct.store?.district
  );

  const categoryRaw = apiProduct.category?.toString().trim();
  const categoryKey = categoryRaw?.toLowerCase();

  const storeLocation = [
    apiProduct.store?.region,
    apiProduct.store?.district,
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ');

  return {
    id: String(apiProduct.id), // number → string
    name: apiProduct.name,
    price: apiProduct.price,
    imageUrl: apiProduct.image_url || '', // snake_case → camelCase, with fallback
    imageAlt: `${apiProduct.name} 상품 이미지`, // Generate alt text
    categoryId:
      (categoryRaw && CATEGORY_MAPPING[categoryRaw]) ||
      (categoryKey && CATEGORY_MAPPING[categoryKey]) ||
      'others',
    regionId,
    isWishlisted: false, // Client-side state (default false)
    isInCart: false, // Client-side state (default false)
    storeName: apiProduct.store?.name,
    storeLocation: storeLocation || undefined,
    options: apiProduct.options
      ?.map((option) => {
        const baseLabel =
          option.name && option.value
            ? `${option.name}: ${option.value}`
            : option.value || option.name || '';

        if (!baseLabel) return null;

        if (option.additional_price && option.additional_price > 0) {
          const formattedPrice = option.additional_price.toLocaleString('ko-KR');
          return `${baseLabel} (+₩${formattedPrice})`;
        }
        return baseLabel;
      })
      .filter((value): value is string => Boolean(value)),
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
): '반지' | '목걸이' | '팔찌' | '귀걸이' | '기타' | undefined {
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
