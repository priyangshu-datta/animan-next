import {
  Box,
  Card,
  CloseButton,
  HStack,
  Image,
  Input,
  Text,
  useDisclosure,
  VStack,
} from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { ChooseMediaModal } from './ChooseMediaModal';
import { useAssociatedMedia } from './hooks';
import { assocMedia } from '@/stores/assoc-media'
import { sentenceCase } from '@/utils/general'

export function AssociatedMedia() {
  const { setValue: setFormValue, control } = useFormContext();
  const { open, onClose, onOpen } = useDisclosure();

  const assocMediaData = assocMedia();

  useAssociatedMedia(setFormValue);

  return (
    <>
      <AssocMediaDummyInputs control={control} />

      <HStack
        alignItems={'flex-start'}
        onClick={onOpen}
        as={Card}
        w={'fit-content'}
        pos={'relative'}
        cursor={'pointer'}
      >
        {assocMediaData.id > 0 ? (
          <>
            <CloseButton
              pos={'absolute'}
              size={'md'}
              right={0}
              onClick={closeButtonHandler(setFormValue)}
            />
            <Box w={'28'} aspectRatio={5 / 7} h={'full'}>
              <Image
                src={assocMediaData.coverImage}
                w={'full'}
                height={'full'}
                borderLeftRadius={'base'}
              />
            </Box>
            <VStack gap={'2'}>
              <Text fontSize={'xl'}>{assocMediaData.title}</Text>
              <Text fontSize={'md'} fontWeight={'light'}>
                Character Role:{' '}
                <strong>{sentenceCase(assocMediaData.role)}</strong>
              </Text>
            </VStack>
          </>
        ) : (
          <Text
            fontWeight={'light'}
            p={'2'}
            borderWidth={'thin'}
            borderColor={'ButtonText'}
            borderStyle={'solid'}
            borderRadius={'base'}
            fontSize={'lg'}
          >
            Review with Context
          </Text>
        )}
      </HStack>
      <ChooseMediaModal onClose={onClose} open={open} />
    </>
  );
}

function closeButtonHandler(setFormValue) {
  return (ev) => {
    ev.stopPropagation();
    setFormValue('associatedMediaId', 0, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setFormValue('associatedMediaType', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setFormValue('role', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    assocMedia.getState().reset();
  };
}

function AssocMediaDummyInputs({ control }) {
  return (
    <div className="hidden">
      <Controller
        name={'associatedMediaId'}
        control={control}
        render={({ field }) => <Input {...field} />}
      />
      <Controller
        name={'associatedMediaType'}
        control={control}
        render={({ field }) => <Input {...field} />}
      />
      <Controller
        name={'role'}
        control={control}
        render={({ field }) => <Input {...field} />}
      />
    </div>
  );
}
