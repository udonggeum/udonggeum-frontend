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
  async getPopularProducts(params?: {
    category?: string;
    region?: string;
    district?: string;
    limit?: number;
  }): Promise<ProductsResponse> {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.POPULAR, {
      params,
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

    // Validate response
    return ProductSchema.parse(response.data);
  }
}

export const productsService = new ProductsService();
