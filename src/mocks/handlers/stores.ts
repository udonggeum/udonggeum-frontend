/**
 * MSW handlers: Stores
 */

import { http, HttpResponse } from 'msw';
import { mockStores, mockRegions } from '../data/stores';
import { mockProducts } from '../data/products';

const BASE_URL = '/api/v1';

export const storesHandlers = [
  /**
   * GET /api/v1/stores
   * Get stores list with optional filters
   */
  http.get(`${BASE_URL}/stores`, ({ request }) => {
    const url = new URL(request.url);
    const region = url.searchParams.get('region');
    const district = url.searchParams.get('district');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('page_size') || '10', 10);

    let filteredStores = [...mockStores];

    // Apply filters
    if (region) {
      filteredStores = filteredStores.filter((s) => s.region === region);
    }
    if (district) {
      filteredStores = filteredStores.filter((s) => s.district === district);
    }

    // Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedStores = filteredStores.slice(start, end);

    return HttpResponse.json({
      count: filteredStores.length,
      stores: paginatedStores,
    });
  }),

  /**
   * GET /api/v1/stores/locations
   * Get available regions and districts
   */
  http.get(`${BASE_URL}/stores/locations`, () => {
    return HttpResponse.json({
      regions: mockRegions,
    });
  }),

  /**
   * GET /api/v1/stores/:id
   * Get store detail with optional products
   */
  http.get(`${BASE_URL}/stores/:id`, ({ params, request }) => {
    const id = parseInt(params.id as string, 10);
    const url = new URL(request.url);
    const includeProducts = url.searchParams.get('include_products') === 'true';

    const store = mockStores.find((s) => s.id === id);
    if (!store) {
      return HttpResponse.json(
        { error: '매장을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Include products if requested (for demo purposes, return all products)
    if (includeProducts) {
      return HttpResponse.json({
        ...store,
        products: mockProducts.slice(0, 3), // Just a few products per store
      });
    }

    return HttpResponse.json(store);
  }),
];
