import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { GoldPriceType } from '@/schemas/goldPrice';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GoldPriceChartProps {
  type: GoldPriceType;
  currentPrice: number;
  period: '1주' | '1개월' | '3개월' | '1년' | '전체';
}

/**
 * GoldPriceChart Component
 *
 * Chart.js를 사용한 금 시세 차트
 *
 * Features:
 * - 선택된 금 유형의 시세 추이 표시 (일별 데이터)
 * - 기간별 필터링 (1주, 1개월, 3개월, 1년, 전체)
 * - 하루 1회 갱신되는 데이터 표시
 * - 그라디언트 영역 채우기
 * - 반응형 디자인
 */
export default function GoldPriceChart({ type, currentPrice, period }: GoldPriceChartProps) {
  // Mock 데이터 생성 (하루 1회 갱신, 일별 데이터)
  const chartData = useMemo(() => {
    // 기간별 데이터 포인트 (일 단위)
    const dataPoints =
      period === '1주' ? 7 :
      period === '1개월' ? 30 :
      period === '3개월' ? 90 :
      period === '1년' ? 365 :
      730; // 전체: 2년

    // 가격 변동 시뮬레이션 (일별 데이터)
    const generatePrices = () => {
      const prices: number[] = [];
      const basePrice = currentPrice;
      const volatility = basePrice * 0.01; // 1% 일일 변동성

      for (let i = 0; i < dataPoints; i++) {
        const randomChange = (Math.random() - 0.5) * volatility;
        const price = basePrice + randomChange;
        prices.push(Math.round(price));
      }

      // 마지막 가격을 현재가로 설정
      prices[prices.length - 1] = currentPrice;

      return prices;
    };

    const prices = generatePrices();

    // 레이블 생성 (일별 데이터)
    const today = new Date();
    const labels = Array.from({ length: dataPoints }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (dataPoints - 1 - i)); // 과거부터 오늘까지

      if (period === '1주') {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[date.getDay()];
      } else if (period === '1개월') {
        // 5일마다 날짜 표시
        return i % 5 === 0 ? `${date.getMonth() + 1}/${date.getDate()}` : '';
      } else if (period === '3개월') {
        // 15일마다 날짜 표시
        return i % 15 === 0 ? `${date.getMonth() + 1}/${date.getDate()}` : '';
      } else if (period === '1년') {
        // 30일마다 월 표시
        return i % 30 === 0 ? `${date.getMonth() + 1}월` : '';
      } else {
        // 전체: 60일마다 월 표시
        return i % 60 === 0 ? `${date.getFullYear()}.${date.getMonth() + 1}` : '';
      }
    });

    return { labels, prices };
  }, [type, currentPrice, period]);

  // Chart.js 데이터 설정
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: `${type} 시세`,
        data: chartData.prices,
        fill: true,
        borderColor: type === 'Platinum' ? 'rgb(156, 163, 175)' : 'rgb(255, 215, 0)',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 320);
          if (type === 'Platinum') {
            gradient.addColorStop(0, 'rgba(156, 163, 175, 0.3)');
            gradient.addColorStop(1, 'rgba(156, 163, 175, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
          }
          return gradient;
        },
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: type === 'Platinum' ? 'rgb(156, 163, 175)' : 'rgb(255, 215, 0)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Chart.js 옵션 설정
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(25, 31, 40, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 215, 0, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context: any) {
            return `${context.parsed.y.toLocaleString()}원/g`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#9E9E9E',
          font: {
            size: 11,
          },
        },
      },
      y: {
        position: 'left' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#9E9E9E',
          font: {
            size: 11,
          },
          callback: function (value: any) {
            return value.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className="relative h-[320px] rounded-xl border border-gray-100 bg-white p-4">
      <Line data={data} options={options} />
    </div>
  );
}
