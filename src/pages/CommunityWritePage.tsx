import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePost } from '@/hooks/queries/useCommunityQueries';
import { useAuthStore } from '@/stores/useAuthStore';
import Navbar from '@/components/Navbar';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import {
  CreatePostRequestSchema,
  POST_CATEGORY_LABELS,
  POST_TYPE_LABELS,
  CATEGORY_TYPES,
  ADMIN_ONLY_TYPES,
  type CreatePostRequest,
  type PostCategory,
} from '@/schemas/community';

// Form data type (before transformation to API request)
type FormData = Omit<CreatePostRequest, 'image_urls'> & {
  image_urls?: string[];
};

export default function CommunityWritePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createPost = useCreatePost();

  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('gold_trade');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(CreatePostRequestSchema),
    defaultValues: {
      category: 'gold_trade',
      type: 'sell_gold',
      image_urls: [],
    },
  });

  const selectedType = watch('type');

  const onSubmit = (data: FormData) => {
    // Transform form data to API request type
    const requestData: CreatePostRequest = {
      ...data,
      image_urls: data.image_urls || [],
    };
    createPost.mutate(requestData, {
      onSuccess: (post) => {
        navigate(`/community/posts/${post.id}`);
      },
      onError: (error: any) => {
        alert(error.message || '게시글 작성에 실패했습니다.');
      },
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="alert alert-warning max-w-md">
          <span>로그인이 필요합니다.</span>
        </div>
      </div>
    );
  }

  const availableTypes = CATEGORY_TYPES[selectedCategory].filter((type) => {
    // 관리자 전용 타입은 관리자만 사용 가능
    if (ADMIN_ONLY_TYPES.includes(type)) {
      return user.role === 'admin';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">글쓰기</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Selection */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">카테고리 *</span>
                </label>
                <div className="tabs tabs-boxed">
                  {(Object.keys(POST_CATEGORY_LABELS) as PostCategory[]).map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`tab ${selectedCategory === category ? 'tab-active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(category);
                      }}
                    >
                      {POST_CATEGORY_LABELS[category]}
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register('category')} value={selectedCategory} />
              </div>

              {/* Type Selection */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">게시글 타입 *</span>
                </label>
                <select
                  {...register('type')}
                  className={`select select-bordered ${errors.type ? 'select-error' : ''}`}
                >
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {POST_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.type.message}</span>
                  </label>
                )}
              </div>

              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">제목 *</span>
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className={`input input-bordered ${errors.title ? 'input-error' : ''}`}
                  placeholder="제목을 입력하세요"
                />
                {errors.title && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.title.message}</span>
                  </label>
                )}
              </div>

              {/* Content */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">내용 *</span>
                </label>
                <textarea
                  {...register('content')}
                  className={`textarea textarea-bordered ${errors.content ? 'textarea-error' : ''}`}
                  rows={10}
                  placeholder="내용을 입력하세요 (최소 10자)"
                />
                {errors.content && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.content.message}</span>
                  </label>
                )}
              </div>

              {/* Gold Trade Additional Fields */}
              {selectedCategory === 'gold_trade' && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">금 거래 정보 (선택)</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">금 종류</span>
                      </label>
                      <input
                        type="text"
                        {...register('gold_type')}
                        className="input input-bordered"
                        placeholder="예: 24K, 18K, 14K"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">중량 (g)</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('weight', { valueAsNumber: true })}
                        className="input input-bordered"
                        placeholder="예: 18.75"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">가격 (원)</span>
                      </label>
                      <input
                        type="number"
                        {...register('price', { valueAsNumber: true })}
                        className="input input-bordered"
                        placeholder="예: 3500000"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">거래 지역</span>
                      </label>
                      <input
                        type="text"
                        {...register('location')}
                        className="input input-bordered"
                        placeholder="예: 서울 강남구"
                      />
                    </div>
                  </div>

                  {/* Store ID는 백엔드에서 자동으로 설정됨 (보안을 위해 사용자 입력 불가) */}
                  {selectedType === 'buy_gold' && user.role === 'admin' && (
                    <div className="alert alert-info mt-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-current shrink-0 w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>
                        이 글은 귀하의 매장({user.name})으로 자동 등록됩니다.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="card-actions justify-end">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate('/community')}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createPost.isPending}
                >
                  {createPost.isPending ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    '작성 완료'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
