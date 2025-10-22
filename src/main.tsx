import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';
import App from './App.tsx';
import { startMockServiceWorker } from './mocks/browser';

/**
 * QueryClient configuration
 * Global settings for TanStack Query
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
      gcTime: 1000 * 60 * 10, // 10 minutes - cache garbage collection
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: true, // Refetch when window gains focus
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

/**
 * Initialize app
 * Start mock service worker if enabled, then render app
 */
async function initializeApp() {
  // Start MSW if enabled via environment variable
  await startMockServiceWorker();

  // Render app
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* DevTools only in development */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </StrictMode>
  );
}

// Start the app
initializeApp().catch(console.error);
