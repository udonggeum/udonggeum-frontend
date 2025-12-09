import { z } from 'zod';

// User schema (from auth.ts, for reference)
const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
});

// Store schema (simplified)
const StoreSchema = z.object({
  id: z.number(),
  name: z.string(),
  region: z.string().optional(),
  district: z.string().optional(),
  address: z.string(),
});

// Review schema
export const StoreReviewSchema = z.object({
  id: z.number(),
  store_id: z.number(),
  store: StoreSchema.optional(),
  user_id: z.number(),
  user: UserSchema,
  rating: z.number().min(1).max(5),
  content: z.string(),
  image_urls: z.array(z.string()).optional(),
  is_visitor: z.boolean(),
  like_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type StoreReview = z.infer<typeof StoreReviewSchema>;

// Create review request
export const CreateReviewRequestSchema = z.object({
  store_id: z.number({ message: '매장 ID를 입력하세요' }),
  rating: z
    .number({ message: '평점을 선택하세요' })
    .min(1, '평점은 1점 이상이어야 합니다')
    .max(5, '평점은 5점 이하여야 합니다'),
  content: z
    .string({ message: '리뷰 내용을 입력하세요' })
    .min(10, '리뷰 내용은 최소 10자 이상이어야 합니다'),
  image_urls: z.array(z.string().url('유효한 URL을 입력하세요')).optional(),
  is_visitor: z.boolean().optional(),
});

export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;

// Update review request
export const UpdateReviewRequestSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  content: z.string().min(10, '리뷰 내용은 최소 10자 이상이어야 합니다').optional(),
  image_urls: z.array(z.string().url()).optional(),
  is_visitor: z.boolean().optional(),
});

export type UpdateReviewRequest = z.infer<typeof UpdateReviewRequestSchema>;

// Review list response
export const ReviewListResponseSchema = z.object({
  data: z.array(StoreReviewSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
});

export type ReviewListResponse = z.infer<typeof ReviewListResponseSchema>;

// Store statistics
export const StoreStatisticsSchema = z.object({
  review_count: z.number(),
  average_rating: z.number(),
  visitor_review_count: z.number(),
  post_count: z.number(),
  gallery_image_count: z.number(),
});

export type StoreStatistics = z.infer<typeof StoreStatisticsSchema>;

// Gallery image
export const GalleryImageSchema = z.object({
  image_url: z.string().url(),
  post_id: z.number(),
  source_type: z.enum(['review', 'community']),
  caption: z.string(),
  author_name: z.string(),
  rating: z.number().optional(),
  created_at: z.string(),
});

export type GalleryImage = z.infer<typeof GalleryImageSchema>;

// Gallery response
export const GalleryResponseSchema = z.object({
  data: z.array(GalleryImageSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
});

export type GalleryResponse = z.infer<typeof GalleryResponseSchema>;

// Review query parameters
export interface ReviewQueryParams {
  page?: number;
  page_size?: number;
  sort_by?: 'created_at' | 'like_count';
  sort_order?: 'asc' | 'desc';
}

// Gallery query parameters
export interface GalleryQueryParams {
  page?: number;
  page_size?: number;
}
