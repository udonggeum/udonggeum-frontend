/**
 * Image Service
 * API calls for image upload and optimization
 */

import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';
import { ValidationError } from '@/utils/errors';
import { ZodError } from 'zod';
import {
  ImageOptimizationResponseSchema,
  ImageUploadResponseSchema,
  type ImageOptimizationResponse,
  type ImageUploadResponse,
} from '@/schemas/image';

/**
 * ImageService
 * Handles all image-related API operations
 */
class ImageService {
  /**
   * Upload image without optimization
   */
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post<ImageUploadResponse>(
        ENDPOINTS.IMAGES.UPLOAD,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const validatedData = ImageUploadResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Optimize product image using OpenAI
   */
  async optimizeImage(
    file: File,
    targetWidth: number = 800,
    targetHeight: number = 800,
    prompt?: string
  ): Promise<ImageOptimizationResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('target_width', targetWidth.toString());
      formData.append('target_height', targetHeight.toString());
      if (prompt) {
        formData.append('prompt', prompt);
      }

      const response = await apiClient.post<ImageOptimizationResponse>(
        ENDPOINTS.IMAGES.OPTIMIZE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const validatedData = ImageOptimizationResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const imageService = new ImageService();
