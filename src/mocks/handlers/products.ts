/**
 * MSW Handlers - Products API
 * Mock Service Worker handlers for products endpoints
 */

import { http, HttpResponse } from 'msw';
import type { Product, ProductsResponse } from '@/schemas/products';

// Mock product data
const mockProducts: Product[] = [
  {
    id: 1,
    name: '18K 골드 네크리스',
    price: 850000,
    category: '목걸이',
    material: '18K 골드',
    stock_quantity: 5,
    popularity_score: 95,
    wishlist_count: 42,
    view_count: 1203,
    description: '세련된 디자인의 18K 골드 네크리스입니다.',
    weight: 3.5,
    purity: '18K (75%)',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    store_id: 1,
    store: {
      id: 1,
      name: '강남 금은방',
      region: '서울',
      district: '강남구',
      address: '서울 강남구 테헤란로 123',
      phone_number: '02-1234-5678',
    },
  },
  {
    id: 2,
    name: '다이아몬드 반지',
    price: 1500000,
    category: '반지',
    material: '플래티넘',
    stock_quantity: 3,
    popularity_score: 92,
    wishlist_count: 68,
    view_count: 2105,
    description: '0.5ct 다이아몬드가 세팅된 플래티넘 반지입니다.',
    weight: 4.2,
    purity: 'PT950',
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
    store_id: 1,
    store: {
      id: 1,
      name: '강남 금은방',
      region: '서울',
      district: '강남구',
      address: '서울 강남구 테헤란로 123',
      phone_number: '02-1234-5678',
    },
  },
  {
    id: 3,
    name: '실버 팔찌',
    price: 120000,
    category: '팔찌',
    material: '실버',
    stock_quantity: 10,
    popularity_score: 88,
    wishlist_count: 35,
    view_count: 856,
    description: '심플하고 세련된 실버 팔찌입니다.',
    weight: 12.0,
    purity: '925 실버',
    image_url: 'https://images.unsplash.com/photo-1611591437764-7097fea5faa6?w=400',
    store_id: 2,
    store: {
      id: 2,
      name: '서초 보석상',
      region: '서울',
      district: '서초구',
      address: '서울 서초구 서초대로 456',
      phone_number: '02-2345-6789',
    },
  },
  {
    id: 4,
    name: '골드 귀걸이',
    price: 450000,
    category: '귀걸이',
    material: '14K 골드',
    stock_quantity: 8,
    popularity_score: 85,
    wishlist_count: 28,
    view_count: 642,
    description: '우아한 디자인의 14K 골드 귀걸이입니다.',
    weight: 2.8,
    purity: '14K (58.5%)',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
    store_id: 2,
    store: {
      id: 2,
      name: '서초 보석상',
      region: '서울',
      district: '서초구',
      address: '서울 서초구 서초대로 456',
      phone_number: '02-2345-6789',
    },
  },
  {
    id: 5,
    name: '진주 목걸이',
    price: 680000,
    category: '목걸이',
    material: '진주',
    stock_quantity: 4,
    popularity_score: 90,
    wishlist_count: 52,
    view_count: 1456,
    description: '천연 담수 진주 목걸이입니다.',
    weight: 15.0,
    purity: '천연 진주',
    image_url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400',
    store_id: 3,
    store: {
      id: 3,
      name: '판교 주얼리',
      region: '경기',
      district: '성남시 분당구',
      address: '경기 성남시 분당구 판교역로 789',
      phone_number: '031-3456-7890',
    },
  },
  {
    id: 6,
    name: '화이트 골드 반지',
    price: 980000,
    category: '반지',
    material: '화이트 골드',
    stock_quantity: 6,
    popularity_score: 87,
    wishlist_count: 41,
    view_count: 923,
    description: '모던한 디자인의 화이트 골드 반지입니다.',
    weight: 3.8,
    purity: '18K',
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    store_id: 3,
    store: {
      id: 3,
      name: '판교 주얼리',
      region: '경기',
      district: '성남시 분당구',
      address: '경기 성남시 분당구 판교역로 789',
      phone_number: '031-3456-7890',
    },
  },
  {
    id: 7,
    name: '큐빅 귀걸이',
    price: 85000,
    category: '귀걸이',
    material: '실버',
    stock_quantity: 15,
    popularity_score: 82,
    wishlist_count: 19,
    view_count: 534,
    description: '반짝이는 큐빅이 세팅된 실버 귀걸이입니다.',
    weight: 2.2,
    purity: '925 실버',
    image_url: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400',
    store_id: 4,
    store: {
      id: 4,
      name: '홍대 악세사리',
      region: '서울',
      district: '마포구',
      address: '서울 마포구 홍익로 321',
      phone_number: '02-4567-8901',
    },
  },
  {
    id: 8,
    name: '골드 팔찌',
    price: 720000,
    category: '팔찌',
    material: '18K 골드',
    stock_quantity: 7,
    popularity_score: 89,
    wishlist_count: 33,
    view_count: 782,
    description: '고급스러운 18K 골드 팔찌입니다.',
    weight: 8.5,
    purity: '18K (75%)',
    image_url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400',
    store_id: 4,
    store: {
      id: 4,
      name: '홍대 악세사리',
      region: '서울',
      district: '마포구',
      address: '서울 마포구 홍익로 321',
      phone_number: '02-4567-8901',
    },
  },
  {
    id: 9,
    name: '은제 목걸이',
    price: 180000,
    category: '목걸이',
    material: '실버',
    stock_quantity: 12,
    popularity_score: 84,
    wishlist_count: 24,
    view_count: 645,
    description: '클래식한 디자인의 은제 목걸이입니다.',
    weight: 18.0,
    purity: '925 실버',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    store_id: 5,
    store: {
      id: 5,
      name: '부산 보석',
      region: '부산',
      district: '해운대구',
      address: '부산 해운대구 해운대로 654',
      phone_number: '051-5678-9012',
    },
  },
  {
    id: 10,
    name: '로즈 골드 반지',
    price: 620000,
    category: '반지',
    material: '로즈 골드',
    stock_quantity: 9,
    popularity_score: 91,
    wishlist_count: 47,
    view_count: 1125,
    description: '로맨틱한 로즈 골드 반지입니다.',
    weight: 3.2,
    purity: '18K',
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
    store_id: 5,
    store: {
      id: 5,
      name: '부산 보석',
      region: '부산',
      district: '해운대구',
      address: '부산 해운대구 해운대로 654',
      phone_number: '051-5678-9012',
    },
  },
];

