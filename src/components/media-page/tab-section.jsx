import { useMedia } from '@/context/use-media';
import { useDeleteReview } from '@/lib/client/hooks/react_query/review/media/use-delete-review';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NativeOption,
  NativeSelect,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  useDisclosure,
  useNotice,
} from '@yamada-ui/react';
import { useEffect, useMemo, useState } from 'react';
import MediaCharacters from './media-characters';
import ReviewList from './review-list';

export default function TabSection({ setEditorContext, onDrawerOpen }) {
  const media = useMedia();

  const memoedDescription = useMemo(() => ({ __html: media.description }));

  const {
    open: openReviewDeleteModal,
    onOpen: onOpenReviewDeleteModal,
    onClose: onCloseReviewDeleteModal,
  } = useDisclosure();

  const [delReview, setDelReview] = useState(null);

  const deleteReview = useDeleteReview();

  function handleDelete() {
    deleteReview.mutate({
      reviewId: delReview.id,
      mediaId: media.id,
      mediaType: media.type,
      subjectType: delReview.subjectType,
    });
  }

  const notice = useNotice();

  useEffect(() => {
    if (deleteReview.isSuccess) {
      notice({
        title: 'Success',
        description: 'Deleted the review',
        status: 'success',
      });
      setDelReview(null);
      onCloseReviewDeleteModal();
    }
    if (deleteReview.isError) {
      notice({
        status: 'error',
        title: `Error: ${deleteReview.error.name}`,
        description: deleteReview.error.message,
      });
      setDelReview(null);
    }
  }, [deleteReview.isError, deleteReview.isSuccess]);

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
          <MediaCharacters mediaId={media.id} />
        </TabPanel>
        <TabPanel>
          <NativeSelect
            defaultValue={subjectType}
            onChange={(ev) => setSubjectType(ev.target.value)}
          >
            <NativeOption value={media.type === 'ANIME' ? 'anime' : 'manga'}>
              {media.type === 'ANIME' ? 'Anime' : 'Manga'}
            </NativeOption>
            {media.type === 'MANGA' && (
              <NativeOption value="volume">Volume</NativeOption>
            )}
            <NativeOption
              value={media.type === 'ANIME' ? 'episode' : 'chapter'}
            >
              {media.type === 'ANIME' ? 'Episode' : 'Chapter'}
            </NativeOption>
          </NativeSelect>

          <ReviewList
            subjectType={subjectType}
            mediaType={media.type}
            mediaId={media.id}
            onDrawerOpen={onDrawerOpen}
            setEditorContext={setEditorContext}
            setDelReview={setDelReview}
            onOpenReviewDeleteModal={onOpenReviewDeleteModal}
          />
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
