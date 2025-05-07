import { httpRequest } from './http-client';

/**
 * Sends a GraphQL request using the provided query, variables, and provider.
 *
 * @param {object} params - The parameters for the GraphQL request.
 * @param {string} params.query - The GraphQL query string.
 * @param {object} [params.variables={}] - The variables for the GraphQL query.
 * @param {string} params.provider - The provider for the request.
 * @returns {Promise<object>} - The response from the GraphQL server.
 */
export function graphqlRequest({
  query,
  variables = {},
  provider = 'anilist',
}) {
  return httpRequest({
    url: '/api/provider/anilist',
    method: 'post',
    data: { query, variables },
    provider,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
