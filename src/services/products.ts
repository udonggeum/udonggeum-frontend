import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';
import {
  ProductSchema,
  ProductsResponseSchema,
  ProductFiltersResponseSchema,
  type Product,
  type ProductsRequest,
  type ProductsResponse,
  type ProductFiltersResponse,
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
    // Map page_size to limit for popular endpoint
    const requestParams = params
      ? {
          category: params.category,
          region: params.region,
          district: params.district,
          limit: params.page_size,
        }
      : undefined;

    const response = await apiClient.get(ENDPOINTS.PRODUCTS.POPULAR, {
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

  /**
   * Get product filters
   * @returns Available categories and materials from backend
   */
  async getProductFilters(): Promise<ProductFiltersResponse> {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.FILTERS);

    // Validate response
    return ProductFiltersResponseSchema.parse(response.data);
  }
}

export const productsService = new ProductsService();
