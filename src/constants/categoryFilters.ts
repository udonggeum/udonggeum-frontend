/**
 * Category Filter Tags
 *
 * Multi-select category chips for product filtering.
 * These represent common product attributes and styles.
 */
export interface CategoryFilterTag {
  id: string;
  label: string;
  displayOrder: number;
}

export const CATEGORY_FILTER_TAGS: CategoryFilterTag[] = [
  { id: 'rings', label: '반지', displayOrder: 1 },
  { id: 'necklaces', label: '목걸이', displayOrder: 2 },
  { id: 'bracelets', label: '팔찌', displayOrder: 3 },
  { id: 'earrings', label: '귀걸이', displayOrder: 4 },
  { id: 'couple-rings', label: '커플링', displayOrder: 5 },
  { id: 'silver', label: '실버', displayOrder: 6 },
  { id: 'gold', label: '골드', displayOrder: 7 },
  { id: '14k', label: '14K', displayOrder: 8 },
  { id: '18k', label: '18K', displayOrder: 9 },
  { id: 'platinum', label: '백금', displayOrder: 10 },
  { id: 'pearl', label: '진주', displayOrder: 11 },
  { id: 'diamond', label: '다이아몬드', displayOrder: 12 },
];
