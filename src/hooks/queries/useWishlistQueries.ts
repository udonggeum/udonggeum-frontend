import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/wishlist';
import type { WishlistResponse } from '@/schemas/wishlist';

/**
 * Query keys factory for wishlist
 * Centralized query key management
 */
export const wishlistKeys = {
  all: ['wishlist'] as const,
  lists: () => [...wishlistKeys.all, 'list'] as const,
  list: () => [...wishlistKeys.lists()] as const,
};

/**
 * Hook to get user's wishlist
 * @param enabled - Whether to enable the query (default: true)
 */
export function useWishlist(enabled = true) {
  return useQuery<WishlistResponse>({
    queryKey: wishlistKeys.list(),
    queryFn: () => wishlistService.getWishlist(),
    enabled,
  });
}

/**
 * Hook to add product to wishlist
 */
export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      wishlistService.addToWishlist(productId),
    onSuccess: () => {
      // Invalidate wishlist query to refetch
      void queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}

/**
 * Hook to remove product from wishlist
 */
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      wishlistService.removeFromWishlist(productId),
    onSuccess: () => {
      // Invalidate wishlist query to refetch
      void queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}

/**
 * Hook to toggle product in wishlist
 * Optimistic update for better UX
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      isInWishlist,
    }: {
      productId: number;
      isInWishlist: boolean;
    }) => wishlistService.toggleWishlist(productId, isInWishlist),
    // Optimistic update
    onMutate: async ({ productId, isInWishlist }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: wishlistKeys.list() });

      // Snapshot previous value
      const previousWishlist =
        queryClient.getQueryData<WishlistResponse>(wishlistKeys.list());

      // Optimistically update
      if (previousWishlist) {
        const newWishlistItems = isInWishlist
          ? // Remove from wishlist
            previousWishlist.wishlist_items.filter(
              (item) => item.product_id !== productId
            )
          : // Add to wishlist (we don't have full item data, so we'll refetch)
            previousWishlist.wishlist_items;

        queryClient.setQueryData<WishlistResponse>(wishlistKeys.list(), {
          ...previousWishlist,
          wishlist_items: newWishlistItems,
          count: newWishlistItems.length,
        });
      }

      return { previousWishlist };
    },
    // Revert on error
    onError: (_error, _variables, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(
          wishlistKeys.list(),
          context.previousWishlist
        );
      }
    },
    // Always refetch after success or error
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}

/**
 * Helper hook to check if a product is in wishlist
 * @param productId - Product ID to check
 */
export function useIsInWishlist(productId: number): boolean {
  const { data: wishlist } = useWishlist();

  if (!wishlist) return false;

  return wishlist.wishlist_items.some(
    (item) => item.product_id === productId
  );
}
