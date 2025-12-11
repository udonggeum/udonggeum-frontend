import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Phone, MapPin, Share2, Heart, Star, Store as StoreIcon, Image as ImageIcon, MessageSquare, Settings, Pencil, Clock } from 'lucide-react';
import {
  Navbar,
  Footer,
  LoadingSpinner,
  ErrorAlert,
  StoreEditModal,
} from '@/components';
import type { StoreEditType } from '@/components/modals/StoreEditModal';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import { useStoreDetail, useUpdateStore } from '@/hooks/queries/useStoresQueries';
import {
  useStoreReviews,
  useStoreStatistics,
  useStoreGallery,
} from '@/hooks/queries/useReviewQueries';
import { usePosts } from '@/hooks/queries/useCommunityQueries';
import { useAuthStore } from '@/stores/useAuthStore';
import { getStoreStatus } from '@/utils/storeStatus';

type TabType = 'news' | 'reviews' | 'gallery';
type EditSections = { name: boolean; description: boolean; address: boolean; phone: boolean; hours: boolean };

export default function StoreDetailPage() {
  const { storeId: storeIdParam } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('news');
  const [imageError, setImageError] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditType, setCurrentEditType] = useState<StoreEditType | null>(null);
  const [isAllEditMode, setIsAllEditMode] = useState(false);
  const [editSections, setEditSections] = useState<EditSections>({
    name: false,
    description: false,
    address: false,
    phone: false,
    hours: false,
  });

  // 인라인 편집용 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone_number: '',
    open_time: '',
    close_time: '',
  });

  const storeId = Number(storeIdParam);
  const isValidId = !Number.isNaN(storeId) && storeId > 0;

  // Mutation
  const { mutate: updateStore, isPending: isUpdating } = useUpdateStore();

  // 데이터 조회
  const {
    data: store,
    isLoading: storeLoading,
    error: storeError,
  } = useStoreDetail(storeId, false, { enabled: isValidId });

  const { data: stats } = useStoreStatistics(storeId);

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

  // 매장 데이터가 로드되면 폼 데이터 초기화
  React.useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || '',
        description: store.description || '',
        address: store.address || '',
        phone_number: store.phone_number || store.phone || '',
        open_time: store.open_time || '',
        close_time: store.close_time || '',
      });
    }
  }, [store]);

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

  // 본인 매장 여부 확인
  const isMyStore = user?.id === store.user_id;
  const isAnyEditing = Object.values(editSections).some(Boolean);
  const isAllEditing = Object.values(editSections).every(Boolean);
  const isImageEditing = editModalOpen && currentEditType === 'image';
  const { statusLabel, statusClass } = getStoreStatus(store.open_time, store.close_time);

  // 수정 모달 열기
  const openEditModal = (editType: StoreEditType) => {
    setCurrentEditType(editType);
    setEditModalOpen(true);
  };

  // 수정 모달 닫기
  const closeEditModal = () => {
    setEditModalOpen(false);
    setCurrentEditType(null);
  };

  // 매장 정보 저장 (모달용 - tags, image)
  const handleSaveStore = (data: any) => {
    updateStore(
      { id: storeId, data },
      {
        onSuccess: () => {
          closeEditModal();
          if (data.image_url) {
            setImageError(false);
          }
        },
        onError: (error) => {
          console.error('매장 정보 수정 실패:', error);
          alert(`수정 실패: ${error.message}`);
        },
      }
    );
  };

  const syncFormDataWithStore = () => {
    setFormData({
      name: store.name || '',
      description: store.description || '',
      address: store.address || '',
      phone_number: store.phone_number || store.phone || '',
      open_time: store.open_time || '',
      close_time: store.close_time || '',
    });
  };

  const handleStartSectionEdit = (section: keyof EditSections) => {
    setIsAllEditMode(false);
    setEditSections((prev) => ({ ...prev, [section]: true }));
  };

  const handleCancelSectionEdit = (section: keyof EditSections) => {
    const updated = { ...editSections, [section]: false };
    setEditSections(updated);

    setFormData((prev) => {
      if (section === 'name') {
        return { ...prev, name: store.name || '' };
      }
      if (section === 'description') {
        return { ...prev, description: store.description || '' };
      }
      if (section === 'address') {
        return { ...prev, address: store.address || '' };
      }
      if (section === 'phone') {
        return { ...prev, phone_number: store.phone_number || store.phone || '' };
      }
      if (section === 'hours') {
        return { ...prev, open_time: store.open_time || '', close_time: store.close_time || '' };
      }
      return prev;
    });

    if (!Object.values(updated).some(Boolean)) {
      setIsAllEditMode(false);
    }
  };

  const handleSaveSection = (section: keyof EditSections) => {
    let dataToSave: any = {};

    if (section === 'name') {
      dataToSave = { name: formData.name };
    } else if (section === 'description') {
      dataToSave = { description: formData.description };
    } else if (section === 'address') {
      dataToSave = { address: formData.address };
    } else if (section === 'phone') {
      dataToSave = { phone: formData.phone_number, phone_number: formData.phone_number };
    } else if (section === 'hours') {
      dataToSave = { open_time: formData.open_time, close_time: formData.close_time };
    }

    if (Object.keys(dataToSave).length === 0) {
      return;
    }

    updateStore(
      { id: storeId, data: dataToSave },
      {
        onSuccess: () => {
          const updated = { ...editSections, [section]: false };
          setEditSections(updated);
          if (!Object.values(updated).some(Boolean)) {
            setIsAllEditMode(false);
          }
        },
        onError: (error) => {
          console.error('매장 정보 수정 실패:', error);
          alert(`수정 실패: ${error.message}`);
        },
      }
    );
  };

  const handleToggleAllEdit = () => {
    if (isAnyEditing) {
      syncFormDataWithStore();
      setEditSections({ name: false, description: false, address: false, phone: false, hours: false });
      setIsAllEditMode(false);
    } else {
      setEditSections({ name: true, description: true, address: true, phone: true, hours: true });
      setIsAllEditMode(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      {/* 커버 이미지 */}
      <div className="relative h-[280px] w-full overflow-hidden bg-gradient-to-br from-black-50 via-black-100 to-yellow-100">
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1" fill="#2e2b29ff" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* 매장 메인 정보 (커버와 겹치게) */}
      <div className="relative z-10 -mt-20 max-w-[1080px] mx-auto px-5 w-full">
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-5">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 매장 이미지 */}
            <div
              className={`w-32 h-32 bg-white border border-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                isMyStore ? 'group relative' : ''
              }`}
            >
              {store.image_url && !imageError ? (
                <img
                  src={store.image_url}
                  alt={store.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover transition-all"
                />
              ) : (
                <StoreIcon className="w-16 h-16 text-white transition-all" />
              )}
              {isMyStore && (
                <button
                  onClick={() => openEditModal('image')}
                  className={`absolute inset-0 flex items-center justify-center transition-all ${
                    isImageEditing
                      ? 'bg-white/40 backdrop-blur-sm opacity-100 pointer-events-none'
                    : isAllEditMode || isAllEditing
                      ? 'bg-white/50 backdrop-blur-[1px] opacity-100'
                      : 'bg-white/50 backdrop-blur-[1px] opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Pencil className="w-6 h-6 text-white drop-shadow-lg" />
                </button>
              )}
            </div>

              {/* 매장 정보 */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`inline-flex items-center gap-2 ${
                          isMyStore && editSections.name
                            ? 'bg-yellow-50 border-2 border-yellow-200 px-3 py-2 rounded-lg'
                            : isMyStore
                            ? 'group px-3 py-2 rounded-lg hover:bg-gray-50'
                            : ''
                        }`}
                      >
                        {isMyStore && editSections.name ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="text-[28px] font-bold text-gray-900 bg-transparent border-none outline-none w-full min-w-[200px]"
                            placeholder="매장 이름"
                          />
                        ) : (
                          <h1 className="text-[28px] font-bold text-gray-900">{store.name}</h1>
                        )}
                        {isMyStore && !editSections.name && (
                          <button
                            onClick={() => handleStartSectionEdit('name')}
                            className="transition-opacity p-1.5 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                    </div>
                  </div>
                  {stats && (
                    <div className="flex items-center gap-3 text-[15px] px-2">
                      <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                        <Star className="w-5 h-5 fill-current" />
                        {stats.average_rating.toFixed(1)}
                      </span>
                      <span className="text-gray-300">|</span>
                      <Link
                        to="#reviews"
                        onClick={() => setActiveTab('reviews')}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        리뷰 {stats.review_count}개
                      </Link>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600">방문자리뷰 {stats.visitor_review_count}</span>
                    </div>
                  )}
                </div>
                {isMyStore ? (
                  <button
                    onClick={handleToggleAllEdit}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                      isAnyEditing
                        ? 'bg-gray-900 hover:bg-gray-800 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-[14px] font-semibold">
                      {isAllEditMode || isAllEditing
                        ? '전체 편집 종료'
                        : isAnyEditing
                        ? '편집 종료'
                        : '전체 편집'}
                    </span>
                  </button>
                ) : (
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-[14px] font-semibold text-gray-900">찜하기</span>
                  </button>
                )}
              </div>

              {/* 한줄 소개 */}
              {(store.description || isMyStore) && (
                <div
                  className={`mb-1 p-3 rounded-lg transition-all ${
                    isMyStore && editSections.description
                      ? 'bg-yellow-50 border-2 border-yellow-200'
                      : isMyStore
                      ? 'group hover:bg-gray-50'
                      : ''
                  }`}
                >
                <div className="flex items-start gap-2.5">
                    <div className="flex-1">
                      {isMyStore && editSections.description ? (
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full text-[15px] leading-relaxed text-gray-600 bg-transparent border-none outline-none resize-none"
                          placeholder="한줄로 매장을 소개해주세요"
                          rows={2}
                        />
                      ) : (
                        <p
                          className={`text-[15px] leading-relaxed ${
                            store.description ? 'text-gray-600' : 'text-gray-400 italic'
                          }`}
                        >
                          {store.description || '한줄 소개를 입력해주세요'}
                        </p>
                      )}
                    </div>
                    {isMyStore && !editSections.description && (
                      <button
                        onClick={() => handleStartSectionEdit('description')}
                        className="transition-opacity p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <Pencil className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                  {isMyStore && editSections.description && (
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => handleCancelSectionEdit('description')}
                        className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 text-[13px] font-semibold rounded-lg border border-gray-200 transition-colors"
                        disabled={isUpdating}
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleSaveSection('description')}
                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-50"
                        disabled={isUpdating}
                      >
                        {isUpdating ? '저장 중...' : '저장'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 매장 태그 */}
              <div
                className={`p-3 rounded-lg mb-1 transition-all ${
                  isMyStore && (isAllEditMode || isAllEditing)
                    ? 'bg-yellow-50 border-2 border-yellow-200'
                    : isMyStore
                    ? 'group hover:bg-gray-50'
                    : ''
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {store.tags && store.tags.length > 0 ? (
                        store.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 bg-yellow-50 text-yellow-800 text-[13px] font-medium rounded-full border border-yellow-200"
                          >
                            {tag}
                          </span>
                        ))
                      ) : isMyStore ? (
                        <span className="px-3 py-1.5 text-gray-400 text-[13px] italic">
                          매장 태그를 선택해주세요
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {isMyStore && (
                    <button
                      onClick={() => openEditModal('tags')}
                      className={`transition-opacity p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0 ${
                        isAllEditMode || isAllEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* 빠른 액션 버튼 */}
              <div className="flex gap-3">
                {store.phone_number && (
                  <a
                    href={`tel:${store.phone_number.replace(/[^0-9]/g, '')}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-semibold rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    상담하기
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
                {activeTab === 'news' && <StoreNewsTab feedData={feedData} isLoading={feedLoading} />}
                {activeTab === 'reviews' && (
                  <ReviewsTab reviewsData={reviewsData} isLoading={reviewsLoading} />
                )}
                {activeTab === 'gallery' && (
                  <GalleryTab galleryData={galleryData} isLoading={galleryLoading} />
                )}
              </div>
            </div>
          </div>

          {/* 우측: 사이드바 */}
          <div className="lg:col-span-1">
            <StoreSidebar
              store={store}
              isMyStore={isMyStore}
              editSections={editSections}
              formData={formData}
              setFormData={setFormData}
              onStartEdit={handleStartSectionEdit}
              onCancelEdit={handleCancelSectionEdit}
              onSaveEdit={handleSaveSection}
              isUpdating={isUpdating}
              statusLabel={statusLabel}
              statusClass={statusClass}
            />
          </div>
        </div>
      </div>

      <Footer />

      {/* 수정 모달 (tags, image만) */}
      {editModalOpen && currentEditType && (
        <StoreEditModal
          store={store}
          editType={currentEditType}
          isOpen={editModalOpen}
          onClose={closeEditModal}
          onSave={handleSaveStore}
          isSaving={isUpdating}
        />
      )}
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
                    {post.category === 'gold_trade'
                      ? '금거래'
                      : post.category === 'gold_news'
                      ? '금소식'
                      : 'QnA'}
                  </span>
                  {post.type && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded">
                      {post.type === 'buy_gold'
                        ? '매입'
                        : post.type === 'product_news'
                        ? '상품소식'
                        : post.type === 'store_news'
                        ? '매장소식'
                        : post.type === 'other'
                        ? '기타'
                        : post.type}
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
                      day: 'numeric',
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
}: {
  reviewsData: any;
  isLoading: boolean;
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
                <div className="text-[15px] font-semibold text-gray-900">
                  {review.user?.name || '익명'}
                </div>
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
                    <span
                      className={`px-2 py-1 text-[11px] font-semibold rounded ${
                        selectedImage.source_type === 'community'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
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
function StoreSidebar({
  store,
  isMyStore,
  editSections,
  formData,
  setFormData,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  isUpdating,
  statusLabel,
  statusClass,
}: {
  store: any;
  isMyStore: boolean;
  editSections: EditSections;
  formData: { name: string; description: string; address: string; phone_number: string; open_time: string; close_time: string };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      address: string;
      phone_number: string;
      open_time: string;
      close_time: string;
    }>
  >;
  onStartEdit: (section: keyof EditSections) => void;
  onCancelEdit: (section: keyof EditSections) => void;
  onSaveEdit: (section: keyof EditSections) => void;
  isUpdating: boolean;
  statusLabel: string;
  statusClass: string;
}) {
  return (
    <div className="sticky top-[180px] space-y-4">
      {/* 매장 정보 카드 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[16px] font-bold text-gray-900">매장 정보</h3>
          <span className={`px-2.5 py-1 text-[12px] font-semibold rounded-full ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
        <div className="space-y-3 text-[14px]">
          {(store.address || isMyStore) && (
            <div
              className={`p-3 rounded-lg transition-all ${
                isMyStore && editSections.address
                  ? 'bg-yellow-50 border-2 border-yellow-200'
                  : 'bg-gray-50 border border-gray-100'
              } ${
                isMyStore && !editSections.address ? 'group hover:bg-gray-100' : ''
              }`}
            >
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  {isMyStore && editSections.address ? (
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full text-[14px] text-gray-600 bg-transparent border-none outline-none"
                      placeholder="매장 주소를 입력해주세요"
                    />
                  ) : (
                    <div className={store.address ? 'text-gray-600' : 'text-gray-400 italic'}>
                      {store.address || '매장 주소를 입력해주세요'}
                    </div>
                  )}
                </div>
                {isMyStore && !editSections.address && (
                  <button
                    onClick={() => onStartEdit('address')}
                    className="transition-opacity p-1.5 hover:bg-gray-100 rounded-lg self-start flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
              {isMyStore && editSections.address && (
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => onCancelEdit('address')}
                    className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-900 text-[13px] font-semibold rounded-lg border border-gray-200 transition-colors"
                    disabled={isUpdating}
                  >
                    취소
                  </button>
                  <button
                    onClick={() => onSaveEdit('address')}
                    className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-50"
                    disabled={isUpdating}
                  >
                    {isUpdating ? '저장 중...' : '저장'}
                  </button>
                </div>
              )}
            </div>
          )}
          {(store.phone_number || isMyStore) && (
            <div
              className={`p-3 rounded-lg transition-all ${
                isMyStore && editSections.phone
                  ? 'bg-yellow-50 border-2 border-yellow-200'
                  : 'bg-gray-50 border border-gray-100'
              } ${
                isMyStore && !editSections.phone ? 'group hover:bg-gray-100' : ''
              }`}
            >
              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  {isMyStore && editSections.phone ? (
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full text-[14px] text-gray-600 bg-transparent border-none outline-none"
                      placeholder="전화번호를 입력해주세요"
                    />
                  ) : store.phone_number ? (
                    <a href={`tel:${store.phone_number}`} className="text-blue-600 hover:underline">
                      {store.phone_number}
                    </a>
                  ) : (
                    <div className="text-gray-400 italic">전화번호를 입력해주세요</div>
                  )}
                </div>
                {isMyStore && !editSections.phone && (
                  <button
                    onClick={() => onStartEdit('phone')}
                    className="transition-opacity p-1.5 hover:bg-gray-100 rounded-lg self-start flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
              {isMyStore && editSections.phone && (
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => onCancelEdit('phone')}
                    className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-900 text-[13px] font-semibold rounded-lg border border-gray-200 transition-colors"
                    disabled={isUpdating}
                  >
                    취소
                  </button>
                  <button
                    onClick={() => onSaveEdit('phone')}
                    className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-50"
                    disabled={isUpdating}
                  >
                    {isUpdating ? '저장 중...' : '저장'}
                  </button>
                </div>
              )}
            </div>
          )}
          {(store.open_time || store.close_time || isMyStore) && (
            <div
              className={`p-3 rounded-lg transition-all ${
                isMyStore && editSections.hours
                  ? 'bg-yellow-50 border-2 border-yellow-200'
                  : 'bg-gray-50 border border-gray-100'
              } ${
                isMyStore && !editSections.hours ? 'group hover:bg-gray-100' : ''
              }`}
            >
              <div className="flex gap-3 items-center">
                <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  {isMyStore && editSections.hours ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="time"
                        value={formData.open_time}
                        onChange={(e) => setFormData({ ...formData, open_time: e.target.value })}
                        className="flex-1 basis-0 min-w-[140px] text-[14px] leading-none text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      />
                      <span className="text-gray-500 text-sm flex items-center">-</span>
                      <input
                        type="time"
                        value={formData.close_time}
                        onChange={(e) => setFormData({ ...formData, close_time: e.target.value })}
                        className="flex-1 basis-0 min-w-[140px] text-[14px] leading-none text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      />
                    </div>
                  ) : (
                    <div className="text-[14px] text-gray-900 font-medium">
                      {(store.open_time || formData.open_time || '--:--') +
                        ' - ' +
                        (store.close_time || formData.close_time || '--:--')}
                    </div>
                  )}
                </div>
                {isMyStore && !editSections.hours && (
                  <button
                    onClick={() => onStartEdit('hours')}
                    className="transition-opacity p-1.5 hover:bg-gray-100 rounded-lg self-start flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
              {isMyStore && editSections.hours && (
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => onCancelEdit('hours')}
                    className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-900 text-[13px] font-semibold rounded-lg border border-gray-200 transition-colors"
                    disabled={isUpdating}
                  >
                    취소
                  </button>
                  <button
                    onClick={() => onSaveEdit('hours')}
                    className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-50"
                    disabled={isUpdating}
                  >
                    {isUpdating ? '저장 중...' : '저장'}
                  </button>
                </div>
              )}
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
