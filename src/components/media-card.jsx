'use client';

import { useUpdateUserMedia } from '@/lib/client/hooks/react_query/patch/user/media';
import { MONTH_NAMES } from '@/lib/constants';
import { sentenceCase } from '@/utils/general';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Flex,
  Image,
  Text,
  Tooltip,
  useNotice,
} from '@yamada-ui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 *
 * @param {number} nextAiringAt
 * @returns {string}
 */
function formatTimeLeft(nextAiringAt) {
  const now = Date.now() / 1000; // current time in seconds
  const diff = Math.max(0, nextAiringAt - now);

  if (diff < 5) return 'Airing now!';

  const seconds = Math.floor(diff % 60)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((diff / 60) % 60)
    .toString()
    .padStart(2, '0');
  const hours = Math.floor((diff / 3600) % 24);

  const days = Math.floor(diff / 86400);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m ${seconds}s`;
  }
}

function computeStartDate({ year, month, day }) {
  let startDate = '';
  if (year) {
    startDate = year;
  }
  if (month) {
    startDate = MONTH_NAMES[month - 1] + ' ' + startDate;
  }
  if (day) {
    startDate = day + ' ' + startDate;
  }

  return startDate.length < 1 ? 'N/A' : startDate;
}

export default function MediaCard({ listEntry }) {
  const [timeLeft, setTimeLeft] = useState();

  const totalEpisodes =
    listEntry?.media?.nextAiringEpisode?.episode - 1 ||
    listEntry?.media?.episodes;

  const nextAiringAt = listEntry?.media?.nextAiringEpisode?.airingAt ?? '';

  useEffect(() => {
    if (!nextAiringAt) return;

    const update = () => {
      setTimeLeft(formatTimeLeft(nextAiringAt));
    };

    update(); // initial run
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [nextAiringAt]);

  // const { progress, updateMediaProgress, updatingMediaProgress } =
  //   useOptimisticUpdateMediaProgress({ mediaProgress: listEntry.progress });
  const notice = useNotice();

  const { mutate, isPending } = useUpdateUserMedia({
    handleSuccess: () => {
      notice({
        status: 'success',
        description: 'Media List Entry Updated',
      });
    },
    handleError: (error) => {
      notice({
        status: 'error',
        description: error.message,
        title: error.name,
      });
    },
  });

  return (
    <Flex direction={'column'} w={'full'}>
      <Card maxW="md" variant={'outline'}>
        <CardHeader>
          <Image
            src={listEntry?.media?.coverImage?.large}
            objectFit="cover"
            minW={'40'}
            maxW={'80'}
            w="full"
            aspectRatio={2 / 3}
          />
        </CardHeader>
        <CardBody>
          <Tooltip label={listEntry?.media?.title?.userPreferred}>
            <Link
              href={`/media?id=${listEntry.media.id}&type=${listEntry.media.type}`}
            >
              <Text lineClamp={1} fontSize={'xl'}>
                {listEntry?.media?.title?.userPreferred}
              </Text>
            </Link>
          </Tooltip>
          <DataList
            col={2}
            variant={'subtle'}
            size={{ base: 'lg' }}
            gapY={{ base: '4', lg: '2' }}
          >
            <DataListItem>
              <DataListTerm>
                {listEntry.media.status === 'NOT_YET_RELEASED'
                  ? 'Release in'
                  : 'Progress'}
              </DataListTerm>
              <DataListDescription>
                {listEntry.media.status === 'NOT_YET_RELEASED' ? (
                  computeStartDate(listEntry.startDate) ?? 'N/A'
                ) : (
                  <Flex gap={'1'} alignItems={'center'}>
                    {totalEpisodes - listEntry.progress > 0 ? (
                      <Tooltip
                        label={`Behind ${
                          totalEpisodes - listEntry.progress
                        } epsiodes`}
                      >
                        <span className="decoration-dashed underline-offset-2 underline">
                          {listEntry.progress}
                        </span>
                      </Tooltip>
                    ) : (
                      listEntry.progress
                    )}
                    <Button
                      variant={'link'}
                      onClick={() => {
                        mutate({
                          mediaId: listEntry.media.id,
                          mediaType: listEntry.media.type,
                          progress: listEntry.progress + 1,
                        });
                      }}
                      disabled={isPending}
                    >
                      {isPending ? '...' : '+'}
                    </Button>
                  </Flex>
                )}
              </DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>
                {listEntry.media.status === 'RELEASING' &&
                listEntry.media.type !== 'MANGA'
                  ? 'Time Left'
                  : 'Status'}
              </DataListTerm>
              <DataListDescription>
                {timeLeft ??
                  sentenceCase(listEntry.media.status.replaceAll('_', ' '))}
              </DataListDescription>
            </DataListItem>
          </DataList>
        </CardBody>
      </Card>
    </Flex>
  );
}
