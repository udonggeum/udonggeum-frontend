import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review';
import type {
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewQueryParams,
  GalleryQueryParams,
} from '@/schemas/review';

/**
 * Review Query Keys Factory
 */
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (storeId: number, params?: ReviewQueryParams) =>
    [...reviewKeys.lists(), storeId, params] as const,
  user: () => [...reviewKeys.all, 'user'] as const,
  userList: (params?: ReviewQueryParams) => [...reviewKeys.user(), params] as const,
  stats: (storeId: number) => [...reviewKeys.all, 'stats', storeId] as const,
  gallery: (storeId: number, params?: GalleryQueryParams) =>
    [...reviewKeys.all, 'gallery', storeId, params] as const,
} as const;

/**
 * 매장 리뷰 목록 조회
 */
export function useStoreReviews(storeId: number, params?: ReviewQueryParams) {
  return useQuery({
    queryKey: reviewKeys.list(storeId, params),
    queryFn: () => reviewService.getStoreReviews(storeId, params),
    enabled: !!storeId,
  });
}

/**
 * 매장 통계 조회
 */
export function useStoreStatistics(storeId: number) {
  return useQuery({
    queryKey: reviewKeys.stats(storeId),
    queryFn: () => reviewService.getStoreStatistics(storeId),
    enabled: !!storeId,
  });
}

/**
 * 매장 갤러리 조회
 */
export function useStoreGallery(storeId: number, params?: GalleryQueryParams) {
  return useQuery({
    queryKey: reviewKeys.gallery(storeId, params),
    queryFn: () => reviewService.getStoreGallery(storeId, params),
    enabled: !!storeId,
  });
}

/**
 * 사용자 리뷰 목록 조회
 */
export function useUserReviews(params?: ReviewQueryParams) {
  return useQuery({
    queryKey: reviewKeys.userList(params),
    queryFn: () => reviewService.getUserReviews(params),
  });
}

/**
 * 리뷰 작성
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => reviewService.createReview(data),
    onSuccess: (_, variables) => {
      // 매장 리뷰 목록 무효화
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });

      // 매장 통계 무효화
      queryClient.invalidateQueries({
        queryKey: reviewKeys.stats(variables.store_id),
      });

      // 사용자 리뷰 무효화
      queryClient.invalidateQueries({
        queryKey: reviewKeys.user(),
      });
    },
  });
}

/**
 * 리뷰 수정
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: number; data: UpdateReviewRequest }) =>
      reviewService.updateReview(reviewId, data),
    onSuccess: () => {
      // 모든 리뷰 목록 무효화
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: reviewKeys.user(),
      });
    },
  });
}

/**
 * 리뷰 삭제
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      // 모든 리뷰 목록 무효화
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });

      // 통계 무효화
      queryClient.invalidateQueries({
        queryKey: [...reviewKeys.all, 'stats'],
      });

      queryClient.invalidateQueries({
        queryKey: reviewKeys.user(),
      });
    },
  });
}

/**
 * 리뷰 좋아요 토글
 */
export function useToggleReviewLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => reviewService.toggleReviewLike(reviewId),
    onSuccess: () => {
      // 리뷰 목록 무효화 (like_count 업데이트)
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: reviewKeys.user(),
      });
    },
  });
}
