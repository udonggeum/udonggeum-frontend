/**
 * Formatting utilities
 * Common formatting functions used across the application
 */

/**
 * Format number as Korean currency (Won)
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "₩10,000")
 *
 * @example
 * formatCurrency(10000) // "₩10,000"
 * formatCurrency(0) // "₩0"
 * formatCurrency(NaN) // "₩0" (safe fallback)
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '₩0';
  }
  return `₩${amount.toLocaleString('ko-KR')}`;
}

/**
 * Build complete shipping address string from form fields
 * @param postalCode - 5-digit postal code
 * @param address1 - Street address (도로명 주소)
 * @param address2 - Detail address (상세 주소)
 * @returns Formatted address string
 *
 * @example
 * buildShippingAddress('12345', '서울시 강남구', '101동 101호')
 * // "(12345) 서울시 강남구 101동 101호"
 */
export function buildShippingAddress(
  postalCode: string,
  address1: string,
  address2: string = ''
): string {
  return `(${postalCode}) ${address1} ${address2}`.trim();
}

/**
 * Format phone number to Korean standard format
 * @param phone - Phone number (with or without hyphens)
 * @returns Formatted phone number (e.g., "010-1234-5678")
 *
 * @example
 * formatPhoneNumber('01012345678') // "010-1234-5678"
 * formatPhoneNumber('010-1234-5678') // "010-1234-5678"
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Format as 010-XXXX-XXXX or 010-XXX-XXXX
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Return as-is if format is unexpected
  return phone;
}

/**
 * Format date to Korean format
 * @param date - Date to format
 * @returns Formatted date string (e.g., "2024년 1월 1일")
 *
 * @example
 * formatDate(new Date('2024-01-01')) // "2024년 1월 1일"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (!d || isNaN(d.getTime())) {
    return '';
  }

  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time to Korean format
 * @param date - Date to format
 * @returns Formatted date and time string (e.g., "2024년 1월 1일 오후 3:30")
 *
 * @example
 * formatDateTime(new Date('2024-01-01T15:30:00')) // "2024년 1월 1일 오후 3:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (!d || isNaN(d.getTime())) {
    return '';
  }

  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
