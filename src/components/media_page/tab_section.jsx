import { useDeleteReview } from '@/lib/client/hooks/react_query/useDeleteReview';
import { useViewReviews } from '@/lib/client/hooks/react_query/useViewNotes';
import { PencilIcon, Trash2Icon } from '@yamada-ui/lucide';
import {
  Button,
  Center,
  ContextMenu,
  ContextMenuTrigger,
  Loading,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  useDisclosure,
  useNotice,
} from '@yamada-ui/react';
import { useEffect, useState, useMemo } from 'react';
import MediaCharacters from './media_characters';
import ReviewCard from './review_card';
import { useMedia } from '@/context/Media';

export default function TabSection({ setEditorContext, onDrawerOpen }) {
  const media = useMedia();

  const memoedDescription = useMemo(() => ({ __html: media.description }));

  const viewUnitReviews = useViewReviews({
    mediaId: media.id,
    mediaType: media.type,
    subjectType: media.type === 'ANIME' ? 'episode' : 'chapter;volume',
  });

  const viewMediaReviews = useViewReviews({
    mediaId: media.id,
    mediaType: media.type,
    subjectType: media.type === 'ANIME' ? 'anime' : 'manga',
  });

  function handleUpdate(review) {
    const editorContext = {
      id: review.id,
      unit:
        media.type === 'ANIME' ? review.episode_number : review.chapter_number,
      rating: review.rating,
      emotions: (review.emotions ?? '').split(';').filter((s) => s.length),
      review: review.review_text,
      favourite: review.favourite,
      subject: review.subject_type,
      volume: review.volume,
    };

    setEditorContext(editorContext);
    onDrawerOpen();
  }

  const {
    open: openReviewDeleteModal,
    onOpen: onOpenReviewDeleteModal,
    onClose: onCloseReviewDeleteModal,
  } = useDisclosure();

  const [delReview, setDelReview] = useState(null);

  const deleteReview = useDeleteReview();

  function handleDelete() {
    console.log('delReview', delReview);
    deleteReview.mutate({
      review_id: delReview.id,
      media_id: media.id,
      mediaType: media.type,
      subject_type: delReview.subject_type,
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
            {media.type === 'ANIME' ? 'Episode' : 'Chapter/Volume'} Notes
          </Tab>
          <Tab className="shrink-0" style={{ margin: 0 }}>
            {media.type === 'ANIME' ? 'Anime' : 'Manga'} Notes
          </Tab>
        </TabList>

        <TabPanel dangerouslySetInnerHTML={memoedDescription}></TabPanel>
        <TabPanel>
          <MediaCharacters mediaId={media.id} />
        </TabPanel>
        <TabPanel display={'grid'} gap={'2'}>
          {viewUnitReviews.isLoading ? (
            <Loading />
          ) : (
            viewUnitReviews.data.data.reviews.map((review) => {
              return (
                <ContextMenu key={review.id}>
                  <ContextMenuTrigger as={Center} w="full" rounded="md">
                    <ReviewCard review={review} key={review.id} />
                  </ContextMenuTrigger>

                  <MenuList>
                    <MenuItem
                      icon={<PencilIcon />}
                      onClick={() => handleUpdate(review)}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem
                      icon={<Trash2Icon color={'red'} />}
                      color={'red'}
                      onClick={() => {
                        setDelReview(review);
                        onOpenReviewDeleteModal();
                      }}
                    >
                      Remove
                    </MenuItem>
                  </MenuList>
                </ContextMenu>
              );
            })
          )}
        </TabPanel>
        <TabPanel display={'grid'} gap={'2'}>
          {viewMediaReviews.isLoading ? (
            <Loading />
          ) : (
            viewMediaReviews.data.data.reviews.map((review) => {
              return (
                <ContextMenu key={review.id}>
                  <ContextMenuTrigger as={Center} w="full" rounded="md">
                    <ReviewCard review={review} key={review.id} />
                  </ContextMenuTrigger>

                  <MenuList>
                    <MenuItem
                      icon={<PencilIcon />}
                      onClick={() => handleUpdate(review)}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem
                      icon={<Trash2Icon color={'red'} />}
                      color={'red'}
                      onClick={() => {
                        setDelReview(review);
                        onOpenReviewDeleteModal();
                      }}
                    >
                      Remove
                    </MenuItem>
                  </MenuList>
                </ContextMenu>
              );
            })
          )}
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
            {deleteReview.isPending ? 'Deleteing...' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
