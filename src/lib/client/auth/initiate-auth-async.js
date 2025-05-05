import { authStore } from '@/stores/auth-store';
import { decodeJwt } from 'jose';

/**
 * Initiates the authentication process using a popup window.
 * @param {string} provider - The authentication provider to use.
 * @returns {Promise<{accessToken: string, userId: string}>} Resolves with an object containing the access token and user ID.
 */
export function initiateAuthAsync(provider) {
  return new Promise((resolve, reject) => {
    const popup = window.open(
      `/api/auth?provider=${provider}`,
      'authPopup',
      'width=600,height=600,menubar=no,toolbar=no,left=400'
    );

    if (!popup) {
      return reject(new Error('Popup blocked. Please allow popups.'));
    }

    // const timeout = setTimeout(() => {
    //   cleanup();
    //   reject(new Error("Authentication timed out"));
    // }, 60_000); // Timeout after 60 seconds

    const handleMessage = (event) => {
      if (event.origin !== process.env.NEXT_PUBLIC_APP_URL) return;

      if (event.data?.accessToken && event.data?.userId) {
        cleanup();
        resolve({
          accessToken: event.data.accessToken,
          userId: event.data?.userId,
        });
      } else {
        cleanup();
        reject(new Error('Authentication failed or cancelled'));
      }
    };

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      // clearTimeout(timeout);
      popup?.close();
    };

    window.addEventListener('message', handleMessage);
  });
}

/**
 * Retrieves a valid access token, initiating authentication if necessary.
 * @param {string} provider - The authentication provider to use.
 * @returns {Promise<string>} Resolves with a valid access token.
 */
export async function getValidAccessToken(provider) {
  let token = authStore.getState().accessToken;
  if (!token) {
    const authObject = await initiateAuthAsync(provider);
    authStore.setState(authObject);
    token = authObject.accessToken;
  } else {
    const { exp } = decodeJwt(token);
    if (exp > Date.now()) {
      const authObject = await initiateAuthAsync(provider);
      authStore.setState(authObject);
      token = authObject.accessToken;
    }
  }
  return token;
}
