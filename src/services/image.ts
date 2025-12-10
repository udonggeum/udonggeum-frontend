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
  PresignedURLResponseSchema,
  type ImageOptimizationResponse,
  type PresignedURLResponse,
} from '@/schemas/image';

/**
 * ImageService
 * Handles all image-related API operations
 */
class ImageService {
  /**
   * Upload image using S3 Pre-signed URL
   * Step 1: Get pre-signed URL from server
   * Step 2: Upload directly to S3
   * Step 3: Return the final file URL
   */
  async uploadImage(file: File, uploadType: 'store' | 'product' = 'product'): Promise<string> {
    try {
      console.log('[ImageService] Starting pre-signed URL upload:', {
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadType,
      });

      // Step 1: Get pre-signed URL from backend
      const presignedResponse = await apiClient.post<PresignedURLResponse>(
        ENDPOINTS.UPLOAD.PRESIGNED_URL,
        {
          filename: file.name,
          content_type: file.type,
          folder: uploadType === 'store' ? 'stores' : 'products',
        }
      );

      console.log('[ImageService] Pre-signed URL response:', presignedResponse.data);

      const validatedData = PresignedURLResponseSchema.parse(presignedResponse.data);

      // Step 2: Upload directly to S3 using pre-signed URL
      console.log('[ImageService] Uploading to S3:', validatedData.upload_url);

      const uploadResponse = await fetch(validatedData.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
      }

      console.log('[ImageService] S3 upload successful');

      // Step 3: Return the final file URL
      return validatedData.file_url;
    } catch (error) {
      console.error('[ImageService] Pre-signed URL upload error:', error);
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
