/**
 * SellerLayout Component
 * Layout for seller/admin pages with navigation bar
 */

import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const sellerNavigationItems = [
  {
    id: 'dashboard',
    label: '대시보드',
    path: '/seller/dashboard',
    displayOrder: 1,
  },
  {
    id: 'stores',
    label: '가게 관리',
    path: '/seller/stores',
    displayOrder: 2,
  },
  {
    id: 'products',
    label: '상품 관리',
    path: '/seller/products',
    displayOrder: 3,
  },
  {
    id: 'orders',
    label: '주문 관리',
    path: '/seller/orders',
    displayOrder: 4,
  },
];

export default function SellerLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-primary)]">
      <Navbar navigationItems={sellerNavigationItems} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
