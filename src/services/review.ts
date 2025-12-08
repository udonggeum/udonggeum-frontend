import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';
import {
  StoreReviewSchema,
  CreateReviewRequestSchema,
  UpdateReviewRequestSchema,
  ReviewListResponseSchema,
  StoreStatisticsSchema,
  GalleryResponseSchema,
} from '@/schemas/review';
import type {
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewListResponse,
  StoreStatistics,
  GalleryResponse,
  ReviewQueryParams,
  GalleryQueryParams,
} from '@/schemas/review';

class ReviewService {
  /**
   * 매장 리뷰 목록 조회
   */
  async getStoreReviews(storeId: number, params?: ReviewQueryParams) {
    const response = await apiClient.get(ENDPOINTS.STORES.REVIEWS(storeId), {
      params,
    });

    return ReviewListResponseSchema.parse(response.data);
  }

  /**
   * 리뷰 작성
   */
  async createReview(data: CreateReviewRequest) {
    const validated = CreateReviewRequestSchema.parse(data);

    const response = await apiClient.post(
      ENDPOINTS.STORES.REVIEWS(validated.store_id),
      validated
    );

    return StoreReviewSchema.parse(response.data);
  }

  /**
   * 리뷰 수정
   */
  async updateReview(reviewId: number, data: UpdateReviewRequest) {
    const validated = UpdateReviewRequestSchema.parse(data);

    const response = await apiClient.put(
      ENDPOINTS.REVIEWS.UPDATE(reviewId),
      validated
    );

    return StoreReviewSchema.parse(response.data);
  }

  /**
   * 리뷰 삭제
   */
  async deleteReview(reviewId: number) {
    await apiClient.delete(ENDPOINTS.REVIEWS.DELETE(reviewId));
  }

  /**
   * 리뷰 좋아요 토글
   */
  async toggleReviewLike(reviewId: number) {
    const response = await apiClient.post(ENDPOINTS.REVIEWS.TOGGLE_LIKE(reviewId));

    return response.data as { is_liked: boolean };
  }

  /**
   * 사용자 리뷰 목록 조회
   */
  async getUserReviews(params?: ReviewQueryParams) {
    const response = await apiClient.get(ENDPOINTS.REVIEWS.USER_REVIEWS, {
      params,
    });

    return ReviewListResponseSchema.parse(response.data);
  }

  /**
   * 매장 통계 조회
   */
  async getStoreStatistics(storeId: number) {
    const response = await apiClient.get(ENDPOINTS.STORES.STATS(storeId));

    return StoreStatisticsSchema.parse(response.data);
  }

  /**
   * 매장 갤러리 조회
   */
  async getStoreGallery(storeId: number, params?: GalleryQueryParams) {
    const response = await apiClient.get(ENDPOINTS.STORES.GALLERY(storeId), {
      params,
    });

    return GalleryResponseSchema.parse(response.data);
  }
}

export const reviewService = new ReviewService();
