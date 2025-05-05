import axios from 'axios';
import { getValidAccessToken } from '../auth/auth-flow-async';

/**
 * Makes an HTTP request using Axios.
 * @param {object} options - The options for the HTTP request.
 * @param {string} options.url - The URL to send the request to.
 * @param {string} [options.method="post"] - The HTTP method to use.
 * @param {object} [options.data] - The data to send in the request body.
 * @param {object} [options.params] - The query parameters to include in the URL.
 * @param {object} [options.headers={}] - Additional headers to include in the request.
 * @param {string} options.provider - The authentication provider.
 * @returns {Promise<any>} The response data from the HTTP request.
 * @throws {Error} If the request fails or requires re-authentication.
 */
export async function httpRequest({
  url,
  method = 'post',
  data,
  params,
  headers = {},
  provider,
}) {
  const token = await getValidAccessToken(provider);

  try {
    const res = await axios({
      url,
      method,
      data,
      params,
      headers: {
        Authorization: `Bearer ${token}`,
        ...headers,
      },
    });

    // throw Error("Error")

    return res.data;
  } catch (err) {
    // At this point, it’s *not* due to missing token
    // console.error('HTTP: ', err.response.data.error);
    throw err.response.data.error;
  }
}
