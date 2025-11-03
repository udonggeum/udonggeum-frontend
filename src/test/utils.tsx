/**
 * Test Utilities
 * Provides reusable test helpers and wrappers
 */

import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';

/**
 * Creates a fresh QueryClient for each test
 * Disables retries and logging for faster, cleaner tests
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Options for renderWithProviders
 */
interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialRoute?: string;
  routes?: string[];
}

/**
 * Render component with QueryClient and Router providers
 * Use this for components that require TanStack Query or routing
 *
 * @example
 * const { getByText } = renderWithProviders(<LoginPage />);
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    initialRoute = '/',
    routes = [initialRoute],
    ...renderOptions
  }: RenderWithProvidersOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={routes} initialIndex={0}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

/**
 * Render component with only QueryClient provider (no router)
 * Use this for isolated components that don't use navigation
 *
 * @example
 * const { getByRole } = renderWithQuery(<Button />);
 */
export function renderWithQuery(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: Omit<RenderWithProvidersOptions, 'initialRoute' | 'routes'> = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

/**
 * Render component with only Router provider (no query client)
 * Use this for components that only use routing
 *
 * @example
 * const { container } = renderWithRouter(<Navigate to="/login" />);
 */
export function renderWithRouter(
  ui: ReactElement,
  {
    initialRoute = '/',
    routes = [initialRoute],
    ...renderOptions
  }: Omit<RenderWithProvidersOptions, 'queryClient'> = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={routes} initialIndex={0}>
        {children}
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Wait for all promises to resolve
 * Useful for waiting for async state updates
 */
export const waitForPromises = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
