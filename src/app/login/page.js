'use client';

import AnilistIcon from '@/components/icons/anilist';
import MALIcon from '@/components/icons/mal';
import KitsuIcon from '@/components/icons/kitsu';
import { Box, Button, Card, Flex } from '@yamada-ui/react';
import { initiateAuthPopupFlow } from '@/lib/client/auth/auth-flow-async';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authStore } from '@/stores/auth-store';
import Link from 'next/link';

// export const metadata = {
//   title: 'AniMan Login Page',
// };

/**
 * LoginPage component renders the login page with options to sign in using different providers.
 * @returns {import("react").ReactElement} The rendered login page component.
 */
export default function LoginPage() {
  const params = useSearchParams();
  const router = useRouter();
  // return router.push('/');

  const [provider, setProvider] = useState(null);
  useEffect(() => {
    if (provider) {
      initiateAuthPopupFlow(provider).then((authObject) => {
        authStore.setState(authObject);
        const nextRoute = decodeURIComponent(params.get('next') ?? '/');
        console.log(nextRoute);
        router.push(nextRoute);
      });
    }
  }, [provider, params, router]);
  return (
    <Box py="8" className=" min-h-screen w-screen">
      {/* <Link href="/character/40">Go to character 40</Link> */}
      <Card className="max-w-sm m-auto">
        <Flex size={1} direction={'column'} gap={'1'}>
          <Button
            onClick={() => setProvider('anilist')}
            disabled={!!provider}
            className=" w-full flex items-center justify-center gap-3 px-4 py-2 rounded-md font-medium transition bg-[#0a6395] text-white"
          >
            <AnilistIcon />
            <span>Sign in with Anilist</span>
          </Button>
          <Button
            onClick={() => setProvider('mal')}
            disabled={!!provider}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-md font-medium transition bg-[#2e51a2] text-white"
          >
            <MALIcon />
            <span>Sign in with MyAnimeList</span>
          </Button>
          <Button
            onClick={() => setProvider('kitsu')}
            disabled={!!provider}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-md font-medium transition bg-[#fd755c] text-white"
          >
            <KitsuIcon />
            <span>Login with Kitsu</span>
          </Button>
        </Flex>{' '}
      </Card>
    </Box>
  );
}
