import { useMedia } from '@/context/use-media';
import { useDeleteMediaReview } from '@/lib/client/hooks/react_query/delete/media/review';
import {
  Button,
  Loading,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Option,
  Select,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  useDisclosure,
  useNotice,
} from '@yamada-ui/react';
import { Suspense, useMemo, useState } from 'react';
import MediaCharacters from './media-characters';
import ReviewList from './review-list';
import { SNACK_DURATION } from '@/lib/constants'

export default function TabSection({ setCurrentReviewMetadata, onDrawerOpen }) {
  const media = useMedia();

  const memoedDescription = useMemo(() => ({ __html: media.description }));

  const {
    open: openReviewDeleteModal,
    onOpen: onOpenReviewDeleteModal,
    onClose: onCloseReviewDeleteModal,
  } = useDisclosure();

  const [delReview, setDelReview] = useState(null);
  const notice = useNotice();

  const deleteReview = useDeleteMediaReview({
    handleSuccess: () => {
      notice({
        description: 'Deleted the review',
        status: 'success',
        duration: SNACK_DURATION,
      });
      setDelReview(null);
      onCloseReviewDeleteModal();
    },
    handleError: (error) => {
      notice({
        status: 'error',
        title: error.name,
        description: error.message,
        duration: SNACK_DURATION,
      });
      setDelReview(null);
    },
  });

  function handleDelete() {
    deleteReview.mutate({
      reviewId: delReview.id,
      mediaId: media.id,
      mediaType: media.type,
      subjectType: delReview.subjectType,
    });
  }

  const [subjectType, setSubjectType] = useState(
    media.type === 'ANIME' ? 'episode' : 'chapter'
  );

  return (
    <>
      <Tabs orientation="horizontal">
        <TabList className="overflow-x-auto">
          <Tab className="shrink-0" style={{ margin: 0 }}>
            Description
          </Tab>
          <Tab className="shrink-0" style={{ margin: 0 }}>
            Characters
          </Tab>
          <Tab className="shrink-0" style={{ margin: 0 }}>
            Reviews
          </Tab>
        </TabList>

        <TabPanel dangerouslySetInnerHTML={memoedDescription} />
        <TabPanel>
          <Suspense fallback={<Loading fontSize={'2xl'} />}>
            <MediaCharacters mediaId={media.id} mediaType={media.type} />
          </Suspense>
        </TabPanel>
        <TabPanel>
          <Select
            defaultValue={subjectType}
            onChange={(option) => setSubjectType(option)}
          >
            <Option value={media.type === 'ANIME' ? 'anime' : 'manga'}>
              {media.type === 'ANIME' ? 'Anime' : 'Manga'}
            </Option>
            {media.type === 'MANGA' && <Option value="volume">Volume</Option>}
            <Option value={media.type === 'ANIME' ? 'episode' : 'chapter'}>
              {media.type === 'ANIME' ? 'Episode' : 'Chapter'}
            </Option>
          </Select>

          <Suspense fallback={<Loading />}>
            <ReviewList
              subjectType={subjectType}
              mediaType={media.type}
              mediaId={media.id}
              onDrawerOpen={onDrawerOpen}
              setCurrentReviewMetadata={setCurrentReviewMetadata}
              setDelReview={setDelReview}
              onOpenReviewDeleteModal={onOpenReviewDeleteModal}
            />
          </Suspense>
        </TabPanel>
      </Tabs>

      <Modal
        open={openReviewDeleteModal}
        onClose={onCloseReviewDeleteModal}
        size="md"
      >
        <ModalHeader>Confirm Delete?</ModalHeader>
        <ModalBody>This is a destructive operation.</ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={onCloseReviewDeleteModal}
            disabled={deleteReview.isPending}
          >
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleDelete}
            disabled={deleteReview.isPending}
          >
            {deleteReview.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
