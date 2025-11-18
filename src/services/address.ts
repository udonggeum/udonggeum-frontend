import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';
import { ValidationError } from '@/utils/errors';
import { ZodError } from 'zod';
import {
  AddressesResponseSchema,
  AddToAddressRequestSchema,
  UpdateAddressRequestSchema,
  AddressMessageResponseSchema,
  type AddressesResponse,
  type AddToAddressRequest,
  type UpdateAddressRequest,
  type AddressMessageResponse,
} from '@/schemas/address';

/**
 * Address service
 * Handles address-related API calls
 */
class AddressService {
  /**
   * Get all addresses for current user
   * @returns List of addresses
   */
  async getAddresses(): Promise<AddressesResponse> {
    try {
      // API call
      const response = await apiClient.get(ENDPOINTS.ADDRESSES.LIST);

      // Validate response
      const validatedResponse = AddressesResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Add new address
   * @param data - Address data (name, recipient, phone, address, is_default)
   * @returns Success message
   */
  async addAddress(data: AddToAddressRequest): Promise<AddressMessageResponse> {
    try {
      // Validate input
      const validatedInput = AddToAddressRequestSchema.parse(data);

      // API call
      const response = await apiClient.post(
        ENDPOINTS.ADDRESSES.ADD,
        validatedInput
      );

      // Validate response
      const validatedResponse = AddressMessageResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Update existing address
   * @param id - Address ID
   * @param data - Updated address data (name?, recipient?, phone?, address?)
   * @returns Success message
   */
  async updateAddress(
    id: number,
    data: UpdateAddressRequest
  ): Promise<AddressMessageResponse> {
    try {
      // Validate input
      const validatedInput = UpdateAddressRequestSchema.parse(data);

      // API call
      const response = await apiClient.put(
        ENDPOINTS.ADDRESSES.UPDATE(id),
        validatedInput
      );

      // Validate response
      const validatedResponse = AddressMessageResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Delete address
   * @param id - Address ID
   * @returns Success message
   */
  async deleteAddress(id: number): Promise<AddressMessageResponse> {
    try {
      // API call
      const response = await apiClient.delete(ENDPOINTS.ADDRESSES.DELETE(id));

      // Validate response
      const validatedResponse = AddressMessageResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Set address as default
   * @param id - Address ID
   * @returns Success message
   */
  async setDefaultAddress(id: number): Promise<AddressMessageResponse> {
    try {
      // API call
      const response = await apiClient.put(ENDPOINTS.ADDRESSES.SET_DEFAULT(id));

      // Validate response
      const validatedResponse = AddressMessageResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const addressService = new AddressService();
