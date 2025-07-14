'use client';

import MediaCard from '@/components/media-card';
import { useUserMediaList } from '@/lib/client/hooks/react_query/get/user/media/list';
import { MEDIA_ENTRY_STATUS, MEDIA_STATUS } from '@/lib/constants';
import { debounce, getCurrentAnimeSeason } from '@/utils/general';
import { PieChart } from '@yamada-ui/charts';
import { Columns3Icon, Grid3x3Icon, InfoIcon } from '@yamada-ui/lucide';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  Checkbox,
  EmptyState,
  EmptyStateTitle,
  Flex,
  Grid,
  Heading,
  IconButton,
  Loading,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Option,
  Select,
  Text,
  Toggle,
  ToggleGroup,
  useDisclosure,
  VStack,
} from '@yamada-ui/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

export default function HomePage() {
  return (
    <Suspense>
      <HomePageComponent />
    </Suspense>
  );
}

function HomePageComponent() {
  const searchParams = useSearchParams();

  const [mediaType, setMediaType] = useState(
    searchParams.get('type') ?? 'ANIME'
  );
  const [mediaEntryStatus, setMediaEntryStatus] = useState(
    `${mediaType ?? 'ANIME'}-${searchParams.get('status') ?? 'CURRENT'}`
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetched } =
    useUserMediaList({
      mediaType,
      mediaEntryStatus: mediaEntryStatus.split('-').at(1),
    });

  const fetchMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  const mediaCardDetails = useMemo(() => {
    if (isFetched) {
      return data.pages.flatMap((page) => page.mediaEntry);
    }
    return [];
  }, [data, isFetched]);

  const mediaGroupedByMediaStatus = useMemo(() => {
    return Object.entries(
      Object.groupBy(mediaCardDetails, ({ media }) => media.status)
    );
  }, [mediaCardDetails]);

  const { open, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    document.title = 'Home';
  }, []);

  return (
    <>
      <VStack
        as={'article'}
        className="max-w-6xl mx-auto px-4"
        gap="2"
        align="center"
        p="2"
      >
        <Grid
          position={'sticky'}
          top="0"
          zIndex={1}
          p="4"
          boxShadow={'base'}
          bgColor={'AppWorkspace'}
          w="full"
        >
          <Flex align={'center'} gap="2">
            <MediaListFilters
              mediaEntryStatus={mediaEntryStatus}
              mediaType={mediaType}
              setMediaEntryStatus={setMediaEntryStatus}
              setMediaType={setMediaType}
            />
            {mediaEntryStatus === 'ANIME-CURRENT' && (
              <IconButton
                icon={<InfoIcon fontSize={'lg'} />}
                variant={'outline'}
                onClick={() => onOpen()}
              />
            )}
          </Flex>
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
        {isFetched ? (
          mediaGroupedByMediaStatus.map(([mediaStatus, mediaGroupDetails]) => (
            <MediaGroupComponent
              key={mediaStatus}
              heading={
                MEDIA_STATUS[mediaType.toLowerCase()].find(
                  ({ value }) => value === mediaStatus
                ).label
              }
              mediaGroupDetails={mediaGroupDetails}
              loadMoreBtnRenders={hasNextPage}
              mediaEntryStatus={mediaEntryStatus}
            />
          ))
        ) : (
          <Loading fontSize={'lg'} />
        )}
      </VStack>

      <AnimeWatchingSummaryModal
        hasNextPage={hasNextPage}
        mediaCardsDetails={mediaCardDetails}
        onClose={onClose}
        open={open}
      />
    </>
  );
}

