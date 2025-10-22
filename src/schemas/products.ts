import { z } from 'zod';

/**
 * Store schema (minimal)
 * Store information embedded in product responses
 */
export const StoreSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  region: z.string().optional(),
  district: z.string().optional(),
});

export type Store = z.infer<typeof StoreSchema>;

/**
 * Product option schema
 * Options/variants for a product (e.g., size, color)
 */
export const ProductOptionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  value: z.string(),
  additional_price: z.number().nonnegative(),
  stock_quantity: z.number().int().nonnegative(),
  is_default: z.boolean(),
});

export type ProductOption = z.infer<typeof ProductOptionSchema>;

/**
 * Product schema
 * Complete product information
 */
export const ProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  price: z.number().positive('가격은 0보다 커야 합니다'),
  category: z.enum(['gold', 'silver', 'jewelry']),
  stock_quantity: z.number().int().nonnegative(),
  popularity_score: z.number().nonnegative(),
  description: z.string().optional(),
  weight: z.number().positive().optional(),
  purity: z.string().optional(),
  image_url: z.string().url().optional(),
  store: StoreSchema,
  options: z.array(ProductOptionSchema).optional(),
});

export type Product = z.infer<typeof ProductSchema>;

/**
 * Products response schema
 * Response from GET /products endpoint (paginated)
 */
export const ProductsResponseSchema = z.object({
  count: z.number().int().nonnegative(),
  page_size: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  products: z.array(ProductSchema),
});

export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;

/**
 * Products request schema
 * Query parameters for filtering/searching products
 */
export const ProductsRequestSchema = z.object({
  page: z.number().int().positive().optional(),
  page_size: z.number().int().positive().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  category: z.enum(['gold', 'silver', 'jewelry']).optional(),
  store_id: z.number().int().positive().optional(),
  search: z.string().optional(),
  sort: z
    .enum(['popularity', 'price_asc', 'price_desc', 'latest'])
    .optional(),
  popular_only: z.boolean().optional(),
  include_options: z.boolean().optional(),
});

export type ProductsRequest = z.infer<typeof ProductsRequestSchema>;
