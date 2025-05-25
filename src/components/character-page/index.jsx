import { useCharacter } from '@/context/use-character';
import { Card, Flex, Image, useDisclosure } from '@yamada-ui/react';
import { useState } from 'react';
import CharacterInfo from './character-info';
import TabSection from './tab-section';
import ReviewEditor from './review-editor';

export default function CharacterPage() {
  const character = useCharacter();

  const {
    open: openReviewEditor,
    onOpen: onOpenReviewEditor,
    onClose: onReviewEditorClose,
  } = useDisclosure();

  const [currentReviewMetadata, setCurrentReviewMetadata] = useState(null);

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
            setCurrentReviewMetadata={setCurrentReviewMetadata}
          />
        </Card>
        <TabSection
          onDrawerOpen={onOpenReviewEditor}
          setCurrentReviewMetadata={setCurrentReviewMetadata}
        />
      </Flex>
      {openReviewEditor && (
        <ReviewEditor
          currentReviewMetadata={currentReviewMetadata}
          openReviewEditor={openReviewEditor}
          onReviewEditorClose={onReviewEditorClose}
        />
      )}
    </>
  );
}
