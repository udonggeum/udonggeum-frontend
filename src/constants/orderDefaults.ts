/**
 * Order-related constants
 * Default values, limits, and validation rules for order processing
 */

/**
 * Delivery fee (standard shipping cost)
 */
export const DELIVERY_FEE = 3000;

/**
 * Maximum length for order memo/note
 */
export const MAX_MEMO_LENGTH = 200;

/**
 * Alert auto-dismiss timeouts (in milliseconds)
 */
export const ALERT_TIMEOUT = {
  DIRECT_PURCHASE: 5000, // 5 seconds
  NO_SELECTION: 5000, // 5 seconds
  LOW_STOCK: 7000, // 7 seconds
} as const;

/**
 * Low stock threshold
 * Items with stock quantity <= this value show warning
 */
export const LOW_STOCK_THRESHOLD = 3;

/**
 * Validation regex patterns
 */
export const VALIDATION_PATTERNS = {
  /** Korean phone number: 010-XXXX-XXXX or 010XXXXXXXX */
  PHONE: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,

  /** 5-digit postal code */
  POSTAL_CODE: /^\d{5}$/,
} as const;

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  RECIPIENT_REQUIRED: '수령인을 입력해주세요.',
  PHONE_REQUIRED: '연락처를 입력해주세요.',
  PHONE_INVALID: '010-1234-5678 형식으로 입력해주세요.',
  POSTAL_CODE_REQUIRED: '우편번호를 입력해주세요.',
  POSTAL_CODE_INVALID: '5자리 우편번호를 입력해주세요.',
  ADDRESS1_REQUIRED: '도로명 주소를 입력해주세요.',
} as const;

/**
 * Fulfillment types
 */
export type FulfillmentType = 'delivery' | 'pickup';

/**
 * Order form field names
 */
export type OrderFieldName = 'recipient' | 'phone' | 'postalCode' | 'address1';
