'use client';

import MediaCard from '@/components/media_card';
import { useUserCurrentList } from '@/lib/client/hooks/react_query/useUserCurrentList';
import { Button, Grid, Loading } from '@yamada-ui/react';
import { useEffect } from 'react';

const debounce = (func, delay) => {
  let timerId;

  return (...args) => {
    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * MediaCardList is a React component that fetches and displays a list of media cards.
 * It uses the useCurrentMediaList hook to retrieve the data.
 *
 * @returns {import("react").ReactElement} A React component rendering the media card list or appropriate messages.
 */
export default function MediaCardList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetched } =
    useUserCurrentList();

  const fetchMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  return (
    <section className="max-w-6xl mx-auto px-4">
      <Grid
        gap={'4'}
        p={'2'}
        placeItems={'center'}
        gridTemplateColumns={'repeat(auto-fill, minmax(220px, 1fr))'}
      >
        {isFetched &&
          data.pages
            .flatMap((page) => page.mediaList)
            .map((watchEntry) => (
              <MediaCard
                coverImage={watchEntry.media.coverImage.large}
                title={watchEntry.media.title.romaji}
                mediaStatus={watchEntry.media.status}
                totalEpisodes={
                  watchEntry.media.nextAiringEpisode?.episode - 1 ||
                  watchEntry.media.episodes
                }
                progress={watchEntry.progress}
                nextAiringAt={
                  watchEntry.media.nextAiringEpisode?.airingAt ?? ''
                }
                mediaId={watchEntry.media.id}
                mediaListId={watchEntry.id}
                key={watchEntry.media.id}
              />
            ))}

        <Button
          onClick={fetchMore}
          disabled={isFetchingNextPage || !hasNextPage}
          gridColumn={'1/-1'}
          w="full"
        >
          {isFetchingNextPage ? (
            <Loading />
          ) : hasNextPage ? (
            'Load More'
          ) : (
            'Nothing more to load'
          )}
        </Button>
      </Grid>
    </section>
  );
}
