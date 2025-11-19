import { z } from 'zod';

/**
 * Dashboard statistics schema
 * Validates seller dashboard stats from API
 */
export const DashboardStatsSchema = z.object({
  total_orders: z.preprocess((val) => val ?? 0, z.number().int().nonnegative()),
  total_revenue: z.preprocess((val) => val ?? 0, z.number().nonnegative()),
  pending_orders: z.preprocess((val) => val ?? 0, z.number().int().nonnegative()),
  confirmed_orders: z.preprocess((val) => val ?? 0, z.number().int().nonnegative()),
  shipping_orders: z.preprocess((val) => val ?? 0, z.number().int().nonnegative()),
  delivered_orders: z.preprocess((val) => val ?? 0, z.number().int().nonnegative()),
  cancelled_orders: z.preprocess((val) => val ?? 0, z.number().int().nonnegative()),
  total_products: z.preprocess((val) => val ?? 0, z.number().int().nonnegative()),
  low_stock_products: z.preprocess((val) => val ?? 0, z.number().int().nonnegative()),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

/**
 * Create store request schema
 * Validates user input for creating new store
 */
export const CreateStoreRequestSchema = z.object({
  name: z.string().min(1, '가게 이름을 입력하세요'),
  region: z.string().min(1, '시·도를 선택하세요'),
  district: z.string().min(1, '구·군을 선택하세요'),
  address: z.string().optional(),
  phone_number: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다')
    .optional(),
  image_url: z.string().url('올바른 URL 형식이 아닙니다').optional().or(z.literal('')),
  description: z.string().optional(),
  open_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '올바른 시간 형식이 아닙니다 (예: 09:00)').optional(),
  close_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '올바른 시간 형식이 아닙니다 (예: 20:00)').optional(),
});

export type CreateStoreRequest = z.infer<typeof CreateStoreRequestSchema>;

/**
 * Update store request schema
 * Validates user input for updating existing store
 * All fields are optional
 */
export const UpdateStoreRequestSchema = z.object({
  name: z.string().min(1, '가게 이름을 입력하세요').optional(),
  region: z.string().min(1, '시·도를 선택하세요').optional(),
  district: z.string().min(1, '구·군을 선택하세요').optional(),
  address: z.string().optional(),
  phone_number: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다')
    .optional(),
  image_url: z.string().url('올바른 URL 형식이 아닙니다').optional().or(z.literal('')),
  description: z.string().optional(),
  open_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '올바른 시간 형식이 아닙니다 (예: 09:00)').optional(),
  close_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '올바른 시간 형식이 아닙니다 (예: 20:00)').optional(),
});

export type UpdateStoreRequest = z.infer<typeof UpdateStoreRequestSchema>;

/**
 * Product option input schema
 * Validates product option input (e.g., size, color) for creating/updating products
 */
export const ProductOptionInputSchema = z.object({
  name: z.string().min(1, '옵션명을 입력하세요'),
  value: z.string().min(1, '옵션값을 입력하세요'),
  additional_price: z.number().nonnegative().default(0),
  stock_quantity: z.number().int().nonnegative().default(0),
  is_default: z.boolean().default(false),
});

export type ProductOptionInput = z.infer<typeof ProductOptionInputSchema>;

/**
 * Create product request schema
 * Validates user input for creating new product
 */
export const CreateProductRequestSchema = z.object({
  store_id: z.number().int().positive('가게를 선택하세요'),
  name: z.string().min(1, '상품명을 입력하세요'),
  description: z.string().optional(),
  price: z.number().positive('가격은 0보다 커야 합니다'),
  weight: z.number().nonnegative().optional(),
  purity: z.string().optional(),
  category: z.string().min(1, '카테고리를 선택하세요'),
  material: z.string().min(1, '재질을 선택하세요'),
  stock_quantity: z.number().int().nonnegative().default(0),
  image_url: z.string().url('올바른 URL 형식이 아닙니다').optional(),
  options: z.array(ProductOptionInputSchema).optional().default([]),
});

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

/**
 * Update product request schema
 * Validates user input for updating existing product
 * All fields are optional
 */
export const UpdateProductRequestSchema = z.object({
  name: z.string().min(1, '상품명을 입력하세요').optional(),
  description: z.string().optional(),
  price: z.number().positive('가격은 0보다 커야 합니다').optional(),
  weight: z.number().nonnegative().optional(),
  purity: z.string().optional(),
  category: z.string().min(1, '카테고리를 선택하세요').optional(),
  material: z.string().min(1, '재질을 선택하세요').optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
  image_url: z.string().url('올바른 URL 형식이 아닙니다').optional(),
  options: z.array(ProductOptionInputSchema).optional(),
});

export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;

/**
 * Update order status request schema
 * Validates order status update
 */
export const UpdateOrderStatusRequestSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'], {
    message: '올바른 주문 상태를 선택하세요',
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
