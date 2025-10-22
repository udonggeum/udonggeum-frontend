import { useQuery } from '@tanstack/react-query';
import { storesService } from '@/services/stores';

/**
 * Stores request params (copied from stores service)
 * TODO: Move to a shared types file or create Zod schema
 */
interface StoresRequest {
  region?: string;
  district?: string;
  page?: number;
  page_size?: number;
}

/**
 * Stores Query Keys Factory
 * Centralized query key management for stores-related queries
 */
export const storesKeys = {
  all: ['stores'] as const,
  lists: () => [...storesKeys.all, 'list'] as const,
  list: (params?: StoresRequest) => [...storesKeys.lists(), params] as const,
  locations: () => [...storesKeys.all, 'locations'] as const,
  details: () => [...storesKeys.all, 'detail'] as const,
  detail: (id: number, includeProducts?: boolean) =>
    [...storesKeys.details(), id, { includeProducts }] as const,
};

/**
 * useStores query
 * Fetches stores list with optional region/district filters
 *
 * @param params - Filter parameters (region, district, page, page_size)
 * @example
 * const { data, isLoading } = useStores({ region: '서울', district: '강남구' });
 * // data.count: number
 * // data.stores: StoreDetail[]
 */
export function useStores(params?: StoresRequest) {
  return useQuery({
    queryKey: storesKeys.list(params),
    queryFn: () => storesService.getStores(params),
    staleTime: 1000 * 60 * 10, // 10 minutes (stores don't change frequently)
  });
}

/**
 * useStoreLocations query
 * Fetches available regions and districts for filtering
 *
 * @example
 * const { data, isLoading } = useStoreLocations();
 * // data.regions: Array<{ region: string, districts: string[] }>
 */
export function useStoreLocations() {
  return useQuery({
    queryKey: storesKeys.locations(),
    queryFn: () => storesService.getStoreLocations(),
    staleTime: 1000 * 60 * 60, // 1 hour (locations rarely change)
  });
}

/**
 * useStoreDetail query
 * Fetches single store detail by ID
 *
 * @param id - Store ID
 * @param includeProducts - Whether to include products in response
 * @param options - Query options (enabled, etc.)
 * @example
 * const { data: store, isLoading } = useStoreDetail(123, true);
 */
export function useStoreDetail(
  id: number,
  includeProducts?: boolean,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: storesKeys.detail(id, includeProducts),
    queryFn: () => storesService.getStoreDetail(id, includeProducts),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: options?.enabled ?? true,
  });
}
