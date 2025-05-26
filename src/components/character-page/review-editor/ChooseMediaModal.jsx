import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
} from '@yamada-ui/react';
import CharacterMedia from '../character-media';
import { MEDIA_TYPES } from '@/lib/constants';
import { useCharacter } from '@/context/use-character';
import { Suspense, useState } from 'react';
import { sentenceCase } from '@/utils/general';

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
            label: mType,
            value: sentenceCase(mType),
          }))}
        />
        <Suspense fallback={<Loading />}>
          <CharacterMedia
            characterId={character.id}
            mediaType={mediaType}
            style={'list'}
          />
        </Suspense>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" type="button" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
