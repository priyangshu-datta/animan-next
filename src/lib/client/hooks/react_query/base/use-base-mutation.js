import { graphqlRequest } from '@/lib/client/api-clients/graphql-client';
import { useMutation } from '@tanstack/react-query';

/**
 * A custom hook that wraps the `useMutation` hook from React Query.
 *
 * @param {object} params - The parameters for the mutation.
 * @param {string} params.query - The GraphQL query string.
 * @param {object} [params.options] - Additional options for the mutation.
 * @returns {import('@tanstack/react-query').UseMutationResult} - The mutation object returned by `useMutation`.
 */
export function useBaseMutation({ query, ...options }) {
  return useMutation({
    mutationFn: (variables) => graphqlRequest({ query, variables }),
    retry: (failureCount, error) =>
      error.message === 'Retry with new token' && failureCount < 2,
    ...options,
  });
}
