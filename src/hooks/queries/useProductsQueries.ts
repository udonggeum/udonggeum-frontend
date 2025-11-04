import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/products';
import type { ProductsRequest } from '@/schemas/products';

/**
 * Products Query Keys Factory
 * Centralized query key management for products-related queries
 */
export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (params?: ProductsRequest) => [...productsKeys.lists(), params] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: number) => [...productsKeys.details(), id] as const,
  popular: (params?: ProductsRequest) => [...productsKeys.all, 'popular', params] as const,
  store: (storeId: number, params?: Omit<ProductsRequest, 'store_id'>) =>
    [...productsKeys.lists(), 'store', storeId, params] as const,
};

/**
 * useProducts query
 * Fetches paginated products list with optional filters
 *
 * @param params - Filter parameters (category, search, page, page_size)
 * @example
 * const { data, isLoading } = useProducts({ category: '과일', page: 1 });
 * // data.products: Product[]
 * // data.count: number
 */
export function useProducts(params?: ProductsRequest) {
  return useQuery({
    queryKey: productsKeys.list(params),
    queryFn: () => productsService.getProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useProductDetail query
 * Fetches single product detail by ID
 *
 * @param id - Product ID
 * @param options - Query options (enabled, etc.)
 * @example
 * const { data: product, isLoading } = useProductDetail(123);
 */
export function useProductDetail(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: productsKeys.detail(id),
    queryFn: () => productsService.getProductDetail(id),
    staleTime: 1000 * 60 * 10, // 10 minutes (product details change less frequently)
    enabled: options?.enabled ?? true,
  });
}

/**
 * usePopularProducts query
 * Fetches popular/featured products with optional filters
 *
 * @param params - Filter parameters (limit, category, etc.)
 * @example
 * const { data, isLoading } = usePopularProducts({ limit: 10 });
 * // data.products: Product[]
 */
export function usePopularProducts(params?: ProductsRequest) {
  return useQuery({
    queryKey: productsKeys.popular(params),
    queryFn: () => productsService.getPopularProducts(params),
    staleTime: 1000 * 60 * 15, // 15 minutes (popular products change infrequently)
  });
}

type StoreProductsParams = Omit<ProductsRequest, 'store_id'>;

/**
 * useStoreProducts query
 * Fetches products for a specific store using the store_id filter.
 */
export function useStoreProducts(
  storeId: number | undefined,
  params?: StoreProductsParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: productsKeys.store(storeId ?? 0, params),
    queryFn: () => {
      if (!storeId) {
        throw new Error('storeId는 필수값입니다.');
      }
      return productsService.getProducts({ ...params, store_id: storeId });
    },
    staleTime: 1000 * 60 * 5,
    enabled: (options?.enabled ?? true) && Boolean(storeId),
  });
}
