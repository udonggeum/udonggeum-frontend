import { z } from 'zod';

/**
 * Dashboard statistics schema
 * Validates seller dashboard stats from API
 */
export const DashboardStatsSchema = z.object({
  total_orders: z.number().int().nonnegative(),
  pending_orders: z.number().int().nonnegative(),
  total_revenue: z.number().nonnegative(),
  total_products: z.number().int().nonnegative(),
  average_rating: z.number().min(0).max(5).optional(),
  total_stores: z.number().int().nonnegative().optional(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

/**
 * Create store request schema
 * Validates user input for creating new store
 */
export const CreateStoreRequestSchema = z.object({
  name: z.string().min(1, '가게 이름을 입력하세요'),
  description: z.string().min(1, '가게 설명을 입력하세요'),
  address: z.string().min(1, '주소를 입력하세요'),
  phone: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다'),
  business_hours: z.string().min(1, '영업 시간을 입력하세요'),
});

export type CreateStoreRequest = z.infer<typeof CreateStoreRequestSchema>;

/**
 * Update store request schema
 * Validates user input for updating existing store
 * All fields are optional
 */
export const UpdateStoreRequestSchema = z.object({
  name: z.string().min(1, '가게 이름을 입력하세요').optional(),
  description: z.string().min(1, '가게 설명을 입력하세요').optional(),
  address: z.string().min(1, '주소를 입력하세요').optional(),
  phone: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다')
    .optional(),
  business_hours: z.string().min(1, '영업 시간을 입력하세요').optional(),
});

export type UpdateStoreRequest = z.infer<typeof UpdateStoreRequestSchema>;

/**
 * Create product request schema
 * Validates user input for creating new product
 */
export const CreateProductRequestSchema = z.object({
  store_id: z.number().int().positive('가게를 선택하세요'),
  name: z.string().min(1, '상품명을 입력하세요'),
  description: z.string().min(1, '상품 설명을 입력하세요'),
  price: z.number().positive('가격은 0보다 커야 합니다'),
  category: z.string().min(1, '카테고리를 선택하세요'),
  image_url: z.string().url('올바른 URL 형식이 아닙니다').optional(),
});

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

/**
 * Update product request schema
 * Validates user input for updating existing product
 * All fields are optional
 */
export const UpdateProductRequestSchema = z.object({
  name: z.string().min(1, '상품명을 입력하세요').optional(),
  description: z.string().min(1, '상품 설명을 입력하세요').optional(),
  price: z.number().positive('가격은 0보다 커야 합니다').optional(),
  category: z.string().min(1, '카테고리를 선택하세요').optional(),
  image_url: z.string().url('올바른 URL 형식이 아닙니다').optional(),
});

export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;

/**
 * Update order status request schema
 * Validates order status update
 */
export const UpdateOrderStatusRequestSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: '올바른 주문 상태를 선택하세요' }),
  }),
});

export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusRequestSchema>;

/**
 * Generic message response schema
 * Reusable for success/error messages
 */
export const SellerMessageResponseSchema = z.object({
  message: z.string(),
});

export type SellerMessageResponse = z.infer<typeof SellerMessageResponseSchema>;
