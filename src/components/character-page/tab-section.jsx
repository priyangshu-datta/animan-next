import { useCharacter } from '@/context/use-character';
import { useDeleteReview } from '@/lib/client/hooks/react_query/review/character/use-delete-review';
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
import CharacterMedia from './character-media';
import ReviewList from './review-list';

export default function TabSection({ setEditorContext, onDrawerOpen }) {
  const character = useCharacter();

  const memoedDescription = useMemo(() => ({ __html: character.description }));

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
      characterId: character.id,
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
          <NativeSelect
            defaultValue={mediaType}
            onChange={(ev) => setMediaType(ev.target.value)}
          >
            <NativeOption value="ANIME">Anime</NativeOption>
            <NativeOption value="MANGA">Manga</NativeOption>
          </NativeSelect>

          <CharacterMedia
            characterId={character.id}
            mediaType={mediaType}
            style={'default'}
          />
        </TabPanel>
        <TabPanel>
          <ReviewList
            characterId={character.id}
            setEditorContext={setEditorContext}
            onDrawerOpen={onDrawerOpen}
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
