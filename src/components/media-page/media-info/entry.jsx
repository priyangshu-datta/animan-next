import MediaRating from '@/components/rating';
import { useMedia } from '@/context/use-media';
import { formatOrdinal, formatPartialDate } from '@/utils/general';
import AppStorage from '@/utils/local-storage';
import {
  CircleCheckBigIcon,
  CircleDotDashedIcon,
  CirclePlayIcon,
  FileCheck2Icon,
  FilePlus2Icon,
  FileX2Icon,
  ListIcon,
  RepeatIcon,
  StarIcon,
} from '@yamada-ui/lucide';
import {
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  EmptyState,
  EmptyStateDescription,
  EmptyStateIndicator,
  EmptyStateTitle,
  Loading,
} from '@yamada-ui/react';
import { computeProgressString } from './utility';

export default function MediaEntry() {
  const media = useMedia();

  if (media.isLoading) {
    return <Loading />;
  }

  return media.entry ? (
    <DataList col={2} variant={'bold'} gap="2" size="lg">
      {['CURRENT', 'REPEATING'].includes(media.entry?.status) && (
        <DataListItem>
          <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
            <CircleDotDashedIcon />
            Progress
          </DataListTerm>
          <DataListDescription>
            {media.type === 'ANIME'
              ? computeProgressString(
                  media.entry?.progress,
                  media.episodes,
                  media.nextAiringEpisode?.episode - 1
                )
              : computeProgressString(media.entry?.progress, media.chapters)}
          </DataListDescription>
        </DataListItem>
      )}

      {formatPartialDate(media.entry.startedAt) && (
        <DataListItem>
          <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
            <CirclePlayIcon />
            Started on
          </DataListTerm>
          <DataListDescription display={'flex'} gap="2">
            {formatPartialDate(media.entry.startedAt)}
          </DataListDescription>
        </DataListItem>
      )}

      {formatPartialDate(media.entry.completedAt) && (
        <DataListItem>
          <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
            <CircleCheckBigIcon />
            Completed on
          </DataListTerm>
          <DataListDescription display={'flex'} gap="2">
            {formatPartialDate(media.entry.completedAt)}
          </DataListDescription>
        </DataListItem>
      )}

      <DataListItem>
        <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
          <FilePlus2Icon />
          Entry added
        </DataListTerm>
        <DataListDescription display={'flex'} gap="2">
          {Intl.DateTimeFormat(AppStorage.get('locale'), {
            dateStyle: 'medium',
            timeStyle: 'medium',
          }).format(new Date(media.entry.createdAt))}
        </DataListDescription>
      </DataListItem>

      <DataListItem>
        <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
          <FileCheck2Icon /> Entry updated
        </DataListTerm>
        <DataListDescription display={'flex'} gap="2">
          {Intl.DateTimeFormat(AppStorage.get('locale'), {
            dateStyle: 'medium',
            timeStyle: 'medium',
          }).format(new Date(media.entry.updatedAt))}
        </DataListDescription>
      </DataListItem>

      <DataListItem>
        <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
          <StarIcon />
          Score
        </DataListTerm>
        <DataListDescription display={'flex'} gap="2">
          {media.entry && media.entry.status !== 'PLANNING' && (
            <MediaRating score={media.entry.score} />
          )}
        </DataListDescription>
      </DataListItem>

      {media.entry.status === 'REPEATING' && (
        <DataListItem>
          <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
            <RepeatIcon />
            {media.type === 'ANIME' ? 'Re-watching' : 'Re-reading'}
          </DataListTerm>
          <DataListDescription display={'flex'} gap="2">
            {formatOrdinal(media.entry.repeat)} time
          </DataListDescription>
        </DataListItem>
      )}

      {media.entry.customLists &&
        Object.values(media.entry.customLists).some((a) => a) && (
          <DataListItem>
            <DataListTerm display={'flex'} gap="2" alignItems={'center'}>
              <ListIcon /> Lists
            </DataListTerm>
            <DataListDescription display={'flex'} gap="2">
              {Object.entries(media.entry.customLists).filter(
                ([_key, value]) => value
              )}
            </DataListDescription>
          </DataListItem>
        )}
    </DataList>
  ) : (
    <EmptyState>
      <EmptyStateTitle>No entry found.</EmptyStateTitle>
      <EmptyStateIndicator>
        <FileX2Icon />
      </EmptyStateIndicator>
      <EmptyStateDescription display={'flex'} gap="2" alignItems={'center'}>
        <FilePlus2Icon /> Start Tracking.
      </EmptyStateDescription>
    </EmptyState>
  );
}
