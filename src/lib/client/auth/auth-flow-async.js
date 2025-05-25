import { authStore } from '@/stores/auth-store';
import { decodeJwt } from 'jose';

export function initiateAuthPopupFlow(provider) {
  return new Promise((resolve, reject) => {
    const popup = window.open(
      `/api/auth/provider/${provider}`,
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
      } else if (event.data.linked) {
        cleanup();
        resolve(event.data.linked);
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

async function trySilentRefreshFlow() {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'block';
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
        reject(new Error('Authentication failed or cancelled'));
      }
    }

    const cleanup = () => {
      window.removeEventListener('message', handler);
      iframe.remove();
    };

    window.addEventListener('message', handler);
  });
}

function isFirstPageLoad() {
  const [entry] = performance.getEntriesByType('navigation');
  return entry?.type === 'navigate'; // "navigate" = direct load or reload
}

export async function getValidAccessToken() {
  try {
    let accessToken = authStore.getState().accessToken;

    if (accessToken) {
      const { exp } = decodeJwt(accessToken);
      if (exp > Date.now() / 1000) {
        return accessToken;
      }
    }

    const authObject = await trySilentRefreshFlow(); // iframe

    authStore.setState(authObject);

    return authObject.accessToken;
  } catch (err) {
    console.error(err);
    console.log('Silent Refresh failed.');

    if (isFirstPageLoad()) {
      console.log('Redirecting to login page.');
      const currentPath = window.location;

      window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
      return new Promise(() => {}); // Never resolve — we're navigating
    } else {
      console.log('Trying fresh login via popup.');
      const authObject = await initiateAuthPopupFlow('anilist');
      authStore.setState(authObject);
      return authObject.accessToken;
    }
  }
}
