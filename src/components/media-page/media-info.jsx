import { useMedia } from '@/context/use-media';
import { useUpdateUserMedia } from '@/lib/client/hooks/react_query/patch/user/media';
import { useOptimisticToggleMediaFavourite } from '@/lib/client/hooks/react_query/patch/user/media/toggle-favourite';
import { useCountDownTimer } from '@/lib/client/hooks/use-count-down-timer';
import {
  MEDIA_ENTRY_STATUS,
  MEDIA_STATUS,
  REVIEW_CATEGORIES,
} from '@/lib/constants';
import {
  CalendarIcon,
  ChevronDownIcon,
  HeartIcon,
  NotepadTextIcon,
  PlusIcon,
} from '@yamada-ui/lucide';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Collapse,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Loading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Rating,
  Separator,
  Skeleton,
  SkeletonText,
  Tag,
  Toggle,
  Tooltip,
  useDisclosure,
  useNotice,
  VStack,
  Link,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from '@yamada-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import ListEditor from './list-editor';
import { formatPartialDate } from '@/utils/general';
import AppStorage from '@/utils/local-storage';

function computeProgressString(progress, total, latest) {
  if (latest) {
    return (
      <Flex gap={'2'}>
        {progress}
        <Separator h="5.5" orientation="vertical" variant={'solid'} />
        {latest}
        {total && (
          <>
            <Separator h="5.5" orientation="vertical" variant={'solid'} />
            {total}
          </>
        )}
      </Flex>
    );
  }
  return (
    <Flex gap={'2'}>
      {progress} <Separator h="5.5" orientation="vertical" variant={'solid'} />{' '}
      {total}
    </Flex>
  );
}

export default function MediaInfo({
  onReviewEditorOpen,
  setCurrentReviewMetadata,
}) {
  const media = useMedia();

  const {
    open: openListEditor,
    onOpen: onListEditorOpen,
    onClose: onListEditorClose,
  } = useDisclosure();

  const { open, onToggle } = useDisclosure();

  return (
    <Card
      flexDirection={{ base: 'row', md: 'column' }}
      overflow="hidden"
      variant="elevated"
      alignItems={{ md: 'center', base: 'start' }}
    >
      <CardHeader>
        {media.isLoading ? (
          <Skeleton minW={'40'} maxW={'68'} h={'max-content'} />
        ) : (
          <Image
            src={media.coverImage?.extraLarge}
            objectFit="cover"
            minW={'40'}
            maxW={'68'}
          />
        )}
      </CardHeader>

      <CardBody>
        <VStack gap="0">
          {media.listEntry && <MediaListEntryStatus />}
          <HStack>
            {media.isLoading ? (
              <SkeletonText>
                <Heading size="lg">One Piece</Heading>
              </SkeletonText>
            ) : (
              <Heading size="lg">{media.title?.userPreferred}</Heading>
            )}

            <MediaToggleFavourite />

            {media.listEntry?.notes && <UserAnilistNote />}
          </HStack>
        </VStack>
        <Flex gap={'1.5'} wrap={'wrap'}>
          {(media.genres ?? []).map((genre) => {
            return (
              <Tag
                key={genre}
                as={NextLink}
                href={`/browse?mediaType=${media.type}&genresIn=${genre}`}
              >
                {genre}
              </Tag>
            );
          })}

          <MediaTags onToggle={onToggle} open={open} />
        </Flex>

        <MediaInfoDataList />

        <ActionButtons
          onListEditorOpen={onListEditorOpen}
          onReviewEditorOpen={onReviewEditorOpen}
          setCurrentReviewMetadata={setCurrentReviewMetadata}
        />
      </CardBody>
      <ListEditor
        openListEditor={openListEditor}
        onListEditorClose={onListEditorClose}
      />
    </Card>
  );
}

