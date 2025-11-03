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
export function useCart() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated, // Only fetch when authenticated
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
 * Updates cart item quantity
 *
 * @example
 * const { mutate: updateCartItem, isPending } = useUpdateCartItem();
 * updateCartItem({ id: 456, quantity: 3 });
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCartItemRequest }) =>
      cartService.updateCartItem(id, payload),
    onSuccess: () => {
      // Invalidate and refetch cart
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
