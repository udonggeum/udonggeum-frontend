/**
 * MSW handlers: Seller Dashboard
 * Handles seller-related API endpoints for testing
 */

import { http, HttpResponse } from 'msw';
import { mockDB } from '../utils/db';
import { getUserIdFromAuth } from '../utils/auth';

const BASE_URL = '/api/v1';

export const sellerHandlers = [
  /**
   * GET /api/v1/seller/dashboard
   * Get seller dashboard statistics
   */
  http.get(`${BASE_URL}/seller/dashboard`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = mockDB.getUserById(userId);
    if (!user || user.role !== 'admin') {
      return HttpResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // Calculate stats (mock data for now)
    const stats = {
      total_orders: 42,
      pending_orders: 5,
      total_revenue: 12500000,
      total_products: 23,
      average_rating: 4.8,
      total_stores: 2,
    };

    return HttpResponse.json(stats, { status: 200 });
  }),

  /**
   * GET /api/v1/seller/stores
   * Get seller's stores
   */
  http.get(`${BASE_URL}/seller/stores`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = mockDB.getUserById(userId);
    if (!user || user.role !== 'admin') {
      return HttpResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // Get stores owned by this user (mock data)
    const stores = [
      {
        id: 1,
        name: '우리 금은방',
        description: '최고 품질의 금은 제품을 판매합니다',
        address: '서울시 강남구 테헤란로 123',
        phone: '010-1234-5678',
        business_hours: '평일 09:00-18:00',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return HttpResponse.json({ stores }, { status: 200 });
  }),

  /**
   * POST /api/v1/seller/stores
   * Create new store
   */
  http.post(`${BASE_URL}/seller/stores`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = mockDB.getUserById(userId);
    if (!user || user.role !== 'admin') {
      return HttpResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, address, phone, business_hours } = body as {
      name: string;
      description: string;
      address: string;
      phone: string;
      business_hours: string;
    };

    // Create new store (mock)
    const newStore = {
      id: Date.now(),
      name,
      description,
      address,
      phone,
      business_hours,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(
      { store: newStore, message: '가게가 추가되었습니다.' },
      { status: 201 }
    );
  }),

  /**
   * PUT /api/v1/seller/stores/:id
   * Update store
   */
  http.put(`${BASE_URL}/seller/stores/:id`, async ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = mockDB.getUserById(userId);
    if (!user || user.role !== 'admin') {
      return HttpResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Mock updated store
    const updatedStore = {
      id: Number(id),
      ...(body as Record<string, unknown>),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(
      { store: updatedStore, message: '가게가 수정되었습니다.' },
      { status: 200 }
    );
  }),

  /**
   * DELETE /api/v1/seller/stores/:id
   * Delete store
   */
  http.delete(`${BASE_URL}/seller/stores/:id`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = mockDB.getUserById(userId);
    if (!user || user.role !== 'admin') {
      return HttpResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    return HttpResponse.json(
      { message: '가게가 삭제되었습니다.' },
      { status: 200 }
    );
  }),

  /**
   * GET /api/v1/seller/stores/:storeId/products
   * Get products for a store
   */
  http.get(`${BASE_URL}/seller/stores/:storeId/products`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = mockDB.getUserById(userId);
    if (!user || user.role !== 'admin') {
      return HttpResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { storeId } = params;

    // Mock products for this store
    const products = [
      {
        id: 1,
        store_id: Number(storeId),
        name: '24K 금반지',
        description: '순금으로 제작된 고급 반지입니다',
        price: 500000,
        category: '반지',
        image_url: 'https://via.placeholder.com/300x300?text=Gold+Ring',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return HttpResponse.json({ products }, { status: 200 });
  }),

  /**
   * POST /api/v1/seller/products
   * Create new product
   */
  http.post(`${BASE_URL}/seller/products`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = mockDB.getUserById(userId);
    if (!user || user.role !== 'admin') {
      return HttpResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { store_id, name, description, price, category, image_url } = body as {
      store_id: number;
      name: string;
      description: string;
      price: number;
      category: string;
      image_url?: string;
    };

    // Create new product (mock)
    const newProduct = {
      id: Date.now(),
      store_id,
      name,
      description,
      price,
      category,
      image_url: image_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(
      { product: newProduct, message: '상품이 추가되었습니다.' },
      { status: 201 }
    );
  }),

  /**
   * PUT /api/v1/seller/products/:id
   * Update product
   */
  http.put(`${BASE_URL}/seller/products/:id`, async ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = mockDB.getUserById(userId);
    if (!user || user.role !== 'admin') {
      return HttpResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Mock updated product
    const updatedProduct = {
      id: Number(id),
      store_id: 1, // Mock store_id
      ...(body as Record<string, unknown>),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(
      { product: updatedProduct, message: '상품이 수정되었습니다.' },
      { status: 200 }
    );
  }),

  /**
   * DELETE /api/v1/seller/products/:id
   * Delete product
   */
  http.delete(`${BASE_URL}/seller/products/:id`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = mockDB.getUserById(userId);
    if (!user || user.role !== 'admin') {
      return HttpResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    return HttpResponse.json(
      { message: '상품이 삭제되었습니다.' },
      { status: 200 }
    );
  }),

  /**
   * GET /api/v1/seller/orders
   * Get seller's orders
   */
  http.get(`${BASE_URL}/seller/orders`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = mockDB.getUserById(userId);
    if (!user || user.role !== 'admin') {
      return HttpResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // Mock orders
    const orders = [
      {
        id: 1,
        user_id: 2,
        status: 'pending' as const,
        payment_status: 'paid' as const,
        total_amount: 500000,
        shipping_address: '서울시 강남구 테헤란로 456',
        items: [
          {
            product_id: 1,
            product_name: '24K 금반지',
            quantity: 1,
            price: 500000,
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return HttpResponse.json({ orders }, { status: 200 });
  }),

  /**
   * PATCH /api/v1/seller/orders/:id/status
   * Update order status
   */
  http.patch(`${BASE_URL}/seller/orders/:id/status`, async ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = mockDB.getUserById(userId);
    if (!user || user.role !== 'admin') {
      return HttpResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body as { status: string };

    // Mock updated order
    const updatedOrder = {
      id: Number(id),
      user_id: 2,
      status,
      payment_status: 'paid',
      total_amount: 500000,
      shipping_address: '서울시 강남구 테헤란로 456',
      items: [
        {
          product_id: 1,
          product_name: '24K 금반지',
          quantity: 1,
          price: 500000,
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(
      { order: updatedOrder, message: '주문 상태가 변경되었습니다.' },
      { status: 200 }
    );
  }),
];
