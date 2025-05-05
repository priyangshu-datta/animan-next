import { useMedia } from '@/context/use-media';
import {
  useToggleFavourite,
  useUpdateMediaProgress,
} from '@/lib/client/hooks/react_query/graphql/use-small-hooks';
import { useCountDownTimer } from '@/lib/client/hooks/use-count-down-timer';
import { REVIEW_CATEGORIES } from '@/lib/constants';
import {
  CalendarIcon,
  ChevronDownIcon,
  HeartIcon,
  PlusIcon,
} from '@yamada-ui/lucide';
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
  Toggle,
  Tooltip,
  useDisclosure,
  VStack,
} from '@yamada-ui/react';
import ListEditor from './list-editor';

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

export default function MediaInfo(props) {
  const { onReviewEditorOpen, setEditorContext } = props;

  const media = useMedia();

  const {
    open: openListEditor,
    onOpen: onListEditorOpen,
    onClose: onListEditorClose,
  } = useDisclosure();

  const timeLeft = useCountDownTimer(media.nextAiringEpisode?.airingAt);

  const { progress, updatingMediaProgress, updateMediaProgress } =
    useUpdateMediaProgress({
      progress: media.listEntry?.progress,
    });

  const {
    isFavourite: mediaIsFavourite,
    toggleFavourite: toggleMediaFavourite,
    togglingFavourite: togglingMediaFavourite,
  } = useToggleFavourite({
    subjectType: media.type,
    isFavourite: media.isFavourite,
  });

  return (
    <VStack gap="0">
      <CardHeader>
        <Heading size="lg">{media.title.userPreferred}</Heading>
        <Toggle
          borderRadius={'full'}
          value="favourite"
          selected={mediaIsFavourite}
          colorScheme="red"
          variant={'solid'}
          icon={togglingMediaFavourite ? <Loading /> : <HeartIcon />}
          aria-label="Favourite Episode"
          onChange={() => {
            toggleMediaFavourite({ subjectId: media.id });
          }}
        />
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
        <HStack wrap={'wrap'}>
          {progress ? (
            <>
              <IconButton
                variant={'outline'}
                icon={updatingMediaProgress ? <Loading /> : <PlusIcon />}
                onClick={() => {
                  updateMediaProgress({
                    mediaId: media.id,
                    progress: progress + 1,
                  });
                }}
                disabled={updatingMediaProgress}
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
                      subject: media.type === 'ANIME' ? 'episode' : 'chapter',
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
              </ButtonGroup>
            </>
          ) : media.status === 'NOT_YET_RELEASED' ? (
            <IconButton icon={<CalendarIcon />} />
          ) : (
            <Flex gap={'2'}>
              <Button onClick={() => {}}>Start Watching</Button>
              <IconButton icon={<CalendarIcon />} />
            </Flex>
          )}
          <Separator orientation="vertical" />
          <Button onClick={onListEditorOpen} variant={'outline'}>
            List Editor
          </Button>
        </HStack>
      </CardBody>
      {openListEditor && (
        <ListEditor
          openListEditor={openListEditor}
          onListEditorClose={onListEditorClose}
        />
      )}
    </VStack>
  );
}
