'use client';

import CharacterReviewCard from '@/components/character-page/review-card';
import Rating from '@/components/rating';
import Spoiler from '@/components/spoiler';
import { useCharacterReviewsByUserPaginated } from '@/lib/client/hooks/react_query/get/character/review/by-user-paginated';
import { useMediaBasicDetailsByIds } from '@/lib/client/hooks/react_query/get/media/info/basic/by-ids';
import { useMediaReviewsByUserPaginated } from '@/lib/client/hooks/react_query/get/media/review/by-user-paginated';
import { MEDIA_TYPES, REVIEW_CATEGORIES } from '@/lib/constants';
import { debounce, sentenceCase } from '@/utils/general';
import AppStorage from '@/utils/local-storage';
import { HeartIcon } from '@yamada-ui/lucide';
import {
  Badge,
  Box,
  Button,
  EmptyState,
  EmptyStateDescription,
  Flex,
  FormControl,
  Grid,
  Heading,
  HStack,
  Image,
  Link,
  Select,
  Separator,
  Stack,
  Text,
  VStack,
} from '@yamada-ui/react';
import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

export default function ReviewsPage() {
  return (
    <Suspense>
      <ReviewsPageComponent />
    </Suspense>
  );
}

function ReviewsPageComponent() {
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

  useEffect(() => {
    document.title = 'My Reviews';
  }, []);

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

  const reviews = useMemo(
    () => data?.pages.flatMap((page) => page.data.reviews),
    [data]
  );

  const basicAnimeDetails = useMediaBasicDetailsByIds({
    mediaIds: reviews
      ?.filter(({ animeId }) => !!animeId)
      ?.map(({ animeId }) => animeId),
    mediaType: mediaType.toUpperCase() === 'ANIME' ? 'ANIME' : undefined,
  });

  const basicMangaDetails = useMediaBasicDetailsByIds({
    mediaIds: reviews
      ?.filter(({ mangaId }) => !!mangaId)
      ?.map(({ mangaId }) => mangaId),
    mediaType: mediaType.toUpperCase() === 'MANGA' ? 'MANGA' : undefined,
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

  useEffect(() => {
    console.log({
      anime: basicAnimeDetails.data,
      manga: basicMangaDetails.data,
    });
  }, [basicAnimeDetails, basicMangaDetails]);

  return (
    <>
      <Grid gap="5">
        {reviews?.length < 1 ? (
          <EmptyState>
            <EmptyStateDescription>No Reviews found</EmptyStateDescription>
          </EmptyState>
        ) : (
          reviews?.map((review) => {
            const emotionList = review.emotions
              ? review.emotions.split(';')
              : [];

            const assocMedia = (
              mediaType === 'anime'
                ? basicAnimeDetails.data?.data
                : basicMangaDetails.data?.data
            )?.find(({ id }) =>
              mediaType === 'anime'
                ? id === review.animeId
                : id === review.mangaId
            );

            return (
              <Stack
                direction={{ md: 'column', base: 'row' }}
                key={review.id}
                position={'relative'}
                alignItems={'start'}
                borderWidth={'thin'}
                gap="0"
              >
                <Box aspectRatio={0.61805} w="32" m={{ md: 'auto', base: '0' }}>
                  <Image
                    objectFit={'cover'}
                    objectPosition={'center'}
                    w="full"
                    h="full"
                    src={assocMedia?.coverImage?.extraLarge}
                    alt={assocMedia?.title?.userPreferred}
                  />
                </Box>
                <VStack gap="2" p="4" pt="2">
                  <Link
                    as={NextLink}
                    href={`/media?id=${
                      assocMedia?.id
                    }&type=${mediaType.toUpperCase()}`}
                  >
                    <Heading size="lg" fontSize={'2xl'}>
                      {assocMedia?.title?.userPreferred}
                    </Heading>
                  </Link>
                  <Flex justify="space-between" align="start" mb="2">
                    <HStack spacing="2">
                      {review.favourite && (
                        <HeartIcon color={'red'} fill={'red'} />
                      )}
                      {!['anime', 'manga'].includes(review.subjectType) && (
                        <Badge colorScheme="primary" variant="solid">
                          {review.subjectType === 'chapter' &&
                            `Ch. ${review.chapterNumber}`}
                          {review.subjectType === 'episode' &&
                            `Ep. ${review.episodeNumber}`}
                          {review.subjectType === 'volume' &&
                            `Vl. ${review.volume}`}
                        </Badge>
                      )}
                      <Rating score={review.rating} maxScore={10} stars={5} />
                    </HStack>
                  </Flex>

                  {emotionList.length > 0 && (
                    <HStack spacing="1" flexWrap="wrap">
                      {emotionList.map((emotion) => (
                        <Badge
                          key={emotion}
                          colorScheme="pink"
                          variant="subtle"
                        >
                          {emotion}
                        </Badge>
                      ))}
                    </HStack>
                  )}
                  <Link
                    as={NextLink}
                    href={`/media?id=${
                      assocMedia?.id
                    }&type=${mediaType}&tabIndex=${5}&reviewType=${
                      review.subjectType
                    }#${review.id}`}
                  >
                    Go to Review
                  </Link>
                  <Box align="start" spacing="2" w="full" mb="3">
                    <Spoiler text={review.reviewText} />
                  </Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mt="2"
                    position={'absolute'}
                    bottom={2}
                  >
                    {Intl.DateTimeFormat(AppStorage.get('locale'), {
                      timeZone: AppStorage.get('timezone'),
                      timeStyle: 'medium',
                      dateStyle: 'long',
                    }).format(new Date(review.updatedAt))}
                  </Text>
                </VStack>
              </Stack>
            );
            // <MediaReviewCard review={review} key={review.id} />
          })
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