function MediaRating({ stars = 5, score, maxScore = 10, label = '' } = {}) {
  const normalizedScore = (stars * score) / maxScore;
  let locale;
  useEffect(() => {
    locale = AppStorage.get('locale');
  }, []);
  return (
    <Tooltip
      label={`${label}${new Intl.NumberFormat(locale, {
        style: 'percent',
      }).format(normalizedScore / stars)}`}
    >
      <Rating
        readOnly
        value={normalizedScore}
        fractions={maxScore}
        items={stars}
      />
    </Tooltip>
  );
}

function MediaTags({ onToggle, open }) {
  const media = useMedia();
  const tags = media.tags ?? [];
  const [showSpoilerTags, setShowSpoilerTags] = useState(false);
  return (
    <>
      {!media.isLoading && (
        <Button variant={'link'} onClick={onToggle}>
          See Tags
        </Button>
      )}
      <Collapse open={open}>
        <Box>
          {tags.some((tag) => tag.isMediaSpoiler) && (
            <Checkbox
              label={'Show spoiler tags'}
              defaultChecked={showSpoilerTags}
              onChange={() => setShowSpoilerTags((prev) => !prev)}
            />
          )}
          <Flex flexWrap={'wrap'} gap={'2'} mt="2">
            {tags
              .filter((tag) => showSpoilerTags || !tag.isMediaSpoiler)
              .map((tag) => (
                <Tooltip key={tag.id} label={tag.description}>
                  <Tag
                    variant={'surface'}
                    colorScheme={tag.isMediaSpoiler ? 'green' : 'purple'}
                    as={NextLink}
                    href={`/browse?mediaType=${media.type}&mediaTagIn=${tag.name}`}
                  >
                    {tag.name}
                  </Tag>
                </Tooltip>
              ))}
          </Flex>
        </Box>
      </Collapse>
    </>
  );
}

function ActionButtons({
  onListEditorOpen,
  onReviewEditorOpen,
  setCurrentReviewMetadata,
}) {
  const media = useMedia();
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

  const components = {
    DEFAULT: (
      <IconButton
        disabled={isPending}
        icon={<CalendarIcon />}
        onClick={() => {
          mutate({
            mediaId: media.id,
            mediaType: media.type,
            status: 'PLANNING',
          });
        }}
      />
    ),
    CURRENT: (
      <>
        <UpdateMediaProgress isPending={isPending} mutate={mutate} />
        <ReviewButtonGroup
          disabled={isPending}
          onReviewEditorOpen={onReviewEditorOpen}
          setCurrentReviewMetadata={setCurrentReviewMetadata}
        />
      </>
    ),

    REPEATING: (
      <>
        <UpdateMediaProgress isPending={isPending} mutate={mutate} />
        <ReviewButtonGroup
          disabled={isPending}
          onReviewEditorOpen={onReviewEditorOpen}
          setCurrentReviewMetadata={setCurrentReviewMetadata}
        />
      </>
    ),

    PLANNING: <PlanningComponent isPending={isPending} mutate={mutate} />,

    PAUSED: (
      <>
        <PlanningComponent isPending={isPending} mutate={mutate} />
        <ReviewButtonGroup
          disabled={isPending}
          onReviewEditorOpen={onReviewEditorOpen}
          setCurrentReviewMetadata={setCurrentReviewMetadata}
        />
      </>
    ),

    COMPLETED: (
      <ReviewButtonGroup
        disabled={isPending}
        onReviewEditorOpen={onReviewEditorOpen}
        setCurrentReviewMetadata={setCurrentReviewMetadata}
      />
    ),

    DROPPED: (
      <ReviewButtonGroup
        disabled={isPending}
        onReviewEditorOpen={onReviewEditorOpen}
        setCurrentReviewMetadata={setCurrentReviewMetadata}
      />
    ),
  };

  return (
    <HStack wrap={'wrap'}>
      {media.isLoading ? (
        <Skeleton w="64">
          <Button></Button>
        </Skeleton>
      ) : (
        <>
          {media.status === 'NOT_YET_RELEASED' ? (
            media.listEntry?.status !== 'PLANNING' && (
              <>
                {components['DEFAULT']}
                <Separator orientation="vertical" h={'20px'} />
              </>
            )
          ) : media.listEntry ? (
            <>
              {components[media.listEntry.status]}
              <Separator orientation="vertical" h={'20px'} />
            </>
          ) : (
            <>
              {components['PLANNING']} {components['DEFAULT']}
              <Separator orientation="vertical" h={'20px'} />
            </>
          )}

          <Button onClick={onListEditorOpen} variant={'outline'}>
            {media.listEntry ? 'Update entry' : 'Track'}
          </Button>
        </>
      )}
    </HStack>
  );
}

