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

    // Enrich cart items with full product and option objects (matching CartItemSchema)
    const enrichedItems = cartItems.map((item) => {
      const product = mockProducts.find((p) => p.id === item.product_id);
      const option = item.product_option_id
        ? mockProductOptions.find((o) => o.id === item.product_option_id)
        : undefined;

      if (!product) {
        // Skip items with missing products (shouldn't happen in normal flow)
        return null;
      }

      return {
        id: item.id,
        quantity: item.quantity,
        product: product, // Full product object
        product_option: option, // Full option object (or undefined)
      };
    }).filter((item) => item !== null);

    // Calculate total
    const total = enrichedItems.reduce((sum, item) => {
      const productPrice = item.product.price ?? 0;
      const optionPrice = item.product_option?.additional_price ?? 0;
      return sum + (productPrice + optionPrice) * item.quantity;
    }, 0);

    return HttpResponse.json({
      cart_items: enrichedItems,
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
      product_option_id?: number;
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
    mockDB.addToCart({
      user_id: userId,
      product_id,
      product_option_id,
      quantity,
    });

    // Backend only returns message, no item object
    return HttpResponse.json({
      message: '장바구니에 추가되었습니다.',
    }, { status: 201 });
  }),

  /**
   * PUT /api/v1/cart/:id
   * Update cart item quantity and/or option (requires authentication)
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
    const { quantity, product_option_id } = body as {
      quantity: number;
      product_option_id?: number | null;
    };

    const updatedItem = mockDB.updateCartItem(id, {
      quantity,
      ...(product_option_id !== undefined && { product_option_id })
    });

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
