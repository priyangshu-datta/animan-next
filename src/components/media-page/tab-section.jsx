import { useMedia } from '@/context/use-media';
import { useDeleteMediaReview } from '@/lib/client/hooks/react_query/delete/media/review';
import { SNACK_DURATION } from '@/lib/constants';
import {
  Button,
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
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import RelatedCharacters from './related-characters';
import RelatedMedia from './related-media';
import ReviewList from './review-list';
import Details from './tabs/details';
import Stats from './tabs/stats';
import Episodes from './tabs/episodes-list';

export default function TabSection({ setCurrentReviewMetadata, onDrawerOpen }) {
  const media = useMedia();
  const searchParams = useSearchParams();

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

  const [tabIndex, setTabIndex] = useState();

  useEffect(() => {
    const tabIndexUrl = parseInt(searchParams.get('tabIndex'));
    setTabIndex(tabIndexUrl < 6 && tabIndexUrl > -1 ? tabIndexUrl : 0);
  }, []);

  return (
    <>
      <Tabs
        orientation="horizontal"
        variant={'sticky'}
        mt="2"
        index={tabIndex}
        onChange={(index) => {
          const newSearchParams = new URLSearchParams();
          newSearchParams.set('tabIndex', index);
          newSearchParams.set('id', media.id);
          newSearchParams.set('type', media.type);

          window.history.replaceState(
            null,
            '',
            `?${newSearchParams.toString()}`
          );
          setTabIndex(index);
        }}
      >
        <TabList className="overflow-x-auto">
          <Tab className="shrink-0" style={{ margin: 0 }}>
            Details
          </Tab>
          <Tab className="shrink-0" style={{ margin: 0 }}>
            Stats
          </Tab>
          <Tab className="shrink-0" style={{ margin: 0 }}>
            Characters
          </Tab>
          {media.streamingEpisodes?.length ? (
            <Tab className="shrink-0" style={{ margin: 0 }}>
              Episodes
            </Tab>
          ) : (
            ''
          )}
          <Tab className="shrink-0" style={{ margin: 0 }}>
            Related Media
          </Tab>
          <Tab className="shrink-0" style={{ margin: 0 }}>
            Reviews
          </Tab>
        </TabList>

        <TabPanel>{!media.isLoading && <Details />}</TabPanel>
        <TabPanel>{!media.isLoading && <Stats />}</TabPanel>
        <TabPanel>
          <RelatedCharacters mediaId={media.id} mediaType={media.type} />
        </TabPanel>
        {media.streamingEpisodes?.length ? (
          <TabPanel>{!media.isLoading && <Episodes />}</TabPanel>
        ) : (
          ''
        )}
        <TabPanel>
          <RelatedMedia />
        </TabPanel>
        <TabPanel>

          <ReviewList
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
