/**
 * MSW Handlers - Stores API
 * Mock Service Worker handlers for stores endpoints
 */

import { http, HttpResponse } from 'msw';
import type { StoreDetail, StoresResponse } from '@/services/stores';

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    store_id: 1,
    user_id: 1,
    user: { id: 1, email: 'user1@example.com', name: '김철수', role: 'user' as const },
    rating: 5,
    content: '정말 친절하시고 가격도 합리적이에요. 금목걸이 구매했는데 너무 만족합니다!',
    image_urls: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    ],
    is_visitor: true,
    like_count: 12,
    created_at: '2025-01-07T14:00:00Z',
    updated_at: '2025-01-07T14:00:00Z',
  },
  {
    id: 2,
    store_id: 1,
    user_id: 2,
    user: { id: 2, email: 'user2@example.com', name: '이영희', role: 'user' as const },
    rating: 4,
    content: '매장이 깔끔하고 상품 종류가 다양해요. 또 방문할 예정입니다.',
    image_urls: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80',
    ],
    is_visitor: true,
    like_count: 8,
    created_at: '2025-01-06T11:30:00Z',
    updated_at: '2025-01-06T11:30:00Z',
  },
];

// Mock statistics
const mockStatistics: Record<number, any> = {
  1: {
    review_count: 2,
    average_rating: 4.5,
    visitor_review_count: 2,
    post_count: 2,
    gallery_image_count: 3,
  },
};

// Mock store data
const mockStores: StoreDetail[] = [
  {
    id: 1,
    name: '강남 금은방',
    region: '서울',
    district: '강남구',
    address: '서울 강남구 테헤란로 123',
    phone: '02-1234-5678',
    phone_number: '02-1234-5678',
    business_hours: '평일 09:00-19:00',
    open_time: '09:00',
    close_time: '19:00',
    description: '강남 최고의 금은방입니다. 품질 좋은 골드 제품을 판매합니다.',
    product_count: 15,
    total_products: 15,
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
    buying_gold: true,
    buying_platinum: true,
    buying_silver: true,
    category_counts: {
      '목걸이': 5,
      '반지': 4,
      '팔찌': 3,
      '귀걸이': 3,
    },
  },
  {
    id: 2,
    name: '서초 보석상',
    region: '서울',
    district: '서초구',
    address: '서울 서초구 서초대로 456',
    phone: '02-2345-6789',
    phone_number: '02-2345-6789',
    business_hours: '매일 10:00-20:00',
    open_time: '10:00',
    close_time: '20:00',
    description: '서초동에서 오랜 전통을 자랑하는 보석상입니다.',
    product_count: 12,
    total_products: 12,
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
    buying_gold: true,
    buying_platinum: false,
    buying_silver: true,
    category_counts: {
      '반지': 5,
      '귀걸이': 4,
      '목걸이': 3,
    },
  },
  {
    id: 3,
    name: '판교 주얼리',
    region: '경기',
    district: '성남시 분당구',
    address: '경기 성남시 분당구 판교역로 789',
    phone: '031-3456-7890',
    phone_number: '031-3456-7890',
    business_hours: '평일 10:00-21:00, 주말 11:00-20:00',
    open_time: '10:00',
    close_time: '21:00',
    description: '판교 테크노밸리 근처의 모던한 주얼리 샵입니다.',
    product_count: 18,
    total_products: 18,
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
    buying_gold: false,
    buying_platinum: true,
    buying_silver: false,
    category_counts: {
      '목걸이': 6,
      '반지': 5,
      '팔찌': 4,
      '귀걸이': 3,
    },
  },
  {
    id: 4,
    name: '홍대 악세사리',
    region: '서울',
    district: '마포구',
    address: '서울 마포구 홍익로 321',
    phone: '02-4567-8901',
    phone_number: '02-4567-8901',
    business_hours: '매일 12:00-22:00',
    open_time: '12:00',
    close_time: '22:00',
    description: '젊은 감각의 트렌디한 악세사리를 만나보세요.',
    product_count: 22,
    total_products: 22,
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
    buying_gold: false,
    buying_platinum: false,
    buying_silver: true,
    category_counts: {
      '귀걸이': 8,
      '팔찌': 6,
      '목걸이': 5,
      '반지': 3,
    },
  },
  {
    id: 5,
    name: '부산 보석',
    region: '부산',
    district: '해운대구',
    address: '부산 해운대구 해운대로 654',
    phone: '051-5678-9012',
    phone_number: '051-5678-9012',
    business_hours: '평일 09:30-19:30',
    open_time: '09:30',
    close_time: '19:30',
    description: '부산 해운대의 명품 보석 전문점입니다.',
    product_count: 20,
    total_products: 20,
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
    buying_gold: true,
    buying_platinum: true,
    buying_silver: false,
    category_counts: {
      '반지': 7,
      '목걸이': 6,
      '귀걸이': 4,
      '팔찌': 3,
    },
  },
];

