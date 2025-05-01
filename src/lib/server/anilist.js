import axios from 'axios';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { ANILIST_GRAPHQL_ENDPOINT } from '../constants';

/**
 * Fetch data from a GraphQL endpoint using axios.
 *
 * @param {string} query - The GraphQL query string
 * @param {object} [variables] - Optional variables for the query
 * @param {object} [headers] - Optional additional headers (e.g. Authorization)
 * @returns {Promise<any>} - The response data from the GraphQL server
 */
export async function getAnilistClient(query, variables = {}, headers = {}) {
  const response = await axios.post(
    ANILIST_GRAPHQL_ENDPOINT,
    {
      query,
      variables,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
    }
  );

  if (response.data.errors) {
    throw new AppError({
      code: ERROR_CODES.AL_ERROR,
      message: 'GraphQL request returned errors.',
      details: response.data.errors,
      status: response.data.errors.status,
    });
  }

  return response.data.data;
}
