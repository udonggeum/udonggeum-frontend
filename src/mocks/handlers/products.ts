/**
 * MSW handlers: Products
 */

import { http, HttpResponse } from 'msw';
import { mockProducts, getPopularProducts, getProductWithOptions } from '../data/products';

const BASE_URL = '/api/v1';

export const productsHandlers = [
  /**
   * GET /api/v1/products
   * Get products list with optional filters
   */
  http.get(`${BASE_URL}/products`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('page_size') || '10', 10);

    let filteredProducts = [...mockProducts];

    // Apply category filter
    if (category) {
      filteredProducts = filteredProducts.filter((p) => p.category === category);
    }

    // Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedProducts = filteredProducts.slice(start, end);

    return HttpResponse.json({
      count: filteredProducts.length,
      products: paginatedProducts,
    });
  }),

  /**
   * GET /api/v1/products/popular
   * Get popular products
   */
  http.get(`${BASE_URL}/products/popular`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || undefined;
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : undefined;

    const popularProducts = getPopularProducts(category, limit);

    return HttpResponse.json({
      count: popularProducts.length,
      products: popularProducts,
    });
  }),

  /**
   * GET /api/v1/products/:id
   * Get product detail
   */
  http.get(`${BASE_URL}/products/:id`, ({ params }) => {
    const id = parseInt(params.id as string, 10);

    const product = getProductWithOptions(id);
    if (!product) {
      return HttpResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return HttpResponse.json(product);
  }),
];
