/**
 * Image Query Hooks
 * TanStack Query hooks for image operations
 */

import { useMutation } from '@tanstack/react-query';
import { imageService } from '@/services/image';
import type {
  ImageOptimizationResponse,
} from '@/schemas/image';

/**
 * Upload image using S3 Pre-signed URL
 * Returns the final file URL directly
 */
export function useUploadImage() {
  return useMutation<string, Error, { file: File; uploadType?: 'store' | 'product' }>({
    mutationFn: ({ file, uploadType }) => imageService.uploadImage(file, uploadType),
  });
}

/**
 * Optimize image mutation
 */
export function useOptimizeImage() {
  return useMutation<
    ImageOptimizationResponse,
    Error,
    { file: File; targetWidth?: number; targetHeight?: number; prompt?: string }
  >({
    mutationFn: ({ file, targetWidth, targetHeight, prompt }) =>
      imageService.optimizeImage(file, targetWidth, targetHeight, prompt),
  });
}