function MediaGroupComponent({
  heading,
  mediaEntryStatus,
  mediaGroupDetails,
  loadMoreBtnRenders,
}) {
  const [cardGroupStyle, setCardGroupStyle] = useState('columns');
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  if (mediaGroupDetails.length < 1) {
    return (
      <EmptyState>
        <EmptyStateTitle>No media found</EmptyStateTitle>
      </EmptyState>
    );
  }

  const mediaCards = mediaGroupDetails
    .filter(({ media, entry }) => {
      const maxEp = media.nextAiringEpisode?.episode - 1 || media.episodes;
      if (showPendingOnly) {
        return maxEp > entry.progress;
      }
      return true;
    })
    .map(({ media, entry }) => (
      <MediaCard key={entry.id} entry={entry} media={media} />
    ));

  return (
    <>
      <VStack
        position={'sticky'}
        top={loadMoreBtnRenders ? '165' : '120'}
        gap="0"
      >
        <Flex bgColor={'AppWorkspace'} w="full" px="2" alignItems={'center'}>
          <Heading size="md">{heading}</Heading>
          <ToggleGroup
            ml="auto"
            value={cardGroupStyle}
            onChange={setCardGroupStyle}
          >
            <Toggle value="columns" disabled={cardGroupStyle === 'columns'}>
              <Columns3Icon />
            </Toggle>
            <Toggle value="grid" disabled={cardGroupStyle === 'grid'}>
              <Grid3x3Icon />
            </Toggle>
          </ToggleGroup>
        </Flex>
        {mediaEntryStatus === 'ANIME-CURRENT' && (
          <Checkbox
            bgColor={'AppWorkspace'}
            p="1"
            label="Show pending only"
            checked={showPendingOnly}
            onChange={(ev) => {
              setShowPendingOnly(ev.target.checked);
            }}
            ml="auto"
          />
        )}
      </VStack>
      {cardGroupStyle === 'columns' && (
        <Flex
          gap="4"
          w="full"
          overflow={'auto'}
          p="4"
          boxShadow={'inner'}
          _dark={{ boxShadow: '0px 0px 0px 0px rgba(255,255,255,1) inset' }}
          bgColor={'whiteAlpha.100'}
        >
          {mediaCards.length > 0 ? (
            mediaCards
          ) : (
            <EmptyState>
              <EmptyStateTitle>No media found</EmptyStateTitle>
            </EmptyState>
          )}
        </Flex>
      )}
      {cardGroupStyle === 'grid' && (
        <Flex w={'full'} gap={'4'} p={'2'} justify={'center'} wrap="wrap">
          {mediaCards.length > 0 ? (
            mediaCards
          ) : (
            <EmptyState>
              <EmptyStateTitle>No media found</EmptyStateTitle>
            </EmptyState>
          )}
        </Flex>
      )}
    </>
  );
}

