'use client';

import { getCurrentAnimeSeason } from '@/components/browse-page/utils';
import MediaCard from '@/components/media-card';
import { useUserMediaList } from '@/lib/client/hooks/react_query/get/user/media/list';
import { MEDIA_ENTRY_STATUS, MEDIA_STATUS } from '@/lib/constants';
import { debounce } from '@/utils/general';
import { PieChart, RadialChart } from '@yamada-ui/charts';
import { Columns3Icon, Grid3x3Icon, InfoIcon } from '@yamada-ui/lucide';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
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

  const mediaCardsDetails = useMemo(
    () => (isFetched ? data.pages.flatMap((page) => page.mediaEntry) : []),
    [data, isFetched]
  );

  const { open, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Flex
        direction={'column'}
        as={'section'}
        className="max-w-6xl mx-auto px-4"
        gap="2"
      >
        <Grid
          position={'sticky'}
          top="0"
          zIndex={1}
          p="4"
          boxShadow={'base'}
          bgColor={'AppWorkspace'}
        >
          <Flex align={"center"} gap="2">
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
                  newSearchParams.set(
                    'status',
                    mediaEntryStatus.split('-').at(1)
                  );
                  window.history.replaceState(
                    null,
                    '',
                    `?${newSearchParams.toString()}`
                  );
                  setMediaType(option);
                  setMediaEntryStatus(
                    `${option}-${mediaEntryStatus.split('-').at(1)}`
                  );
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
          Object.entries(
            Object.groupBy(mediaCardsDetails, ({ media }) => media.status)
          ).length > 1 ? (
            Object.entries(
              Object.groupBy(mediaCardsDetails, ({ media }) => media.status)
            ).map(([key, value]) => (
              <CustomComponent
                key={key}
                heading={
                  MEDIA_STATUS[mediaType.toLowerCase()].find(
                    ({ value }) => value === key
                  ).label
                }
                value={value}
                loadMoreBtnRenders={hasNextPage}
              />
            ))
          ) : (
            <CustomComponent
              value={
                Object.entries(
                  Object.groupBy(mediaCardsDetails, ({ media }) => media.status)
                )
                  ?.at(0)
                  ?.at(1) ?? []
              }
              loadMoreBtnRenders={hasNextPage}
            />
          )
        ) : (
          <Loading />
        )}
      </Flex>
      <Modal open={open} size="xl">
        <ModalHeader>
          <Heading size="lg">Summary</Heading>
        </ModalHeader>
        <ModalBody>
          <InformaitonModalBody
            mediaCardsDetails={mediaCardsDetails}
            hasMoreData={hasNextPage}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => onClose()}>Close</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

function CustomComponent({ heading, value, loadMoreBtnRenders }) {
  const [cardGroupStyle, setCardGroupStyle] = useState('columns');

  if (value.length < 1) {
    return (
      <EmptyState>
        <EmptyStateTitle>No media found</EmptyStateTitle>
      </EmptyState>
    );
  }

  return (
    <>
      <Flex
        align={'center'}
        position={'sticky'}
        top={loadMoreBtnRenders ? '120' : '71'}
        bgColor={'AppWorkspace'}
      >
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
          {/* If status is current then show statistics: how many episodes in total the user is behind. if season is near, show the first anime ending, show total epsiodes behind for current season, etc. */}
          {value.map(({ media, entry }) => (
            <MediaCard key={entry.id} entry={entry} media={media} />
          ))}
        </Flex>
      )}
      {cardGroupStyle === 'grid' && (
        <Flex w={'full'} gap={'4'} p={'2'} justify={'center'} wrap="wrap">
          {value.map(({ media, entry }) => (
            <MediaCard key={entry.id} entry={entry} media={media} />
          ))}
        </Flex>
      )}
    </>
  );
}

function InformaitonModalBody({ mediaCardsDetails, hasMoreData }) {
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
          Date.parse(`${eY2}-${eM2}-${eD2}`) -
          Date.parse(`${eY1}-${eM1}-${eD1}`)
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
          <strong>{firstToEnd.title.userPreferred}</strong>
          will end first this season.
        </Text>
      )}
      <Heading size="md">Pending Episodes</Heading>

      <PieChart
        withLegend
        size="lg"
        data={piechartData}
        tooltipDataSource="segment"
        flexShrink={0}
      />
      <Alert status="info" flexShrink={0}>
        <AlertIcon />
        <AlertTitle>Legends represent anime airing status.</AlertTitle>
      </Alert>
    </>
  );
}
