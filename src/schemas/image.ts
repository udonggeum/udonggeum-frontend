import { z } from 'zod';

/**
 * Image optimization request schema
 * Request to optimize product image using OpenAI
 */
export const ImageOptimizationRequestSchema = z.object({
  image: z.instanceof(File, { message: '이미지 파일을 선택하세요' }),
  target_width: z.number().int().positive().default(800),
  target_height: z.number().int().positive().default(800),
  prompt: z.string().optional(),
});

export type ImageOptimizationRequest = z.infer<typeof ImageOptimizationRequestSchema>;

/**
 * Product analysis schema from Vision API
 * All fields are optional to handle OpenAI API failures gracefully
 */
export const ProductAnalysisSchema = z.object({
  product_type: z.string().optional(),
  design_features: z.array(z.string()).optional(),
  preservation_rules: z.array(z.string()).optional(),
  recommended_prompt: z.string().optional(),
});

export type ProductAnalysis = z.infer<typeof ProductAnalysisSchema>;

/**
 * Image optimization response schema
 * Response from backend after OpenAI optimization
 */
export const ImageOptimizationResponseSchema = z.object({
  original_url: z.string().min(1),
  optimized_url: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.string(),
  size_bytes: z.number().int().nonnegative(),
  product_analysis: ProductAnalysisSchema.nullable().optional(),
  optimization_notes: z.string().optional(),
});

export type ImageOptimizationResponse = z.infer<typeof ImageOptimizationResponseSchema>;

/**
 * Image upload response schema
 * Simple image upload without optimization
 */
export const ImageUploadResponseSchema = z.object({
  message: z.string().optional(),
  url: z.string().min(1),
  filename: z.string(),
  size_bytes: z.number().int().nonnegative(),
});

export type ImageUploadResponse = z.infer<typeof ImageUploadResponseSchema>;

/**
 * Pre-signed URL request schema
 * Request to generate S3 pre-signed URL
 */
export const PresignedURLRequestSchema = z.object({
  filename: z.string().min(1),
  content_type: z.string().min(1),
  file_size: z.number().int().positive(),
});

export type PresignedURLRequest = z.infer<typeof PresignedURLRequestSchema>;

/**
 * Pre-signed URL response schema
 * Response containing upload URL and final file URL
 */
export const PresignedURLResponseSchema = z.object({
  upload_url: z.string().url(),
  file_url: z.string().min(1),
  key: z.string().min(1),
});

export type PresignedURLResponse = z.infer<typeof PresignedURLResponseSchema>;
