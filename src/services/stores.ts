import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';

/**
 * Store detail type (minimal)
 * TODO: Create Zod schema for stores
 */
interface StoreDetail {
  id: number;
  name: string;
  region?: string;
  district?: string;
  address?: string;
  phone?: string;
  business_hours?: string;
  products?: unknown[];
}

/**
 * Stores response type
 */
interface StoresResponse {
  count: number;
  stores: StoreDetail[];
}

/**
 * Locations response type
 */
interface LocationsResponse {
  regions: Array<{
    region: string;
    districts: string[];
  }>;
}

/**
 * Stores request params
 */
interface StoresRequest {
  region?: string;
  district?: string;
  page?: number;
  page_size?: number;
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
   * @returns Available regions and districts
   */
  async getStoreLocations(): Promise<LocationsResponse> {
    const response = await apiClient.get<LocationsResponse>(
      ENDPOINTS.STORES.LOCATIONS
    );
    return response.data;
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
    const response = await apiClient.get<StoreDetail>(
      ENDPOINTS.STORES.DETAIL(id),
      { params: { include_products: includeProducts } }
    );
    return response.data;
  }
}

export const storesService = new StoresService();
