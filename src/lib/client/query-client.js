import { QueryClient } from '@tanstack/react-query';

/**
 * Creates and returns a new instance of a QueryClient with predefined default options.
 *
 * The default options include:
 * - `staleTime`: Set to `Infinity`, meaning queries will never become stale.
 * - `refetchOnWindowFocus`: Set to `false`, meaning queries will not refetch when the window regains focus.
 *
 * @returns {QueryClient} A configured QueryClient instance.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
      },
    },
  });
}
