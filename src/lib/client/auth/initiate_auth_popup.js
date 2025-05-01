import { authStore } from '@/stores/auth-store';

/**
 * Initiates the authentication process by opening a popup for the specified provider.
 * Listens for a message event to handle the authentication response.
 *
 * @param {string} provider Resource Provider
 * @param {{router: import("next/dist/shared/lib/app-router-context.shared-runtime").AppRouterInstance; to: string}} [redirect] - Optional redirect object containing the router and target path.
 *
 */
export function initiateAuth(provider, redirect) {
  const popup = window.open(
    `/api/auth?provider=${provider}`,
    'authPopup',
    'width=600,height=600,menubar=no,toolbar=no,left=400'
  );

  const handleMessage = (event) => {
    // Validate origin
    if (event.origin !== process.env.NEXT_PUBLIC_APP_URL) {
      return;
    }

    if (event.data?.access_token) {
      // setAccessToken(event.data.access_token);
      authStore.setState({ access_token: event.data.access_token });
      if (redirect) return redirect.router.push(redirect.to);
    } else {
      console.error('Authentication failed');
    }
  };

  window.addEventListener('message', handleMessage);

  if (!popup) {
    console.error('Popup blocked. Please allow popups and try again.');
  }
}
