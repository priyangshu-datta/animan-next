'use client';

import { initiateAuthAsync } from '@/lib/client/auth/initiate_auth_async';
import { authStore } from '@/stores/auth-store';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Auth Logic that takes place in popup window
 * @returns {undefined | void}
 */
export default function AuthPopup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');
  const redirectTo = searchParams.get('redirectTo') ?? '/';

  useEffect(() => {
    if (provider) {
      initiateAuthAsync(provider)
        .then(({ access_token, user_id }) => {
          authStore.setState({ access_token, user_id });
          if (redirectTo) {
            router.push(redirectTo);
          }
        })
        .catch(console.error);
    } else {
      return router.push('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
