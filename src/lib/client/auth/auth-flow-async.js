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
    iframe.style.display = 'block'; // Or 'none' if you truly want it hidden
    iframe.src = `/api/auth/silent-refresh`;
    document.body.appendChild(iframe); // <-- Accessing document.body

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
      iframe.remove(); // <-- Accessing iframe.remove()
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
  // IMPORTANT: The entire `getValidAccessToken` function (and thus its calls to
  // `trySilentRefreshFlow` and `isFirstPageLoad`) needs to be executed ONLY on the client.
  //
  // You need to ensure that whatever component or hook calls `getValidAccessToken`
  // is a client component and calls it within a `useEffect` hook.
  // Example:
  // "use client";
  // import { useEffect } from 'react';
  // import { getValidAccessToken } from '@/utils/auth'; // Assuming this file path
  //
  // function MyClientComponent() {
  //   useEffect(() => {
  //     getValidAccessToken().then(token => {
  //       // Use token
  //     }).catch(err => {
  //       // Handle error
  //     });
  //   }, []);
  //   return null;
  // }
  // export default MyClientComponent;

  try {
    let accessToken = authStore.getState().accessToken;

    if (accessToken) {
      const { exp } = decodeJwt(accessToken);
      if (exp > Date.now() / 1000) {
        return accessToken;
      }
    }

    // `trySilentRefreshFlow` is now guarded internally, but it should only be called on client.
    const authObject = await trySilentRefreshFlow(); // iframe

    authStore.setState(authObject);

    return authObject.accessToken;
  } catch (err) {
    console.error(err);
    console.log('Silent Refresh failed.');

    // isFirstPageLoad is now guarded internally
    if (isFirstPageLoad()) {
      console.log('Redirecting to login page.');
      // window.location access needs to be client-side
      if (typeof window !== 'undefined') {
        const currentPath = window.location.href; // Use .href for the full URL
        window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
      }
      return new Promise(() => {}); // Never resolve — we're navigating
    } else {
      console.log('Trying fresh login via popup.');
      // initiateAuthPopupFlow is now guarded internally
      const authObject = await initiateAuthPopupFlow('anilist');
      authStore.setState(authObject);
      return authObject.accessToken;
    }
  }
}
