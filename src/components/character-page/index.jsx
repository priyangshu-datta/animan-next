import { useCharacter } from '@/context/use-character';
import { Card, Flex, Image, useDisclosure } from '@yamada-ui/react';
import { useState } from 'react';
import CharacterInfo from './character-info';
import TabSection from './tab-section';
import ReviewEditor from './review_editor';

export default function CharacterPage() {
  const character = useCharacter();

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
            src={character.image.large}
            objectFit="cover"
            minW={'40'}
            maxW={'68'}
          />
          <CharacterInfo
            onReviewEditorOpen={onOpenReviewEditor}
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
