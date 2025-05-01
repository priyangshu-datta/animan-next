import { useMedia } from '@/context/Media';
import { useUpdateMediaProgress } from '@/lib/client/hooks/react_query/useUpdateMediaProgress';
import { REVIEW_CATEGORIES } from '@/lib/constants';
import { CalendarIcon, ChevronDownIcon, PlusIcon } from '@yamada-ui/lucide';
import {
  Button,
  ButtonGroup,
  CardBody,
  CardHeader,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Flex,
  Heading,
  HStack,
  IconButton,
  Loading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Rating,
  Separator,
  Tag,
  Tooltip,
  useNotice,
  VStack,
} from '@yamada-ui/react';
import { useEffect, useState } from 'react';

function useCountDownTimer(nextEpisodeAiringAt) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!nextEpisodeAiringAt) return;

    function updateCountdown() {
      const now = Date.now() / 1000; // current time in seconds
      const diff = Math.max(0, nextEpisodeAiringAt - now);

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
        setTimeLeft(
          `${days} day${days > 1 ? 's' : ''} ${
            hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''
          }`
        );
      } else if (hours > 0) {
        setTimeLeft(
          `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${
            minutes > 1 ? 's' : ''
          }`
        );
      } else if (minutes > 0) {
        setTimeLeft(
          `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${
            seconds !== 1 ? 's' : ''
          }`
        );
      } else {
        setTimeLeft(`${seconds} second${seconds !== 1 ? 's' : ''}`);
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextEpisodeAiringAt]);

  return timeLeft;
}

function computeProgressString(progress, totalEpisodes, latestEpisode) {
  if (latestEpisode) {
    return (
      <Flex gap={'2'}>
        {progress}
        <Separator h="5.5" orientation="vertical" variant={'solid'} />
        {latestEpisode}
        {totalEpisodes && (
          <>
            <Separator h="5.5" orientation="vertical" variant={'solid'} />
            {totalEpisodes}
          </>
        )}
      </Flex>
    );
  }
  return (
    <Flex gap={'2'}>
      {progress} <Separator h="5.5" orientation="vertical" variant={'solid'} />{' '}
      {totalEpisodes}
    </Flex>
  );
}

export default function MediaInfo(props) {
  const { onReviewEditorOpen, onListEditorOpen, setEditorContext } = props;

  const media = useMedia();

  console.log(media);

  const notice = useNotice();

  const [progress, setProgress] = useState(media.listEntry?.progress);

  useEffect(() => {
    setProgress(media.listEntry?.progress);
  }, [media.listEntry]);

  const timeLeft = useCountDownTimer(media.nextAiringEpisode?.airingAt);

  const { mutate, isPending, isError, isSuccess, error } =
    useUpdateMediaProgress();

  function handleUpdateProgress() {
    mutate({ id: media.listEntry.id, progress: progress + 1 });
    setProgress((progress) => progress + 1);
  }

  useEffect(() => {
    if (isSuccess) {
      notice({
        title: 'Update',
        description: `${media.title.romaji} progress updated +1`,
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
    <VStack gap="0">
      <CardHeader>
        <Heading size="lg">{media.title.romaji}</Heading>
      </CardHeader>

      <CardBody>
        <Flex gap={'1.5'} wrap={'wrap'}>
          {media.genres &&
            media.genres.map((genre) => {
              return <Tag key={genre}>{genre}</Tag>;
            })}
        </Flex>
        <DataList
          col={2}
          variant={'subtle'}
          size={{ base: 'lg' }}
          gapY={{ base: '4', lg: '2' }}
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
            <DataListDescription>
              <Tooltip label={`${media.meanScore}%`}>
                <Rating
                  readOnly
                  defaultValue={5 * (media.meanScore / 100)}
                  fractions={Math.floor(
                    1 /
                      (5 * (media.meanScore / 100) -
                        Math.floor(5 * (media.meanScore / 100)))
                  )}
                />
              </Tooltip>
            </DataListDescription>
          </DataListItem>
          <DataListItem>
            <DataListTerm>Airing Status</DataListTerm>
            <DataListDescription>
              {media.type === 'ANIME'
                ? media.nextAiringEpisode
                  ? `Next episode ${media.nextAiringEpisode.episode} is airing in ${timeLeft}`
                  : `Not airing (${media.status.replace('_', ' ')})`
                : media.status === 'RELEASING'
                ? 'Ongoing'
                : media.status}
            </DataListDescription>
          </DataListItem>
          {progress && (
            <DataListItem>
              <DataListTerm>Progress</DataListTerm>
              <DataListDescription>
                {media.type === 'ANIME'
                  ? computeProgressString(
                      progress,
                      media.episodes,
                      media.nextAiringEpisode?.episode - 1
                    )
                  : computeProgressString(progress, media.chapters)}
              </DataListDescription>
            </DataListItem>
          )}
        </DataList>
        <HStack>
          {progress ? (
            <>
              <IconButton
                variant={'outline'}
                icon={isPending ? <Loading /> : <PlusIcon />}
                onClick={handleUpdateProgress}
              />
              <ButtonGroup attached variant="outline">
                <Button
                  onClick={() => {
                    setEditorContext({
                      id: null,
                      unit: progress ?? 1,
                      rating: 0,
                      emotions: [],
                      review: '',
                      favourite: false,
                      subject: media.type === 'ANIME' ? 'anime' : 'chapter',
                    });
                    onReviewEditorOpen();
                  }}
                >
                  Review
                </Button>

                <Menu>
                  <MenuButton as={IconButton} icon={<ChevronDownIcon />} />

                  <MenuList>
                    {REVIEW_CATEGORIES[media.type.toLowerCase()].map((item) => (
                      <MenuItem
                        key={item.value}
                        onClick={() => {
                          setEditorContext({
                            id: null,
                            unit: progress ?? 1,
                            rating: 0,
                            emotions: [],
                            review: '',
                            favourite: false,
                            subject: item.value,
                            ...(media.progressVolumes && {
                              volume: media.progressVolumes,
                            }),
                          });
                          onReviewEditorOpen();
                        }}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* <IconButton icon={<ChevronDownIcon />} /> */}
              </ButtonGroup>
            </>
          ) : media.status === 'NOT_YET_RELEASED' ? (
            <IconButton icon={<CalendarIcon />} />
          ) : (
            <Flex gap={'2'}>
              <Button>Start Watching</Button>
              <IconButton icon={<CalendarIcon />} />
            </Flex>
          )}
          <Separator orientation="vertical" />
          <Button onClick={onListEditorOpen} variant={'outline'}>
            List Editor
          </Button>
        </HStack>
      </CardBody>
    </VStack>
  );
}
