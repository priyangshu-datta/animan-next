import { Card, Flex, Image, useDisclosure } from '@yamada-ui/react';
import { useMemo, useState } from 'react';
import MediaInfo from './media_info';
import ReviewEditor from './review_editor';
import TabSection from './tab_section';
import ListEditor from './list_editor';
import { useMedia } from '@/context/Media';

export default function MediaPage(props) {
  const media = useMedia();


  const {
    open: openReviewEditor,
    onOpen: onOpenReviewEditor,
    onClose: onReviewEditorClose,
  } = useDisclosure();

  const {
    open: openListEditor,
    onOpen: onOpenListEditor,
    onClose: onListEditorClose,
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
            maxW={'80'}
          />
          <MediaInfo
            onReviewEditorOpen={onOpenReviewEditor}
            onListEditorOpen={onOpenListEditor}
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
      <ListEditor
        openListEditor={openListEditor}
        onListEditorClose={onListEditorClose}
      />
    </>
  );
}
