/**
 * SellerDashboardPage Component
 * Main dashboard for sellers showing key statistics and quick actions
 */

import { Link } from 'react-router-dom';
import {
  BarChart3,
  Package,
  ShoppingBag,
  DollarSign,
  Store,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/queries';
import { LoadingSpinner, ErrorAlert } from '@/components';

export default function SellerDashboardPage() {
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
      <div className="container mx-auto px-4 py-8">
        <ErrorAlert error={error} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-warning">
          <span>통계 데이터를 불러올 수 없습니다.</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: '전체 주문',
      value: stats.total_orders,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '대기 중인 주문',
      value: stats.pending_orders,
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: '총 수익',
      value: `₩${stats.total_revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '전체 상품',
      value: stats.total_products,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  // Additional stats from backend
  const additionalStats = [
    {
      title: '확정된 주문',
      value: stats.confirmed_orders,
      icon: ShoppingBag,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: '배송 중',
      value: stats.shipping_orders,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: '배송 완료',
      value: stats.delivered_orders,
      icon: ShoppingBag,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
    {
      title: '취소된 주문',
      value: stats.cancelled_orders,
      icon: ShoppingBag,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: '재고 부족 상품',
      value: stats.low_stock_products,
      icon: Package,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ];

  const allStats = [...statCards, ...additionalStats];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8" aria-hidden="true" />
            판매자 대시보드
          </h1>
          <p className="text-base-content/70 mt-2">
            판매 현황과 통계를 한눈에 확인하세요
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {allStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/70 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-8 h-8 ${stat.color}`} aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title mb-4">빠른 작업</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/seller/stores"
              className="btn btn-outline btn-primary gap-2"
            >
              <Store className="w-5 h-5" />
              가게 관리
            </Link>
            <Link
              to="/seller/products"
              className="btn btn-outline btn-secondary gap-2"
            >
              <Package className="w-5 h-5" />
              상품 관리
            </Link>
            <Link
              to="/seller/orders"
              className="btn btn-outline btn-accent gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              주문 관리
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
