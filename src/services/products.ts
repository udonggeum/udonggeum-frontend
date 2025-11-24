import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';
import {
  ProductSchema,
  ProductsResponseSchema,
  type Product,
  type ProductsRequest,
  type ProductsResponse,
} from '@/schemas/products';

/**
 * Products service
 * Handles product-related API calls
 */
class ProductsService {
  /**
   * Get products list
   * @param params - Filter and pagination parameters
   * @returns Paginated products response
   */
  async getProducts(params?: ProductsRequest): Promise<ProductsResponse> {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, { params });

    // Validate response
    return ProductsResponseSchema.parse(response.data);
  }

  /**
   * Get popular products
   * @param params - Filter parameters
   * @returns Popular products response
   */
  async getPopularProducts(params?: ProductsRequest): Promise<ProductsResponse> {
    // Use regular products endpoint with popularity sort
    const requestParams = {
      ...params,
      sort: 'popularity' as const,
    };

    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, {
      params: requestParams,
    });

    // Validate response
    return ProductsResponseSchema.parse(response.data);
  }

  /**
   * Get product detail
   * @param id - Product ID
   * @returns Product detail
   */
  async getProductDetail(id: number): Promise<Product> {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.DETAIL(id));
    const data: unknown = response.data;

    const rawData =
      typeof data === 'object' && data !== null && 'data' in data
        ? (data as Record<'data', unknown>).data
        : typeof data === 'object' && data !== null && 'product' in data
          ? (data as Record<'product', unknown>).product
          : data;

    // Validate response
    return ProductSchema.parse(rawData);
  }
}

export const productsService = new ProductsService();
