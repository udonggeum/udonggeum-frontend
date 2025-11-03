import { z } from 'zod';
import { ProductSchema, ProductOptionSchema } from './products';

/**
 * Cart item schema
 * Individual item in the shopping cart
 */
export const CartItemSchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().int().positive('수량은 최소 1개 이상이어야 합니다'),
  product: ProductSchema,
  product_option: ProductOptionSchema.optional(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

/**
 * Cart response schema
 * Response from GET /cart endpoint
 */
export const CartResponseSchema = z.object({
  count: z.number().int().nonnegative(),
  total: z.number().nonnegative(),
  cart_items: z.array(CartItemSchema),
});

export type CartResponse = z.infer<typeof CartResponseSchema>;

/**
 * Add to cart request schema
 * Validates input for adding items to cart
 */
export const AddToCartRequestSchema = z.object({
  product_id: z.number().int().positive('상품 ID가 필요합니다'),
  product_option_id: z.number().int().positive().optional(),
  quantity: z.number().int().positive('수량은 최소 1개 이상이어야 합니다'),
});

export type AddToCartRequest = z.infer<typeof AddToCartRequestSchema>;

/**
 * Update cart item request schema
 * Validates input for updating cart item quantity
 */
export const UpdateCartItemRequestSchema = z.object({
  quantity: z.number().int().positive('수량은 최소 1개 이상이어야 합니다'),
  product_option_id: z.number().int().positive().optional(),
});

export type UpdateCartItemRequest = z.infer<
  typeof UpdateCartItemRequestSchema
>;
