import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';

export interface PresignedURLRequest {
  filename: string;
  content_type: string;
  folder?: string;
}

export interface PresignedURLResponse {
  upload_url: string;
  file_url: string;
  key: string;
}

class UploadService {
  /**
   * Generate presigned URL for file upload
   */
  async generatePresignedURL(data: PresignedURLRequest): Promise<PresignedURLResponse> {
    const response = await apiClient.post(ENDPOINTS.UPLOAD.PRESIGNED_URL, data);
    return response.data;
  }

  /**
   * Upload file to S3 using presigned URL
   */
  async uploadToS3(presignedUrl: string, file: File): Promise<void> {
    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  }

  /**
   * Upload file (get presigned URL + upload to S3)
   */
  async uploadFile(file: File, folder = 'community'): Promise<string> {
    // 1. Get presigned URL from backend
    const presignedData = await this.generatePresignedURL({
      filename: file.name,
      content_type: file.type,
      folder,
    });

    // 2. Upload to S3
    await this.uploadToS3(presignedData.upload_url, file);

    // 3. Return the final file URL
    return presignedData.file_url;
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: File[], folder = 'community'): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }
}

export const uploadService = new UploadService();
