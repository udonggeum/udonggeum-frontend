import { useState, useEffect } from 'react';
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
  type PostType,
} from '@/schemas/community';
import { CITY_NAMES, getDistricts, getDongs, formatAddress } from '@/constants/locations';
import { getKeywordGroupsByType } from '@/constants/keywords';
import { communityService } from '@/services/community';
import { uploadService } from '@/services/upload';

// Form data type (before transformation to API request)
type FormData = Omit<CreatePostRequest, 'image_urls'> & {
  image_urls?: string[];
};

export default function CommunityWritePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createPost = useCreatePost();

  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('gold_trade');
  const [selectedType, setSelectedType] = useState<PostType>('sell_gold');

  // 주소 선택 상태
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedDong, setSelectedDong] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [dongs, setDongs] = useState<string[]>([]);

  // AI 키워드 모달 상태
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 이미지 업로드 상태
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(CreatePostRequestSchema),
    defaultValues: {
      category: 'gold_trade',
      type: 'sell_gold',
      image_urls: [],
    },
  });

  const watchedType = watch('type');
  const watchedTitle = watch('title');
  const watchedGoldType = watch('gold_type');
  const watchedWeight = watch('weight');
  const watchedPrice = watch('price');

  // buy_gold일 때 자동으로 매장 주소 설정
  useEffect(() => {
    if (watchedType === 'buy_gold' && user?.role === 'admin') {
      // TODO: user.store 정보가 있다면 그 주소를 자동으로 설정
      // 현재는 user 스키마에 store 정보가 없으므로 주석 처리
      // if (user.store?.address) {
      //   setValue('location', user.store.address);
      // }
    }
  }, [watchedType, user, setValue]);

  // 시 변경 시 구 목록 업데이트
  useEffect(() => {
    if (selectedCity) {
      const newDistricts = getDistricts(selectedCity);
      setDistricts(newDistricts);
      setSelectedDistrict('');
      setDongs([]);
      setSelectedDong('');
    } else {
      setDistricts([]);
      setDongs([]);
    }
  }, [selectedCity]);

  // 구 변경 시 동 목록 업데이트
  useEffect(() => {
    if (selectedCity && selectedDistrict) {
      const newDongs = getDongs(selectedCity, selectedDistrict);
      setDongs(newDongs);
      setSelectedDong('');
    } else {
      setDongs([]);
    }
  }, [selectedCity, selectedDistrict]);

  // 주소가 완성되면 location 필드에 설정
  useEffect(() => {
    if (selectedCity && selectedDistrict && selectedDong) {
      const fullAddress = formatAddress(selectedCity, selectedDistrict, selectedDong);
      setValue('location', fullAddress);
    }
  }, [selectedCity, selectedDistrict, selectedDong, setValue]);

  const onSubmit = async (data: FormData) => {
    console.log('[CommunityWritePage] onSubmit called with data:', data);
    try {
      setIsUploading(true);
      let uploadedImageUrls: string[] = [];

      // Upload images if any
      if (imageFiles.length > 0) {
        try {
          uploadedImageUrls = await uploadService.uploadMultipleFiles(imageFiles, 'community');
        } catch (error) {
          console.error('Image upload failed:', error);
          alert('이미지 업로드에 실패했습니다. 이미지 없이 게시글을 작성하시겠습니까?');
          // Continue without images
        }
      }

      // Transform form data to API request type
      const requestData: CreatePostRequest = {
        ...data,
        image_urls: uploadedImageUrls,
      };

      createPost.mutate(requestData, {
        onSuccess: (post) => {
          setIsUploading(false);
          navigate(`/community/posts/${post.id}`);
        },
        onError: (error: any) => {
          alert(error.message || '게시글 작성에 실패했습니다.');
          setIsUploading(false);
        },
      });
    } catch (error: any) {
      alert(error.message || '게시글 작성 중 오류가 발생했습니다.');
      setIsUploading(false);
    }
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

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: PostCategory) => {
    setSelectedCategory(category);
    setValue('category', category);

    // 첫 번째 사용 가능한 타입으로 자동 선택
    const firstAvailableType = CATEGORY_TYPES[category].find((type) => {
      if (ADMIN_ONLY_TYPES.includes(type)) {
        return user.role === 'admin';
      }
      return true;
    });

    if (firstAvailableType) {
      setSelectedType(firstAvailableType);
      setValue('type', firstAvailableType);
    }
  };

  // 타입 변경 핸들러
  const handleTypeChange = (type: PostType) => {
    setSelectedType(type);
    setValue('type', type);
  };

  // 키워드 토글
  const toggleKeyword = (keywordId: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(keywordId) ? prev.filter((k) => k !== keywordId) : [...prev, keywordId]
    );
  };

  // 이미지 업로드 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - imageFiles.length);

    if (imageFiles.length + newFiles.length > 5) {
      alert('이미지는 최대 5장까지 업로드 가능합니다.');
      return;
    }

    setImageFiles((prev) => [...prev, ...newFiles]);

    // 미리보기 생성
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreviews((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 이미지 삭제 핸들러
  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // AI 자동 작성
  const handleGenerateContent = async () => {
    if (selectedKeywords.length === 0) {
      alert('최소 1개의 키워드를 선택하세요.');
      return;
    }

    setIsGenerating(true);
    setShowKeywordModal(false);

    try {
      const response = await communityService.generateContent({
        type: selectedType,
        keywords: selectedKeywords,
        title: watchedTitle,
        gold_type: watchedGoldType,
        weight: watchedWeight,
        price: watchedPrice,
        location: selectedCity && selectedDistrict ? `${selectedCity} ${selectedDistrict}` : undefined,
      });

      setValue('content', response.content);
      setSelectedKeywords([]);
    } catch (error: any) {
      alert(error.message || 'AI 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const keywordGroups = getKeywordGroupsByType(selectedType);

  return (
    <div className="min-h-screen bg-white">
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      <div className="container mx-auto px-4 py-8 max-w-[900px]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-8">게시글 작성</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Selection */}
              <div className="form-control">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-3">
                  {(Object.keys(POST_CATEGORY_LABELS) as PostCategory[]).map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                        selectedCategory === category
                          ? 'bg-yellow-400 text-gray-900 border-yellow-500'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {POST_CATEGORY_LABELS[category]}
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register('category')} value={selectedCategory} />
              </div>

              {/* Type Selection */}
              <div className="form-control">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  게시글 타입 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('type')}
                  className={`w-full p-3 rounded-lg border ${
                    errors.type ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value as PostType)}
                >
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {POST_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-2 text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              {/* Title */}
              <div className="form-control">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className={`w-full p-3 rounded-lg border ${
                    errors.title ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                  placeholder="제목을 입력하세요"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div className="form-control">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  이미지 (최대 5장)
                </label>
                <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500">이미지를 업로드하세요</p>
                    <p className="text-xs text-gray-400">
                      {imageFiles.length}/5 업로드됨
                    </p>
                  </div>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isUploading}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content with AI Button */}
              <div className="form-control">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    내용 <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
                    onClick={() => setShowKeywordModal(true)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></span>
                        생성 중...
                      </>
                    ) : (
                      '자동 작성하기'
                    )}
                  </button>
                </div>
                <textarea
                  {...register('content')}
                  className={`w-full p-3 rounded-lg border ${
                    errors.content ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none`}
                  rows={10}
                  placeholder="내용을 입력하세요 (최소 10자)"
                />
                {errors.content && (
                  <p className="mt-2 text-sm text-red-500">{errors.content.message}</p>
                )}
              </div>

              {/* Gold Trade Additional Fields */}
              {selectedCategory === 'gold_trade' && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">금 거래 정보 (선택)</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        금 종류
                      </label>
                      <input
                        type="text"
                        {...register('gold_type')}
                        className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="예: 24K, 18K, 14K"
                      />
                    </div>

                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        중량 (g)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('weight', {
                          setValueAs: (v) => (v === '' || v === null ? undefined : parseFloat(v)),
                        })}
                        className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="예: 18.75"
                      />
                    </div>

                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        가격 (원)
                      </label>
                      <input
                        type="number"
                        {...register('price', {
                          setValueAs: (v) => (v === '' || v === null ? undefined : parseInt(v, 10)),
                        })}
                        className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="예: 3500000"
                      />
                    </div>

                    {/* Location Selection - 금 판매(sell_gold)일 때만 선택 가능 */}
                    {selectedType === 'sell_gold' && (
                      <div className="form-control md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          거래 지역
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {/* 시/도 선택 */}
                          <select
                            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                          >
                            <option value="">시/도 선택</option>
                            {CITY_NAMES.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>

                          {/* 구/군 선택 */}
                          <select
                            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={!selectedCity}
                          >
                            <option value="">구/군 선택</option>
                            {districts.map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                          </select>

                          {/* 동/읍/면 선택 */}
                          <select
                            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                            value={selectedDong}
                            onChange={(e) => setSelectedDong(e.target.value)}
                            disabled={!selectedDistrict}
                          >
                            <option value="">동/읍/면 선택</option>
                            {dongs.map((dong) => (
                              <option key={dong} value={dong}>
                                {dong}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input type="hidden" {...register('location')} />
                      </div>
                    )}

                    {/* buy_gold일 때 매장 주소 표시 */}
                    {selectedType === 'buy_gold' && user.role === 'admin' && (
                      <div className="form-control md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          거래 지역 (매장 주소)
                        </label>
                        <input
                          type="text"
                          {...register('location')}
                          className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                          placeholder="매장 주소가 자동으로 입력됩니다"
                          readOnly
                        />
                        <p className="mt-2 text-xs text-blue-600">
                          매장 정보에 등록된 주소가 자동으로 사용됩니다
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedType === 'buy_gold' && user.role === 'admin' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-blue-600 shrink-0 w-5 h-5 mt-0.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <p className="text-sm text-blue-700">
                        이 글은 귀하의 매장({user.name})으로 자동 등록됩니다.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <button
                  type="button"
                  className="px-4 py-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => navigate('/community')}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={createPost.isPending || isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
                      이미지 업로드 중...
                    </span>
                  ) : createPost.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
                      작성 중...
                    </span>
                  ) : (
                    '게시하기'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Keyword Selection Modal */}
      {showKeywordModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-base-100 pb-4 mb-4 border-b">
              <h3 className="font-bold text-xl mb-2">게시글 주제를 선택해주세요.</h3>
              <p className="text-sm text-gray-500">
                여러 개의 이웃과 이야기를 나눠보세요.
              </p>
              <p className="text-xs text-gray-400 mt-1">최대 5개까지 선택 가능</p>
            </div>

            {/* Keyword Groups */}
            <div className="space-y-6">
              {keywordGroups.map((group) => (
                <div key={group.title}>
                  {/* Group Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{group.icon}</span>
                    <h4 className="font-semibold text-base">{group.title}</h4>
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-2">
                    {group.keywords.map((keyword) => (
                      <button
                        key={keyword.id}
                        type="button"
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedKeywords.includes(keyword.id)
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => toggleKeyword(keyword.id)}
                        disabled={
                          selectedKeywords.length >= 5 &&
                          !selectedKeywords.includes(keyword.id)
                        }
                      >
                        {keyword.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with Selected Count */}
            <div className="sticky bottom-0 bg-base-100 pt-4 mt-6 border-t">
              <div className="text-sm text-gray-500 mb-4 text-center">
                선택된 키워드: <span className="font-semibold">{selectedKeywords.length}</span>/5
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowKeywordModal(false);
                    setSelectedKeywords([]);
                  }}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerateContent}
                  disabled={selectedKeywords.length === 0}
                >
                  자동 작성하기
                </button>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black bg-opacity-50"
            onClick={() => {
              setShowKeywordModal(false);
              setSelectedKeywords([]);
            }}
          ></div>
        </div>
      )}
    </div>
  );
}
