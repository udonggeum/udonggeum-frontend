import { z } from 'zod';

// ==================== Enums ====================

export const PostCategorySchema = z.enum(['gold_trade', 'gold_news', 'qna']);

export const PostTypeSchema = z.enum([
  'sell_gold',
  'buy_gold',
  'news',
  'review',
  'tip',
  'question',
  'faq',
]);

export const PostStatusSchema = z.enum(['active', 'inactive', 'deleted', 'reported']);

// ==================== Models ====================

// User schema (간소화 버전)
export const PostAuthorSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
});

// Store schema (간소화 버전)
export const PostStoreSchema = z.object({
  id: z.number(),
  name: z.string(),
  region: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
});

// Community Post
export const CommunityPostSchema = z.object({
  id: z.number(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),

  // 기본 정보
  title: z.string(),
  content: z.string(),
  category: PostCategorySchema,
  type: PostTypeSchema,
  status: PostStatusSchema,

  // 작성자
  user_id: z.number(),
  user: PostAuthorSchema,

  // 금거래 관련 (optional)
  gold_type: z.string().optional().nullable(),
  weight: z.number().optional().nullable(),
  price: z.number().int().optional().nullable(),
  location: z.string().optional().nullable(),
  store_id: z.number().optional().nullable(),
  store: PostStoreSchema.optional().nullable(),

  // QnA 관련
  is_answered: z.boolean().default(false),
  accepted_answer_id: z.number().optional().nullable(),

  // 통계
  view_count: z.number().int().default(0),
  like_count: z.number().int().default(0),
  comment_count: z.number().int().default(0),

  // 이미지
  image_urls: z.array(z.string().url()).optional().default([]),
});

// Community Comment (with explicit type to handle circular reference)
export const CommunityCommentSchema: z.ZodType<any> = z.object({
  id: z.number(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),

  content: z.string(),
  user_id: z.number(),
  user: PostAuthorSchema,
  post_id: z.number(),
  parent_id: z.number().optional().nullable(),

  // QnA
  is_answer: z.boolean().default(false),
  is_accepted: z.boolean().default(false),

  // 통계
  like_count: z.number().int().default(0),

  // 대댓글
  replies: z.array(z.lazy(() => CommunityCommentSchema)).optional().default([]),
});

// ==================== Request Schemas ====================

// Create Post Request
export const CreatePostRequestSchema = z.object({
  title: z
    .string({ message: '제목을 입력하세요' })
    .min(2, '제목은 최소 2자 이상이어야 합니다')
    .max(200, '제목은 최대 200자까지 입력 가능합니다'),

  content: z
    .string({ message: '내용을 입력하세요' })
    .min(10, '내용은 최소 10자 이상이어야 합니다'),

  category: PostCategorySchema,
  type: PostTypeSchema,

  // 금거래 옵션
  gold_type: z.string().optional(),
  weight: z.number().positive('중량은 0보다 커야 합니다').optional(),
  price: z.number().int().nonnegative('가격은 0 이상이어야 합니다').optional(),
  location: z.string().optional(),
  // store_id는 사용자 입력으로 받지 않음 (백엔드에서 자동 설정)
  // buy_gold 타입일 때 백엔드가 사용자의 매장 ID를 자동으로 설정

  // 이미지
  image_urls: z.array(z.string().url()).default([]),
});

// Update Post Request
export const UpdatePostRequestSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  content: z.string().min(10).optional(),
  status: PostStatusSchema.optional(),
  gold_type: z.string().optional(),
  weight: z.number().positive().optional(),
  price: z.number().int().nonnegative().optional(),
  location: z.string().optional(),
  image_urls: z.array(z.string().url()).optional(),
});

// Create Comment Request
export const CreateCommentRequestSchema = z.object({
  content: z
    .string({ message: '댓글 내용을 입력하세요' })
    .min(1, '댓글 내용을 입력하세요'),

  post_id: z.number({ message: '게시글 ID가 필요합니다' }),
  parent_id: z.number().optional(),
  is_answer: z.boolean().optional().default(false),
});

// Update Comment Request
export const UpdateCommentRequestSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력하세요').optional(),
});

