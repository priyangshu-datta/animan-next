import MediaRating from '@/components/rating';
import Spoiler from '@/components/spoiler';
import { useMedia } from '@/context/use-media';
import { useCountDownTimer } from '@/lib/client/hooks/use-count-down-timer';
import { MEDIA_STATUS } from '@/lib/constants';
import { formatPartialDate, sentenceCase } from '@/utils/general';
import AppStorage from '@/utils/local-storage';
import {
  AlignLeftIcon,
  AsteriskIcon,
  RadioIcon,
  RocketIcon,
  StarIcon,
  Tally5Icon,
  ViewIcon,
} from '@yamada-ui/lucide';
import {
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Flex,
  Link,
  Loading,
  Separator,
  Text,
  Tooltip,
} from '@yamada-ui/react';
import NextLink from 'next/link';
import { useMemo } from 'react';

export default function Overview() {
  const media = useMedia();

  const timeLeft = useCountDownTimer(media.nextAiringEpisode?.airingAt);
  const memoedDescription = useMemo(() => media.description, [media]);

  if (media.isLoading) {
    return <Loading />;
  }

  return (
    <DataList col={2} variant={'bold'} gap="2" size="lg">
      <DataListItem>
        <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
          <ViewIcon />
          Type
        </DataListTerm>
        <DataListDescription>{sentenceCase(media.type)}</DataListDescription>
      </DataListItem>

      <DataListItem>
        <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
          <StarIcon />
          Score
        </DataListTerm>
        <DataListDescription display={'flex'} gap="2">
          <MediaRating
            score={media.averageScore}
            maxScore={100}
            label={'Score: '}
          />
        </DataListDescription>
      </DataListItem>

      <DataListItem>
        <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
          <RadioIcon />
          {media.status === 'NOT_YET_RELEASED' && media.startDate?.year
            ? (media.type === 'ANIME'
                ? 'Release'
                : media.type === 'MANGA'
                ? 'Publish'
                : 'Error: Unexpected Media type') + ' in'
            : (media.type === 'ANIME'
                ? 'Airing'
                : media.type === 'MANGA'
                ? 'Publishing'
                : 'Error: Unexpected Media type') + ' Status'}
        </DataListTerm>
        <DataListDescription>
          {media.type === 'ANIME' ? (
            media.nextAiringEpisode ? (
              <Text>
                Next episode {media.nextAiringEpisode.episode} is airing in{' '}
                <Tooltip
                  label={Intl.DateTimeFormat(AppStorage.get('locale'), {
                    timeZone: AppStorage.get('timezone'),
                    timeStyle: 'medium',
                    dateStyle: 'medium',
                  }).format(new Date(media.nextAiringEpisode?.airingAt))}
                >
                  <span>{timeLeft}</span>
                </Tooltip>
              </Text>
            ) : media.status === 'NOT_YET_RELEASED' && media.startDate?.year ? (
              formatPartialDate(media.startDate)
            ) : (
              `Not airing (${
                MEDIA_STATUS[media.type.toLowerCase()].find(
                  ({ value }) => value === media.status
                ).label
              })`
            )
          ) : media.status === 'RELEASING' ? (
            'Ongoing'
          ) : (
            media.status
          )}
        </DataListDescription>
      </DataListItem>

      {media.seasonYear && (
        <DataListItem>
          <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
            <RocketIcon />
            Released Year
          </DataListTerm>
          <DataListDescription>{media.seasonYear}</DataListDescription>
        </DataListItem>
      )}

      {(media.episodes ?? media.chapters) && (
        <DataListItem>
          <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
            <Tally5Icon />
            {media.type === 'ANIME' ? 'Episodes' : 'Chapters'}
          </DataListTerm>
          <DataListDescription>
            {media.episodes ?? media.chapters}
          </DataListDescription>
        </DataListItem>
      )}

      <DataListItem>
        <DataListTerm display={'flex'} gap="2" alignItems={'start'}>
          <Flex gap="2" align="center">
            <AlignLeftIcon />
            Description
          </Flex>
        </DataListTerm>
        <DataListDescription>
          <Spoiler text={memoedDescription} />
        </DataListDescription>
      </DataListItem>

      <DataListItem>
        <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
          <AsteriskIcon />
          Reference
        </DataListTerm>
        <DataListDescription display={'flex'} gap="2">
          <Link
            as={NextLink}
            href={`https://anilist.co/${media.type?.toLowerCase()}/${media.id}`}
          >
            Anilist
          </Link>
          <Separator orientation="vertical" />
          <Link
            as={NextLink}
            href={`https://myanimelist.net/${media.type?.toLowerCase()}/${
              media.idMal
            }`}
          >
            MyAnimeList
          </Link>
        </DataListDescription>
      </DataListItem>
    </DataList>
  );
}
