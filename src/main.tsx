import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';
import App from './App.tsx';

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
 * Initialize MSW in development mode
 * Only when VITE_MOCK_API=true
 */
async function enableMocking() {
  // Only enable MSW if explicitly requested via env var
  if (import.meta.env.VITE_MOCK_API !== 'true') {
    return;
  }

  const { worker } = await import('./mocks/browser');

  // Start MSW worker
  return worker.start({
    onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
  });
}

// Start app after MSW is ready
enableMocking().then(() => {
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
});
