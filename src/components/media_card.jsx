'use client';

import { useUpdateMediaProgress } from '@/lib/client/hooks/react_query/useUpdateMediaProgress';
import { CalendarIcon, EyeIcon, InfoIcon, PlusIcon } from '@yamada-ui/lucide';
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
  IconButton,
  Image,
  Link as LinkUI,
  Separator,
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

function computeProgressString(progress, totalEpisodes, status) {
  if (!progress) {
    if (status === 'NOT_YET_RELEASED') {
      return <IconButton icon={<CalendarIcon />} />;
    } else {
      return (
        <Flex>
          <IconButton icon={<EyeIcon />} />
          <IconButton icon={<CalendarIcon />} />
        </Flex>
      );
    }
  }
  return (
    <Tooltip label={`Behind ${totalEpisodes - progress} epsiodes`}>
      {progress}
    </Tooltip>
  );
}

/**
 * Card for anime / manga
 * @param {object} parameters
 * @param {string} parameters.title
 * @param {string} parameters.coverImage
 * @param {number} parameters._progress
 * @param {number} parameters.totalEpisodes
 * @param {number} parameters.nextAiringAt
 * @param {string} parameters.status
 * @param {number} parameters.mediaId
 * @returns {import("react").ReactElement}
 */
export default function MediaCard({
  title,
  coverImage,
  progress: _progress,
  totalEpisodes,
  nextAiringAt,
  mediaId,
  mediaStatus,
  mediaListId,
} = {}) {
  const [timeLeft, setTimeLeft] = useState();
  const [progress, setProgress] = useState(_progress);

  useEffect(() => {
    if (!nextAiringAt) return;

    const update = () => {
      setTimeLeft(formatTimeLeft(nextAiringAt));
    };

    update(); // initial run
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [nextAiringAt]);

  const { mutate, isPending, isError, isSuccess, error } =
    useUpdateMediaProgress();

  function handleUpdateProgress() {
    mutate({ id: mediaListId, progress: progress + 1 });
    setProgress((progress) => progress + 1);
  }

  const notice = useNotice();

  useEffect(() => {
    if (isSuccess) {
      notice({
        title: 'Update',
        description: `${title} progress updated +1`,
        status: 'success',
      });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      notice({
        title: 'Error',
        description: error.message,
        status: 'error',
      });

      setProgress((progress) => progress - 1);
    }
  }, [isError]);

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
          <Text
            as={Link}
            fontSize="2xl"
            lineClamp={1}
            href={`/media/${mediaId}`}
          >
            {title}
          </Text>
          <DataList
            col={2}
            variant={'subtle'}
            size={{ base: 'lg' }}
            gapY={{ base: '4', lg: '2' }}
          >
            <DataListItem>
              <DataListTerm>Progress</DataListTerm>
              <DataListDescription>
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
                  <Button variant={'link'} onClick={handleUpdateProgress}>
                    {isPending ? '...' : '+'}
                  </Button>
                </Flex>
              </DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>Time Left</DataListTerm>
              <DataListDescription>
                {timeLeft ?? (
                  <Flex gap="2">
                    Not airing
                    <Tooltip label={mediaStatus}>
                      <span>
                        <InfoIcon />
                      </span>
                    </Tooltip>
                  </Flex>
                )}
              </DataListDescription>
            </DataListItem>
          </DataList>
        </CardBody>
      </Card>
    </Flex>
  );
}

/* <div className="flex flex-col w-60 bg-neutral-900 rounded-lg overflow-hidden shadow-md text-white">
      <div className="relative w-full h-80 bg-neutral-800">
        <Image src={coverImage} alt={title} fill className="object-cover" />
      </div>

      <div className="p-3">
        <Link href={`/media/${mediaId}`}>
          <h3 className="text-sm font-semibold line-clamp-1">{title}</h3>
        </Link>

        <div className="mt-2 text-xs text-gray-400 flex justify-between">
          <span>
            {progress} / {total}
          </span>
          {nextAiringAt && (
            <span className="text-green-400">🕒 {timeLeft}</span>
          )}
        </div>

        {status && (
          <div className="mt-2 text-[10px] px-2 py-1 inline-block bg-green-700 rounded-full text-white">
            {status}
          </div>
        )}
      </div>
    </div> */
