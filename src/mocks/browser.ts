/**
 * MSW browser setup
 * Configures Service Worker for development
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * Setup MSW worker for browser
 * This will intercept requests and return mock responses
 */
export const worker = setupWorker(...handlers);

/**
 * Start mock service worker
 * Called conditionally based on environment variable
 */
export async function startMockServiceWorker() {
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_API === 'true') {
    await worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    });

    console.log(
      '%c🎭 Mock API Enabled',
      'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
    );
    console.log('Mock handlers loaded:', handlers.length);
  }
}
