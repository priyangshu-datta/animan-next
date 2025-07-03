import { useCharacter } from '@/context/use-character';
import { MEDIA_TYPES } from '@/lib/constants';
import { sentenceCase } from '@/utils/general';
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
} from '@yamada-ui/react';
import { useState } from 'react';
import RelatedMedia from '../related-media';
import { assocMedia } from '@/stores/assoc-media';

export function ChooseMediaModal({ onClose, open }) {
  const character = useCharacter();
  // const [mediaType, setMediaType] = useState('ANIME');

  return (
    <Modal open={open} onClose={onClose} size={'6xl'}>
      <ModalHeader>Choose Associated Media</ModalHeader>
      <ModalBody>
        {/* <Select
          defaultValue={mediaType}
          onChange={(option) => setMediaType(option)}
          items={MEDIA_TYPES.map((mType) => ({
            value: mType,
            label: sentenceCase(mType),
          }))}
        /> */}

        <RelatedMedia
          characterId={character.id}
          // mediaType={mediaType}
          // style={'list'}
          Wrapper={function Wrapper({ children, media, characterRole }) {
            return (
              <Box
                {...(media.id === assocMedia().id
                  ? {
                      borderColor: 'primary',
                      borderWidth: 'thick',
                    }
                  : {})}
                cursor={"pointer"}
                onClick={() => {
                  assocMedia.setState({
                    id: media.id,
                    role: characterRole,
                    type: media.type,
                    coverImage: media.coverImage.extraLarge,
                    title: media.title.userPreferred,
                  });
                }}
              >
                {children}
              </Box>
            );
          }}
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
