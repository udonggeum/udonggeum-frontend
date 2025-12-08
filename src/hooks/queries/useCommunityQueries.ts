import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '@/services/community';
import type {
  PostListQuery,
  CommentListQuery,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '@/schemas/community';

// ==================== Query Keys ====================

export const communityKeys = {
  all: ['community'] as const,
  posts: () => [...communityKeys.all, 'posts'] as const,
  post: (id: number) => [...communityKeys.posts(), id] as const,
  postList: (query?: PostListQuery) => [...communityKeys.posts(), 'list', query] as const,
  comments: () => [...communityKeys.all, 'comments'] as const,
  commentList: (query: CommentListQuery) => [...communityKeys.comments(), 'list', query] as const,
};

// ==================== Post Queries ====================

/**
 * Get post list with filters
 */
export function usePosts(query?: PostListQuery) {
  return useQuery({
    queryKey: communityKeys.postList(query),
    queryFn: () => communityService.getPosts(query),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Get post detail by ID
 */
export function usePost(id: number) {
  return useQuery({
    queryKey: communityKeys.post(id),
    queryFn: () => communityService.getPost(id),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Create new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePostRequest) => communityService.createPost(request),
    onSuccess: () => {
      // Invalidate all post lists
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
    },
  });
}

/**
 * Update post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostRequest }) =>
      communityService.updatePost(id, data),
    onSuccess: (updatedPost) => {
      // Invalidate specific post and all lists
      queryClient.invalidateQueries({ queryKey: communityKeys.post(updatedPost.id) });
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
    },
  });
}

/**
 * Delete post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => communityService.deletePost(id),
    onSuccess: () => {
      // Invalidate all post lists
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
    },
  });
}

/**
 * Toggle post like
 */
export function useTogglePostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => communityService.togglePostLike(id),
    onSuccess: (_, id) => {
      // Invalidate specific post to update like count and status
      queryClient.invalidateQueries({ queryKey: communityKeys.post(id) });
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
    },
  });
}

// ==================== Comment Queries ====================

/**
 * Get comment list for a post
 */
export function useComments(query: CommentListQuery) {
  return useQuery({
    queryKey: communityKeys.commentList(query),
    queryFn: () => communityService.getComments(query),
    enabled: !!query.post_id, // Only fetch when post_id is provided
  });
}

/**
 * Create new comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCommentRequest) => communityService.createComment(request),
    onSuccess: (newComment) => {
      // Invalidate comment list for this post
      queryClient.invalidateQueries({
        queryKey: communityKeys.commentList({ post_id: newComment.post_id }),
      });
      // Invalidate post to update comment count
      queryClient.invalidateQueries({ queryKey: communityKeys.post(newComment.post_id) });
    },
  });
}

/**
 * Update comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCommentRequest }) =>
      communityService.updateComment(id, data),
    onSuccess: (updatedComment) => {
      // Invalidate comment list for this post
      queryClient.invalidateQueries({
        queryKey: communityKeys.commentList({ post_id: updatedComment.post_id }),
      });
    },
  });
}

/**
 * Delete comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, postId }: { id: number; postId: number }) =>
      communityService.deleteComment(id),
    onSuccess: (_, { postId }) => {
      // Invalidate comment list for this post
      queryClient.invalidateQueries({
        queryKey: communityKeys.commentList({ post_id: postId }),
      });
      // Invalidate post to update comment count
      queryClient.invalidateQueries({ queryKey: communityKeys.post(postId) });
    },
  });
}

/**
 * Toggle comment like
 */
export function useToggleCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, postId }: { id: number; postId: number }) =>
      communityService.toggleCommentLike(id),
    onSuccess: (_, { postId }) => {
      // Invalidate comment list to update like count
      queryClient.invalidateQueries({
        queryKey: communityKeys.commentList({ post_id: postId }),
      });
    },
  });
}

// ==================== QnA Queries ====================

/**
 * Accept answer for QnA post
 */
export function useAcceptAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: number; commentId: number }) =>
      communityService.acceptAnswer(postId, commentId),
    onSuccess: (_, { postId }) => {
      // Invalidate post and comments
      queryClient.invalidateQueries({ queryKey: communityKeys.post(postId) });
      queryClient.invalidateQueries({
        queryKey: communityKeys.commentList({ post_id: postId }),
      });
    },
  });
}
