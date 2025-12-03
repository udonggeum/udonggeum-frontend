import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLatestGoldPrices } from '@/hooks/queries/useGoldPricesQueries';
import Navbar from '@/components/Navbar';
import GoldPriceChart from '@/components/GoldPriceChart';
import PriceTableHistory from '@/components/PriceTableHistory';
import PriceCalculator from '@/components/PriceCalculator';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import type { GoldPrice, GoldPriceWithCalculations, GoldPriceType } from '@/schemas/goldPrice';

/**
 * PricePage Component
 *
 * 실시간 금시세 페이지 - ui-renewal/price.html 디자인 기반
 *
 * Features:
 * - 실시간 금 시세 카드 (24K, 18K, 14K, 백금)
 * - 가격 변동률 표시
 * - 1돈 기준 가격 계산
 * - 차트 placeholder (추후 구현)
 */
export default function PricePage() {
  const { data: pricesData, isLoading } = useLatestGoldPrices();
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState<GoldPriceType>('24K'); // 선택된 금 유형
  const [selectedPeriod, setSelectedPeriod] = useState<'1주' | '1개월' | '3개월' | '1년' | '전체'>('1개월');

  // URL 파라미터에서 타입 읽기 (예: /price?type=18K)
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && ['24K', '18K', '14K', 'Platinum'].includes(typeParam)) {
      setSelectedType(typeParam as GoldPriceType);
    }
  }, [searchParams]);

  // 금 시세 데이터에 UI용 계산 필드 추가
  const prices: GoldPriceWithCalculations[] = useMemo(() => {
    if (!pricesData) return [];

    // Helper function to get purity percentage
    const getPurity = (type: string): string => {
      switch (type) {
        case '24K':
          return '99.99%';
        case '18K':
          return '75%';
        case '14K':
          return '58.5%';
        case 'Platinum':
          return '99.95%';
        default:
          return '';
      }
    };

    // Helper function to get badge colors
    const getBadgeColors = (type: string): { bg: string; text: string } => {
      if (type === 'Platinum') {
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
      }
      return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    };

    // 정렬 순서 정의: 24K > 18K > 14K > Platinum
    const typeOrder: Record<string, number> = {
      '24K': 1,
      '18K': 2,
      '14K': 3,
      'Platinum': 4,
    };

    return pricesData
      .map((price: GoldPrice) => {
        const colors = getBadgeColors(price.type);
        return {
          ...price,
          sell_price: Math.round(price.sell_price), // 소수점 제거
          buy_price: Math.round(price.buy_price), // 소수점 제거
          // 1돈 = 3.75g
          price_per_don: Math.round(price.sell_price * 3.75),
          purity: getPurity(price.type),
          badge_bg: colors.bg,
          badge_text: colors.text,
          // Mock 변동률 (백엔드 추가 예정)
          change_percent: price.type === '24K' ? -0.22 : price.type === '18K' ? 0.15 : price.type === 'Platinum' ? 1.28 : 0,
          change_amount: price.type === '24K' ? -1000 : price.type === '18K' ? 500 : price.type === 'Platinum' ? 2000 : 0,
          sortOrder: typeOrder[price.type] || 99,
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder); // 정렬
  }, [pricesData]);

  // 선택된 금 유형의 가격 (차트용)
  const selectedPrice = prices.find((p) => p.type === selectedType);

  // 현재 시각
  const currentTime = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      {/* Navbar */}
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-5 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[28px] font-bold text-gray-900">실시간 금시세</h1>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[12px] font-semibold text-green-700">LIVE</span>
            </div>
          </div>
          <p className="text-[15px] text-gray-500">{currentTime} 기준</p>
        </div>

        {/* 메인 시세 카드 (토스/크림 스타일) */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {prices.map((price) => {
              const isPositive = (price.change_percent || 0) > 0;
              const isNegative = (price.change_percent || 0) < 0;
              const isZero = (price.change_percent || 0) === 0;

              const isSelected = selectedType === price.type;

              return (
                <div
                  key={price.type}
                  onClick={() => setSelectedType(price.type)}
                  className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer ${
                    isSelected ? 'border-2 border-yellow-400' : 'border-2 border-transparent'
                  }`}
                >
                  {/* 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 ${price.badge_bg} rounded-xl flex items-center justify-center`}>
                        <span className={`text-[13px] font-bold ${price.badge_text}`}>
                          {price.type}
                        </span>
                      </div>
                      <div>
                        <span className="text-[15px] font-semibold text-gray-900">
                          {price.type === '24K' ? '순금' : price.type === '18K' ? '18K금' : price.type === '14K' ? '14K금' : '백금'}
                        </span>
                        <p className="text-[11px] text-gray-400">{price.purity}</p>
                      </div>
                    </div>
                    {!isZero && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                        isPositive ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        {isPositive ? (
                          <ChevronUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-red-500" />
                        )}
                        <span className={`text-[12px] font-semibold ${
                          isPositive ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {isPositive ? '+' : ''}{price.change_percent?.toFixed(2)}%
                        </span>
                      </div>
                    )}
                    {isZero && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                        <span className="text-[12px] font-semibold text-gray-500">0.00%</span>
                      </div>
                    )}
                  </div>

                  {/* 가격 */}
                  <div className="mb-2">
                    <span className="text-[28px] font-bold text-gray-900 tabular-nums">
                      {price.sell_price.toLocaleString()}
                    </span>
                    <span className="text-[14px] text-gray-500 ml-1">원/g</span>
                  </div>

                  {/* 변동 및 1돈 기준 */}
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className={`font-medium tabular-nums ${
                      isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {isPositive ? '▲' : isNegative ? '▼' : '-'} {Math.abs(price.change_amount || 0).toLocaleString()}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">
                      1돈 <span className="font-semibold text-gray-900 tabular-nums">{price.price_per_don.toLocaleString()}</span>원
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 시세 차트 섹션 (Placeholder) */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-[20px] font-bold text-gray-900 mb-1">
                {selectedType === '24K' ? '24K 순금' : selectedType === '18K' ? '18K 금' : selectedType === '14K' ? '14K 금' : '백금'} 시세 추이
              </h2>
              <p className="text-[14px] text-gray-500">국내 {selectedType === 'Platinum' ? '백금' : '금'} 시세 변동 그래프</p>
            </div>

            {/* 기간 선택 */}
            <div className="flex items-center gap-2">
              {(['1주', '1개월', '3개월', '1년', '전체'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                    selectedPeriod === period
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* 차트 영역 */}
          {selectedPrice ? (
            <GoldPriceChart
              type={selectedType}
              currentPrice={selectedPrice.sell_price}
              period={selectedPeriod}
            />
          ) : (
            <div className="relative h-[320px] rounded-xl border border-gray-100 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
              <div className="text-center">
                <p className="text-[16px] font-semibold text-gray-400 mb-2">데이터 로딩중</p>
                <p className="text-[14px] text-gray-400">잠시만 기다려주세요</p>
              </div>
            </div>
          )}

          {/* 차트 하단 요약 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-[12px] text-gray-500 mb-1">기간 최고가</p>
              <p className="text-[16px] font-bold text-gray-900 tabular-nums">
                {selectedPrice ? (selectedPrice.sell_price + 6000).toLocaleString() : '-'}원
              </p>
              <p className="text-[11px] text-gray-400">11/15</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 mb-1">기간 최저가</p>
              <p className="text-[16px] font-bold text-gray-900 tabular-nums">
                {selectedPrice ? (selectedPrice.sell_price - 7000).toLocaleString() : '-'}원
              </p>
              <p className="text-[11px] text-gray-400">11/03</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 mb-1">기간 평균가</p>
              <p className="text-[16px] font-bold text-gray-900 tabular-nums">
                {selectedPrice ? (selectedPrice.sell_price - 800).toLocaleString() : '-'}원
              </p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 mb-1">기간 변동폭</p>
              <p className="text-[16px] font-bold text-green-500 tabular-nums">+1.57%</p>
              <p className="text-[11px] text-gray-400">+7,000원</p>
            </div>
          </div>
        </div>

        {/* 상세 시세표 */}
        {selectedPrice && (
          <div className="mb-8">
            <PriceTableHistory
              type={selectedType}
              period={selectedPeriod}
              currentPrice={selectedPrice.sell_price}
            />
          </div>
        )}

        {/* 시세 계산기 */}
        {!isLoading && prices.length > 0 && (
          <div className="mb-8">
            <PriceCalculator prices={prices} />
          </div>
        )}

        {/* 정보 섹션 */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-[18px] font-bold text-gray-900 mb-4">금시세 안내</h3>
          <div className="space-y-3 text-[14px] text-gray-600">
            <p>• 위 시세는 실시간으로 업데이트되며, 매장별로 실제 거래 가격은 다를 수 있습니다.</p>
            <p>• 1돈 = 3.75g 기준으로 계산된 가격입니다.</p>
            <p>• 매입가와 매도가는 각 매장의 정책에 따라 차이가 있을 수 있습니다.</p>
            <p>• 정확한 시세는 매장에 직접 문의하시기 바랍니다.</p>
          </div>
        </div>
      </main>
    </>
  );
}
