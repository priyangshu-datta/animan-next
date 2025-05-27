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
import { useState } from 'react';

export default function Home() {
  const [mediaType, setMediaType] = useState('ANIME');
  const [mediaListStatus, setMediaListStatus] = useState('CURRENT');
  return (
    <Box as={'section'} className="max-w-6xl mx-auto px-4">
      <Flex gap="2">
        <Select
          defaultValue={mediaType}
          onChange={(option) => setMediaType(option)}
        >
          <Option value={'ANIME'}>Anime</Option>
          <Option value={'MANGA'}>Manga</Option>
        </Select>
        <Select
          defaultValue={mediaListStatus}
          onChange={(option) => setMediaListStatus(option)}
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
