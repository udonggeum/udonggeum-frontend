import { z } from 'zod';
import { AUTH_ERRORS } from '@/constants/errors';

/**
 * Address schema
 * Validates address data from API responses
 * Matches backend API format: zip_code, address, detail_address
 */
export const AddressSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  name: z.string().min(1, AUTH_ERRORS.ADDRESS_NAME_REQUIRED),
  recipient: z.string().min(1, AUTH_ERRORS.RECIPIENT_REQUIRED),
  phone: z
    .string()
    .regex(
      /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
      AUTH_ERRORS.PHONE_INVALID
    ),
  zip_code: z
    .string()
    .regex(/^\d{5}$/, AUTH_ERRORS.POSTAL_CODE_INVALID)
    .optional()
    .default(''),
  address: z.string().min(1, AUTH_ERRORS.ADDRESS_REQUIRED),
  detail_address: z.string().optional().default(''),
  is_default: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Address = z.infer<typeof AddressSchema>;

/**
 * Addresses response schema
 * Validates response from GET /api/v1/addresses
 */
export const AddressesResponseSchema = z.object({
  addresses: z.array(AddressSchema),
});

export type AddressesResponse = z.infer<typeof AddressesResponseSchema>;

/**
 * Add address request schema
 * Validates user input for creating new address
 * Matches backend API format: zip_code, address, detail_address
 */
export const AddToAddressRequestSchema = z.object({
  name: z.string().min(1, AUTH_ERRORS.ADDRESS_NAME_REQUIRED),
  recipient: z.string().min(1, AUTH_ERRORS.RECIPIENT_REQUIRED),
  phone: z
    .string()
    .regex(
      /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
      AUTH_ERRORS.PHONE_INVALID
    ),
  zip_code: z
    .string()
    .regex(/^\d{5}$/, AUTH_ERRORS.POSTAL_CODE_INVALID)
    .optional()
    .default(''),
  address: z.string().min(1, AUTH_ERRORS.ADDRESS_REQUIRED),
  detail_address: z.string().optional().default(''),
  is_default: z.boolean().optional().default(false),
});

export type AddToAddressRequest = z.infer<typeof AddToAddressRequestSchema>;

/**
 * Update address request schema
 * Validates user input for updating existing address
 * Matches backend API format:
 * - Required: name, recipient, phone, address
 * - Optional: zip_code, detail_address
 */
export const UpdateAddressRequestSchema = z.object({
  name: z.string().min(1, AUTH_ERRORS.ADDRESS_NAME_REQUIRED),
  recipient: z.string().min(1, AUTH_ERRORS.RECIPIENT_REQUIRED),
  phone: z
    .string()
    .regex(
      /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
      AUTH_ERRORS.PHONE_INVALID
    ),
  zip_code: z
    .string()
    .regex(/^\d{5}$/, AUTH_ERRORS.POSTAL_CODE_INVALID)
    .optional()
    .default(''),
  address: z.string().min(1, AUTH_ERRORS.ADDRESS_REQUIRED),
  detail_address: z.string().optional().default(''),
});

export type UpdateAddressRequest = z.infer<typeof UpdateAddressRequestSchema>;

/**
 * Address message response schema
 * Validates success/error messages from address API endpoints
 */
export const AddressMessageResponseSchema = z.object({
  message: z.string(),
});

export type AddressMessageResponse = z.infer<typeof AddressMessageResponseSchema>;
