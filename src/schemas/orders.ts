import { z } from 'zod';

/**
 * Order item schema
 * Individual item within an order
 */
export const OrderItemSchema = z.object({
  id: z.number().int().positive(),
  product_id: z.number().int().positive(),
  product_option_id: z.number().int().positive().optional(),
  store_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  option_snapshot: z.string(),
  product: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    image_url: z.string().optional(),
  }).optional(),
  store: z.object({
    id: z.number().int().positive(),
    name: z.string(),
  }).optional(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

/**
 * Order schema
 * Complete order information
 */
export const OrderSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  total_amount: z.number().nonnegative(),
  total_price: z.number().nonnegative().optional(),
  status: z.enum(['pending', 'confirmed', 'shipping', 'delivered', 'cancelled']).optional(),
  payment_status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  fulfillment_type: z.enum(['delivery', 'pickup']),
  shipping_address: z.string().optional(),
  pickup_store_id: z.number().int().positive().optional(),
  order_items: z.array(OrderItemSchema),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Order = z.infer<typeof OrderSchema>;

/**
 * Order response schema
 * Response from creating an order
 */
export const OrderResponseSchema = z.object({
  message: z.string(),
  order: OrderSchema,
});

export type OrderResponse = z.infer<typeof OrderResponseSchema>;

/**
 * Orders response schema
 * Response from GET /orders endpoint
 */
export const OrdersResponseSchema = z.object({
  count: z.number().int().nonnegative(),
  orders: z.array(OrderSchema),
});

export type OrdersResponse = z.infer<typeof OrdersResponseSchema>;

/**
 * Order item input schema for creating orders
 * Specifies which products to order
 */
export const OrderItemInputSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  product_option_id: z.number().int().positive().optional(),
});

export type OrderItemInput = z.infer<typeof OrderItemInputSchema>;

/**
 * Create order request schema
 * Complex validation using refine:
 * - Items array is required and must not be empty
 * - If fulfillment_type is 'delivery', shipping_address is required
 * - If fulfillment_type is 'pickup', pickup_store_id is required
 */
export const CreateOrderRequestSchema = z
  .object({
    items: z.array(OrderItemInputSchema).min(1, '주문할 상품이 최소 1개 이상 필요합니다'),
    fulfillment_type: z.enum(['delivery', 'pickup']),
    shipping_address: z.string().min(1).optional(),
    pickup_store_id: z.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      // 배송인 경우 주소 필수
      if (data.fulfillment_type === 'delivery') {
        return !!data.shipping_address;
      }
      // 픽업인 경우 매장 ID 필수
      if (data.fulfillment_type === 'pickup') {
        return !!data.pickup_store_id;
      }
      return true;
    },
    {
      message: '배송 선택 시 주소가, 픽업 선택 시 매장 ID가 필요합니다',
      path: ['fulfillment_type'],
    }
  );

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
