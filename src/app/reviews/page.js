'use client';

import MediaReviewCard from '@/components/media-page/review-card';
import CharacterReviewCard from '@/components/character-page/review-card';
import { useCharacterReviewsByUserPaginated } from '@/lib/client/hooks/react_query/get/character/review/by-user-paginated';
import { useMediaReviewsByUserPaginated } from '@/lib/client/hooks/react_query/get/media/review/by-user-paginated';
import { MEDIA_TYPES, REVIEW_CATEGORIES } from '@/lib/constants';
import { debounce, sentenceCase } from '@/utils/general';
import {
  Button,
  EmptyState,
  EmptyStateDescription,
  Flex,
  FormControl,
  Grid,
  Select,
  Separator,
} from '@yamada-ui/react';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function TimlinePage() {
  return (
    <Suspense>
      <TimelinePageComponent />
    </Suspense>
  );
}

function TimelinePageComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const [reviewType, setReviewType] = useState(
    ['anime', 'manga', 'character'].includes(
      searchParams.get('reviewType')?.toLowerCase()
    )
      ? searchParams.get('reviewType').toLowerCase()
      : 'anime'
  );
  const [subjectType, setSubjectType] = useState(
    ['anime', 'manga'].includes(searchParams.get('reviewType')?.toLowerCase())
      ? REVIEW_CATEGORIES[searchParams.get('reviewType').toLowerCase()]
          .map((cat) => cat.value)
          .includes(searchParams.get('subjectType').toLowerCase())
        ? searchParams.get('reviewType').toLowerCase()
        : 'all'
      : ['anime', 'manga'].includes(reviewType)
      ? 'all'
      : ''
  );

  return (
    <Flex p="2" gap="4" direction={'column'}>
      <Flex gap="2" wrap={{ base: 'nowrap', md: 'wrap' }}>
        <FormControl label="Review Type">
          <Select
            value={reviewType}
            items={[
              {
                label: 'Media',
                items: MEDIA_TYPES.map((mt) => ({
                  label: sentenceCase(mt),
                  value: mt.toLowerCase(),
                })),
              },
              {
                label: 'Character',
                items: [{ label: 'Character', value: 'character' }],
              },
            ]}
            onChange={(option) => {
              const newSearchParams = new URLSearchParams();
              if (option !== 'character') {
                setSubjectType('all');
                newSearchParams.set('subjectType', 'all');
              }
              setReviewType(option);
              newSearchParams.set('reviewType', option);

              window.history.replaceState(
                null,
                '',
                `?${newSearchParams.toString()}`
              );
            }}
            disabled={isLoading}
          />
        </FormControl>
        {MEDIA_TYPES.map((mt) => mt.toLowerCase()).includes(reviewType) && (
          <FormControl label="Subject Type">
            <Select
              value={subjectType}
              items={[
                { label: 'Any', value: 'all' },
                ...REVIEW_CATEGORIES[reviewType],
              ]}
              onChange={(option) => {
                const newSearchParams = new URLSearchParams();
                newSearchParams.set('subjectType', option);
                setSubjectType(option);
                window.history.replaceState(
                  null,
                  '',
                  `?${newSearchParams.toString()}`
                );
              }}
              disabled={isLoading}
            />
          </FormControl>
        )}
      </Flex>
      <Separator variant={'dotted'} />

      {MEDIA_TYPES.map((mt) => mt.toLowerCase()).includes(reviewType) && (
        <MediaReviewList
          setIsLoading={setIsLoading}
          mediaType={reviewType}
          subjectType={subjectType}
        />
      )}
      {reviewType === 'character' && (
        <CharacterReviewList setIsLoading={setIsLoading} />
      )}
    </Flex>
  );
}

function CharacterReviewList({ setIsLoading }) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCharacterReviewsByUserPaginated();

  useEffect(() => {
    if (typeof isLoading === 'boolean') {
      setIsLoading(isLoading);
    }
  }, [isLoading]);

  const fetchMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  return (
    <>
      <Grid gap="2">
        {data?.pages.flatMap((page) => page.data.reviews).length < 1 ? (
          <EmptyState>
            <EmptyStateDescription>No Reviews found</EmptyStateDescription>
          </EmptyState>
        ) : (
          data?.pages
            .flatMap((page) => page.data.reviews)
            .map((review) => (
              <CharacterReviewCard review={review} key={review.id} />
            ))
        )}
      </Grid>
      <Button
        w={'full'}
        onClick={fetchMore}
        disabled={isFetchingNextPage || !hasNextPage}
        visibility={!isFetchingNextPage && !hasNextPage && 'collapse'}
      >
        {isFetchingNextPage ? 'Loading more...' : hasNextPage && 'Load More'}
      </Button>
    </>
  );
}

function MediaReviewList({ setIsLoading, mediaType, subjectType }) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useMediaReviewsByUserPaginated({
      mediaType,
      subjectType,
    });

  useEffect(() => {
    if (typeof isLoading === 'boolean') {
      setIsLoading(isLoading);
    }
  }, [isLoading]);

  const fetchMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  return (
    <>
      <Grid gap="2">
        {data?.pages.flatMap((page) => page.data.reviews).length < 1 ? (
          <EmptyState>
            <EmptyStateDescription>No Reviews found</EmptyStateDescription>
          </EmptyState>
        ) : (
          data?.pages
            .flatMap((page) => page.data.reviews)
            .map((review) => (
              <MediaReviewCard review={review} key={review.id} />
            ))
        )}
      </Grid>
      <Button
        w={'full'}
        onClick={fetchMore}
        disabled={isFetchingNextPage || !hasNextPage}
        visibility={!isFetchingNextPage && !hasNextPage && 'collapse'}
      >
        {isFetchingNextPage ? 'Loading more...' : hasNextPage && 'Load More'}
      </Button>
    </>
  );
}
