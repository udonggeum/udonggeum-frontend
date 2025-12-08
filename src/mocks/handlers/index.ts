/**
 * MSW Handlers
 * Central export for all Mock Service Worker request handlers
 */

import { paymentHandlers } from './payment';
import { productsHandlers } from './products';
import { storesHandlers } from './stores';
import { goldPricesHandlers } from './goldPrices';
import { communityHandlers } from './community';

// Combine all handlers
export const handlers = [
  ...paymentHandlers,
  ...productsHandlers,
  ...storesHandlers,
  ...goldPricesHandlers,
  ...communityHandlers,
];
