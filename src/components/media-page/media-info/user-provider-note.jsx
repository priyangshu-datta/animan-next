import { useMedia } from '@/context/use-media';
import { NotepadTextIcon } from '@yamada-ui/lucide';
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from '@yamada-ui/react';

export default function UserProviderNote() {
  const media = useMedia();
  const { onClose, onOpen, open } = useDisclosure();
  return (
    <>
      <Tooltip label="Your Anilist note">
        <Box onClick={() => onOpen()}>
          <NotepadTextIcon />
        </Box>
      </Tooltip>
      <Modal open={open} size="4xl">
        <ModalHeader>Your Anilist note</ModalHeader>
        <ModalBody>{media.entry.notes}</ModalBody>
        <ModalFooter>
          <Button onClick={() => onClose()}>Close</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
