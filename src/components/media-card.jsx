'use client';

import { useUpdateUserMedia } from '@/lib/client/hooks/react_query/patch/user/media'
import { MEDIA_STATUS } from '@/lib/constants'
import { formatPartialDate, sentenceCase } from '@/utils/general'
import AppStorage from '@/utils/local-storage'
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
} from '@yamada-ui/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Rating } from './rating'

/**
 *
 * @param {number} nextAiringAt
 * @returns {string}
 */
/**
 * Formats the time left until `nextAiringAt` using Intl.RelativeTimeFormat
 * for localized and grammatically correct output.
 *
 * @param {number} nextAiringAt - Unix timestamp (seconds) of the next airing time.
 * @param {string} [locale='en-US'] - The locale string (e.g., 'en-US', 'fr-FR', 'ja-JP').
 * @returns {string} The formatted time left, e.g., "in 3 days", "in 5 hours", "10 minutes".
 */
function formatTimeLeft(nextAiringAt, locale = 'en-US') {
  const now = Date.now() / 1000; // current time in seconds
  const diff = Math.max(0, nextAiringAt - now); // difference in seconds

  if (diff < 5) {
    // For very small differences, you might still want a custom string
    // or use Intl.RelativeTimeFormat for "now".
    // For "now", it's best to stick to your original "Airing now!" as Intl might give "in 0 seconds".
    return 'Airing now!';
  }

  const seconds = Math.floor(diff);
  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);

  const rtf = new Intl.RelativeTimeFormat(AppStorage.get('locale'), {
    numeric: 'auto',
    style: 'narrow',
  });
  // 'numeric: auto' means "in 1 day" instead of "in 1 days", "yesterday" instead of "1 day ago" etc.
  // 'style: long' means "days", "hours", "minutes", "seconds". You can use 'short' or 'narrow' for "d", "h", "m", "s".

  if (days > 0) {
    // To get combined units like "3d 5h", Intl.RelativeTimeFormat needs to be called twice.
    // However, Intl.RelativeTimeFormat is primarily designed for a single dominant unit.
    // Combining them perfectly localized is complex with Intl.
    // A common approach is to pick the largest relevant unit.
    if (days >= 2) {
      return rtf.format(days, 'day'); // e.g., "in 3 days"
    } else {
      // days === 1
      // If it's exactly 1 day, "tomorrow" is often preferred.
      // If it's less than 2 days but more than 1, still use rtf.format
      const remainingHours = hours % 24;
      if (remainingHours > 0) {
        // For "1 day and X hours", Intl.RelativeTimeFormat doesn't directly combine units.
        // We'll fall back to showing the dominant unit.
        // If you absolutely need "1 day 5 hours", you might create a custom string
        // but it loses Intl's localization benefits for the combined phrase itself.
        // For practical purposes, "in 1 day" is usually sufficient, or "in 25 hours".
        if (hours >= 24 && hours < 48) {
          // If it's more than 24 hours but less than 48, still report as 1 day
          return sentenceCase(rtf.format(days, 'day')); // "in 1 day"
        }
      }
      return rtf.format(days, 'day');
    }
  } else if (hours > 0) {
    return rtf.format(hours, 'hour'); // e.g., "in 5 hours"
  } else if (minutes > 0) {
    return rtf.format(minutes, 'minute'); // e.g., "in 10 minutes"
  } else {
    // For seconds, 'auto' numeric might still return 'in 0 seconds' for small values.
    // Consider if you really want "in 3 seconds" or just "Airing now!" for very small diffs.
    return rtf.format(seconds, 'second'); // e.g., "in 20 seconds"
  }
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
    <Flex direction={'column'} w={'full'} alignSelf={'stretch'}>
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
            gapY={{ base: '2', lg: '2' }}
          >
            <DataListItem>
              <DataListTerm>
                {listEntry.media?.status === 'NOT_YET_RELEASED' &&
                listEntry.media?.startDate?.year
                  ? 'Release in'
                  : listEntry.media?.status === 'RELEASING'
                  ? 'Airs'
                  : 'Airing Status'}
              </DataListTerm>
              <DataListDescription>
                {listEntry.media?.type === 'ANIME'
                  ? listEntry.media?.nextAiringEpisode
                    ? `${timeLeft} (Ep ${listEntry.media?.nextAiringEpisode.episode})`
                    : listEntry.media?.status === 'NOT_YET_RELEASED' &&
                      listEntry.media?.startDate?.year
                    ? formatPartialDate(listEntry.media?.startDate)
                    : `${
                        MEDIA_STATUS[listEntry.media?.type.toLowerCase()].find(
                          ({ value }) => value === listEntry.media?.status
                        ).label
                      }`
                  : listEntry.media?.status === 'RELEASING'
                  ? 'Ongoing'
                  : listEntry.media?.status}
              </DataListDescription>
            </DataListItem>
            {listEntry.status === 'CURRENT' ? (
              <DataListItem>
                <DataListTerm>Progress</DataListTerm>
                <DataListDescription>
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
                </DataListDescription>
              </DataListItem>
            ) : (
              listEntry.status === 'COMPLETED' && (
                <DataListItem>
                  <DataListTerm>Score</DataListTerm>
                  <DataListDescription>
                    <Rating score={listEntry.score} />
                  </DataListDescription>
                </DataListItem>
              )
            )}
            {/* <DataListItem>
              <DataListTerm>
                {listEntry.media.status === 'NOT_YET_RELEASED'
                  ? 'Release in'
                  : 'Progress'}
              </DataListTerm>
              <DataListDescription>
                {listEntry.media.status === 'NOT_YET_RELEASED' ? (
                  // computeStartDate(listEntry.startDate)
                  listEntry?.startDate?.day
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
                  (listEntry.media.type !== 'MANGA' ? 'Time Left' : 'Status')}
              </DataListTerm>
              <DataListDescription>
                {timeLeft ??
                  sentenceCase(listEntry.media.status.replaceAll('_', ' '))}
              </DataListDescription>
            </DataListItem> */}
          </DataList>
        </CardBody>
      </Card>
    </Flex>
  );
}

/**

not yet released
start date: known | unknown
release in, status



 */
