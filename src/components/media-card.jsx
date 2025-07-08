import { useUpdateUserMedia } from '@/lib/client/hooks/react_query/patch/user/media';
import { MEDIA_STATUS } from '@/lib/constants';
import { formatPartialDate, formatTimeLeft } from '@/utils/general';
import {
  Box,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Flex,
  Image,
  Link,
  Loading,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  useNotice,
} from '@yamada-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import Rating from './rating';

export default function MediaCard({
  media,
  entry,
  aboveDataListComponent,
  dataListItems,
  belowDataListComponent,
}) {
  const [timeLeft, setTimeLeft] = useState();

  const totalEpisodes =
    media.type === 'ANIME'
      ? media?.nextAiringEpisode?.episode - 1 || media?.episodes
      : media.type === 'MANGA'
      ? media?.chapters
      : 'Error: Other media type found!';

  const nextAiringAt = media?.nextAiringEpisode?.airingAt ?? '';

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

  const [progress, setProgress] = useState(entry?.progress);

  const { mutate, isPending } = useUpdateUserMedia({
    optimistic: false,
    handleSuccess: () => {
      setProgress((prev) => prev + 1);
      notice({
        status: 'success',
        description: 'Media Entry Updated',
        isClosable: true,
      });
    },
    handleError: (error) => {
      notice({
        status: 'error',
        description: error.message,
        title: error.name,
        isClosable: true,
      });
    },
  });

  return (
    <Popover closeOnButton={false} trigger="hover">
      <PopoverTrigger>
        <Box aspectRatio={0.61805} boxShadow={'2xl'} flexShrink={0} w="32">
          <Image
            src={media?.coverImage?.extraLarge}
            objectFit="cover"
            objectPosition={'center'}
            alt={media?.title?.userPreferred}
            w="full"
            h="full"
            _dark={{
              boxShadow: '0px 2px 5px 0px rgb(123 118 118 / 94%)',
            }}
            boxShadow={
              '0 1px 1px hsl(0deg 0% 0% / 0.075), 0 2px 2px hsl(0deg 0% 0% / 0.075), 0 4px 4px hsl(0deg 0% 0% / 0.075), 0 8px 8px hsl(0deg 0% 0% / 0.075), 0 16px 16px hsl(0deg 0% 0% / 0.075)'
            }
          />
        </Box>
      </PopoverTrigger>

      <PopoverContent style={{ width: '15rem' }}>
        <PopoverHeader>
          <Link as={NextLink} href={`/media?type=${media.type}&id=${media.id}`}>
            <Text lineClamp={1}>{media.title?.userPreferred}</Text>
          </Link>
        </PopoverHeader>
        <PopoverBody>
          {aboveDataListComponent}
          <DataList col={2} w="full">
            <DataListItem>
              <DataListTerm>
                {media?.status === 'NOT_YET_RELEASED' && media?.startDate?.year
                  ? 'Release in'
                  : media?.status === 'RELEASING'
                  ? 'Airs'
                  : 'Airing'}
              </DataListTerm>
              <DataListDescription>
                {media?.type === 'ANIME'
                  ? media?.nextAiringEpisode
                    ? `${timeLeft} (Ep ${media?.nextAiringEpisode?.episode})`
                    : media?.status === 'NOT_YET_RELEASED' &&
                      media?.startDate?.year
                    ? formatPartialDate(media?.startDate)
                    : `${
                        MEDIA_STATUS[media?.type?.toLowerCase()].find(
                          ({ value }) => value === media?.status
                        )?.label
                      }`
                  : media?.status === 'RELEASING'
                  ? 'Ongoing'
                  : media?.status}
              </DataListDescription>
            </DataListItem>
            {entry?.status === 'CURRENT' ? (
              <DataListItem w="full">
                <DataListTerm>Progress</DataListTerm>
                <DataListDescription w="full">
                  <Flex
                    justify={'space-between'}
                    w="full"
                    alignItems={'center'}
                  >
                    <Flex gap={'1'}>
                      <span>
                        {String(progress).padStart(
                          String(totalEpisodes).length,
                          0
                        )}
                      </span>
                      /<span>{totalEpisodes}</span>
                    </Flex>

                    <Text
                      fontSize="sm"
                      tabIndex={0}
                      role="button"
                      onPointerDown={() => {
                        if (!isPending) {
                          mutate({
                            mediaId: media.id,
                            mediaType: media.type,
                            progress: entry?.progress + 1,
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          !isPending &&
                          (e.code === 'Enter' || e.code === 'Space')
                        ) {
                          mutate({
                            mediaId: media.id,
                            mediaType: media.type,
                            progress: entry?.progress + 1,
                          });
                        }
                      }}
                      className="bg-[#E0E0E0] dark:bg-[#424242] hover:bg-[#BDBDBD] hover:dark:bg-[#616161]  focus:bg-[#BDBDBD] focus:dark:bg-[#616161]"
                      cursor={isPending ? 'not-allowed' : 'pointer'}
                      rounded={'md'}
                      px="1"
                    >
                      {isPending ? <Loading /> : '+1'}
                    </Text>
                  </Flex>
                </DataListDescription>
              </DataListItem>
            ) : (
              entry?.status === 'COMPLETED' && (
                <DataListItem>
                  <DataListTerm>Score</DataListTerm>
                  <DataListDescription>
                    <Rating score={entry?.score} />
                  </DataListDescription>
                </DataListItem>
              )
            )}
            {dataListItems}
          </DataList>
          {belowDataListComponent}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
