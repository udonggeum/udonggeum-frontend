/**
 * Seller Service
 * API calls for seller dashboard functionality
 */

import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';
import { ValidationError } from '@/utils/errors';
import { ZodError } from 'zod';
import {
  DashboardStatsSchema,
  CreateStoreRequestSchema,
  UpdateStoreRequestSchema,
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
  UpdateOrderStatusRequestSchema,
  SellerMessageResponseSchema,
  type DashboardStats,
  type CreateStoreRequest,
  type UpdateStoreRequest,
  type CreateProductRequest,
  type UpdateProductRequest,
  type UpdateOrderStatusRequest,
  type SellerMessageResponse,
} from '@/schemas/seller';
import type { Store } from '@/schemas';
import type { Product } from '@/schemas';
import type { Order } from '@/schemas';

/**
 * SellerService
 * Handles all seller-related API operations
 */
class SellerService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<{ dashboard: DashboardStats }>(
        ENDPOINTS.SELLER.DASHBOARD
      );
      const validatedData = DashboardStatsSchema.parse(response.data.dashboard);
      return validatedData;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Get seller's stores
   */
  async getStores(): Promise<Store[]> {
    const response = await apiClient.get<{ stores: Store[] }>(
      ENDPOINTS.SELLER.STORES.LIST
    );
    return response.data.stores;
  }

  /**
   * Create new store
   */
  async createStore(data: CreateStoreRequest): Promise<Store> {
    try {
      // Validate input
      const validatedData = CreateStoreRequestSchema.parse(data);

      const response = await apiClient.post<{ store: Store; message: string }>(
        ENDPOINTS.SELLER.STORES.CREATE,
        validatedData
      );

      return response.data.store;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Update existing store
   */
  async updateStore(storeId: number, data: UpdateStoreRequest): Promise<Store> {
    try {
      // Validate input
      const validatedData = UpdateStoreRequestSchema.parse(data);

      const response = await apiClient.put<{ store: Store; message: string }>(
        ENDPOINTS.SELLER.STORES.UPDATE(storeId),
        validatedData
      );

      return response.data.store;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Delete store
   */
  async deleteStore(storeId: number): Promise<SellerMessageResponse> {
    try {
      const response = await apiClient.delete<SellerMessageResponse>(
        ENDPOINTS.SELLER.STORES.DELETE(storeId)
      );

      const validatedData = SellerMessageResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Get products for a specific store
   */
  async getStoreProducts(storeId: number): Promise<Product[]> {
    const response = await apiClient.get<{ products: Product[] }>(
      ENDPOINTS.SELLER.PRODUCTS.LIST(storeId)
    );
    return response.data.products;
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      // Validate input
      const validatedData = CreateProductRequestSchema.parse(data);

      const response = await apiClient.post<{
        product: Product;
        message: string;
      }>(ENDPOINTS.SELLER.PRODUCTS.CREATE, validatedData);

      return response.data.product;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Update existing product
   */
  async updateProduct(
    productId: number,
    data: UpdateProductRequest
  ): Promise<Product> {
    try {
      // Validate input
      const validatedData = UpdateProductRequestSchema.parse(data);

      const response = await apiClient.put<{ product: Product; message: string }>(
        ENDPOINTS.SELLER.PRODUCTS.UPDATE(productId),
        validatedData
      );

      return response.data.product;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: number): Promise<SellerMessageResponse> {
    try {
      const response = await apiClient.delete<SellerMessageResponse>(
        ENDPOINTS.SELLER.PRODUCTS.DELETE(productId)
      );

      const validatedData = SellerMessageResponseSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Get store's orders
   */
  async getStoreOrders(storeId: number): Promise<Order[]> {
    const response = await apiClient.get<{ orders: Order[]; count: number }>(
      ENDPOINTS.SELLER.STORES.ORDERS(storeId)
    );
    return response.data.orders;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: number,
    data: UpdateOrderStatusRequest
  ): Promise<Order> {
    try {
      // Validate input
      const validatedData = UpdateOrderStatusRequestSchema.parse(data);

      const response = await apiClient.patch<{ order: Order; message: string }>(
        ENDPOINTS.SELLER.ORDERS.UPDATE_STATUS(orderId),
        validatedData
      );

      return response.data.order;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const sellerService = new SellerService();
