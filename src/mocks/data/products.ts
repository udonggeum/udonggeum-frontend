/**
 * Mock data: Products
 * Korean jewelry products
 */

export const mockProducts = [
  {
    id: 1,
    name: '14K 골드 반지 - 클래식',
    category: 'ring',
    price: 350000,
    description: '심플하고 우아한 디자인의 14K 골드 반지',
    image_url: 'https://placeholder.com/product1.jpg',
    stock: 25,
    is_popular: true,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: '18K 골드 목걸이 - 하트',
    category: 'necklace',
    price: 580000,
    description: '사랑스러운 하트 모티브의 18K 골드 목걸이',
    image_url: 'https://placeholder.com/product2.jpg',
    stock: 18,
    is_popular: true,
    created_at: '2025-01-14T10:00:00Z',
  },
  {
    id: 3,
    name: '14K 로즈골드 귀걸이',
    category: 'earring',
    price: 280000,
    description: '화사한 로즈골드 컬러의 귀걸이',
    image_url: 'https://placeholder.com/product3.jpg',
    stock: 32,
    is_popular: false,
    created_at: '2025-01-13T10:00:00Z',
  },
  {
    id: 4,
    name: '18K 화이트골드 팔찌',
    category: 'bracelet',
    price: 720000,
    description: '고급스러운 화이트골드 체인 팔찌',
    image_url: 'https://placeholder.com/product4.jpg',
    stock: 12,
    is_popular: true,
    created_at: '2025-01-12T10:00:00Z',
  },
  {
    id: 5,
    name: '24K 순금 돌반지',
    category: 'ring',
    price: 1200000,
    description: '전통미가 살아있는 24K 순금 돌반지',
    image_url: 'https://placeholder.com/product5.jpg',
    stock: 8,
    is_popular: false,
    created_at: '2025-01-11T10:00:00Z',
  },
  {
    id: 6,
    name: '14K 이니셜 목걸이',
    category: 'necklace',
    price: 420000,
    description: '맞춤 제작 가능한 이니셜 목걸이',
    image_url: 'https://placeholder.com/product6.jpg',
    stock: 28,
    is_popular: true,
    created_at: '2025-01-10T10:00:00Z',
  },
];

// Product options (sizes, colors, etc.)
export const mockProductOptions = [
  // Ring sizes
  { id: 101, product_id: 1, option_type: 'size', option_value: '7호' },
  { id: 102, product_id: 1, option_type: 'size', option_value: '9호' },
  { id: 103, product_id: 1, option_type: 'size', option_value: '11호' },
  { id: 104, product_id: 5, option_type: 'size', option_value: '8호' },
  { id: 105, product_id: 5, option_type: 'size', option_value: '10호' },

  // Necklace lengths
  { id: 201, product_id: 2, option_type: 'length', option_value: '40cm' },
  { id: 202, product_id: 2, option_type: 'length', option_value: '45cm' },
  { id: 203, product_id: 6, option_type: 'length', option_value: '40cm' },
  { id: 204, product_id: 6, option_type: 'length', option_value: '45cm' },

  // Earring types
  { id: 301, product_id: 3, option_type: 'type', option_value: '침형' },
  { id: 302, product_id: 3, option_type: 'type', option_value: '클립형' },

  // Bracelet sizes
  { id: 401, product_id: 4, option_type: 'size', option_value: '17cm' },
  { id: 402, product_id: 4, option_type: 'size', option_value: '19cm' },
];

/**
 * Get popular products
 */
export function getPopularProducts(category?: string, limit?: number) {
  let products = mockProducts.filter((p) => p.is_popular);

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
