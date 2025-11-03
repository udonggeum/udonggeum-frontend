import type { NavigationItem } from '../types';

/**
 * Main navigation menu items
 *
 * This is the single source of truth for navigation across the application.
 * All pages should import and use these navigation items to maintain consistency.
 */
export const NAV_ITEMS: NavigationItem[] = [
  {
    id: 'products',
    label: '상품',
    path: '/products',
    displayOrder: 1,
  },
  {
    id: 'stores',
    label: '매장',
    path: '/stores',
    displayOrder: 2,
  },
  {
    id: 'cart',
    label: '장바구니',
    path: '/cart',
    displayOrder: 3,
  },
];
