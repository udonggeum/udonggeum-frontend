/**
 * SellerDashboardPage Component
 * Main dashboard for sellers showing key statistics and quick actions
 */

import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Package,
  ShoppingBag,
  DollarSign,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/queries';
import { LoadingSpinner, ErrorAlert, Card, CardBody } from '@/components';

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)]">
        <div className="container mx-auto px-4 py-8">
          <ErrorAlert error={error} message="통계 정보를 불러오는 중 오류가 발생했습니다" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)]">
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-warning">
            <span>통계 데이터를 불러올 수 없습니다.</span>
          </div>
        </div>
      </div>
    );
  }

  // Order-related stats
  const orderStats = [
    {
      title: '전체 주문',
      value: stats.total_orders,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      path: '/seller/orders',
      query: 'status=all',
      clickable: true,
    },
    {
      title: '대기 중인 주문',
      value: stats.pending_orders,
      icon: Package,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      path: '/seller/orders',
      query: 'status=pending',
      clickable: true,
    },
    {
      title: '확정된 주문',
      value: stats.confirmed_orders,
      icon: ShoppingBag,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      path: '/seller/orders',
      query: 'status=confirmed',
      clickable: true,
    },
    {
      title: '배송 중',
      value: stats.shipping_orders,
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      path: '/seller/orders',
      query: 'status=shipping',
      clickable: true,
    },
    {
      title: '배송 완료',
      value: stats.delivered_orders,
      icon: ShoppingBag,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      path: '/seller/orders',
      query: 'status=delivered',
      clickable: true,
    },
    {
      title: '취소된 주문',
      value: stats.cancelled_orders,
      icon: ShoppingBag,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
      path: '/seller/orders',
      query: 'status=cancelled',
      clickable: true,
    },
    {
      title: '총 수익',
      value: `₩${stats.total_revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      clickable: false,
    },
  ];

  // Product-related stats
  const productStats = [
    {
      title: '전체 상품',
      value: stats.total_products,
      icon: Package,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100',
      path: '/seller/products',
      clickable: true,
    },
    {
      title: '재고 부족 상품',
      value: stats.low_stock_products,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      path: '/seller/products',
      query: 'stock=low',
      clickable: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b-2 border-[var(--color-gold)]/20">
        <div className="space-y-2">
          <span className="badge badge-lg border-2 border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10 font-semibold">
            Seller Dashboard
          </span>
          <h1 className="text-4xl font-bold text-[var(--color-text)] flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-[var(--color-gold)]" aria-hidden="true" />
            판매자 대시보드
          </h1>
          <p className="text-base text-[var(--color-text)]/70">
            판매 현황과 통계를 한눈에 확인하세요
          </p>
        </div>
      </div>

      {/* Order Stats Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-gold)]/10">
            <ShoppingBag className="w-6 h-6 text-[var(--color-gold)]" aria-hidden="true" />
          </div>
          주문 관리
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orderStats.map((stat) => {
            const Icon = stat.icon;
            const handleClick = () => {
              if (stat.clickable && stat.path) {
                const url = stat.query ? `${stat.path}?${stat.query}` : stat.path;
                navigate(url);
              }
            };

            return (
              <Card
                key={stat.title}
                onClick={stat.clickable ? handleClick : undefined}
                hover={stat.clickable}
                className={`border-2 border-[var(--color-gold)]/20 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent ${!stat.clickable ? 'opacity-90' : 'hover-lift cursor-pointer'}`}
              >
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--color-text)]/70 mb-2 font-medium">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-[var(--color-gold)]">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-4 rounded-2xl shadow-sm`}>
                      <Icon className={`w-8 h-8 ${stat.color}`} aria-hidden="true" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Product Stats Section */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-gold)]/10">
            <Package className="w-6 h-6 text-[var(--color-gold)]" aria-hidden="true" />
          </div>
          상품 관리
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productStats.map((stat) => {
            const Icon = stat.icon;
            const handleClick = () => {
              if (stat.clickable && stat.path) {
                const url = stat.query ? `${stat.path}?${stat.query}` : stat.path;
                navigate(url);
              }
            };

            return (
              <Card
                key={stat.title}
                onClick={stat.clickable ? handleClick : undefined}
                hover={stat.clickable}
                className={`border-2 border-[var(--color-gold)]/20 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent ${!stat.clickable ? 'opacity-90' : 'hover-lift cursor-pointer'}`}
              >
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--color-text)]/70 mb-2 font-medium">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-[var(--color-gold)]">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-4 rounded-2xl shadow-sm`}>
                      <Icon className={`w-8 h-8 ${stat.color}`} aria-hidden="true" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
