import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';
import { ValidationError } from '@/utils/errors';
import { ZodError } from 'zod';
import {
  CartResponseSchema,
  AddToCartRequestSchema,
  AddToCartResponseSchema,
  UpdateCartItemRequestSchema,
  type CartResponse,
  type AddToCartRequest,
  type AddToCartResponse,
  type UpdateCartItemRequest,
} from '@/schemas/cart';

/**
 * Cart service
 * Handles shopping cart-related API calls
 */
class CartService {
  /**
   * Get cart
   * @returns Cart with items
   */
  async getCart(): Promise<CartResponse> {
    const response = await apiClient.get(ENDPOINTS.CART.GET);

    // Validate response
    return CartResponseSchema.parse(response.data);
  }

  /**
   * Add item to cart
   * @param data - Product and quantity to add
   * @returns Added cart item information
   */
  async addToCart(data: AddToCartRequest): Promise<AddToCartResponse> {
    try {
      // Validate input
      const validatedInput = AddToCartRequestSchema.parse(data);

      // API call
      const response = await apiClient.post(ENDPOINTS.CART.ADD, validatedInput);

      // Validate and return response
      return AddToCartResponseSchema.parse(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Update cart item quantity
   * @param id - Cart item ID
   * @param data - New quantity
   */
  async updateCartItem(
    id: number,
    data: UpdateCartItemRequest
  ): Promise<void> {
    try {
      // Validate input
      const validatedInput = UpdateCartItemRequestSchema.parse(data);

      // API call
      await apiClient.put(ENDPOINTS.CART.UPDATE(id), validatedInput);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @param id - Cart item ID
   */
  async removeCartItem(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.CART.DELETE(id));
  }

  /**
   * Clear cart (remove all items)
   */
  async clearCart(): Promise<void> {
    await apiClient.delete(ENDPOINTS.CART.CLEAR);
  }
}

export const cartService = new CartService();
