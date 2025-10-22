import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders';
import { useAuthStore } from '@/stores/useAuthStore';
import { cartKeys } from './useCartQueries';
import type { CreateOrderRequest } from '@/schemas/orders';

/**
 * Orders Query Keys Factory
 * Centralized query key management for orders-related queries
 */
export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: () => [...ordersKeys.lists()] as const,
  details: () => [...ordersKeys.all, 'detail'] as const,
  detail: (id: number) => [...ordersKeys.details(), id] as const,
};

/**
 * useOrders query
 * Fetches user's orders list
 * Only enabled when user is authenticated
 *
 * @example
 * const { data, isLoading } = useOrders();
 * // data.count: number
 * // data.orders: Order[]
 */
export function useOrders() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ordersKeys.list(),
    queryFn: () => ordersService.getOrders(),
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useOrderDetail query
 * Fetches single order detail by ID
 *
 * @param id - Order ID
 * @param options - Query options (enabled, etc.)
 * @example
 * const { data: order, isLoading } = useOrderDetail(123);
 */
export function useOrderDetail(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: () => ordersService.getOrderDetail(id),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: options?.enabled ?? true,
  });
}

/**
 * useCreateOrder mutation
 * Creates new order from cart items
 * Invalidates both orders and cart queries on success
 *
 * @example
 * const { mutate: createOrder, isPending } = useCreateOrder();
 * createOrder({
 *   fulfillment_type: 'delivery',
 *   shipping_address: '서울시 강남구 테헤란로 123'
 * });
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersService.createOrder(data),
    onSuccess: () => {
      // Invalidate orders list to show new order
      void queryClient.invalidateQueries({ queryKey: ordersKeys.list() });

      // Invalidate cart (creating order typically clears cart)
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}
