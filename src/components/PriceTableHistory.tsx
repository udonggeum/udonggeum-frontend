import { useMemo } from 'react';
import type { GoldPriceType } from '@/schemas/goldPrice';
import { useGoldPriceHistory } from '@/hooks/queries/useGoldPricesQueries';

interface PriceHistoryData {
  date: string;
  price: number;
  change: number;
  changePercent: number;
}

interface PriceTableHistoryProps {
  type: GoldPriceType;
  period: '1주' | '1개월' | '3개월' | '1년' | '전체';
  currentPrice?: number; // Optional - no longer needed with real API
}

/**
 * PriceTableHistory Component
 *
 * 선택된 기간의 금 시세 이력을 테이블로 표시
 *
 * Features:
 * - 차트와 동일한 기간의 데이터를 테이블로 표시
 * - 날짜, 가격, 전일대비, 등락률 표시
 * - 반응형 디자인
 * - 스크롤 가능한 고정 높이 테이블
 * - 프론트엔드에서 전일 대비 변동률 계산
 */
export default function PriceTableHistory({ type, period }: PriceTableHistoryProps) {
  // 과거 시세 이력 조회
  const { data: rawHistoryData, isLoading } = useGoldPriceHistory(type, period);

  // 전일 대비 변동률 계산
  const historyData = useMemo((): PriceHistoryData[] => {
    if (!rawHistoryData || rawHistoryData.length === 0) {
      return [];
    }

    return rawHistoryData.map((item, index) => {
      const price = Math.round(item.sell_price);

      // 전일 대비 계산 (첫 번째 항목은 이전 데이터 없음)
      let change = 0;
      let changePercent = 0;

      if (index > 0) {
        const prevPrice = rawHistoryData[index - 1].sell_price;
        change = price - prevPrice;
        changePercent = (change / prevPrice) * 100;
      }

      return {
        date: item.date,
        price,
        change,
        changePercent,
      };
    }).reverse(); // 최신순으로 정렬 (오늘이 맨 위)
  }, [rawHistoryData]);

  const getTypeName = (type: GoldPriceType): string => {
    switch (type) {
      case '24K': return '24K 순금';
      case '18K': return '18K 금';
      case '14K': return '14K 금';
      case 'Platinum': return '백금';
      case 'Silver': return '은';
      default: return type;
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${month}/${day} (${dayOfWeek})`;
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-[18px] font-bold text-gray-900">
            {getTypeName(type)} 시세 이력 ({period})
          </h2>
        </div>
        <div className="p-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-[14px] text-gray-400">데이터 로딩중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 데이터 없음 처리
  if (!historyData || historyData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-[18px] font-bold text-gray-900">
            {getTypeName(type)} 시세 이력 ({period})
          </h2>
        </div>
        <div className="p-12 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[16px] font-semibold text-gray-400 mb-2">데이터 없음</p>
            <p className="text-[14px] text-gray-400">선택한 기간의 시세 데이터가 없습니다</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 통계 요약 */}
      <div className="mb-4 text-center">
        <p className="text-[13px] text-gray-500">
          최근 <span className="font-semibold text-gray-700">{historyData.length}일</span>간의 시세 변동
        </p>
      </div>

      {/* 테이블 - 스크롤 가능 */}
      <div className="overflow-x-auto overflow-y-auto max-h-[500px] rounded-lg border border-gray-100">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 text-[12px] text-gray-500 font-medium">
              <th className="py-3 px-6 text-left">날짜</th>
              <th className="py-3 px-4 text-right">가격 (원/g)</th>
              <th className="py-3 px-4 text-right">전일대비</th>
              <th className="py-3 px-4 text-right">등락률</th>
            </tr>
          </thead>
          <tbody className="text-[14px] bg-white">
            {historyData.map((row, index) => {
              const isPositive = row.change > 0;
              const isNegative = row.change < 0;
              const isToday = index === 0;

              return (
                <tr
                  key={row.date}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors duration-200 ${
                    isToday ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {formatDate(row.date)}
                      </span>
                      {isToday && (
                        <span className="px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-bold rounded">
                          오늘
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-900 tabular-nums">
                    {row.price.toLocaleString()}
                  </td>
                  <td className={`py-4 px-4 text-right font-medium tabular-nums ${
                    isPositive ? 'text-red-500' : isNegative ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {isPositive ? '▲' : isNegative ? '▼' : '-'} {Math.abs(row.change).toLocaleString()}
                  </td>
                  <td className={`py-4 px-4 text-right font-medium tabular-nums ${
                    isPositive ? 'text-red-500' : isNegative ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {isPositive ? '+' : ''}{row.changePercent.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 푸터 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-[12px] text-gray-500 text-center">
        * 위 시세는 참고용이며, 실제 거래 시세는 매장별로 상이할 수 있습니다.
      </div>
    </>
  );
}
