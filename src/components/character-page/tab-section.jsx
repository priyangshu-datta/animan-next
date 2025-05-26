import { useCharacter } from '@/context/use-character'
import { useDeleteMediaReview } from '@/lib/client/hooks/react_query/delete/character/review'
import { SNACK_DURATION } from '@/lib/constants'
import {
  Button,
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
  useNotice
} from '@yamada-ui/react'
import { useMemo, useState } from 'react'
import CharacterMedia from './character-media'
import ReviewList from './review-list'

export default function TabSection({ setCurrentReviewMetadata, onDrawerOpen }) {
  const character = useCharacter();

  const memoedDescription = useMemo(
    () => ({ __html: character?.description }),
    [character]
  );

  const {
    open: openReviewDeleteModal,
    onOpen: onOpenReviewDeleteModal,
    onClose: onCloseReviewDeleteModal,
  } = useDisclosure();

  const [delReview, setDelReview] = useState(null);

  const deleteReview = useDeleteMediaReview({
    characterId: character.id,
    handleSuccess: () => {
      notice({
        description: 'Review deleted',
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
    });
  }

  const notice = useNotice();
  const [mediaType, setMediaType] = useState('ANIME');

  return (
    <>
      <Tabs orientation="horizontal">
        <TabList className="overflow-x-auto">
          <Tab className="shrink-0" style={{ margin: 0 }}>
            Description
          </Tab>
          <Tab className="shrink-0" style={{ margin: 0 }}>
            Media
          </Tab>
          <Tab className="shrink-0" style={{ margin: 0 }}>
            Reviews
          </Tab>
        </TabList>

        <TabPanel>
          <style>{`
.markdown_spoiler {
  filter: blur(6px);
  cursor: pointer;
  transition: filter 0.3s ease;

  &:hover {
    filter: none;
  }
}
`}</style>
          <div dangerouslySetInnerHTML={memoedDescription} />
        </TabPanel>
        <TabPanel>
          <Select
            defaultValue={mediaType}
            onChange={(option) => setMediaType(option)}
          >
            <Option value="ANIME">Anime</Option>
            <Option value="MANGA">Manga</Option>
          </Select>
          <CharacterMedia
            characterId={character.id}
            mediaType={mediaType}
            style={'default'}
          />
        </TabPanel>
        <TabPanel>
          <ReviewList
            characterId={character.id}
            setCurrentReviewMetadata={setCurrentReviewMetadata}
            onDrawerOpen={onDrawerOpen}
            setDelReview={setDelReview}
            onOpenReviewDeleteModal={onOpenReviewDeleteModal}
          />
        </TabPanel>
      </Tabs>

      <ReviewActionMenu
        deleteReview={deleteReview}
        handleDelete={handleDelete}
        onCloseReviewDeleteModal={onCloseReviewDeleteModal}
        openReviewDeleteModal={openReviewDeleteModal}
      />
    </>
  );
}

function ReviewActionMenu({
  deleteReview,
  handleDelete,
  onCloseReviewDeleteModal,
  openReviewDeleteModal,
}) {
  return (
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
  );
}