// Helper function to filter and paginate stores
function filterAndPaginateStores(
  stores: StoreDetail[],
  params: URLSearchParams
): StoresResponse {
  let filtered = [...stores];

  // Filter by region
  const region = params.get('region');
  if (region) {
    filtered = filtered.filter((s) => s.region === region);
  }

  // Filter by district
  const district = params.get('district');
  if (district) {
    filtered = filtered.filter((s) => s.district === district);
  }

  // Pagination
  const pageSize = parseInt(params.get('page_size') || '12', 10);
  const page = parseInt(params.get('page') || '1', 10);
  const offset = (page - 1) * pageSize;

  const paginated = filtered.slice(offset, offset + pageSize);

  return {
    count: filtered.length,
    stores: paginated,
  };
}

export const storesHandlers = [
  // GET /api/v1/stores - List stores with filters/pagination
  http.get('/api/v1/stores', ({ request }) => {
    const url = new URL(request.url);
    const response = filterAndPaginateStores(mockStores, url.searchParams);

    return HttpResponse.json(response);
  }),

  // GET /api/v1/stores/locations - Get available locations
  http.get('/api/v1/stores/locations', () => {
    // Extract unique regions and districts from mock stores
    const locationsMap = new Map<string, Set<string>>();

    mockStores.forEach((store) => {
      if (store.region && store.district) {
        if (!locationsMap.has(store.region)) {
          locationsMap.set(store.region, new Set());
        }
        locationsMap.get(store.region)!.add(store.district);
      }
    });

    // Convert to API format
    const locations = Array.from(locationsMap.entries()).flatMap(
      ([region, districts]) =>
        Array.from(districts).map((district) => ({
          region,
          district,
          store_count: mockStores.filter(
            (s) => s.region === region && s.district === district
          ).length,
        }))
    );

    return HttpResponse.json({
      count: locations.length,
      locations,
    });
  }),

  // GET /api/v1/stores/:id - Get store detail
  http.get('/api/v1/stores/:id', ({ params }) => {
    const storeId = parseInt(params.id as string, 10);
    const store = mockStores.find((s) => s.id === storeId);

    if (!store) {
      return HttpResponse.json(
        { message: '매장을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ store });
  }),

  // GET /api/v1/stores/:id/reviews - Get store reviews
  http.get('/api/v1/stores/:id/reviews', ({ params, request }) => {
    const storeId = parseInt(params.id as string, 10);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('page_size') || '10', 10);

    const storeReviews = mockReviews.filter((r) => r.store_id === storeId);
    const offset = (page - 1) * pageSize;
    const paginated = storeReviews.slice(offset, offset + pageSize);

    return HttpResponse.json({
      data: paginated,
      total: storeReviews.length,
      page,
      page_size: pageSize,
    });
  }),

  // GET /api/v1/stores/:id/stats - Get store statistics
  http.get('/api/v1/stores/:id/stats', ({ params }) => {
    const storeId = parseInt(params.id as string, 10);
    const stats = mockStatistics[storeId] || {
      review_count: 0,
      average_rating: 0,
      visitor_review_count: 0,
      post_count: 0,
      gallery_image_count: 0,
    };

    return HttpResponse.json(stats);
  }),

  // GET /api/v1/stores/:id/gallery - Get store gallery
  http.get('/api/v1/stores/:id/gallery', ({ params, request }) => {
    const storeId = parseInt(params.id as string, 10);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('page_size') || '20', 10);

    // Collect all images from reviews and posts for this store
    const galleryImages: any[] = [];

    // Add images from reviews
    mockReviews
      .filter((r) => r.store_id === storeId)
      .forEach((review) => {
        if (review.image_urls && review.image_urls.length > 0) {
          review.image_urls.forEach((url: string) => {
            galleryImages.push({
              image_url: url,
              post_id: review.id,
              source_type: 'review',
              caption: review.content.substring(0, 50) + '...',
              rating: review.rating,
              author_name: review.user.name,
              created_at: review.created_at,
            });
          });
        }
      });

    // Add image from community post (금목걸이 이벤트)
    galleryImages.push({
      image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
      post_id: 15,
      source_type: 'community',
      caption: '🎁 새해 특가! 18K 금목걸이 30% 할인 이벤트',
      author_name: '관리자',
      created_at: '2025-01-09T10:30:00Z',
    });

    // Sort by created_at descending
    galleryImages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const offset = (page - 1) * pageSize;
    const paginated = galleryImages.slice(offset, offset + pageSize);

    return HttpResponse.json({
      data: paginated,
      total: galleryImages.length,
      page,
      page_size: pageSize,
    });
  }),
];
