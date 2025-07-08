import { useMedia } from '@/context/use-media';
import { useEntryEditor } from './hooks';
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Flex,
  Snacks,
  Spacer,
  Stack,
  Text,
  useDisclosure,
} from '@yamada-ui/react';
import { FormProvider } from 'react-hook-form';
import { InfoIcon } from '@yamada-ui/lucide';
import Favourite from './favourite';
import EntryStatus from './status-selector';
import EntryRating from './rating';
import EntryProgress from './progress';
import VolumeProgress from './volume-progress';
import EntryStartEndDate from './start-end-date';
import EntryRepeatCounter from './repeat-counter';
import EntryNotes from './notes';
import Entry_Private_HiddenFromStatusLists_CheckBoxes from './checkboxes';
import EntryCustomLists from './custom-lists';
import FormButtons from './form-buttons';
import EntryDeleteConfirmationModal from './delete-modal';

export default function EntryEditor({ openEntryEditor, onEntryEditorClose }) {
  const media = useMedia();

  const {
    customLists,
    deleteEntry,
    formMethods,
    mediaEntry,
    toggleFavourite,
    updateMediaEntry,
    snack,
    snacks,
  } = useEntryEditor({ onEntryEditorClose });

  async function onSubmit(formData) {
    const mutationData = {
      mediaId: media.id,
      mediaType: media.type,
      status: formData.status,
      progress: formData.progress,
      favourite: formData.favourite,
      score: formData.score,
      ...(formData['startEndDate'][0]
        ? {
            startedAt: {
              day: formData['startEndDate'][0].getDate(),
              month: formData['startEndDate'][0].getMonth() + 1,
              year: formData['startEndDate'][0].getFullYear(),
            },
          }
        : {}),
      ...(formData['startEndDate'][1]
        ? {
            completedAt: {
              day: formData['startEndDate'][1].getDate(),
              month: formData['startEndDate'][1].getMonth() + 1,
              year: formData['startEndDate'][1].getFullYear(),
            },
          }
        : {}),
      ...(media.type === 'MANGA'
        ? { progressVolumes: formData.vlProgress }
        : {}),
      notes: formData.notes,
      repeat: formData.repeat,
      customLists: formData.customLists,
      private: formData.options.includes('private'),
      hiddenFromStatusLists: formData.options.includes('hiddenFromStatusLists'),
    };

    if (formMethods.formState.isDirty) {
      const { favourite, ...restData } = mutationData;

      const promises = [updateMediaEntry.mutateAsync(restData)];

      if (favourite !== mediaEntry?.data?.data?.isFavourite) {
        promises.push(
          toggleFavourite.mutateAsync({
            mediaId: media.id,
            mediaType: media.type,
          })
        );
      }

      await Promise.all(promises);
    } else {
      snack({
        status: 'info',
        description: 'No changes have been made',
        duration: SNACK_DURATION,
      });
    }
  }

  const { open, onOpen, onClose } = useDisclosure();

  return (
    <FormProvider {...formMethods}>
      <Drawer
        open={openEntryEditor}
        size="full"
        as={'form'}
        onSubmit={formMethods.handleSubmit(onSubmit)}
        blockScrollOnMount={false}
      >
        <DrawerHeader>
          <Flex w="full" gap="md">
            <Text>List Editor</Text>
            <Spacer />

            <Favourite />
          </Flex>
        </DrawerHeader>

        <DrawerBody>
          <Flex
            alignItems={'center'}
            gap="2"
            borderColor="primary"
            borderWidth={'thin'}
            borderStyle={'solid'}
            p="2"
            borderRadius={'lg'}
            w="full"
          >
            <InfoIcon stroke="primary" fontSize={'xl'} />
            <Box>
              This mutates your Anilist data. If preferred go and fill the same
              in anilist, and then reload this page.
            </Box>
          </Flex>
          <Stack direction={{ md: 'column', base: 'row' }} w={'full'}>
            <EntryStatus mediaType={media.type} />
            <EntryRating />
            <EntryProgress />
            {media.type === 'MANGA' && <VolumeProgress />}
          </Stack>
          <Stack direction={{ md: 'column', base: 'row' }} w={'full'}>
            <EntryStartEndDate />
            <EntryRepeatCounter />
          </Stack>
          <EntryNotes />
          <Entry_Private_HiddenFromStatusLists_CheckBoxes />
          <EntryCustomLists customLists={customLists} />
          <Snacks snacks={snacks} gutter={[0, 'md']} />
        </DrawerBody>

        <DrawerFooter>
          <FormButtons
            mediaEntry={mediaEntry}
            onEntryEditorClose={onEntryEditorClose}
            onOpen={onOpen}
          />
        </DrawerFooter>

        <EntryDeleteConfirmationModal
          deleteEntry={deleteEntry}
          mediaEntry={mediaEntry}
          onClose={onClose}
          open={open}
        />
      </Drawer>
    </FormProvider>
  );
}
