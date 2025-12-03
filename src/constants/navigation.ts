import type { NavigationItem } from '../types';

/**
 * Main navigation menu items
 *
 * This is the single source of truth for navigation across the application.
 * All pages should import and use these navigation items to maintain consistency.
 */
export const NAV_ITEMS: NavigationItem[] = [
  {
    id: 'price',
    label: '금시세',
    path: '/price',
    displayOrder: 1,
  },
  {
    id: 'products',
    label: '상품',
    path: '/products',
    displayOrder: 2,
  },
  {
    id: 'stores',
    label: '매장',
    path: '/stores',
    displayOrder: 3,
  },
];
