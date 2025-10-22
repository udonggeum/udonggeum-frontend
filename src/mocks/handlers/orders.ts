/**
 * MSW handlers: Orders
 */

import { http, HttpResponse } from 'msw';
import { mockDB } from '../utils/db';
import { getUserIdFromAuth } from '../utils/auth';

const BASE_URL = '/api/v1';

export const ordersHandlers = [
  /**
   * GET /api/v1/orders
   * Get user's orders (requires authentication)
   */
  http.get(`${BASE_URL}/orders`, ({ request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const orders = mockDB.getOrdersByUserId(userId);

    return HttpResponse.json({
      count: orders.length,
      orders,
    });
  }),

  /**
   * POST /api/v1/orders
   * Create new order from cart (requires authentication)
   */
  http.post(`${BASE_URL}/orders`, async ({ request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fulfillment_type, shipping_address, pickup_store_id } = body as {
      fulfillment_type: 'delivery' | 'pickup';
      shipping_address?: string;
      pickup_store_id?: number;
    };

    // Validate fulfillment details
    if (fulfillment_type === 'delivery' && !shipping_address) {
      return HttpResponse.json(
        { error: '배송 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (fulfillment_type === 'pickup' && !pickup_store_id) {
      return HttpResponse.json(
        { error: '픽업 매장을 선택해주세요.' },
        { status: 400 }
      );
    }

    // Get cart items to calculate total
    const cartItems = mockDB.getCartByUserId(userId);
    if (cartItems.length === 0) {
      return HttpResponse.json(
        { error: '장바구니가 비어있습니다.' },
        { status: 400 }
      );
    }

    // Calculate total (simplified - real app would get prices from products)
    const totalAmount = cartItems.length * 500000; // Mock calculation

    // Create order
    const newOrder = mockDB.createOrder({
      user_id: userId,
      fulfillment_type,
      shipping_address,
      pickup_store_id,
      status: 'pending',
      total_amount: totalAmount,
    });

    // Clear cart after successful order
    mockDB.clearCart(userId);

    return HttpResponse.json({
      message: '주문이 접수되었습니다.',
      order: newOrder,
    }, { status: 201 });
  }),

  /**
   * GET /api/v1/orders/:id
   * Get order detail (requires authentication)
   */
  http.get(`${BASE_URL}/orders/:id`, ({ params, request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id as string, 10);
    const order = mockDB.getOrderById(id);

    if (!order) {
      return HttpResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Check if order belongs to user
    if (order.user_id !== userId) {
      return HttpResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    return HttpResponse.json(order);
  }),
];
