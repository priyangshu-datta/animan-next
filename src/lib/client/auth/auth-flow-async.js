import { authStore } from '@/stores/auth-store';
import { decodeJwt } from 'jose';

// This function needs to be guarded because it uses `window.open`
export function initiateAuthPopupFlow(provider) {
  return new Promise((resolve, reject) => {
    // ONLY run this on the client
    if (typeof window === 'undefined') {
      return resolve({
        accessToken: null,
        userId: null,
      });
    }

    const popup = window.open(
      `/api/auth/provider/${provider}`,
      'authPopup',
      'width=600,height=600,menubar=no,toolbar=no,left=400'
    );

    if (!popup) {
      return reject('Popup blocked. Please allow popups.');
    }

    const handleMessage = (event) => {
      // Use process.env.NEXT_PUBLIC_APP_URL for client-side checks
      // On the server, NEXT_PUBLIC_APP_URL might not be reliable for origin
      // but this function is guarded to run only on client.
      if (event.origin !== process.env.NEXT_PUBLIC_APP_URL) return;

      if (event.data?.accessToken && event.data?.userId) {
        cleanup();
        resolve({
          accessToken: event.data.accessToken,
          userId: event.data?.userId,
        });
      } else if (event.data.linked) {
        cleanup();
        resolve(event.data.linked);
      } else {
        cleanup();
        reject('Authentication failed or cancelled');
      }
    };

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      popup?.close();
    };

    window.addEventListener('message', handleMessage);
  });
}

// This function absolutely MUST only run on the client because it manipulates the DOM
async function trySilentRefreshFlow() {
  return new Promise((resolve, reject) => {
    // ONLY run this on the client
    if (typeof document === 'undefined') {
      // Check for document directly
      return resolve({
        accessToken: null,
        userId: null,
      });
    }

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none'; // Keep it hidden
    iframe.src = `/api/auth/silent-refresh`;
    document.body.appendChild(iframe);

    function handler(event) {
      if (event.origin !== process.env.NEXT_PUBLIC_APP_URL) return;

      if (event.data?.accessToken && event.data?.userId) {
        cleanup();
        resolve({
          accessToken: event.data.accessToken,
          userId: event.data?.userId,
        });
      } else {
        cleanup();
        reject('Authentication failed or cancelled');
      }
    }

    const cleanup = () => {
      window.removeEventListener('message', handler);
      iframe.remove();
    };

    window.addEventListener('message', handler);
  });
}

// This function also accesses browser-specific APIs (performance, window.location)
function isFirstPageLoad() {
  // ONLY run this on the client
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return false; // Safely assume not first load if on server or non-browser env
  }
  const [entry] = performance.getEntriesByType('navigation');
  return entry?.type === 'navigate'; // "navigate" = direct load or reload
}

export async function getValidAccessToken() {
  const state = authStore.getState();
  let accessToken = state.accessToken;

  // 1. Check if token is valid and not expired
  if (accessToken) {
    try {
      const { exp } = decodeJwt(accessToken);
      if (exp > Date.now() / 1000) {
        return accessToken; // Token is valid, return it immediately
      }
    } catch (e) {
      // If JWT decoding fails, the token is likely malformed or invalid
      console.warn('Malformed access token, attempting refresh.', e);
      accessToken = null; // Invalidate current token to force refresh
    }
  }

  // 2. If a refresh is already in progress, wait for it
  if (state.isRefreshing && state.refreshPromise) {
    console.log('Refresh already in progress, waiting for it to complete...');
    try {
      await state.refreshPromise;
      // After waiting, re-check the access token in case it was updated
      const newState = authStore.getState();
      if (newState.accessToken) {
        return newState.accessToken;
      }
      // If no token even after refresh, proceed to error handling/new refresh
    } catch (err) {
      console.error('Waiting for refresh promise failed:', err);
      // Fall through to initiate a new refresh or handle failure
    }
  }

  // 3. No valid token and no refresh in progress, initiate a new silent refresh
  if (
    !accessToken ||
    (accessToken && decodeJwt(accessToken).exp <= Date.now() / 1000)
  ) {
    console.log('Initiating new silent refresh...');
    authStore.getState().setIsRefreshing(true); // Set the flag
    let refreshOperation;
    try {
      refreshOperation = trySilentRefreshFlow();
      authStore.getState().setRefreshPromise(refreshOperation); // Store the promise

      const authObject = await refreshOperation;

      authStore.getState().setTokens(authObject.accessToken, authObject.userId);
      return authObject.accessToken;
    } catch (err) {
      console.error('Silent Refresh failed:', err);
      console.log('Silent Refresh failed, handling error...');

      // Important: Clear the refresh promise and flag even on failure
      authStore.getState().setRefreshPromise(null);
      authStore.getState().setIsRefreshing(false);

      if (isFirstPageLoad()) {
        console.log(
          'First page load failed authentication, redirecting to login page.'
        );
        if (typeof window !== 'undefined') {
          const currentPath = window.location.href;
          window.location.href = `/login?next=${encodeURIComponent(
            currentPath
          )}`;
        }
        return new Promise(() => {}); // Never resolve — we're navigating
      } else {
        console.log('Non-first page load, trying fresh login via popup.');
        try {
          // This path should ideally be rare if silent refresh is robust
          const authObject = await initiateAuthPopupFlow('anilist');
          authStore
            .getState()
            .setTokens(authObject.accessToken, authObject.userId);
          return authObject.accessToken;
        } catch (popupErr) {
          console.error('Popup authentication failed:', popupErr);
          // If popup also fails, redirect to login
          if (typeof window !== 'undefined') {
            const currentPath = window.location.href;
            window.location.href = `/login?next=${encodeURIComponent(
              currentPath
            )}`;
          }
          return new Promise(() => {}); // Never resolve
        }
      }
    } finally {
      // Ensure the refreshing state is reset even if there's an unexpected error
      authStore.getState().setRefreshPromise(null);
      authStore.getState().setIsRefreshing(false);
    }
  }

  // This should ideally not be reached if logic is correct, but as a fallback
  return null;
}
