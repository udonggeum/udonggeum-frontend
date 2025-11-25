import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';
import { ValidationError } from '@/utils/errors';
import { ZodError } from 'zod';
import {
  OrderSchema,
  OrderResponseSchema,
  OrdersResponseSchema,
  CreateOrderRequestSchema,
  type Order,
  type OrderResponse,
  type OrdersResponse,
  type CreateOrderRequest,
} from '@/schemas/orders';

/**
 * Orders service
 * Handles order-related API calls
 */
class OrdersService {
  /**
   * Create new order
   * @param data - Order details (fulfillment type, address/store)
   * @returns Created order
   */
  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    try {
      // Validate input with complex refine logic
      // (delivery requires shipping_address, pickup requires pickup_store_id)
      const validatedInput = CreateOrderRequestSchema.parse(data);

      // API call
      const response = await apiClient.post(
        ENDPOINTS.ORDERS.CREATE,
        validatedInput
      );

      // Validate response
      return OrderResponseSchema.parse(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Get user's orders
   * @returns List of orders
   */
  async getOrders(): Promise<OrdersResponse> {
    const response = await apiClient.get(ENDPOINTS.ORDERS.LIST);

    // Validate response
    return OrdersResponseSchema.parse(response.data);
  }

  /**
   * Get order detail
   * @param id - Order ID
   * @returns Order detail
   */
  async getOrderDetail(id: number): Promise<Order> {
    const response = await apiClient.get(ENDPOINTS.ORDERS.DETAIL(id));

    // Backend returns { order: {...} }, extract and validate the nested order
    return OrderSchema.parse(response.data.order);
  }
}

export const ordersService = new OrdersService();