function AnimeWatchingSummaryModalBody({ mediaCardsDetails, hasMoreData }) {
  const piechartData = useMemo(
    () => [
      {
        name: 'Not releasing',
        value: mediaCardsDetails
          .filter(({ media }) => media.status === 'FINISHED')
          .reduce(
            (acc, { entry, media }) =>
              acc +
              (media?.nextAiringEpisode?.episode - 1 || media?.episodes) -
              entry.progress,
            0
          ),
        color: 'orange',
      },
      {
        name: `Released before ${getCurrentAnimeSeason()} ${new Date().getFullYear()}`,
        value:
          mediaCardsDetails.reduce(
            (acc, { entry, media }) =>
              acc +
              (media?.nextAiringEpisode?.episode - 1 || media?.episodes) -
              entry.progress,
            0
          ) -
          mediaCardsDetails
            .filter(({ media }) => media.status === 'FINISHED')
            .reduce(
              (acc, { entry, media }) =>
                acc +
                (media?.nextAiringEpisode?.episode - 1 || media?.episodes) -
                entry.progress,
              0
            ) -
          mediaCardsDetails
            .filter(
              ({ media }) =>
                media.season === getCurrentAnimeSeason() &&
                media.seasonYear === new Date().getFullYear()
            )
            .reduce(
              (acc, { entry, media }) =>
                acc +
                (media?.nextAiringEpisode?.episode - 1 || media?.episodes) -
                entry.progress,
              0
            ),
        color: 'green',
      },
      {
        name: `Released in ${getCurrentAnimeSeason()} ${new Date().getFullYear()}`,
        value: mediaCardsDetails
          .filter(
            ({ media }) =>
              media.season === getCurrentAnimeSeason() &&
              media.seasonYear === new Date().getFullYear()
          )
          .reduce(
            (acc, { entry, media }) =>
              acc +
              (media?.nextAiringEpisode?.episode - 1 || media?.episodes) -
              entry.progress,
            0
          ),
        color: 'blue',
      },
    ],
    [mediaCardsDetails]
  );

  const firstToEnd = mediaCardsDetails
    .filter(
      ({ media }) =>
        media.season === getCurrentAnimeSeason() &&
        media.seasonYear === new Date().getFullYear() &&
        media.endDate.day
    )
    .sort(({ media: m1 }, { media: m2 }) => {
      const { day: eD1, month: eM1, year: eY1 } = m1.endDate;
      const { day: eD2, month: eM2, year: eY2 } = m2.endDate;

      if (eD1 && eD2) {
        return (
          Date.parse(`${eY1}-${eM1}-${eD1}`) -
          Date.parse(`${eY2}-${eM2}-${eD2}`)
        );
      }
    })
    ?.at(0)?.media;

  return (
    <>
      {hasMoreData && (
        <Alert status="warning" flexShrink={0}>
          <AlertIcon />
          <AlertTitle>Load more data for more accurate summary.</AlertTitle>
        </Alert>
      )}
      <Text>
        Current Season: <strong>{getCurrentAnimeSeason()}</strong>
      </Text>
      <Text>
        This season you are watching{' '}
        <strong>
          {
            mediaCardsDetails.filter(
              ({ media }) =>
                media.season === getCurrentAnimeSeason() &&
                media.seasonYear === new Date().getFullYear()
            ).length
          }{' '}
        </strong>
        anime
        {mediaCardsDetails.filter(
          ({ media }) =>
            media.season === getCurrentAnimeSeason() &&
            media.seasonYear === new Date().getFullYear()
        ).length > 1
          ? 's'
          : ''}
      </Text>

      {firstToEnd && (
        <Text>
          <strong>{firstToEnd.title.userPreferred}</strong> will end first this
          season.
        </Text>
      )}

      <Heading size="md" mt="4">
        Pending Episodes
      </Heading>
      {piechartData.every(({ value }) => value === 0) ? (
        <EmptyState>
          <EmptyStateTitle>None, all on track</EmptyStateTitle>
        </EmptyState>
      ) : (
        <PieChart
          size="md"
          data={piechartData}
          tooltipDataSource="segment"
          flexShrink={0}
          mx="auto"
        />
      )}
      <Alert status="info" flexShrink={0} w="full" mt="2">
        <AlertIcon />
        <AlertTitle>Legends represent anime airing status.</AlertTitle>
      </Alert>
    </>
  );
}

function AnimeWatchingSummaryModal({
  hasNextPage,
  mediaCardsDetails,
  onClose,
  open,
}) {
  return (
    <Modal open={open} size="lg">
      <ModalHeader>
        <Heading size="lg">Summary</Heading>
      </ModalHeader>
      <ModalBody>
        <AnimeWatchingSummaryModalBody
          mediaCardsDetails={mediaCardsDetails}
          hasMoreData={hasNextPage}
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={() => onClose()}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}

function MediaListFilters({
  mediaEntryStatus,
  mediaType,
  setMediaEntryStatus,
  setMediaType,
}) {
  return (
    <Flex
      gap="2"
      align={'center'}
      wrap={{ base: 'nowrap', sm: 'wrap' }}
      w="full"
    >
      <Select
        value={mediaType}
        onChange={(option) => {
          const newSearchParams = new URLSearchParams();
          newSearchParams.set('type', option);
          newSearchParams.set('status', mediaEntryStatus.split('-').at(1));
          window.history.replaceState(
            null,
            '',
            `?${newSearchParams.toString()}`
          );
          setMediaType(option);
          setMediaEntryStatus(`${option}-${mediaEntryStatus.split('-').at(1)}`);
        }}
      >
        <Option value={'ANIME'}>Anime</Option>
        <Option value={'MANGA'}>Manga</Option>
      </Select>
      <Select
        value={mediaEntryStatus}
        onChange={(option) => {
          const newSearchParams = new URLSearchParams();
          newSearchParams.set('type', mediaType);
          newSearchParams.set('status', option.split('-').at(1));
          window.history.replaceState(
            null,
            '',
            `?${newSearchParams.toString()}`
          );
          setMediaEntryStatus(option);
        }}
        items={MEDIA_ENTRY_STATUS[mediaType.toLowerCase()].map(
          ({ label, value }) => ({
            label,
            value: `${mediaType}-${value}`,
          })
        )}
      />
    </Flex>
  );
}
