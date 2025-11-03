import { apiCategoryToUICategory } from '@/utils/apiAdapters';
import type { StoreDetail, StoreCategoryCounts } from '@/services/stores';
import type { StoreCategoryCount, StoreSummary } from '@/types';

export type StoreCategorySource = Array<{ id: string; name: string }>;

export function buildCategoryLabelMap(categories: StoreCategorySource) {
  return new Map(categories.map((category) => [category.id, category.name]));
}

export function extractStoreCategoryCounts(
  rawCounts: StoreCategoryCounts | undefined,
  labelMap: Map<string, string>
): StoreCategoryCount[] | undefined {
  if (!rawCounts) {
    return undefined;
  }

  const entries: Array<[string, number]> = [];

  if (Array.isArray(rawCounts)) {
    rawCounts.forEach((item) => {
      if (!item || typeof item !== 'object') {
        return;
      }

      const key =
        (typeof item.category === 'string' && item.category) ||
        (typeof item.name === 'string' && item.name) ||
        (typeof item.key === 'string' && item.key) ||
        (typeof item.code === 'string' && item.code);

      const value =
        typeof item.count === 'number'
          ? item.count
          : typeof item.total === 'number'
            ? item.total
            : undefined;

      if (key && typeof value === 'number') {
        entries.push([key, value]);
      }
    });
  } else if (typeof rawCounts === 'object') {
    Object.entries(rawCounts).forEach(([key, value]) => {
      if (typeof value === 'number') {
        entries.push([key, value]);
      }
    });
  }

  const normalized = entries
    .map(([key, value]) => {
      const uiId = apiCategoryToUICategory(key);
      if (!uiId || value <= 0) {
        return null;
      }
      const name = labelMap.get(uiId) ?? key;
      return { id: uiId, name, count: value };
    })
    .filter((entry): entry is StoreCategoryCount => Boolean(entry))
    .sort((a, b) => b.count - a.count);

  return normalized.length > 0 ? normalized : undefined;
}

export function deriveStoreProductCount(
  store: StoreDetail,
  categoryCounts?: StoreCategoryCount[]
): number | undefined {
  if (typeof store.product_count === 'number') {
    return store.product_count;
  }

  if (Array.isArray(store.products)) {
    return store.products.length;
  }

  if (categoryCounts?.length) {
    return categoryCounts.reduce((sum, item) => sum + item.count, 0);
  }

  return undefined;
}

export function mapStoreDetailToSummary(
  store: StoreDetail,
  labelMap: Map<string, string>
): StoreSummary {
  const categoryCounts = extractStoreCategoryCounts(store.category_counts, labelMap);
  const productCount = deriveStoreProductCount(store, categoryCounts);

  return {
    id: store.id,
    name: store.name,
    region: store.region,
    district: store.district,
    address: store.address,
    phone: store.phone ?? store.phone_number,
    businessHours: store.business_hours,
    productCount,
    imageUrl: store.image_url ?? store.logo_url ?? store.thumbnail_url,
    categoryCounts,
  };
}
