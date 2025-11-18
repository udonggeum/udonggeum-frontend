import { mockStores } from './stores';

/**
 * Mock data: Products
 * Aligns with backend schema (categories/materials in Korean, includes store info)
 */

export const mockProducts = [
  {
    id: 1,
    name: '24K 순금 반지',
    description: '강남 대표 매장에서 선보이는 프리미엄 순금 반지',
    price: 980000,
    weight: 7.2,
    purity: '24K',
    category: '반지',
    material: '금',
    stock_quantity: 10,
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
    store_id: 1,
    store: mockStores[0],
    popularity_score: 92,
    wishlist_count: 340,
    view_count: 1200,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-20T10:00:00Z',
  },
  {
    id: 2,
    name: '18K 하트 목걸이',
    description: '사랑스러운 하트 펜던트가 돋보이는 골드 목걸이',
    price: 620000,
    weight: 6.1,
    purity: '18K',
    category: '목걸이',
    material: '금',
    stock_quantity: 15,
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    store_id: 1,
    store: mockStores[0],
    popularity_score: 88,
    wishlist_count: 180,
    view_count: 980,
    created_at: '2025-01-14T12:00:00Z',
    updated_at: '2025-01-19T09:00:00Z',
  },
  {
    id: 3,
    name: '실버 스퀘어 커플링',
    description: '925 실버 소재의 깔끔한 커플 반지 세트',
    price: 210000,
    weight: 5.5,
    purity: '925',
    category: '반지',
    material: '은',
    stock_quantity: 30,
    image_url: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=400',
    store_id: 2,
    store: mockStores[1],
    popularity_score: 74,
    wishlist_count: 290,
    view_count: 640,
    created_at: '2025-01-13T08:30:00Z',
    updated_at: '2025-01-18T15:10:00Z',
  },
  {
    id: 4,
    name: '화이트골드 체인 팔찌',
    description: '고급스러운 화이트골드 체인 디자인',
    price: 750000,
    weight: 8.2,
    purity: '18K',
    category: '팔찌',
    material: '금',
    stock_quantity: 12,
    image_url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400',
    store_id: 3,
    store: mockStores[2],
    popularity_score: 81,
    view_count: 720,
    created_at: '2025-01-12T09:15:00Z',
    updated_at: '2025-01-17T11:25:00Z',
  },
  {
    id: 5,
    name: '24K 순금 돌반지',
    description: '첫 돌 기념 선물로 인기 있는 전통 순금 반지',
    price: 1250000,
    weight: 6.5,
    purity: '24K',
    category: '반지',
    material: '금',
    stock_quantity: 6,
    image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
    store_id: 4,
    store: mockStores[3],
    popularity_score: 68,
    view_count: 510,
    created_at: '2025-01-11T11:40:00Z',
    updated_at: '2025-01-16T18:05:00Z',
  },
  {
    id: 6,
    name: '커스텀 이니셜 목걸이',
    description: '맞춤 제작 가능한 커스텀 이니셜 목걸이',
    price: 430000,
    weight: 4.3,
    purity: '14K',
    category: '목걸이',
    material: '금',
    stock_quantity: 20,
    image_url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=400',
    store_id: 5,
    store: mockStores[4],
    popularity_score: 79,
    view_count: 860,
    created_at: '2025-01-10T13:20:00Z',
    updated_at: '2025-01-15T16:45:00Z',
  },
];

// Product options (sizes, colors, etc.)
export const mockProductOptions = [
  // Product 1 options (sizes)
  { id: 101, product_id: 1, name: '사이즈', value: '9호', additional_price: 0, stock_quantity: 3, is_default: true },
  { id: 102, product_id: 1, name: '사이즈', value: '11호', additional_price: 20000, stock_quantity: 4, is_default: false },
  { id: 103, product_id: 1, name: '사이즈', value: '13호', additional_price: 30000, stock_quantity: 3, is_default: false },

  // Product 2 options (length)
  { id: 201, product_id: 2, name: '길이', value: '40cm', additional_price: 0, stock_quantity: 5, is_default: true },
  { id: 202, product_id: 2, name: '길이', value: '45cm', additional_price: 30000, stock_quantity: 5, is_default: false },

  // Product 3 options (size)
  { id: 301, product_id: 3, name: '사이즈', value: '11호', additional_price: 0, stock_quantity: 10, is_default: true },
  { id: 302, product_id: 3, name: '사이즈', value: '13호', additional_price: 10000, stock_quantity: 8, is_default: false },

  // Product 4 options (length)
  { id: 401, product_id: 4, name: '길이', value: '17cm', additional_price: 0, stock_quantity: 6, is_default: true },
  { id: 402, product_id: 4, name: '길이', value: '19cm', additional_price: 20000, stock_quantity: 6, is_default: false },

  // Product 6 options (pendant style)
  { id: 601, product_id: 6, name: '펜던트', value: '서체 A', additional_price: 0, stock_quantity: 7, is_default: true },
  { id: 602, product_id: 6, name: '펜던트', value: '서체 B', additional_price: 15000, stock_quantity: 7, is_default: false },
];

/**
 * Get popular products
 */
export function getPopularProducts(category?: string, limit?: number) {
  let products = mockProducts
    .filter((p) => p.popularity_score > 0)
    .sort((a, b) => b.popularity_score - a.popularity_score);

  if (category) {
    products = products.filter((p) => p.category === category);
  }

  if (limit) {
    products = products.slice(0, limit);
  }

  return products;
}

/**
 * Get product with options
 */
export function getProductWithOptions(productId: number) {
  const product = mockProducts.find((p) => p.id === productId);
  if (!product) return null;

  const options = mockProductOptions.filter((o) => o.product_id === productId);

  return {
    ...product,
    options,
  };
}
