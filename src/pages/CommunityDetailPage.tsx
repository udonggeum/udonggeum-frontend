import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  usePost,
  useTogglePostLike,
  useDeletePost,
  useCreateComment,
  useToggleCommentLike,
  useDeleteComment,
  useAcceptAnswer,
} from '@/hooks/queries/useCommunityQueries';
import { useAuthStore } from '@/stores/useAuthStore';
import Navbar from '@/components/Navbar';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import { POST_TYPE_LABELS, type CommunityComment } from '@/schemas/community';

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const postId = Number(id);
  const { data, isLoading, error } = usePost(postId);

  const toggleLike = useTogglePostLike();
  const deletePost = useDeletePost();
  const createComment = useCreateComment();
  const toggleCommentLike = useToggleCommentLike();
  const deleteComment = useDeleteComment();
  const acceptAnswer = useAcceptAnswer();

  const handleLike = () => {
    toggleLike.mutate(postId);
  };

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deletePost.mutate(postId, {
        onSuccess: () => {
          navigate('/community');
        },
      });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    createComment.mutate(
      {
        content: commentContent,
        post_id: postId,
        parent_id: replyTo || undefined,
        is_answer: data?.data.category === 'qna',
      },
      {
        onSuccess: () => {
          setCommentContent('');
          setReplyTo(null);
        },
      }
    );
  };

  const handleCommentLike = (commentId: number) => {
    toggleCommentLike.mutate({ id: commentId, postId });
  };

  const handleCommentDelete = (commentId: number) => {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      deleteComment.mutate({ id: commentId, postId });
    }
  };

  const handleAcceptAnswer = (commentId: number) => {
    if (confirm('이 답변을 채택하시겠습니까?')) {
      acceptAnswer.mutate({ postId, commentId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <span>게시글을 찾을 수 없습니다.</span>
        </div>
      </div>
    );
  }

  const post = data.data;
  const isAuthor = user?.id === post.user_id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isAuthor || isAdmin;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      <div className="max-w-[1080px] mx-auto px-5 py-8 w-full">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ← 목록으로
          </Link>
        </div>

        {/* Post Card */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-[12px] font-semibold rounded-full border border-yellow-200">
                    {POST_TYPE_LABELS[post.type]}
                  </span>
                  {post.is_answered && post.category === 'qna' && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-[12px] font-semibold rounded-full border border-green-200">
                      답변 완료
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-3">{post.title}</h1>

                <div className="flex items-center gap-4 text-sm text-base-content/60">
                  <span>{post.user.name}</span>
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                  <span>조회 {post.view_count}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {canEdit && (
                <div className="dropdown dropdown-end">
                  <button tabIndex={0} className="btn btn-ghost btn-sm">
                    ⋮
                  </button>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
                  >
                    <li>
                      <Link to={`/community/edit/${post.id}`}>수정</Link>
                    </li>
                    <li>
                      <button onClick={handleDelete} className="text-error">
                        삭제
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Gold Trade Info */}
            {post.category === 'gold_trade' && (
              <div className="bg-base-200 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {post.gold_type && (
                    <div>
                      <span className="font-semibold">금 종류:</span> {post.gold_type}
                    </div>
                  )}
                  {post.weight && (
                    <div>
                      <span className="font-semibold">중량:</span> {post.weight}g
                    </div>
                  )}
                  {post.price && (
                    <div>
                      <span className="font-semibold">가격:</span>{' '}
                      {post.price.toLocaleString()}원
                    </div>
                  )}
                  {post.location && (
                    <div>
                      <span className="font-semibold">지역:</span> {post.location}
                    </div>
                  )}
                  {post.store && (
                    <div className="col-span-2">
                      <span className="font-semibold">매장:</span>{' '}
                      <Link to={`/stores/${post.store.id}`} className="link link-primary">
                        {post.store.name}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Images */}
            {post.image_urls && post.image_urls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {post.image_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`이미지 ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Like Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`btn btn-sm ${data.is_liked ? 'btn-primary' : 'btn-outline'}`}
                disabled={!user}
              >
                ❤️ 좋아요 {post.like_count}
              </button>
              <span className="text-sm text-base-content/60">댓글 {post.comment_count}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">
              댓글 {post.comment_count}
              {post.category === 'qna' && !post.is_answered && ' (답변 채택 대기 중)'}
            </h2>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                {replyTo && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-base-content/60">
                      답글 작성 중...
                    </span>
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="btn btn-ghost btn-xs"
                    >
                      취소
                    </button>
                  </div>
                )}
                <textarea
                  className="textarea textarea-bordered w-full mb-2"
                  placeholder={
                    post.category === 'qna' ? '답변을 작성하세요' : '댓글을 입력하세요'
                  }
                  rows={3}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!commentContent.trim() || createComment.isPending}
                >
                  {post.category === 'qna' ? '답변 작성' : '댓글 작성'}
                </button>
              </form>
            ) : (
              <div className="alert alert-info mb-6">
                <span>
                  댓글을 작성하려면{' '}
                  <Link to="/login" className="link">
                    로그인
                  </Link>
                  이 필요합니다.
                </span>
              </div>
            )}

            {/* Comment List */}
            <div className="space-y-4">
              {post.comments?.map((comment) => (
                <div key={comment.id} className="border-l-4 border-base-300 pl-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.user.name}</span>
                      <span className="text-sm text-base-content/60">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                      {comment.is_accepted && (
                        <span className="badge badge-success badge-sm">채택됨</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Accept Answer Button (QnA only) */}
                      {post.category === 'qna' &&
                        !post.is_answered &&
                        isAuthor &&
                        comment.is_answer &&
                        !comment.parent_id && (
                          <button
                            onClick={() => handleAcceptAnswer(comment.id)}
                            className="btn btn-success btn-xs"
                          >
                            채택
                          </button>
                        )}

                      {/* Like Button */}
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className="btn btn-ghost btn-xs"
                        disabled={!user}
                      >
                        ❤️ {comment.like_count}
                      </button>

                      {/* Reply Button */}
                      {user && !comment.parent_id && (
                        <button
                          onClick={() => setReplyTo(comment.id)}
                          className="btn btn-ghost btn-xs"
                        >
                          답글
                        </button>
                      )}

                      {/* Delete Button */}
                      {(user?.id === comment.user_id || isAdmin) && (
                        <button
                          onClick={() => handleCommentDelete(comment.id)}
                          className="btn btn-ghost btn-xs text-error"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap mb-2">{comment.content}</p>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3 ml-6">
                      {comment.replies.map((reply: CommunityComment) => (
                        <div key={reply.id} className="border-l-2 border-base-300 pl-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{reply.user.name}</span>
                              <span className="text-sm text-base-content/60">
                                {new Date(reply.created_at).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCommentLike(reply.id)}
                                className="btn btn-ghost btn-xs"
                                disabled={!user}
                              >
                                ❤️ {reply.like_count}
                              </button>

                              {(user?.id === reply.user_id || isAdmin) && (
                                <button
                                  onClick={() => handleCommentDelete(reply.id)}
                                  className="btn btn-ghost btn-xs text-error"
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="whitespace-pre-wrap text-sm">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
