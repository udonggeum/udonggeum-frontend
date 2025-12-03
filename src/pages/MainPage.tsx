import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  TrendingUp,
  MapPin,
  Store,
  Heart,
  Tag,
  FileText,
  Menu,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useLatestGoldPrices } from '@/hooks/queries/useGoldPricesQueries';

/**
 * MainPage Component (Renewed)
 *
 * "매장을 발견하는 플랫폼" - 네이버 지도 + 배민 상점프로필 컨셉
 *
 * Sections:
 * 1. Hero Section with Real-time Price Badge + Search Bar
 * 2. Quick Menu Grid (8 icons)
 * 3. Real-time Gold Price Cards (24K/18K/14K/Platinum)
 * 4. Nearby Stores Section
 * 5. CTA Banner for Store Owners
 */
export default function MainPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');

  // 백엔드에서 실시간 금시세 가져오기
  const { data: pricesData, isLoading: isPricesLoading } = useLatestGoldPrices();

  // Redirect admin users to dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      void navigate('/seller/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      void navigate(`/stores?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const popularSearches = ['강남', '종로', '24K 반지', '금목걸이'];

  // 백엔드 데이터를 UI 형식으로 변환
  const goldPrices = useMemo(() => {
    if (!pricesData) {
      // 로딩 중이거나 에러 시 빈 배열
      return [];
    }

    // 정렬 순서 정의: 24K > 18K > 14K > Platinum
    const typeOrder: Record<string, number> = {
      '24K': 1,
      '18K': 2,
      '14K': 3,
      'Platinum': 4,
    };

    return pricesData
      .map((price) => {
        const isGold = price.type !== 'Platinum';
        // Mock 변동률 (백엔드에서 제공 예정)
        const mockChange = price.type === '24K' ? -1000 : price.type === '18K' ? 500 : price.type === '14K' ? 0 : 2000;
        const mockPercent = price.type === '24K' ? -0.22 : price.type === '18K' ? 0.15 : price.type === '14K' ? 0 : 1.28;

        return {
          id: price.type.toLowerCase(),
          name: price.type === '24K' ? '순금' : price.type === '18K' ? '18K금' : price.type === '14K' ? '14K금' : '백금',
          karat: price.type === 'Platinum' ? 'Pt' : price.type,
          type: price.type, // 라우팅용
          price: Math.round(price.sell_price), // 소수점 제거
          change: mockChange,
          changePercent: mockPercent,
          badgeBg: isGold ? 'bg-yellow-100' : 'bg-gray-100',
          badgeText: isGold ? 'text-yellow-700' : 'text-gray-700',
          sortOrder: typeOrder[price.type] || 99,
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder); // 정렬
  }, [pricesData]);

  // Mock data for nearby stores
  const nearbyStores = [
    {
      id: 1,
      name: '강남금은방',
      address: '강남구 테헤란로 123',
      rating: 4.8,
      reviewCount: 128,
      distance: '350m',
      isOpen: true,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      id: 2,
      name: '종로주얼리',
      address: '강남구 역삼동 456',
      rating: 4.9,
      reviewCount: 89,
      distance: '520m',
      isOpen: true,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 3,
      name: '다이아몬드하우스',
      address: '강남구 선릉로 789',
      rating: 4.7,
      reviewCount: 256,
      distance: '1.2km',
      isOpen: false,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  const quickMenuItems = [
    {
      icon: TrendingUp,
      label: '금시세',
      path: '/price',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      icon: MapPin,
      label: '내주변',
      path: '/stores',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Store,
      label: '매장찾기',
      path: '/stores',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      icon: Heart,
      label: '찜목록',
      path: '/wishlist',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
    },
    {
      icon: Tag,
      label: '이벤트',
      path: '/products',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      icon: FileText,
      label: '주문내역',
      path: '/orders',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
    {
      icon: Menu,
      label: '전체메뉴',
      path: '/products',
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - 토스 스타일 대담한 타이포그래피 */}
      <section className="pt-16 pb-20 px-5 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1200px] mx-auto">
          {/* 실시간 시세 배너 - 크림 스타일 */}
          {isPricesLoading ? (
            <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-white rounded-full border border-gray-200 mb-8">
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : goldPrices.length > 0 ? (
            <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-white rounded-full border border-gray-200 mb-8">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[13px] font-medium text-gray-500">실시간</span>
              </span>
              <span className="text-[13px] text-gray-300">|</span>
              <span className="text-[14px] font-semibold text-gray-900">24K 금 시세</span>
              <span className="text-[15px] font-bold text-gray-900">
                {goldPrices[0].price.toLocaleString()}원
              </span>
              {goldPrices[0].change !== 0 && (
                <span className={`flex items-center text-[13px] font-semibold ${
                  goldPrices[0].change > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {goldPrices[0].change > 0 ? (
                    <ChevronUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ChevronDown className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(goldPrices[0].change).toLocaleString()}
                </span>
              )}
            </div>
          ) : null}

          {/* 히어로 텍스트 */}
          <div className="mb-12">
            <h1 className="text-[40px] md:text-[52px] font-bold leading-[1.2] tracking-[-0.02em] text-gray-900 mb-5">
              투명한 금 거래,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">
                쉽고 빠르게
              </span>
            </h1>
            <p className="text-[17px] md:text-[19px] text-gray-500 leading-relaxed font-normal">
              내 주변 금은방의 실시간 시세와 매장 정보를<br className="hidden md:block" />
              한 곳에서 비교하고 확인하세요
            </p>
          </div>

          {/* 검색바 - 당근/오늘의집 스타일 */}
          <form onSubmit={handleSearch}>
            <div className="max-w-[580px] bg-white border-2 border-gray-200 rounded-2xl p-1.5 flex items-center transition-all duration-200 hover:border-gray-300 focus-within:border-gray-900">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="지역, 매장명을 검색해보세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-3 text-[15px] text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-semibold rounded-xl transition-all duration-200"
              >
                검색
              </button>
            </div>
          </form>

          {/* 인기 검색어 - 당근 스타일 */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-[13px] text-gray-400">인기</span>
            {popularSearches.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => {
                  setSearchQuery(keyword);
                  void navigate(`/stores?search=${encodeURIComponent(keyword)}`);
                }}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[13px] text-gray-600 transition-colors duration-200"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 빠른 메뉴 - 당근/토스 스타일 아이콘 그리드 */}
      <section className="py-12 px-5">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
            {quickMenuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-200"
              >
                <div
                  className={`w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
                >
                  <item.icon className={`w-7 h-7 ${item.iconColor}`} strokeWidth={1.5} />
                </div>
                <span className="text-[13px] font-medium text-gray-700 text-center">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 실시간 시세 섹션 - 크림/무신사 스타일 */}
      <section className="py-12 px-5 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[22px] font-bold text-gray-900 mb-1">실시간 금 시세</h2>
              <p className="text-[14px] text-gray-500">1분마다 업데이트됩니다</p>
            </div>
            <Link
              to="/price"
              className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 flex items-center gap-1"
            >
              전체보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isPricesLoading ? (
              // 로딩 스켈레톤
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white p-5 rounded-2xl shadow-sm animate-pulse">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-24 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : (
              goldPrices.map((item) => (
                <Link
                  key={item.id}
                  to={`/price?type=${item.type}`}
                  className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
                >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 ${item.badgeBg} rounded-lg flex items-center justify-center`}>
                    <span className={`text-[12px] font-bold ${item.badgeText}`}>
                      {item.karat}
                    </span>
                  </div>
                  <span className="text-[15px] font-semibold text-gray-900">{item.name}</span>
                </div>
                <div className="text-[20px] font-bold text-gray-900 mb-1">
                  {item.price.toLocaleString()}원
                </div>
                <div
                  className={`flex items-center gap-1 text-[13px] font-medium ${
                    item.change > 0
                      ? 'text-green-500'
                      : item.change < 0
                      ? 'text-red-500'
                      : 'text-gray-400'
                  }`}
                >
                  {item.change > 0 ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : item.change < 0 ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <span>-</span>
                  )}
                  {item.change !== 0
                    ? `${Math.abs(item.change).toLocaleString()} (${item.changePercent > 0 ? '+' : ''}${item.changePercent}%)`
                    : '0 (0.00%)'}
                </div>
              </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 내 주변 매장 섹션 - 당근 스타일 */}
      <section className="py-12 px-5 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[22px] font-bold text-gray-900 mb-1">내 주변 금은방</h2>
              <p className="text-[14px] text-gray-500">서울 강남구 기준</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <MapPin className="w-4 h-4" />
              위치 변경
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nearbyStores.map((store) => (
              <Link
                key={store.id}
                to={`/stores/${store.id}`}
                className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex gap-4 transform hover:-translate-y-0.5"
              >
                <div
                  className={`w-20 h-20 ${store.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <Store className={`w-10 h-10 ${store.iconColor}`} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[16px] font-semibold text-gray-900 truncate">
                      {store.name}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 ${
                        store.isOpen
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      } text-[11px] font-medium rounded`}
                    >
                      {store.isOpen ? '영업중' : '준비중'}
                    </span>
                  </div>
                  <div className="text-[13px] text-gray-500 mb-2 truncate">{store.address}</div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="text-yellow-500 font-medium">★ {store.rating}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">리뷰 {store.reviewCount}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">{store.distance}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 배너 - 토스 스타일 */}
      <section className="py-16 px-5">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-gray-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-[24px] md:text-[28px] font-bold text-white mb-2">
                금은방 사장님이신가요?
              </h3>
              <p className="text-[15px] text-gray-400">
                무료로 매장을 등록하고 더 많은 고객을 만나보세요
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/seller/stores')}
              className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 text-[15px] font-semibold rounded-xl transition-colors duration-200 flex-shrink-0"
            >
              매장 등록하기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
