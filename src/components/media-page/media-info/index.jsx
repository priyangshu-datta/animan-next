import { Card, CardBody, CardHeader, Flex, Heading, HStack, Image, Indicator, Skeleton, SkeletonText, Tag, useDisclosure, VStack } from "@yamada-ui/react"
import EntryEditor from "../entry-editor"
import ActionButtons from "./action-buttons"
import MediaInfoDataList from "./info-datalist"
import UserProviderNote from "./user-provider-note"
import MediaEntryStatus from "./media-entry-status"
import { useMedia } from "@/context/use-media"
import MediaToggleFavourite from "./toggle-favourite"
import MediaTags from "./tags"
import NextLink from 'next/link';

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
          {media.listEntry && <MediaEntryStatus />}
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

            {media.listEntry?.notes && <UserProviderNote />}
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
          onEntryEditorOpen={onEntryEditorOpen}
          onReviewEditorOpen={onReviewEditorOpen}
          setCurrentReviewMetadata={setCurrentReviewMetadata}
        />
      </CardBody>
      <EntryEditor
        onEntryEditorClose={onEntryEditorClose}
        openEntryEditor={openEntryEditor}
      />
    </Card>
  );
}
