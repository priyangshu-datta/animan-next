'use client';

import MediaPage from '@/components/media_page';
import { MediaProvider } from '@/context/Media';
import { useAnimeByMediaId } from '@/lib/client/hooks/react_query/useAnimeByMediaId';
import { Center, Loading } from '@yamada-ui/react';
import { useParams } from 'next/navigation';

/**
 * Media component fetches and displays media details based on the mediaId parameter.
 * It uses the Anilist API to retrieve data and renders the MediaPage component.
 *
 * @returns {import("react").ReactElement} The rendered Media component.
 */
export default function Media() {
  const { mediaId } = useParams();
  const { data, isLoading, isSuccess } = useAnimeByMediaId(mediaId);

  return (
    <Center>
      {isLoading ? (
        <Loading />
      ) : (
        isSuccess && (
          <MediaProvider value={data.data.Media}>
            <MediaPage />
          </MediaProvider>
        )
      )}
    </Center>
  );
}
