import type { NavigationItem } from '@/types';

/**
 * 공통 네비게이션 항목
 * 금시세, 상품, 매장찾기
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'price', label: '금시세', path: '/price', displayOrder: 1 },
  { id: 'products', label: '상품', path: '/products', displayOrder: 2 },
  { id: 'stores', label: '매장찾기', path: '/stores', displayOrder: 3 },
];
