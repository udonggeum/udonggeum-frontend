import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';
import {
  WishlistResponseSchema,
  WishlistMessageResponseSchema,
  type WishlistResponse,
  type AddToWishlistRequest,
  type WishlistMessageResponse,
} from '@/schemas/wishlist';

/**
 * Wishlist service
 * Handles wishlist-related API calls
 */
class WishlistService {
  /**
   * Get user's wishlist
   * @returns User's wishlist items with product details
   */
  async getWishlist(): Promise<WishlistResponse> {
    const response = await apiClient.get(ENDPOINTS.WISHLIST.GET);

    // Validate response
    return WishlistResponseSchema.parse(response.data);
  }

  /**
   * Add product to wishlist
   * @param productId - Product ID to add
   * @returns Success message
   */
  async addToWishlist(
    productId: number
  ): Promise<WishlistMessageResponse> {
    const payload: AddToWishlistRequest = { product_id: productId };
    const response = await apiClient.post(ENDPOINTS.WISHLIST.ADD, payload);

    // Validate response
    return WishlistMessageResponseSchema.parse(response.data);
  }

  /**
   * Remove product from wishlist
   * @param productId - Product ID to remove
   * @returns Success message
   */
  async removeFromWishlist(
    productId: number
  ): Promise<WishlistMessageResponse> {
    const response = await apiClient.delete(
      ENDPOINTS.WISHLIST.DELETE(productId)
    );

    // Validate response
    return WishlistMessageResponseSchema.parse(response.data);
  }

  /**
   * Toggle product in wishlist (add if not exists, remove if exists)
   * Helper method for UI convenience
   * @param productId - Product ID to toggle
   * @param isInWishlist - Current wishlist status
   * @returns Success message
   */
  async toggleWishlist(
    productId: number,
    isInWishlist: boolean
  ): Promise<WishlistMessageResponse> {
    if (isInWishlist) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }
}

export const wishlistService = new WishlistService();
