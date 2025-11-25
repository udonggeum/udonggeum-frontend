/**
 * MSW Browser Setup
 * Configures Mock Service Worker for browser-based API mocking
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create MSW worker with all handlers
export const worker = setupWorker(...handlers);
