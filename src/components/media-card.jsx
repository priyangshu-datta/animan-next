'use client';

import { useUpdateUserMedia } from '@/lib/client/hooks/react_query/patch/user/media'
import { MEDIA_STATUS } from '@/lib/constants'
import {
  formatPartialDate,
  formatTimeLeft
} from '@/utils/general'
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
          </DataList>
        </CardBody>
      </Card>
    </Flex>
  );
}
