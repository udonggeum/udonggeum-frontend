import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart';
import { useAuthStore } from '@/stores/useAuthStore';
import type { AddToCartRequest, UpdateCartItemRequest } from '@/schemas/cart';

/**
 * Cart Query Keys Factory
 * Centralized query key management for cart-related queries
 */
export const cartKeys = {
  all: ['cart'] as const,
  detail: () => [...cartKeys.all, 'detail'] as const,
};

/**
 * useCart query
 * Fetches user's shopping cart
 * Only enabled when user is authenticated
 *
 * @example
 * const { data: cart, isLoading } = useCart();
 * // cart.items: CartItem[]
 * // cart.total_price: number
 */
export function useCart(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: () => cartService.getCart(),
    enabled: options?.enabled !== undefined ? options.enabled : isAuthenticated, // Allow override
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * useAddToCart mutation
 * Adds item to shopping cart
 *
 * @example
 * const { mutate: addToCart, isPending } = useAddToCart();
 * addToCart({ product_id: 123, quantity: 2 });
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartService.addToCart(data),
    onSuccess: () => {
      // Invalidate and refetch cart
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}

/**
 * useUpdateCartItem mutation
 * Updates cart item quantity with Optimistic Update
 *
 * @example
 * const { mutate: updateCartItem, isPending } = useUpdateCartItem();
 * updateCartItem({ id: 456, payload: { quantity: 3 } });
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCartItemRequest }) =>
      cartService.updateCartItem(id, payload),
    // Optimistic Update: 즉시 UI 업데이트
    onMutate: async ({ id, payload }) => {
      // 진행 중인 refetch 취소 (충돌 방지)
      await queryClient.cancelQueries({ queryKey: cartKeys.detail() });

      // 이전 데이터 백업 (롤백용)
      const previousCart = queryClient.getQueryData(cartKeys.detail());

      // 즉시 캐시 업데이트
      queryClient.setQueryData(cartKeys.detail(), (old: any) => {
        if (!old) return old;

        return {
          ...old,
          cart_items: old.cart_items.map((item: any) =>
            item.id === id
              ? {
                  ...item,
                  quantity: payload.quantity ?? item.quantity,
                  product_option_id: payload.product_option_id !== undefined
                    ? payload.product_option_id
                    : item.product_option_id,
                }
              : item
          ),
        };
      });

      // 롤백을 위해 이전 데이터 반환
      return { previousCart };
    },
    // 에러 시 롤백
    onError: (_error, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.detail(), context.previousCart);
      }
    },
    // 성공 시 최신 데이터로 동기화
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}

/**
 * useRemoveCartItem mutation
 * Removes item from shopping cart
 *
 * @example
 * const { mutate: removeCartItem, isPending } = useRemoveCartItem();
 * removeCartItem(456);
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cartService.removeCartItem(id),
    onSuccess: () => {
      // Invalidate and refetch cart
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}

/**
 * useClearCart mutation
 * Removes all items from shopping cart
 *
 * @example
 * const { mutate: clearCart, isPending } = useClearCart();
 * clearCart();
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      // Invalidate and refetch cart
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}
