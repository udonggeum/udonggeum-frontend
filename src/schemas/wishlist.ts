import { z } from 'zod';
import { ProductSchema } from './products';

/**
 * Wishlist item schema
 * Individual item in user's wishlist
 */
export const WishlistItemSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  product_id: z.number().int().positive(),
  created_at: z.string().datetime(),
  product: ProductSchema.optional(), // Preloaded product data
});

export type WishlistItem = z.infer<typeof WishlistItemSchema>;

/**
 * Wishlist response schema
 * Response from GET /wishlist endpoint
 */
export const WishlistResponseSchema = z.object({
  wishlist_items: z.array(WishlistItemSchema),
  count: z.number().int().nonnegative(),
});

export type WishlistResponse = z.infer<typeof WishlistResponseSchema>;

/**
 * Add to wishlist request schema
 */
export const AddToWishlistRequestSchema = z.object({
  product_id: z.number().int().positive(),
});

export type AddToWishlistRequest = z.infer<typeof AddToWishlistRequestSchema>;

/**
 * Generic success message response
 */
export const WishlistMessageResponseSchema = z.object({
  message: z.string(),
});

export type WishlistMessageResponse = z.infer<
  typeof WishlistMessageResponseSchema
>;
