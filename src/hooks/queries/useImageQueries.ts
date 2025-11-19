/**
 * Image Query Hooks
 * TanStack Query hooks for image operations
 */

import { useMutation } from '@tanstack/react-query';
import { imageService } from '@/services/image';
import type {
  ImageOptimizationResponse,
  ImageUploadResponse,
} from '@/schemas/image';

/**
 * Upload image mutation
 */
export function useUploadImage() {
  return useMutation<ImageUploadResponse, Error, File>({
    mutationFn: (file: File) => imageService.uploadImage(file),
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
