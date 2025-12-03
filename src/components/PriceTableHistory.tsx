import type { GoldPriceType } from '@/schemas/goldPrice';

interface PriceHistoryData {
  date: string;
  price: number;
  change: number;
  changePercent: number;
}

interface PriceTableHistoryProps {
  type: GoldPriceType;
  period: '1주' | '1개월' | '3개월' | '1년' | '전체';
  currentPrice: number;
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
 */
export default function PriceTableHistory({ type, period, currentPrice }: PriceTableHistoryProps) {
  // Mock 이력 데이터 생성 (차트와 동일한 데이터)
  const generateHistoryData = (): PriceHistoryData[] => {
    const dataPoints =
      period === '1주' ? 7 :
      period === '1개월' ? 30 :
      period === '3개월' ? 90 :
      period === '1년' ? 365 :
      730; // 전체: 2년

    const today = new Date();
    const data: PriceHistoryData[] = [];
    const volatility = currentPrice * 0.01; // 1% 일일 변동성

    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (dataPoints - 1 - i));

      const randomChange = (Math.random() - 0.5) * volatility;
      const price = Math.round(currentPrice + randomChange);

      // 전일 대비 (간단한 시뮬레이션)
      const prevPrice = i === 0 ? price : data[i - 1].price;
      const change = price - prevPrice;
      const changePercent = prevPrice > 0 ? ((change / prevPrice) * 100) : 0;

      data.push({
        date: date.toISOString().split('T')[0],
        price: i === dataPoints - 1 ? currentPrice : price, // 마지막은 현재가
        change,
        changePercent,
      });
    }

    // 최신순으로 정렬 (오늘이 맨 위)
    return data.reverse();
  };

  const historyData = generateHistoryData();

  // 표시할 데이터 제한 (너무 많으면 일부만)
  const displayLimit = period === '1주' ? 7 : period === '1개월' ? 30 : 30; // 최대 30개만 표시
  const displayData = historyData.slice(0, displayLimit);

  const getTypeName = (type: GoldPriceType): string => {
    switch (type) {
      case '24K': return '24K 순금';
      case '18K': return '18K 금';
      case '14K': return '14K 금';
      case 'Platinum': return '백금';
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

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[18px] font-bold text-gray-900">
          {getTypeName(type)} 시세 이력 ({period})
        </h2>
        <p className="text-[13px] text-gray-500 mt-1">
          최근 {displayData.length}일간의 시세 변동
        </p>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-[12px] text-gray-500 font-medium">
              <th className="py-3 px-6 text-left">날짜</th>
              <th className="py-3 px-4 text-right">가격 (원/g)</th>
              <th className="py-3 px-4 text-right">전일대비</th>
              <th className="py-3 px-4 text-right">등락률</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {displayData.map((row, index) => {
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
                    isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {isPositive ? '▲' : isNegative ? '▼' : '-'} {Math.abs(row.change).toLocaleString()}
                  </td>
                  <td className={`py-4 px-4 text-right font-medium tabular-nums ${
                    isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-400'
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
      <div className="p-4 bg-gray-50 text-[12px] text-gray-500">
        * 위 시세는 참고용이며, 실제 거래 시세는 매장별로 상이할 수 있습니다.
      </div>
    </div>
  );
}