// Helper function to filter and paginate products
function filterAndPaginateProducts(
  products: Product[],
  params: URLSearchParams
): ProductsResponse {
  let filtered = [...products];

  // Filter by category
  const category = params.get('category');
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  // Filter by material
  const material = params.get('material');
  if (material) {
    filtered = filtered.filter((p) => p.material === material);
  }

  // Filter by store_id
  const storeId = params.get('store_id');
  if (storeId) {
    filtered = filtered.filter((p) => p.store_id === parseInt(storeId, 10));
  }

  // Search by name
  const search = params.get('search');
  if (search) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Sort
  const sort = params.get('sort');
  if (sort === 'popularity') {
    filtered.sort((a, b) => b.popularity_score - a.popularity_score);
  } else if (sort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'wishlist' || sort === 'wishlist_desc') {
    filtered.sort((a, b) => b.wishlist_count - a.wishlist_count);
  } else if (sort === 'wishlist_asc') {
    filtered.sort((a, b) => a.wishlist_count - b.wishlist_count);
  }

  // Pagination
  const pageSize = parseInt(params.get('page_size') || '20', 10);
  const page = parseInt(params.get('page') || '1', 10);
  const offset = (page - 1) * pageSize;

  const paginated = filtered.slice(offset, offset + pageSize);

  return {
    count: filtered.length,
    page_size: pageSize,
    offset,
    products: paginated,
  };
}

export const productsHandlers = [
  // GET /api/v1/products - List products with filters/pagination
  http.get('/api/v1/products', ({ request }) => {
    const url = new URL(request.url);
    const response = filterAndPaginateProducts(mockProducts, url.searchParams);

    return HttpResponse.json(response);
  }),

  // GET /api/v1/products/popular - Get popular products
  http.get('/api/v1/products/popular', ({ request }) => {
    const url = new URL(request.url);
    const pageSize = parseInt(url.searchParams.get('page_size') || '10', 10);

    // Sort by popularity and return top N
    const popularProducts = [...mockProducts]
      .sort((a, b) => b.popularity_score - a.popularity_score)
      .slice(0, pageSize);

    const response: ProductsResponse = {
      count: popularProducts.length,
      page_size: pageSize,
      offset: 0,
      products: popularProducts,
    };

    return HttpResponse.json(response);
  }),

  // GET /api/v1/products/:id - Get product detail
  http.get('/api/v1/products/:id', ({ params }) => {
    const productId = parseInt(params.id as string, 10);
    const product = mockProducts.find((p) => p.id === productId);

    if (!product) {
      return HttpResponse.json(
        { message: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return HttpResponse.json(product);
  }),
];
