import { z } from 'zod';

const ProductCategorySchema = z.string().min(1);
const ProductMaterialSchema = z.string().min(1);

/**
 * Store schema (minimal)
 * Store information embedded in product responses
 */
export const StoreSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  region: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  open_time: z.string().optional().nullable(),
  close_time: z.string().optional().nullable(),
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
  additional_price: z.number().nonnegative().default(0),
  stock_quantity: z.number().int().nonnegative().default(0),
  is_default: z.boolean().default(false),
});

export type ProductOption = z.infer<typeof ProductOptionSchema>;

/**
 * Product schema
 * Complete product information
 */
export const ProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  category: ProductCategorySchema,
  material: ProductMaterialSchema.optional(),
  stock_quantity: z.number().int().nonnegative().default(0),
  popularity_score: z.number().nonnegative().default(0),
  wishlist_count: z.number().int().nonnegative().default(0),
  view_count: z.number().int().nonnegative().default(0),
  description: z.string().optional(),
  weight: z.number().nonnegative().optional(),
  purity: z.string().optional(),
  image_url: z.string().url().optional(),
  store_id: z.number().int().positive().optional(),
  store: StoreSchema.optional(),
  options: z.array(ProductOptionSchema).optional(),
});

export type Product = z.infer<typeof ProductSchema>;

/**
 * Products response schema
 * Response from GET /products endpoint (paginated)
 */
export const ProductsResponseSchema = z.object({
  count: z.number().int().nonnegative(),
  page_size: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
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
  category: ProductCategorySchema.optional(),
  material: ProductMaterialSchema.optional(),
  store_id: z.number().int().positive().optional(),
  search: z.string().optional(),
  sort: z
    .enum([
      'popularity',
      'price_asc',
      'price_desc',
      'latest',
      'created_at_asc',
      'created_at_desc',
      'wishlist',
      'wishlist_desc',
      'wishlist_asc',
      'views',
      'views_desc',
      'views_asc',
    ])
    .optional(),
  popular_only: z.boolean().optional(),
  include_options: z.boolean().optional(),
});

export type ProductsRequest = z.infer<typeof ProductsRequestSchema>;
