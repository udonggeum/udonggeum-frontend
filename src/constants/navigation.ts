import type { NavigationItem } from '@/types';

/**
 * 공통 네비게이션 항목
 * 금시세, 매장찾기, 금광산
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'price', label: '금시세', path: '/price', displayOrder: 1 },
  { id: 'stores', label: '매장찾기', path: '/stores', displayOrder: 2 },
  { id: 'community', label: '금광산', path: '/community', displayOrder: 3 },
];
