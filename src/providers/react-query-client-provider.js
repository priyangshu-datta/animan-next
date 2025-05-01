'use client';

import { makeQueryClient } from '@/lib/client/query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * ReactQueryClientProvider is a component that provides a React Query client to its children.
 *
 * @param {object} props - The props object.
 * @param {import("react").ReactNode} props.children - The child components to be wrapped by the provider.
 * @returns {import("react").ReactElement} The QueryClientProvider component with React Query Devtools.
 */
export function ReactQueryClientProvider({ children }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
