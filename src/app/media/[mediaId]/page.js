'use client';

import MediaPage from '@/components/media-page';
import { MediaProvider } from '@/context/use-media';
import { useFullMediaById } from '@/lib/client/hooks/react_query/graphql/use-media-by-id';
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
  try {
    const { data, isLoading, isSuccess } = useFullMediaById(parseInt(mediaId));

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
  } catch {
    throw Error('Invalid Media ID');
  }
}
