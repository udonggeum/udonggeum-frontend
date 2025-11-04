/**
 * MSW Server Configuration for Tests
 * Sets up Mock Service Worker for Node.js test environment
 */

import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';

/**
 * MSW server instance for tests
 * Intercepts HTTP requests in Node.js environment (Vitest)
 */
export const server = setupServer(...authHandlers);
