import { useCharacter } from '@/context/use-character';
import { MEDIA_TYPES } from '@/lib/constants';
import { sentenceCase } from '@/utils/general';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
} from '@yamada-ui/react';
import { useState } from 'react';
import CharacterMedia from '../character-media';

export function ChooseMediaModal({ onClose, open }) {
  const character = useCharacter();
  const [mediaType, setMediaType] = useState('ANIME');

  return (
    <Modal open={open} onClose={onClose} size={'6xl'}>
      <ModalHeader>Choose Associated Media</ModalHeader>
      <ModalBody>
        <Select
          defaultValue={mediaType}
          onChange={(option) => setMediaType(option)}
          items={MEDIA_TYPES.map((mType) => ({
            value: mType,
            label: sentenceCase(mType),
          }))}
        />
        <CharacterMedia
          characterId={character.id}
          mediaType={mediaType}
          style={'list'}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" type="button" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
