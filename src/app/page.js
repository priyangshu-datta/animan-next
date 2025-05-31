'use client';

import MediaCard from '@/components/media-card';
import { useUserMediaList } from '@/lib/client/hooks/react_query/get/user/media/list';
import { MEDIA_LIST_STATUS } from '@/lib/constants';
import { debounce } from '@/utils/general';
import {
  Box,
  Button,
  Flex,
  Grid,
  Loading,
  Option,
  Select,
  Skeleton,
} from '@yamada-ui/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

export default function HomePage() {
  const searchParams = useSearchParams();

  return (
    <Suspense>
      <HomePageComponent
        initMediaListStatus={searchParams.get('status') ?? 'CURRENT'}
        initMediaType={searchParams.get('type') ?? 'ANIME'}
      />
    </Suspense>
  );
}

function HomePageComponent({ initMediaType, initMediaListStatus }) {
  const [mediaType, setMediaType] = useState(initMediaType);
  const [mediaListStatus, setMediaListStatus] = useState(initMediaListStatus);
  return (
    <Box as={'section'} className="max-w-6xl mx-auto px-4">
      <Flex gap="2">
        <Select
          defaultValue={mediaType}
          onChange={(option) => {
            const newSearchParams = new URLSearchParams();
            newSearchParams.set('type', option);
            newSearchParams.set('status', mediaListStatus);
            window.history.replaceState(
              null,
              '',
              `?${newSearchParams.toString()}`
            );
            setMediaType(option);
          }}
        >
          <Option value={'ANIME'}>Anime</Option>
          <Option value={'MANGA'}>Manga</Option>
        </Select>
        <Select
          defaultValue={mediaListStatus}
          onChange={(option) => {
            const newSearchParams = new URLSearchParams();
            newSearchParams.set('type', mediaType);
            newSearchParams.set('status', option);
            window.history.replaceState(
              null,
              '',
              `?${newSearchParams.toString()}`
            );
            setMediaListStatus(option);
          }}
          items={MEDIA_LIST_STATUS[mediaType.toLocaleLowerCase()]}
        />
      </Flex>
      <MediaCardList mediaListStatus={mediaListStatus} mediaType={mediaType} />
    </Box>
  );
}

function MediaCardList({ mediaType, mediaListStatus }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetched } =
    useUserMediaList({ mediaType, mediaListStatus });

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
      {isFetched
        ? data.pages
            .flatMap((page) => page.mediaList)
            .map((listEntry) => (
              <MediaCard
                listEntry={listEntry}
                coverImage={listEntry?.media?.coverImage?.large}
                title={listEntry?.media?.title?.userPreferred}
                mediaStatus={listEntry?.media?.status}
                totalEpisodes={
                  listEntry?.media?.nextAiringEpisode?.episode - 1 ||
                  listEntry?.media?.episodes
                }
                progress={listEntry?.progress}
                nextAiringAt={
                  listEntry?.media?.nextAiringEpisode?.airingAt ?? ''
                }
                mediaId={listEntry?.media?.id}
                mediaType={mediaType}
                key={listEntry?.media?.id}
              />
            ))
        : Array.from({ length: 5 }).map(() => (
            <Box key={Math.random()} padding={'4'}>
              <Skeleton h={'xs'} w={'150px'} />
            </Box>
          ))}
      {hasNextPage && (
        <Button
          onClick={fetchMore}
          disabled={isFetchingNextPage || !hasNextPage}
          gridColumn={'1/-1'}
          w="full"
          mt={'2'}
        >
          {isFetchingNextPage ? <Loading /> : 'Load more'}
        </Button>
      )}
    </Grid>
  );
}
