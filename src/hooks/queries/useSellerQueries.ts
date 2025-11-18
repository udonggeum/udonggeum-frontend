import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sellerService } from '@/services/seller';
import { useAuthStore } from '@/stores/useAuthStore';
import type {
  CreateStoreRequest,
  UpdateStoreRequest,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateOrderStatusRequest,
} from '@/schemas/seller';

/**
 * Seller Query Keys Factory
 * Centralized query key management for seller-related queries
 */
export const sellerKeys = {
  all: ['seller'] as const,
  dashboard: () => [...sellerKeys.all, 'dashboard'] as const,
  stores: () => [...sellerKeys.all, 'stores'] as const,
  products: (storeId?: number) =>
    storeId
      ? [...sellerKeys.all, 'products', storeId] as const
      : [...sellerKeys.all, 'products'] as const,
  orders: () => [...sellerKeys.all, 'orders'] as const,
};

/**
 * useDashboardStats query
 * Fetches seller dashboard statistics
 * Only enabled when user is authenticated as seller
 *
 * @example
 * const { data, isLoading } = useDashboardStats();
 * // data: DashboardStats
 */
export function useDashboardStats() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: sellerKeys.dashboard(),
    queryFn: () => sellerService.getDashboardStats(),
    enabled: isAdmin, // Only fetch when authenticated as admin
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useSellerStores query
 * Fetches seller's stores
 * Only enabled when user is authenticated as admin
 *
 * @example
 * const { data: stores, isLoading } = useSellerStores();
 */
export function useSellerStores() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: sellerKeys.stores(),
    queryFn: () => sellerService.getStores(),
    enabled: isAdmin,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useCreateStore mutation
 * Creates new store
 *
 * @example
 * const { mutate: createStore, isPending } = useCreateStore();
 * createStore({ name: '우리 가게', description: '..', address: '..', phone: '010-1234-5678', business_hours: '09:00-18:00' });
 */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoreRequest) => sellerService.createStore(data),
    onSuccess: () => {
      // Invalidate stores list and dashboard stats
      void queryClient.invalidateQueries({ queryKey: sellerKeys.stores() });
      void queryClient.invalidateQueries({ queryKey: sellerKeys.dashboard() });
    },
  });
}

/**
 * useUpdateStore mutation
 * Updates existing store
 *
 * @example
 * const { mutate: updateStore, isPending } = useUpdateStore();
 * updateStore({ id: 123, data: { name: '새 이름' } });
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStoreRequest }) =>
      sellerService.updateStore(id, data),
    onSuccess: () => {
      // Invalidate stores list
      void queryClient.invalidateQueries({ queryKey: sellerKeys.stores() });
    },
  });
}

/**
 * useDeleteStore mutation
 * Deletes store
 *
 * @example
 * const { mutate: deleteStore, isPending } = useDeleteStore();
 * deleteStore(123);
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sellerService.deleteStore(id),
    onSuccess: () => {
      // Invalidate stores list and dashboard stats
      void queryClient.invalidateQueries({ queryKey: sellerKeys.stores() });
      void queryClient.invalidateQueries({ queryKey: sellerKeys.dashboard() });
    },
  });
}

/**
 * useStoreProducts query
 * Fetches products for a specific store
 * Only enabled when storeId is provided and user is admin
 *
 * @example
 * const { data: products, isLoading } = useStoreProducts(storeId);
 */
export function useStoreProducts(storeId?: number) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: sellerKeys.products(storeId),
    queryFn: () => sellerService.getStoreProducts(storeId!),
    enabled: isAdmin && !!storeId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useCreateProduct mutation
 * Creates new product
 *
 * @example
 * const { mutate: createProduct, isPending } = useCreateProduct();
 * createProduct({ store_id: 1, name: '금반지', description: '..', price: 500000, category: '반지' });
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) =>
      sellerService.createProduct(data),
    onSuccess: (product) => {
      // Invalidate products list for this store and dashboard stats
      void queryClient.invalidateQueries({
        queryKey: sellerKeys.products(product.store_id),
      });
      void queryClient.invalidateQueries({ queryKey: sellerKeys.dashboard() });
    },
  });
}

/**
 * useUpdateProduct mutation
 * Updates existing product
 *
 * @example
 * const { mutate: updateProduct, isPending } = useUpdateProduct();
 * updateProduct({ id: 123, data: { price: 600000 } });
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) =>
      sellerService.updateProduct(id, data),
    onSuccess: (product) => {
      // Invalidate products list for this store
      void queryClient.invalidateQueries({
        queryKey: sellerKeys.products(product.store_id),
      });
      // Also invalidate all products queries
      void queryClient.invalidateQueries({ queryKey: sellerKeys.products() });
    },
  });
}

/**
 * useDeleteProduct mutation
 * Deletes product
 *
 * @example
 * const { mutate: deleteProduct, isPending } = useDeleteProduct();
 * deleteProduct(123);
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sellerService.deleteProduct(id),
    onSuccess: () => {
      // Invalidate all products queries and dashboard stats
      void queryClient.invalidateQueries({ queryKey: sellerKeys.products() });
      void queryClient.invalidateQueries({ queryKey: sellerKeys.dashboard() });
    },
  });
}

/**
 * useSellerOrders query
 * Fetches seller's orders
 * Only enabled when user is authenticated as admin
 *
 * @example
 * const { data: orders, isLoading } = useSellerOrders();
 */
export function useSellerOrders() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: sellerKeys.orders(),
    queryFn: () => sellerService.getOrders(),
    enabled: isAdmin,
    staleTime: 1000 * 60, // 1 minute (orders change frequently)
  });
}

/**
 * useUpdateOrderStatus mutation
 * Updates order status
 *
 * @example
 * const { mutate: updateOrderStatus, isPending } = useUpdateOrderStatus();
 * updateOrderStatus({ id: 123, data: { status: 'confirmed' } });
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateOrderStatusRequest;
    }) => sellerService.updateOrderStatus(id, data),
    onSuccess: () => {
      // Invalidate orders list and dashboard stats
      void queryClient.invalidateQueries({ queryKey: sellerKeys.orders() });
      void queryClient.invalidateQueries({ queryKey: sellerKeys.dashboard() });
    },
  });
}
