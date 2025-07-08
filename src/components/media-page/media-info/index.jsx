import { useMedia } from '@/context/use-media';
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Image,
  Indicator,
  SkeletonText,
  Tab,
  TabPanel,
  Tabs,
  useDisclosure,
  VStack,
} from '@yamada-ui/react';
import EntryEditor from '../entry-editor';
import ActionButtons from './action-buttons';
import MediaEntry from './entry';
import MediaEntryStatus from './media-entry-status';
import Overview from './overview';
import MediaToggleFavourite from './toggle-favourite';
import UserProviderNote from './user-provider-note';

export default function MediaInfo({
  onReviewEditorOpen,
  setCurrentReviewMetadata,
}) {
  const media = useMedia();

  const {
    open: openEntryEditor,
    onOpen: onEntryEditorOpen,
    onClose: onEntryEditorClose,
  } = useDisclosure();

  return (
    <Card
      flexDirection={{ base: 'row', md: 'column' }}
      overflow="hidden"
      variant="elevated"
      px={{ md: '4', base: '0' }}
      gap="6"
    >
      <CardHeader p="0" alignSelf={{ md: 'center', base: 'start' }}>
        <Image
          src={media.coverImage?.extraLarge}
          objectFit="cover"
          w="64"
          aspectRatio={0.61805}
        />
      </CardHeader>

      <CardBody p="0">
        <VStack gap="0">
          {media.entry && <MediaEntryStatus />}
          <HStack>
            {media.isLoading ? (
              <SkeletonText>
                <Heading size="lg">One Piece</Heading>
              </SkeletonText>
            ) : (
              <Indicator
                label={'18+'}
                colorScheme={'red'}
                size={'sm'}
                disabled={!media.isAdult}
              >
                <Heading size="lg">{media.title?.userPreferred}</Heading>
              </Indicator>
            )}

            <MediaToggleFavourite />

            {media.entry?.notes && <UserProviderNote />}
          </HStack>
        </VStack>
        <ActionButtons
          onEntryEditorOpen={onEntryEditorOpen}
          onReviewEditorOpen={onReviewEditorOpen}
          setCurrentReviewMetadata={setCurrentReviewMetadata}
        />
        {!media.isLoading && (
          <Tabs
            variant={'sticky'}
            defaultIndex={Number(
              ['CURRENT', 'REPEATING'].includes(media.entry?.status)
            )}
          >
            <Tab>Overview</Tab>
            <Tab>My Entry</Tab>

            <TabPanel p="2">
              <Overview />
            </TabPanel>
            <TabPanel p="2">
              <MediaEntry />
            </TabPanel>
          </Tabs>
        )}
      </CardBody>
      <EntryEditor
        onEntryEditorClose={onEntryEditorClose}
        openEntryEditor={openEntryEditor}
      />
    </Card>
  );
}
