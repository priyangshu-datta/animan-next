import AnilistIcon from '@/components/icons/anilist';
import MALIcon from '@/components/icons/mal';
import KitsuIcon from '@/components/icons/kitsu';
import Link from 'next/link';
import { Link as LinkUI, Section, Box, Flex, Card } from '@radix-ui/themes';

export const metadata = {
  title: 'AniMan Login Page',
};


/**
 * LoginPage component renders the login page with options to sign in using different providers.
 * @returns {import("react").ReactElement} The rendered login page component.
 */
export default function LoginPage() {
  return (
    <Box py="8" className=" min-h-screen w-screen">
      <Card className="max-w-sm m-auto">
        <Flex size={1} direction={'column'} gap={'1'}>
          <Link
            href="/auth?provider=anilist"
            className=" w-full flex items-center justify-center gap-3 px-4 py-2 rounded-md font-medium transition bg-[#0a6395] text-white"
          >
            <AnilistIcon />
            <span>Sign in with Anilist</span>
          </Link>
          <Link
            href="/auth?provider=mal"
            className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-md font-medium transition bg-[#2e51a2] text-white"
          >
            <MALIcon />
            <span>Sign in with MyAnimeList</span>
          </Link>
          <Link
            href="/auth?provider=kitsu"
            className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-md font-medium transition bg-[#fd755c] text-white"
          >
            <KitsuIcon />
            <span>Login with Kitsu</span>
          </Link>
        </Flex>{' '}
      </Card>
    </Box>
  );
}
