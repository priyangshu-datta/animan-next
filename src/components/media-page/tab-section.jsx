import { useMedia } from '@/context/use-media';
import { useDeleteMediaReview } from '@/lib/client/hooks/react_query/delete/media/review';
import { useMediaRelatedMedia } from '@/lib/client/hooks/react_query/get/media/related/media';
import { REVIEW_CATEGORIES, SNACK_DURATION } from '@/lib/constants';
import { Columns3Icon, Grid3x3Icon } from '@yamada-ui/lucide';
import {
  Accordion,
  AccordionItem,
  AccordionLabel,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Loading,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Toggle,
  ToggleGroup,
  useDisclosure,
  useNotice,
} from '@yamada-ui/react';
import { useEffect, useMemo, useState } from 'react';
import MediaCard from '../media-card';
import MediaCharacters from './related-characters';
import ReviewList from './review-list';
import RelatedMedia from './related-media';

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
        isClosable: true,
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
        isClosable: true,
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

  const [subjectType, setSubjectType] = useState();

  useEffect(() => {
    setSubjectType(media.type === 'ANIME' ? 'episode' : 'chapter');
  }, [media]);

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
            Related Media
          </Tab>
          <Tab className="shrink-0" style={{ margin: 0 }}>
            Reviews
          </Tab>
        </TabList>

        <TabPanel dangerouslySetInnerHTML={memoedDescription} />
        <TabPanel>
          <MediaCharacters mediaId={media.id} mediaType={media.type} />
        </TabPanel>
        <TabPanel>
          <RelatedMedia />
        </TabPanel>
        <TabPanel>
          <Select
            defaultValue={subjectType}
            onChange={(option) => setSubjectType(option)}
            items={REVIEW_CATEGORIES[media.type?.toLowerCase()]}
          />

          <ReviewList
            subjectType={subjectType}
            mediaType={media.type}
            mediaId={media.id}
            onDrawerOpen={onDrawerOpen}
            setCurrentReviewMetadata={setCurrentReviewMetadata}
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
