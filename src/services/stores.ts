import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';

export interface StoreCategoryCounter {
  category?: string;
  name?: string;
  key?: string;
  code?: string;
  count?: number;
  total?: number;
}

export type StoreCategoryCounts =
  | Record<string, number>
  | StoreCategoryCounter[];

/**
 * Store detail type (minimal)
 * TODO: Replace with Zod schemas for strict validation when backend stabilizes.
 */
export interface StoreDetail {
  id: number;
  user_id?: number; // Owner user ID
  name: string;
  region?: string;
  district?: string;
  address?: string;
  phone?: string;
  phone_number?: string;
  open_time?: string;
  close_time?: string;
  business_hours?: string; // Deprecated: use open_time and close_time
  description?: string;
  product_count?: number;
  total_products?: number;
  image_url?: string;
  logo_url?: string;
  thumbnail_url?: string;
  tags?: string[]; // 매장 태그 (예: ["금 매입", "친절한 상담"])
  buying_gold?: boolean; // Deprecated: use tags
  buying_platinum?: boolean; // Deprecated: use tags
  buying_silver?: boolean; // Deprecated: use tags
  category_counts?: StoreCategoryCounts;
  products?: unknown[];
}

/**
 * Stores response type
 */
export interface StoresResponse {
  count: number;
  stores: StoreDetail[];
  category_store_counts?: Record<string, number>;
  category_counts?: Record<string, number>;
}

/**
 * Locations response type (actual backend format)
 */
interface LocationsResponse {
  count: number;
  locations: Array<{
    region: string;
    district: string;
    store_count: number;
  }>;
}

/**
 * Transformed locations type (for UI consumption)
 */
export interface RegionsData {
  regions: Array<{
    region: string;
    districts: string[];
  }>;
}

/**
 * Stores request params
 */
export interface StoresRequest {
  region?: string;
  district?: string;
  category?: string;
  page?: number;
  page_size?: number;
}

/**
 * Update store request type
 */
export interface UpdateStoreRequest {
  name: string;
  region: string;
  district: string;
  description?: string;
  address?: string;
  phone?: string;
  phone_number?: string;
  tags?: string[];
  image_url?: string;
}

/**
 * Stores service
 * Handles store location-related API calls
 */
class StoresService {
  /**
   * Get stores list
   * @param params - Filter and pagination parameters
   * @returns List of stores
   */
  async getStores(params?: StoresRequest): Promise<StoresResponse> {
    const response = await apiClient.get<StoresResponse>(
      ENDPOINTS.STORES.LIST,
      { params }
    );
    return response.data;
  }

  /**
   * Get store locations (regions and districts)
   * @returns Available regions and districts grouped by region
   */
  async getStoreLocations(): Promise<RegionsData> {
    const response = await apiClient.get<LocationsResponse>(
      ENDPOINTS.STORES.LOCATIONS
    );

    // Transform backend format to UI format
    // Group locations by region
    const regionsMap = new Map<string, Set<string>>();

    response.data.locations.forEach((location) => {
      if (!regionsMap.has(location.region)) {
        regionsMap.set(location.region, new Set());
      }
      regionsMap.get(location.region)!.add(location.district);
    });

    // Convert to array format
    const regions = Array.from(regionsMap.entries()).map(([region, districts]) => ({
      region,
      districts: Array.from(districts).sort(),
    }));

    return { regions };
  }

  /**
   * Get store detail
   * @param id - Store ID
   * @param includeProducts - Whether to include products
   * @returns Store detail
   */
  async getStoreDetail(
    id: number,
    includeProducts?: boolean
  ): Promise<StoreDetail> {
    const response = await apiClient.get<{ store: StoreDetail }>(
      ENDPOINTS.STORES.DETAIL(id),
      { params: { include_products: includeProducts } }
    );
    return response.data.store;
  }

  /**
   * Update store information
   * @param id - Store ID
   * @param data - Store data to update
   * @returns Updated store detail
   */
  async updateStore(
    id: number,
    data: UpdateStoreRequest
  ): Promise<StoreDetail> {
    const response = await apiClient.put<{ store: StoreDetail }>(
      ENDPOINTS.STORES.DETAIL(id),
      data
    );
    return response.data.store;
  }
}

export const storesService = new StoresService();
