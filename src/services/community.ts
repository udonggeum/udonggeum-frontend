import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';
import { ValidationError } from '@/utils/errors';
import { ZodError } from 'zod';
import {
  CreatePostRequestSchema,
  UpdatePostRequestSchema,
  CreateCommentRequestSchema,
  UpdateCommentRequestSchema,
  PostListResponseSchema,
  PostDetailResponseSchema,
  CommentListResponseSchema,
  LikeResponseSchema,
  AcceptAnswerResponseSchema,
  CommunityPostSchema,
  CommunityCommentSchema,
} from '@/schemas/community';
import type {
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  PostListQuery,
  CommentListQuery,
  PostListResponse,
  PostDetailResponse,
  CommentListResponse,
  AcceptAnswerResponse,
  CommunityPost,
  CommunityComment,
} from '@/schemas/community';

/**
 * Community service
 * Handles community-related API calls (금광산)
 */
class CommunityService {
  // ==================== Post APIs ====================

  /**
   * Get post list
   * @param query - Filter and pagination options
   * @returns Post list response
   */
  async getPosts(query?: PostListQuery): Promise<PostListResponse> {
    try {
      const response = await apiClient.get(ENDPOINTS.COMMUNITY.POSTS, { params: query });
      return PostListResponseSchema.parse(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Get post detail by ID
   * @param id - Post ID
   * @returns Post detail response (includes comments and like status)
   */
  async getPost(id: number): Promise<PostDetailResponse> {
    try {
      const response = await apiClient.get(ENDPOINTS.COMMUNITY.POST_DETAIL(id));
      return PostDetailResponseSchema.parse(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Create new post
   * @param data - Post creation data
   * @returns Created post
   */
  async createPost(data: CreatePostRequest): Promise<CommunityPost> {
    try {
      const validatedInput = CreatePostRequestSchema.parse(data);
      const response = await apiClient.post(ENDPOINTS.COMMUNITY.POSTS, validatedInput);
      return CommunityPostSchema.parse(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Update post
   * @param id - Post ID
   * @param data - Update data
   * @returns Updated post
   */
  async updatePost(id: number, data: UpdatePostRequest): Promise<CommunityPost> {
    try {
      const validatedInput = UpdatePostRequestSchema.parse(data);
      const response = await apiClient.put(ENDPOINTS.COMMUNITY.POST_DETAIL(id), validatedInput);
      return CommunityPostSchema.parse(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Delete post
   * @param id - Post ID
   */
  async deletePost(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.COMMUNITY.POST_DETAIL(id));
  }

  /**
   * Toggle post like
   * @param id - Post ID
   * @returns Like status (true if liked, false if unliked)
   */
  async togglePostLike(id: number): Promise<boolean> {
    try {
      const response = await apiClient.post(ENDPOINTS.COMMUNITY.POST_LIKE(id));
      const result = LikeResponseSchema.parse(response.data);
      return result.is_liked;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  // ==================== Comment APIs ====================

  /**
   * Get comment list
   * @param query - Filter and pagination options
   * @returns Comment list response
   */
  async getComments(query: CommentListQuery): Promise<CommentListResponse> {
    try {
      const response = await apiClient.get(ENDPOINTS.COMMUNITY.COMMENTS, { params: query });
      return CommentListResponseSchema.parse(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Create new comment
   * @param data - Comment creation data
   * @returns Created comment
   */
  async createComment(data: CreateCommentRequest): Promise<CommunityComment> {
    try {
      const validatedInput = CreateCommentRequestSchema.parse(data);
      const response = await apiClient.post(ENDPOINTS.COMMUNITY.COMMENTS, validatedInput);
      return CommunityCommentSchema.parse(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Update comment
   * @param id - Comment ID
   * @param data - Update data
   * @returns Updated comment
   */
  async updateComment(id: number, data: UpdateCommentRequest): Promise<CommunityComment> {
    try {
      const validatedInput = UpdateCommentRequestSchema.parse(data);
      const response = await apiClient.put(ENDPOINTS.COMMUNITY.COMMENT_DETAIL(id), validatedInput);
      return CommunityCommentSchema.parse(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Delete comment
   * @param id - Comment ID
   */
  async deleteComment(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.COMMUNITY.COMMENT_DETAIL(id));
  }

  /**
   * Toggle comment like
   * @param id - Comment ID
   * @returns Like status (true if liked, false if unliked)
   */
  async toggleCommentLike(id: number): Promise<boolean> {
    try {
      const response = await apiClient.post(ENDPOINTS.COMMUNITY.COMMENT_LIKE(id));
      const result = LikeResponseSchema.parse(response.data);
      return result.is_liked;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  // ==================== QnA APIs ====================

  /**
   * Accept answer for QnA post
   * @param postId - Post ID
   * @param commentId - Comment ID to accept
   * @returns Success message
   */
  async acceptAnswer(postId: number, commentId: number): Promise<AcceptAnswerResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.COMMUNITY.POST_ACCEPT(postId, commentId));
      return AcceptAnswerResponseSchema.parse(response.data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }
}

export const communityService = new CommunityService();
