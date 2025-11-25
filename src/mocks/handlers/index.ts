/**
 * MSW Handlers
 * Central export for all Mock Service Worker request handlers
 */

import { paymentHandlers } from './payment';
import { productsHandlers } from './products';

// Combine all handlers
export const handlers = [
  ...paymentHandlers,
  ...productsHandlers,
];