function ReviewButtonGroup({
  onReviewEditorOpen,
  setCurrentReviewMetadata,
  disabled,
}) {
  const media = useMedia();
  return (
    <ButtonGroup attached variant="outline">
      <Button
        disabled={disabled}
        onClick={() => {
          setCurrentReviewMetadata({
            subjectType: media.type === 'ANIME' ? 'episode' : 'chapter',
          });
          onReviewEditorOpen();
        }}
      >
        Review
      </Button>

      <Menu>
        <MenuButton
          as={IconButton}
          icon={<ChevronDownIcon />}
          disabled={disabled}
        />

        <MenuList>
          {REVIEW_CATEGORIES[media.type.toLowerCase()].map((item) => (
            <MenuItem
              key={item.value}
              onClick={() => {
                setCurrentReviewMetadata({
                  subjectType: item.value,
                });
                onReviewEditorOpen();
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </ButtonGroup>
  );
}

function UpdateMediaProgress({ isPending, mutate }) {
  const media = useMedia();
  return (
    <IconButton
      variant={'outline'}
      icon={isPending ? <Loading /> : <PlusIcon />}
      onClick={() => {
        mutate({
          mediaId: media.id,
          mediaType: media.type,
          progress: media.listEntry?.progress + 1,
        });
      }}
      disabled={isPending}
    />
  );
}

function PlanningComponent({ isPending, mutate }) {
  const media = useMedia();
  return (
    <Button
      disabled={isPending}
      onClick={() => {
        mutate({
          mediaId: media.id,
          mediaType: media.type,
          status: 'CURRENT',
        });
      }}
    >
      {isPending ? <Loading /> : 'Start Watching'}
    </Button>
  );
}

function MediaInfoDataList() {
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

function UserAnilistNote() {
  const media = useMedia();
  const { onClose, onOpen, open } = useDisclosure();
  return (
    <>
      <Tooltip label="Your Anilist note">
        <Box onClick={() => onOpen()}>
          <NotepadTextIcon />
        </Box>
      </Tooltip>
      <Modal open={open} size="4xl">
        <ModalHeader>Your Anilist note</ModalHeader>
        <ModalBody>{media.listEntry.notes}</ModalBody>
        <ModalFooter>
          <Button onClick={() => onClose()}>Close</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

function MediaListEntryStatus() {
  const media = useMedia();
  return (
    <p>
      You{' '}
      {['PAUSED', 'DROPPED', 'COMPLETED'].includes(media.listEntry.status)
        ? 'have'
        : 'are'}{' '}
      <em>
        {MEDIA_ENTRY_STATUS[media.type.toLowerCase()]
          .find((mls) => mls.value === media.listEntry.status)
          .label.toLowerCase()}
      </em>
    </p>
  );
}

function MediaToggleFavourite() {
  const media = useMedia();
  const { mediaIsFavourite, toggleMediaFavourite, togglingMediaFavourite } =
    useOptimisticToggleMediaFavourite({
      mediaIsFavourite: media.isFavourite,
    });
  return (
    <Toggle
      borderRadius={'full'}
      value="favourite"
      selected={mediaIsFavourite}
      colorScheme="red"
      variant={'solid'}
      disabled={togglingMediaFavourite}
      icon={togglingMediaFavourite ? <Loading /> : <HeartIcon />}
      onChange={() => {
        toggleMediaFavourite({
          mediaId: media.id,
          mediaType: media.type,
        });
      }}
    />
  );
}
