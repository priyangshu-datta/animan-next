'use client';

import MediaCard from '@/components/media-card';
import { useUserList } from '@/lib/client/hooks/react_query/graphql/use-user-list';
import { debounce } from '@/lib/client/utils';
import {
  Box,
  Button,
  Flex,
  Grid,
  Loading,
  NativeOption,
  NativeSelect,
} from '@yamada-ui/react';
import { useState } from 'react';

export default function Home() {
  const [mediaType, setMediaType] = useState('ANIME');
  const [mediaStatus, setMediaStatus] = useState('CURRENT');
  return (
    <section className="max-w-6xl mx-auto px-4">
      <Flex>
        <NativeSelect
          defaultValue={mediaType}
          onChange={(ev) => setMediaType(ev.target.value)}
        >
          <NativeOption value={'ANIME'}>Anime</NativeOption>
          <NativeOption value={'MANGA'}>Manga</NativeOption>
        </NativeSelect>
        <NativeSelect
          defaultValue={mediaStatus}
          onChange={(ev) => setMediaStatus(ev.target.value)}
        >
          <NativeOption value={'CURRENT'}>
            {mediaType === 'ANIME' ? 'Watching' : 'Reading'}
          </NativeOption>
          <NativeOption value={'PLANNING'}>Planning</NativeOption>
          <NativeOption value={'PAUSED'}>Paused</NativeOption>
          <NativeOption value={'DROPPED'}>Dropped</NativeOption>
          <NativeOption value={'REPEATING'}>Repeating</NativeOption>
        </NativeSelect>
      </Flex>
      <MediaCardList mediaStatus={mediaStatus} mediaType={mediaType} />
    </section>
  );
}

function MediaCardList({ mediaType, mediaStatus }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetched,
    isPending,
  } = useUserList(mediaType, mediaStatus);

  const fetchMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  return (
    <Grid
      w={'full'}
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
              watchEntry={watchEntry}
              coverImage={watchEntry.media.coverImage.large}
              title={watchEntry.media.title.userPreferred}
              mediaStatus={watchEntry.media.status}
              totalEpisodes={
                watchEntry.media.nextAiringEpisode?.episode - 1 ||
                watchEntry.media.episodes
              }
              progress={watchEntry.progress}
              nextAiringAt={watchEntry.media.nextAiringEpisode?.airingAt ?? ''}
              mediaId={watchEntry.media.id}
              key={watchEntry.media.id}
            />
          ))}
      {isPending ? (
        <Loading fontSize={"2xl"} gridColumn={"1 / -1"} />
      ) : (
        hasNextPage && (
          <Button
            onClick={fetchMore}
            disabled={isFetchingNextPage || !hasNextPage}
            gridColumn={'1/-1'}
            w="full"
          >
            Load More
          </Button>
        )
      )}
    </Grid>
  );
}
