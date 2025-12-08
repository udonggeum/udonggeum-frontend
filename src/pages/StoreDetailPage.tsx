import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Phone,
  MapPin,
  Share2,
  Heart,
  Star,
  ArrowLeft,
  Store as StoreIcon,
  Image as ImageIcon,
  MessageSquare,
  Info,
} from 'lucide-react';
import {
  Navbar,
  Footer,
  LoadingSpinner,
  ErrorAlert,
} from '@/components';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import { useStoreDetail } from '@/hooks/queries/useStoresQueries';
import {
  useStoreReviews,
  useStoreStatistics,
  useStoreGallery,
} from '@/hooks/queries/useReviewQueries';
import { usePosts } from '@/hooks/queries/useCommunityQueries';

type TabType = 'news' | 'reviews' | 'gallery';

export default function StoreDetailPage() {
  const { storeId: storeIdParam } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('news');

  const storeId = Number(storeIdParam);
  const isValidId = !Number.isNaN(storeId) && storeId > 0;

  // 데이터 조회
  const {
    data: store,
    isLoading: storeLoading,
    error: storeError,
  } = useStoreDetail(storeId, false, { enabled: isValidId });

  const {
    data: stats,
    isLoading: statsLoading,
  } = useStoreStatistics(storeId);

  const {
    data: feedData,
    isLoading: feedLoading,
  } = usePosts({
    store_id: storeId,
    page: 1,
    page_size: 10,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useStoreReviews(storeId, {
    page: 1,
    page_size: 10,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const {
    data: galleryData,
    isLoading: galleryLoading,
  } = useStoreGallery(storeId, {
    page: 1,
    page_size: 20,
  });

  if (!isValidId) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar navigationItems={NAVIGATION_ITEMS} />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16">
            <ErrorAlert
              title="잘못된 접근입니다"
              message="유효하지 않은 매장 ID입니다."
              onRetry={() => navigate('/stores')}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (storeLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar navigationItems={NAVIGATION_ITEMS} />
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner message="매장 정보를 불러오는 중..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar navigationItems={NAVIGATION_ITEMS} />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16">
            <ErrorAlert
              title="매장을 불러오지 못했습니다"
              message={storeError instanceof Error ? storeError.message : '알 수 없는 오류가 발생했습니다.'}
              onRetry={() => window.location.reload()}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      {/* 커버 이미지 */}
      <div className="relative h-[280px] w-full overflow-hidden bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200">
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1" fill="#D4AF37" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* 매장 메인 정보 (커버와 겹치게) */}
      <div className="relative z-10 -mt-20 max-w-[1080px] mx-auto px-5 w-full">
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 매장 아이콘 */}
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <StoreIcon className="w-16 h-16 text-white" />
            </div>

            {/* 매장 정보 */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-[28px] font-bold text-gray-900">{store.name}</h1>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[13px] font-semibold rounded-full">
                      영업중
                    </span>
                  </div>
                  {stats && (
                    <div className="flex items-center gap-3 text-[15px]">
                      <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                        <Star className="w-5 h-5 fill-current" />
                        {stats.average_rating.toFixed(1)}
                      </span>
                      <span className="text-gray-300">|</span>
                      <Link to="#reviews" onClick={() => setActiveTab('reviews')} className="text-gray-600 hover:text-gray-900">
                        리뷰 {stats.review_count}개
                      </Link>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600">방문자리뷰 {stats.visitor_review_count}</span>
                    </div>
                  )}
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-[14px] font-semibold text-gray-900">찜하기</span>
                </button>
              </div>

              {/* 한줄 소개 */}
              {store.description && (
                <p className="text-[15px] text-gray-600 mb-4 leading-relaxed">
                  {store.description}
                </p>
              )}

              {/* 태그 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {store.buying_gold && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[13px] font-medium rounded-lg">
                    금 매입
                  </span>
                )}
                {store.buying_platinum && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[13px] font-medium rounded-lg">
                    백금 매입
                  </span>
                )}
                {store.buying_silver && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[13px] font-medium rounded-lg">
                    은 매입
                  </span>
                )}
              </div>

              {/* 빠른 액션 버튼 */}
              <div className="flex gap-3">
                {store.phone_number && (
                  <a
                    href={`tel:${store.phone_number.replace(/[^0-9]/g, '')}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-semibold rounded-xl transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    전화하기
                  </a>
                )}
                {store.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 text-[15px] font-semibold rounded-xl transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    길찾기
                  </a>
                )}
                <button className="flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 text-[15px] font-semibold rounded-xl transition-colors">
                  <Share2 className="w-5 h-5" />
                  공유
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-[1080px] mx-auto px-5 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 메인 컨텐츠 */}
          <div className="lg:col-span-2">
            {/* 탭 네비게이션 + 콘텐츠를 하나의 카드로 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* 탭 네비게이션 */}
              <nav className="border-b border-gray-100 px-6 flex items-center gap-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('news')}
                  className={`relative py-4 text-[15px] font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'news'
                      ? 'text-gray-900 font-semibold after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  매장 소식
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`relative py-4 text-[15px] font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-gray-900 font-semibold after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  리뷰
                </button>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`relative py-4 text-[15px] font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'gallery'
                      ? 'text-gray-900 font-semibold after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  갤러리
                </button>
              </nav>

              {/* 탭 콘텐츠 */}
              <div className="p-6">
                {activeTab === 'news' && (
                  <StoreNewsTab
                    feedData={feedData}
                    isLoading={feedLoading}
                  />
                )}
                {activeTab === 'reviews' && (
                  <ReviewsTab
                    reviewsData={reviewsData}
                    isLoading={reviewsLoading}
                    storeId={storeId}
                  />
                )}
                {activeTab === 'gallery' && (
                  <GalleryTab
                    galleryData={galleryData}
                    isLoading={galleryLoading}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 우측: 사이드바 */}
          <div className="lg:col-span-1">
            <StoreSidebar store={store} stats={stats} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// 매장 소식 탭 컴포넌트
function StoreNewsTab({
  feedData,
  isLoading,
}: {
  feedData: any;
  isLoading: boolean;
}) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner message="매장 소식을 불러오는 중..." />
      </div>
    );
  }

  if (!feedData || feedData.data.length === 0) {
    return (
      <div className="p-12 text-center">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">아직 등록된 소식이 없습니다.</p>
        <p className="text-[13px] text-gray-400">매장에서 작성한 공지사항, 이벤트, 소식 등이 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedData.data.map((post: any) => (
        <article
          key={post.id}
          className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-300 transition-all hover:shadow-md cursor-pointer"
          onClick={() => navigate(`/community/${post.id}`)}
        >
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-[12px] font-semibold rounded-full border border-yellow-200">
                    {post.category === 'gold_trade' ? '금거래' : post.category === 'gold_news' ? '금소식' : 'QnA'}
                  </span>
                  {post.type && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded">
                      {post.type === 'buy_gold' ? '매입' : post.type === 'news' ? '뉴스' : post.type}
                    </span>
                  )}
                </div>
                <h2 className="text-[18px] font-bold text-gray-900 mb-2 line-clamp-1">{post.title}</h2>
                <p className="text-[14px] text-gray-600 leading-relaxed line-clamp-2 mb-3">
                  {post.content}
                </p>

                {/* 이미지가 있는 경우 표시 */}
                {post.image_urls && post.image_urls.length > 0 && (
                  <div className="mt-3 mb-3">
                    <img
                      src={post.image_urls[0]}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 text-[13px] text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    {post.comment_count}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    {post.like_count}
                  </span>
                  <span className="text-[12px]">
                    {new Date(post.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

// 리뷰 탭 컴포넌트
function ReviewsTab({
  reviewsData,
  isLoading,
  storeId,
}: {
  reviewsData: any;
  isLoading: boolean;
  storeId: number;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner message="리뷰를 불러오는 중..." />
      </div>
    );
  }

  if (!reviewsData || reviewsData.data.length === 0) {
    return (
      <div className="p-12 text-center">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">아직 작성된 리뷰가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviewsData.data.map((review: any) => (
        <div key={review.id} className="border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-[12px] font-bold text-blue-700">
                {review.user?.name?.charAt(0) || '?'}
              </div>
              <div>
                <div className="text-[15px] font-semibold text-gray-900">{review.user?.name || '익명'}</div>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-500">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[13px] text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
            {review.is_visitor && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-[11px] font-semibold rounded">
                방문자
              </span>
            )}
          </div>
          <p className="text-[14px] text-gray-700 leading-relaxed">{review.content}</p>
          {review.image_urls && review.image_urls.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {review.image_urls.map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt={`리뷰 이미지 ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-3 text-[13px] text-gray-500">
            <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
              <span>좋아요 {review.like_count}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// 갤러리 탭 컴포넌트
function GalleryTab({
  galleryData,
  isLoading,
}: {
  galleryData: any;
  isLoading: boolean;
}) {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = React.useState<any | null>(null);

  // Debug: 데이터 확인
  React.useEffect(() => {
    if (galleryData) {
      console.log('Gallery Data:', galleryData);
      console.log('Gallery Images:', galleryData.data);
    }
  }, [galleryData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner message="갤러리를 불러오는 중..." />
      </div>
    );
  }

  if (!galleryData || !galleryData.data || galleryData.data.length === 0) {
    console.log('No gallery data:', galleryData);
    return (
      <div className="p-12 text-center">
        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">아직 등록된 사진이 없습니다.</p>
        <p className="text-[13px] text-gray-400 mt-2">
          데이터: {galleryData ? JSON.stringify(galleryData) : 'null'}
        </p>
      </div>
    );
  }

  const handleImageClick = (image: any) => {
    setSelectedImage(image);
  };

  const handleViewPost = (image: any) => {
    if (image.source_type === 'community') {
      navigate(`/community/${image.post_id}`);
    }
    setSelectedImage(null);
  };

  return (
    <>
      {/* 인스타그램 스타일 그리드 */}
      <div className="grid grid-cols-3 gap-1 -m-6">
        {galleryData.data.map((image: any, index: number) => (
          <div
            key={`${image.post_id}-${image.source_type}-${index}`}
            className="aspect-square overflow-hidden bg-gray-200 cursor-pointer group relative"
            onClick={() => handleImageClick(image)}
          >
            <img
              src={image.image_url}
              alt={image.caption}
              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 text-white" />
                <span className="text-white text-[11px] font-medium px-2 py-1 bg-black bg-opacity-50 rounded">
                  {image.source_type === 'community' ? '매장 소식' : '리뷰'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 이미지 상세 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* 이미지 */}
              <div className="bg-gray-900 flex items-center justify-center min-h-[400px]">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.caption}
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              </div>

              {/* 정보 */}
              <div className="p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[18px] font-bold text-gray-900">이미지 정보</h3>
                    <span className={`px-2 py-1 text-[11px] font-semibold rounded ${
                      selectedImage.source_type === 'community'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedImage.source_type === 'community' ? '매장 소식' : '리뷰'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <span className="text-gray-500 text-[20px]">×</span>
                  </button>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <div className="text-[13px] text-gray-500 mb-1">작성자</div>
                    <p className="text-[15px] text-gray-900">{selectedImage.author_name}</p>
                  </div>

                  <div>
                    <div className="text-[13px] text-gray-500 mb-1">설명</div>
                    <p className="text-[15px] text-gray-900">{selectedImage.caption}</p>
                  </div>

                  {selectedImage.source_type === 'review' && selectedImage.rating && (
                    <div>
                      <div className="text-[13px] text-gray-500 mb-1">평점</div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: selectedImage.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-[13px] text-gray-500 mb-1">게시 날짜</div>
                    <p className="text-[15px] text-gray-900">
                      {new Date(selectedImage.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100 space-y-2">
                  {selectedImage.source_type === 'community' && (
                    <button
                      onClick={() => handleViewPost(selectedImage)}
                      className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      게시글 보기
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 사이드바 컴포넌트
function StoreSidebar({ store, stats }: { store: any; stats: any }) {
  return (
    <div className="sticky top-[180px] space-y-4">
      {/* 매장 정보 카드 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-[16px] font-bold text-gray-900 mb-4">매장 정보</h3>
        <div className="space-y-3 text-[14px]">
          {store.address && (
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-gray-900 font-medium mb-1">주소</div>
                <div className="text-gray-600">{store.address}</div>
              </div>
            </div>
          )}
          {store.phone_number && (
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-gray-900 font-medium mb-1">전화번호</div>
                <a href={`tel:${store.phone_number}`} className="text-blue-600 hover:underline">
                  {store.phone_number}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 지도 미리보기 */}
      {store.address && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-blue-600 hover:underline"
              >
                지도 보기
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
