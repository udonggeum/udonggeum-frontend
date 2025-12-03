import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import type { GoldPriceType } from '@/schemas/goldPrice';

interface PriceCalculatorProps {
  prices: Array<{
    type: GoldPriceType;
    buy_price: number;
    sell_price: number;
  }>;
}

type WeightUnit = 'g' | '돈' | 'oz';

/**
 * PriceCalculator Component
 *
 * 금 시세 계산기 - 무게와 금 유형에 따른 매입/매도 예상가 계산
 *
 * Features:
 * - 금 유형 선택 (24K, 18K, 14K, 백금)
 * - 무게 단위 선택 (g/돈/oz)
 * - 실시간 매입/매도 예상가 계산
 * - 반응형 디자인
 */
export default function PriceCalculator({ prices }: PriceCalculatorProps) {
  const [selectedType, setSelectedType] = useState<GoldPriceType>('24K');
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<WeightUnit>('g');

  // 선택된 금 유형의 가격 정보
  const selectedPrice = prices.find((p) => p.type === selectedType);

  // 무게를 그램으로 변환
  const weightInGrams = useMemo(() => {
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight <= 0) return 0;

    switch (unit) {
      case 'g':
        return numWeight;
      case '돈':
        return numWeight * 3.75; // 1돈 = 3.75g
      case 'oz':
        return numWeight * 31.1035; // 1oz = 31.1035g
      default:
        return 0;
    }
  }, [weight, unit]);

  // 매입/매도 예상가 계산
  const buyEstimate = useMemo(() => {
    if (!selectedPrice || weightInGrams === 0) return 0;
    return Math.round(selectedPrice.buy_price * weightInGrams);
  }, [selectedPrice, weightInGrams]);

  const sellEstimate = useMemo(() => {
    if (!selectedPrice || weightInGrams === 0) return 0;
    return Math.round(selectedPrice.sell_price * weightInGrams);
  }, [selectedPrice, weightInGrams]);

  const getTypeName = (type: GoldPriceType): string => {
    switch (type) {
      case '24K': return '24K 순금';
      case '18K': return '18K 금';
      case '14K': return '14K 금';
      case 'Platinum': return '백금';
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-yellow-600" />
          <h2 className="text-[18px] font-bold text-gray-900">시세 계산기</h2>
        </div>
        <p className="text-[13px] text-gray-500">
          무게를 입력하면 예상 매입/매도 가격을 확인할 수 있습니다
        </p>
      </div>

      {/* 계산기 본문 */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 입력 영역 */}
          <div className="space-y-4">
            {/* 금 유형 선택 */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                금 유형
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as GoldPriceType)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              >
                {prices.map((price) => (
                  <option key={price.type} value={price.type}>
                    {getTypeName(price.type)}
                  </option>
                ))}
              </select>
            </div>

            {/* 무게 입력 */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">
                무게
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all tabular-nums"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as WeightUnit)}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                >
                  <option value="g">g</option>
                  <option value="돈">돈</option>
                  <option value="oz">oz</option>
                </select>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                * 1돈 = 3.75g, 1oz = 31.1035g
              </p>
            </div>

            {/* 그램 환산 정보 */}
            {weightInGrams > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[12px] text-gray-500">
                  입력 무게: <span className="font-semibold text-gray-900 tabular-nums">{weightInGrams.toFixed(2)}g</span>
                </p>
              </div>
            )}
          </div>

          {/* 결과 영역 */}
          <div className="space-y-4">
            {/* 매입 예상가 (살 때) */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <p className="text-[13px] font-medium text-green-700 mb-1">살 때 예상가 (매입가)</p>
              <p className="text-[28px] font-bold text-green-600 tabular-nums">
                {buyEstimate.toLocaleString()}
                <span className="text-[16px] ml-1">원</span>
              </p>
              {selectedPrice && weightInGrams > 0 && (
                <p className="text-[11px] text-green-600 mt-1">
                  {selectedPrice.buy_price.toLocaleString()}원/g × {weightInGrams.toFixed(2)}g
                </p>
              )}
            </div>

            {/* 매도 예상가 (팔 때) */}
            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
              <p className="text-[13px] font-medium text-red-700 mb-1">팔 때 예상가 (매도가)</p>
              <p className="text-[28px] font-bold text-red-600 tabular-nums">
                {sellEstimate.toLocaleString()}
                <span className="text-[16px] ml-1">원</span>
              </p>
              {selectedPrice && weightInGrams > 0 && (
                <p className="text-[11px] text-red-600 mt-1">
                  {selectedPrice.sell_price.toLocaleString()}원/g × {weightInGrams.toFixed(2)}g
                </p>
              )}
            </div>

            {/* 매입/매도 차액 */}
            {weightInGrams > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[12px] text-gray-500">
                  매입/매도 차액: <span className="font-semibold text-gray-900 tabular-nums">{(sellEstimate - buyEstimate).toLocaleString()}원</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="p-4 bg-gray-50 text-[12px] text-gray-500">
        * 위 계산 결과는 참고용이며, 실제 거래가는 매장 상황에 따라 달라질 수 있습니다.
      </div>
    </div>
  );
}
