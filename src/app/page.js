'use client';

import AnilistIcon from '@/components/icons/anilist';
import { initiateAuthPopupFlow } from '@/lib/client/auth/auth-flow-async';
import { authStore } from '@/stores/auth-store'
import { Box, Button, Heading } from '@yamada-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();

  function handleSignIn() {
    setDisabled(true);
    initiateAuthPopupFlow('anilist')
      .then((authObject) => {
        authStore.setState(authObject);
        router.push('/home');
      })
      .catch((err) => {
        console.log(err);
        setDisabled(false);
      });
  }

  useEffect(() => {
    document.title = 'AniMan';
  }, []);

  return (
    <Box as={'main'} className="max-w-6xl mx-auto px-4">
      <Heading>Get Started</Heading>
      <Button
        onClick={handleSignIn}
        disabled={disabled}
        className=" w-full flex items-center justify-center gap-3 px-4 py-2 rounded-md font-medium transition bg-[#0a6395] text-white"
      >
        <AnilistIcon />
        <span>Sign in with Anilist</span>
      </Button>
    </Box>
  );
}
