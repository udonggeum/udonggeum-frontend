/**
 * MSW handlers index
 * Combines all handlers following barrel export pattern
 */

import { authHandlers } from './auth';
import { storesHandlers } from './stores';
import { productsHandlers } from './products';
import { cartHandlers } from './cart';
import { ordersHandlers } from './orders';
import { addressHandlers } from './address';
import { sellerHandlers } from './seller';

export const handlers = [
  ...authHandlers,
  ...storesHandlers,
  ...productsHandlers,
  ...cartHandlers,
  ...ordersHandlers,
  ...addressHandlers,
  ...sellerHandlers,
];
