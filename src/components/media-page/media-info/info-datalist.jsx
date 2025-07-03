import { useMedia } from '@/context/use-media';
import { useCountDownTimer } from '@/lib/client/hooks/use-count-down-timer';
import {
  Box,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Flex,
  Link,
  Separator,
  SkeletonText,
  Tooltip,
} from '@yamada-ui/react';
import NextLink from 'next/link';
import AppStorage from '@/utils/local-storage';
import { computeProgressString } from './utility';
import { Rating as MediaRating } from '@/components/rating'
import { MEDIA_STATUS } from '@/lib/constants'

export default function MediaInfoDataList() {
  const media = useMedia();
  const timeLeft = useCountDownTimer(media.nextAiringEpisode?.airingAt);

  if (media.isLoading) {
    return (
      <DataList
        col={2}
        variant={'subtle'}
        size={{ base: 'lg' }}
        gapY={{ base: '4', lg: '2' }}
      >
        <DataListItem>
          <SkeletonText lineClamp={1}>
            <DataListTerm>Type</DataListTerm>
          </SkeletonText>
          <SkeletonText lineClamp={1}>
            <DataListDescription>ANIME</DataListDescription>
          </SkeletonText>
        </DataListItem>
        <DataListItem>
          <SkeletonText lineClamp={1}>
            <DataListTerm>Format</DataListTerm>
          </SkeletonText>
          <SkeletonText lineClamp={1}>
            <DataListDescription>TV</DataListDescription>
          </SkeletonText>
        </DataListItem>
        <DataListItem>
          <SkeletonText lineClamp={1}>
            <DataListTerm>Score</DataListTerm>
          </SkeletonText>
          <SkeletonText lineClamp={1}>
            <DataListDescription>F</DataListDescription>
          </SkeletonText>
        </DataListItem>
        <DataListItem>
          <SkeletonText lineClamp={1}>
            <DataListTerm>Date of Birth</DataListTerm>
          </SkeletonText>
          <SkeletonText lineClamp={1}>
            <DataListDescription>May 5</DataListDescription>
          </SkeletonText>
        </DataListItem>
      </DataList>
    );
  }

  return (
    <DataList
      col={2}
      variant={'subtle'}
      size={{ base: 'lg' }}
      gapY={{ base: '2', lg: '2' }}
    >
      <DataListItem>
        <DataListTerm>Type</DataListTerm>
        <DataListDescription>{media.type}</DataListDescription>
      </DataListItem>
      <DataListItem>
        <DataListTerm>Format</DataListTerm>
        <DataListDescription>{media.format}</DataListDescription>
      </DataListItem>
      <DataListItem>
        <DataListTerm>Score</DataListTerm>
        <DataListDescription display={'flex'} gap="2">
          {media.listEntry && media.listEntry.status !== 'PLANNING' && (
            <>
              <MediaRating
                score={media.listEntry.score}
                label={'Your score: '}
              />
              <Separator orientation="vertical" h={'20px'} />
            </>
          )}
          <MediaRating
            score={media.meanScore}
            maxScore={100}
            label={'Mean Score: '}
          />
        </DataListDescription>
      </DataListItem>
      <DataListItem>
        <DataListTerm>
          {media.status === 'NOT_YET_RELEASED' && media.startDate?.year
            ? 'Release in'
            : 'Airing Status'}
        </DataListTerm>
        <DataListDescription>
          {media.type === 'ANIME' ? (
            media.nextAiringEpisode ? (
              <Flex gap="1">
                Next episode {media.nextAiringEpisode.episode} is airing in
                <Tooltip
                  label={Intl.DateTimeFormat(AppStorage.get('locale'), {
                    timeZone: AppStorage.get('timezone'),
                    timeStyle: 'medium',
                    dateStyle: 'medium',
                  }).format(new Date(media.nextAiringEpisode?.airingAt))}
                >
                  <Box>{timeLeft}</Box>
                </Tooltip>
              </Flex>
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
      {media.listEntry?.status === 'CURRENT' && (
        <DataListItem>
          <DataListTerm>Progress</DataListTerm>
          <DataListDescription>
            {media.type === 'ANIME'
              ? computeProgressString(
                  media.listEntry?.progress,
                  media.episodes,
                  media.nextAiringEpisode?.episode - 1
                )
              : computeProgressString(
                  media.listEntry?.progress,
                  media.chapters
                )}
          </DataListDescription>
        </DataListItem>
      )}
      <DataListItem>
        <DataListTerm>Reference</DataListTerm>
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
