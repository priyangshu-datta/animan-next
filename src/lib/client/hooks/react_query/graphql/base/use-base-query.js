import { graphqlRequest } from '@/lib/client/api-clients/graphql-client';
import { useQuery } from '@tanstack/react-query';

/**
 * A custom hook that wraps the `useQuery` hook from React Query.
 *
 * @param {object} params - The parameters for the query.
 * @param {string[]} params.key - The query key used for caching.
 * @param {string} params.query - The GraphQL query string.
 * @param {object} [params.variables={}] - The variables for the GraphQL query.
 * @param {object} [params.options] - Additional options for the query.
 * @returns {import("@tanstack/react-query").UseQueryResult} The result of the `useQuery` hook.
 */
export function useBaseQuery({ key, query, variables = {}, ...options }) {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: key,
    queryFn: () => graphqlRequest({ query, variables }),
    retry: (failureCount, error) => {
      return error.message === 'Retry with new token' && failureCount < 2;
    },
    notifyOnChangeProps: 'all',
    ...options,
  });
}
