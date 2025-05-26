'use client';

import { CharacterProvider } from '@/context/use-character';
import { useCharacterFullInfoById } from '@/lib/client/hooks/react_query/get/character/info/full-by-id';
import { Card, Center, Flex, Image, useDisclosure } from '@yamada-ui/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ReviewEditor from './review-editor'
import TabSection from './tab-section'
import CharacterInfo from './character-info'

export default function CharacterPage() {
  const searchParams = useSearchParams();
  const { data } = useCharacterFullInfoById({
    characterId: parseInt(searchParams.get('id')),
  });

  const {
    open: openReviewEditor,
    onOpen: onOpenReviewEditor,
    onClose: onReviewEditorClose,
  } = useDisclosure();

  const [currentReviewMetadata, setCurrentReviewMetadata] = useState(null);

  return (
    <Center>
      <CharacterProvider value={data.data.Character}>
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
              src={data.data.Character.image.large}
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
      </CharacterProvider>
    </Center>
  );
}
