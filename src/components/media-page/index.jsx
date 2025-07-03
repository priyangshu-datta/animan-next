'use client';

import { MediaProvider } from '@/context/use-media';
import { useMediaFullInfoById } from '@/lib/client/hooks/react_query/get/media/info/full-by-id';
import { Center, Flex, useDisclosure } from '@yamada-ui/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import MediaInfo from './media-info';
import ReviewEditor from './review-editor';
import TabSection from './tab-section';

export default function MediaPage() {
  const searchParams = useSearchParams();

  const mediaFullInfo = useMediaFullInfoById({
    mediaId: parseInt(searchParams.get('id')),
    mediaType: searchParams.get('type'),
  });

  const {
    open: openReviewEditor,
    onOpen: onOpenReviewEditor,
    onClose: onReviewEditorClose,
  } = useDisclosure();

  const [currentReviewMetadata, setCurrentReviewMetadata] = useState(null);

  return (
    <>
      <Center>
        <MediaProvider
          value={{
            ...mediaFullInfo.data?.data,
            isLoading: mediaFullInfo.isLoading,
          }}
        >
          <Flex
            direction={'column'}
            maxW={{ sm: '100%', xl: '90%', '2xl': '80%', base: '60%' }}
            w={'full'}
          >
            <MediaInfo
              onReviewEditorOpen={onOpenReviewEditor}
              setCurrentReviewMetadata={setCurrentReviewMetadata}
            />
            <TabSection
              setCurrentReviewMetadata={setCurrentReviewMetadata}
              onDrawerOpen={onOpenReviewEditor}
            />
          </Flex>
          {openReviewEditor && (
            <ReviewEditor
              currentReviewMetadata={currentReviewMetadata}
              openReviewEditor={openReviewEditor}
              onReviewEditorClose={onReviewEditorClose}
            />
          )}
        </MediaProvider>
      </Center>
    </>
  );
}
