'use client';

import { sentenceCase } from '@/utils/general';
import { MONTH_NAMES } from '@/lib/constants';
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
} from '@yamada-ui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useOptimisticUpdateMediaProgress } from '@/lib/client/hooks/react_query/patch/user/media/progress';

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

export default function MediaCard({
  title,
  coverImage,
  totalEpisodes,
  nextAiringAt,
  mediaId,
  mediaType,
  mediaStatus,
  listEntry,
}) {
  const [timeLeft, setTimeLeft] = useState();

  useEffect(() => {
    if (!nextAiringAt) return;

    const update = () => {
      setTimeLeft(formatTimeLeft(nextAiringAt));
    };

    update(); // initial run
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [nextAiringAt]);

  const { progress, updateMediaProgress, updatingMediaProgress } =
    useOptimisticUpdateMediaProgress({ mediaProgress: listEntry.progress });

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

  return (
    <Flex direction={'column'} w={'full'}>
      <Card maxW="md" variant={'outline'}>
        <CardHeader>
          <Image
            src={coverImage}
            objectFit="cover"
            minW={'40'}
            maxW={'80'}
            w="full"
            aspectRatio={2 / 3}
          />
        </CardHeader>
        <CardBody>
          <Tooltip label={title}>
            <Link href={`/media?id=${mediaId}&type=${mediaType}`}>
              <Text lineClamp={1} fontSize={'xl'}>
                {title}
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
                {mediaStatus === 'NOT_YET_RELEASED' ? 'Release in' : 'Progress'}
              </DataListTerm>
              <DataListDescription>
                {mediaStatus === 'NOT_YET_RELEASED' ? (
                  computeStartDate(listEntry.media.startDate) ?? 'N/A'
                ) : (
                  <Flex gap={'1'} alignItems={'center'}>
                    {totalEpisodes - progress > 0 ? (
                      <Tooltip
                        label={`Behind ${totalEpisodes - progress} epsiodes`}
                      >
                        <span className="decoration-dashed underline-offset-2 underline">
                          {progress}
                        </span>
                      </Tooltip>
                    ) : (
                      progress
                    )}
                    <Button
                      variant={'link'}
                      onClick={() => {
                        updateMediaProgress({
                          mediaId,
                          progress: progress + 1,
                        });
                      }}
                      disabled={updatingMediaProgress}
                    >
                      {updatingMediaProgress ? '...' : '+'}
                    </Button>
                  </Flex>
                )}
              </DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>
                {mediaStatus === 'RELEASING' && listEntry.media.type !== 'MANGA'
                  ? 'Time Left'
                  : 'Status'}
              </DataListTerm>
              <DataListDescription>
                {timeLeft ?? sentenceCase(mediaStatus.replaceAll('_', ' '))}
              </DataListDescription>
            </DataListItem>
          </DataList>
        </CardBody>
      </Card>
    </Flex>
  );
}
