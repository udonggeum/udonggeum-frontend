/**
 * MSW handlers: Cart
 */

import { http, HttpResponse } from 'msw';
import { mockDB } from '../utils/db';
import { getUserIdFromAuth } from '../utils/auth';
import { mockProducts, mockProductOptions } from '../data/products';

const BASE_URL = '/api/v1';

export const cartHandlers = [
  /**
   * GET /api/v1/cart
   * Get user's cart items (requires authentication)
   */
  http.get(`${BASE_URL}/cart`, ({ request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const cartItems = mockDB.getCartByUserId(userId);

    // Enrich cart items with product details
    const enrichedItems = cartItems.map((item) => {
      const product = mockProducts.find((p) => p.id === item.product_id);
      const option = mockProductOptions.find((o) => o.id === item.product_option_id);

      const productPrice = product?.price ?? 0;
      const optionPrice = option?.additional_price ?? 0;
      const optionLabel = option ? `${option.name}: ${option.value}` : '';

      return {
        id: item.id,
        product_id: item.product_id,
        product_name: product?.name || 'Unknown',
        product_price: productPrice,
        product_option_id: item.product_option_id,
        option_value: optionLabel,
        option_additional_price: optionPrice,
        quantity: item.quantity,
        subtotal: (productPrice + optionPrice) * item.quantity,
        created_at: item.created_at,
      };
    });

    const total = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);

    return HttpResponse.json({
      items: enrichedItems,
      total,
      count: enrichedItems.length,
    });
  }),

  /**
   * POST /api/v1/cart
   * Add item to cart (requires authentication)
   */
  http.post(`${BASE_URL}/cart`, async ({ request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product_id, product_option_id, quantity } = body as {
      product_id: number;
      product_option_id: number;
      quantity: number;
    };

    // Validate product exists
    const product = mockProducts.find((p) => p.id === product_id);
    if (!product) {
      return HttpResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Add to cart
    const newItem = mockDB.addToCart({
      user_id: userId,
      product_id,
      product_option_id,
      quantity,
    });

    return HttpResponse.json({
      message: '장바구니에 추가되었습니다.',
      item: newItem,
    }, { status: 201 });
  }),

  /**
   * PUT /api/v1/cart/:id
   * Update cart item quantity (requires authentication)
   */
  http.put(`${BASE_URL}/cart/:id`, async ({ params, request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id as string, 10);
    const body = await request.json();
    const { quantity } = body as { quantity: number };

    const updatedItem = mockDB.updateCartItem(id, quantity);
    if (!updatedItem) {
      return HttpResponse.json(
        { error: '장바구니 항목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      message: '수량이 변경되었습니다.',
      item: updatedItem,
    });
  }),

  /**
   * DELETE /api/v1/cart/:id
   * Remove item from cart (requires authentication)
   */
  http.delete(`${BASE_URL}/cart/:id`, ({ params, request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id as string, 10);

    const success = mockDB.deleteCartItem(id);
    if (!success) {
      return HttpResponse.json(
        { error: '장바구니 항목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      message: '장바구니에서 삭제되었습니다.',
    });
  }),

  /**
   * DELETE /api/v1/cart
   * Clear cart (requires authentication)
   */
  http.delete(`${BASE_URL}/cart`, ({ request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    mockDB.clearCart(userId);

    return HttpResponse.json({
      message: '장바구니가 비워졌습니다.',
    });
  }),
];