// ==================== Query Schemas ====================

// Post List Query
export const PostListQuerySchema = z.object({
  category: PostCategorySchema.optional(),
  type: PostTypeSchema.optional(),
  status: PostStatusSchema.optional(),
  user_id: z.number().optional(),
  store_id: z.number().optional(),
  is_answered: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).optional().default(1),
  page_size: z.number().int().min(1).max(100).optional().default(20),
  sort_by: z.enum(['created_at', 'view_count', 'like_count', 'comment_count']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

// Comment List Query
export const CommentListQuerySchema = z.object({
  post_id: z.number({ message: '게시글 ID가 필요합니다' }),
  parent_id: z.number().optional(),
  page: z.number().int().min(1).optional().default(1),
  page_size: z.number().int().min(1).max(100).optional().default(50),
  sort_by: z.enum(['created_at', 'like_count']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

// ==================== Response Schemas ====================

// Post List Response
export const PostListResponseSchema = z.object({
  data: z.array(CommunityPostSchema),
  total: z.number().int(),
  page: z.number().int(),
  page_size: z.number().int(),
});

// Post Detail Response
export const PostDetailResponseSchema = z.object({
  data: CommunityPostSchema.extend({
    comments: z.array(CommunityCommentSchema).optional(),
  }),
  is_liked: z.boolean(),
});

// Comment List Response
export const CommentListResponseSchema = z.object({
  data: z.array(CommunityCommentSchema),
  total: z.number().int(),
  page: z.number().int(),
  page_size: z.number().int(),
});

// Like Response
export const LikeResponseSchema = z.object({
  is_liked: z.boolean(),
});

// Accept Answer Response
export const AcceptAnswerResponseSchema = z.object({
  message: z.string(),
});

// ==================== TypeScript Types ====================

export type PostCategory = z.infer<typeof PostCategorySchema>;
export type PostType = z.infer<typeof PostTypeSchema>;
export type PostStatus = z.infer<typeof PostStatusSchema>;

export type PostAuthor = z.infer<typeof PostAuthorSchema>;
export type PostStore = z.infer<typeof PostStoreSchema>;

export type CommunityPost = z.infer<typeof CommunityPostSchema>;
export type CommunityComment = z.infer<typeof CommunityCommentSchema>;

export type CreatePostRequest = z.infer<typeof CreatePostRequestSchema>;
export type UpdatePostRequest = z.infer<typeof UpdatePostRequestSchema>;
export type CreateCommentRequest = z.infer<typeof CreateCommentRequestSchema>;
export type UpdateCommentRequest = z.infer<typeof UpdateCommentRequestSchema>;

export type PostListQuery = z.infer<typeof PostListQuerySchema>;
export type CommentListQuery = z.infer<typeof CommentListQuerySchema>;

export type PostListResponse = z.infer<typeof PostListResponseSchema>;
export type PostDetailResponse = z.infer<typeof PostDetailResponseSchema>;
export type CommentListResponse = z.infer<typeof CommentListResponseSchema>;
export type LikeResponse = z.infer<typeof LikeResponseSchema>;
export type AcceptAnswerResponse = z.infer<typeof AcceptAnswerResponseSchema>;

// ==================== 유틸리티 상수 ====================

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  gold_trade: '금거래',
  gold_news: '금소식',
  qna: 'QnA',
};

export const POST_TYPE_LABELS: Record<PostType, string> = {
  sell_gold: '금 매수 (팔기)',
  buy_gold: '금 매입',
  news: '뉴스',
  review: '후기',
  tip: '팁',
  question: '질문',
  faq: 'FAQ',
};

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  active: '활성',
  inactive: '비활성',
  deleted: '삭제됨',
  reported: '신고됨',
};

// 카테고리별 허용 타입
export const CATEGORY_TYPES: Record<PostCategory, PostType[]> = {
  gold_trade: ['sell_gold', 'buy_gold', 'faq'],
  gold_news: ['news', 'review', 'tip', 'faq'],
  qna: ['question', 'faq'],
};

// 관리자만 작성 가능한 타입
export const ADMIN_ONLY_TYPES: PostType[] = ['buy_gold', 'faq'];
