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
    const pageSize = parseInt(url.searchParams.get('page_size') || '12', 10);
    const region = url.searchParams.get('region');
    const district = url.searchParams.get('district');
    const sort = url.searchParams.get('sort') || 'popularity';
    const includeOptions = url.searchParams.get('include_options') === 'true';
    const popularOnly = url.searchParams.get('popular_only') === 'true';
    const search = url.searchParams.get('search');

    let filteredProducts = [...mockProducts];

    // Apply category filter
    if (category) {
      filteredProducts = filteredProducts.filter((p) => p.category === category);
    }

    if (region) {
      filteredProducts = filteredProducts.filter((p) => p.store?.region === region);
    }

    if (district) {
      filteredProducts = filteredProducts.filter((p) => p.store?.district === district);
    }

    if (popularOnly) {
      filteredProducts = filteredProducts.filter((p) => p.popularity_score > 0);
    }

    if (search) {
      const normalized = search.trim();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.includes(normalized) ||
          (p.description ?? '').includes(normalized)
      );
    }

    switch (sort) {
      case 'price_asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'latest':
      case 'created_at_desc':
        filteredProducts.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'created_at_asc':
        filteredProducts.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'popularity':
      default:
        filteredProducts.sort((a, b) => b.popularity_score - a.popularity_score);
        break;
    }

    // Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedProducts = filteredProducts.slice(start, end).map((product) =>
      includeOptions ? getProductWithOptions(product.id) ?? product : product
    );

    return HttpResponse.json({
      count: filteredProducts.length,
      products: paginatedProducts,
      page_size: pageSize,
      offset: start,
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
      page_size: limit ?? popularProducts.length,
      offset: 0,
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
