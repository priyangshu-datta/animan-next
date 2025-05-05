import { useMedia } from '@/context/use-media';
import { Card, Flex, Image, useDisclosure } from '@yamada-ui/react';
import { useState } from 'react';
import MediaInfo from './media-info';
import ReviewEditor from './review_editor';
import TabSection from './tab-section';

export default function MediaPage() {
  const media = useMedia();

  const {
    open: openReviewEditor,
    onOpen: onOpenReviewEditor,
    onClose: onReviewEditorClose,
  } = useDisclosure();

  const [editorContext, setEditorContext] = useState({});

  return (
    <>
      <Flex
        direction={'column'}
        maxW={{ sm: '100%', xl: '90%', '2xl': '80%', base: '60%' }}
        w={'full'}
      >
        <Card
          flexDirection={{ base: 'row', md: 'column' }}
          overflow="hidden"
          variant="elevated"
          alignItems={{ md: 'center' }}
        >
          <Image
            src={media.coverImage.extraLarge}
            objectFit="cover"
            minW={'40'}
            maxW={'68'}
          />
          <MediaInfo
            onReviewEditorOpen={onOpenReviewEditor}
            // onListEditorOpen={onOpenListEditor}
            setEditorContext={setEditorContext}
          />
        </Card>
        <TabSection
          setEditorContext={setEditorContext}
          onDrawerOpen={onOpenReviewEditor}
        />
      </Flex>
      <ReviewEditor
        editorContext={editorContext}
        openReviewEditor={openReviewEditor}
        onReviewEditorClose={onReviewEditorClose}
      />
    </>
  );
}
