import { Button, Modal, ModalFooter, ModalHeader } from '@yamada-ui/react';

export default function EntryDeleteConfirmationModal({
  deleteEntry,
  mediaEntry,
  onClose,
  open,
}) {
  return (
    <Modal open={open}>
      <ModalHeader>Are you sure?</ModalHeader>
      <ModalFooter>
        <Button
          disabled={deleteEntry.isPending}
          onClick={() => {
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button
          colorScheme={'red'}
          disabled={deleteEntry.isPending}
          onClick={() => {
            deleteEntry.mutate({
              mediaListEntryId: mediaEntry?.data?.data?.id,
            });
          }}
        >
          Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
}
