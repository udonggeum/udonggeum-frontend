import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';
import { ValidationError } from '@/utils/errors';
import { ZodError } from 'zod';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  AuthResponseSchema,
  MeResponseSchema,
  TokensSchema,
  UpdateProfileRequestSchema,
  UpdateProfileResponseSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  MessageResponseSchema,
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
  type MeResponse,
  type Tokens,
  type UpdateProfileRequest,
  type UpdateProfileResponse,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type MessageResponse,
} from '@/schemas/auth';

/**
 * Auth service
 * Handles authentication-related API calls
 */
class AuthService {
  /**
   * Register new user
   * @param data - Registration data (email, password, name, phone)
   * @returns Auth response with user and tokens
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validate input
      const validatedInput = RegisterRequestSchema.parse(data);

      // API call
      const response = await apiClient.post(
        ENDPOINTS.AUTH.REGISTER,
        validatedInput
      );

      // Validate response
      const validatedResponse = AuthResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Login user
   * @param data - Login credentials (email, password)
   * @returns Auth response with user and tokens
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Validate input
      const validatedInput = LoginRequestSchema.parse(data);

      // Normalize email to lowercase for consistency
      const normalizedData = {
        ...validatedInput,
        email: validatedInput.email.toLowerCase(),
      };

      // API call
      const response = await apiClient.post(
        ENDPOINTS.AUTH.LOGIN,
        normalizedData
      );

      // Validate response
      const validatedResponse = AuthResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Get current user
   * @returns Current user information
   */
  async getMe(): Promise<MeResponse> {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME);

    // Validate response
    return MeResponseSchema.parse(response.data);
  }

  /**
   * Logout user
   * Optional backend cleanup - clears auth state
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Logout should succeed even if backend call fails
      // Client-side state will be cleared regardless
      console.warn('Logout API call failed, proceeding with client-side cleanup', error);
    }
  }

  /**
   * Refresh access token
   * @param refreshToken - Refresh token from auth store
   * @returns New tokens
   */
  async refreshToken(refreshToken: string): Promise<Tokens> {
    const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    });

    // Validate response
    return TokensSchema.parse(response.data);
  }

  /**
   * Update user profile
   * @param data - Profile data (name, phone)
   * @returns Updated user information
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      // Validate input
      const validatedInput = UpdateProfileRequestSchema.parse(data);

      // API call
      const response = await apiClient.put(
        ENDPOINTS.AUTH.ME,
        validatedInput
      );

      // Validate response
      const validatedResponse = UpdateProfileResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Request password reset
   * Sends password reset email with token
   * @param data - Email address
   * @returns Success message
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
    try {
      // Validate input
      const validatedInput = ForgotPasswordRequestSchema.parse(data);

      // Normalize email to lowercase for consistency
      const normalizedData = {
        email: validatedInput.email.toLowerCase(),
      };

      // API call
      const response = await apiClient.post(
        ENDPOINTS.AUTH.FORGOT_PASSWORD,
        normalizedData
      );

      // Validate response
      const validatedResponse = MessageResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param data - Reset token and new password
   * @returns Success message
   */
  async resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
    try {
      // Validate input
      const validatedInput = ResetPasswordRequestSchema.parse(data);

      // API call
      const response = await apiClient.post(
        ENDPOINTS.AUTH.RESET_PASSWORD,
        validatedInput
      );

      // Validate response
      const validatedResponse = MessageResponseSchema.parse(response.data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZod(error);
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
