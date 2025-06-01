import { useMedia } from '@/context/use-media';
import { useDeleteUserMedia } from '@/lib/client/hooks/react_query/delete/user/media';
import { useUserMedia } from '@/lib/client/hooks/react_query/get/user/media';
import { useUserCustomLists } from '@/lib/client/hooks/react_query/get/user/media/custom-lists';
import { useUpdateUserMedia } from '@/lib/client/hooks/react_query/patch/user/media/index';
import { useToggleMediaFavourite } from '@/lib/client/hooks/react_query/patch/user/media/toggle-favourite';
import { MEDIA_ENTRY_STATUS, SNACK_DURATION } from '@/lib/constants';
import { RangeDatePicker } from '@yamada-ui/calendar';
import { HeartIcon, InfoIcon, VenetianMaskIcon } from '@yamada-ui/lucide';
import {
  Box,
  Button,
  CheckboxCardGroup,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Flex,
  FormControl,
  HStack,
  Input,
  Modal,
  ModalFooter,
  ModalHeader,
  Select,
  Snacks,
  Spacer,
  Stack,
  Text,
  Textarea,
  Toggle,
  useDisclosure,
  useNotice,
  useSnacks,
} from '@yamada-ui/react';
import { useEffect, useState } from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form';

function useListEditor({ onListEditorClose }) {
  const media = useMedia();

  const { snack, snacks } = useSnacks();

  const notice = useNotice();
  const updateMediaListEntry = useUpdateUserMedia({
    handleError: (error) => {
      snack({
        description: error.message,
        status: 'error',
        duration: SNACK_DURATION,
      });
    },
    handleSuccess: () => {
      notice({
        description: `${
          mediaListEntry?.data?.data?.Media?.mediaListEntry
            ? 'Updated'
            : 'Added'
        } the entry.`,
        status: 'success',
        duration: SNACK_DURATION,
      });

      onListEditorClose();
    },
  });

  const toggleFavourite = useToggleMediaFavourite({
    handleError: (error) => {
      snack({
        description: error.message,
        status: 'error',
        duration: SNACK_DURATION,
      });
    },
    handleSuccess: () => {
      notice({
        description: `Toggled favourite.`,
        status: 'success',
        duration: SNACK_DURATION,
      });
    },
  });

  const userCustomLists = useUserCustomLists({ mediaType: media.type });

  const mediaListEntry = useUserMedia({
    mediaId: media.id,
    mediaType: media.type,
  });

  const methods = useForm({
    defaultValues: setDefaultFormValues(mediaListEntry, userCustomLists),
  });

  useEffect(() => {
    const defaultValues = setDefaultFormValues(mediaListEntry, userCustomLists);
    methods.reset(defaultValues);
  }, [mediaListEntry?.data]);

  const [customLists, setCustomLists] = useState([]);

  useEffect(() => {
    setCustomLists(userCustomLists?.data?.data?.customLists);
  }, [userCustomLists?.data]);

  const { mutate: deleteListEntry } = useDeleteUserMedia({
    mediaId: media.id,
    mediaType: media.type,
    handleError: (error) => {
      snack({
        status: 'error',
        description: error.message,
        duration: SNACK_DURATION,
        title: error.name,
      });
    },
    handleSuccess: () => {
      notice({
        status: 'success',
        description: 'Media List Entry deleted',
      });
      onListEditorClose();
    },
  });

  return {
    snack,
    snacks,
    updateMediaListEntry,
    toggleFavourite,
    mediaListEntry,
    formMethods: methods,
    customLists,
    deleteListEntry,
  };
}

export default function ListEditor({ openListEditor, onListEditorClose }) {
  const media = useMedia();

  const {
    customLists,
    deleteListEntry,
    formMethods,
    mediaListEntry,
    toggleFavourite,
    updateMediaListEntry,
    snack,
    snacks,
  } = useListEditor({ onListEditorClose });

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

      const promises = [updateMediaListEntry.mutateAsync(restData)];

      if (favourite !== mediaListEntry?.data?.data?.isFavourite) {
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
        open={openListEditor}
        size="full"
        as={'form'}
        onSubmit={formMethods.handleSubmit(onSubmit)}
      >
        <DrawerHeader>
          <Flex w="full" gap="md">
            <Text>List Editor</Text>
            <Spacer />

            <MediaFavouriteToggler />
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
            <MediaListStatusSelector mediaType={media.type} />
            <MediaListEntryRating />
            <MediaListEntryProgress />
            {media.type === 'MANGA' && <MangaSpecificVolumeProgress />}
          </Stack>
          <Stack direction={{ md: 'column', base: 'row' }} w={'full'}>
            <MediaListEntryStartEndDateSelector />
            <MediaListEntryRepeatCounter />
          </Stack>
          <MediaListEntryNotes />
          <MediaListEntry_Private_HiddenFromStatusLists_CheckBoxes />
          <MediaListEntryCustomListsSelector customLists={customLists} />
          <Snacks snacks={snacks} gutter={[0, 'md']} />
        </DrawerBody>

        <DrawerFooter>
          <FormButtons
            mediaListEntry={mediaListEntry}
            onListEditorClose={onListEditorClose}
            onOpen={onOpen}
          />
        </DrawerFooter>

        <MediaListEntryDeleteConfirmationModal
          deleteListEntry={deleteListEntry}
          mediaListEntry={mediaListEntry}
          onClose={onClose}
          open={open}
        />
      </Drawer>
    </FormProvider>
  );
}

function setDefaultFormValues(mediaListEntry, userCustomLists) {
  const dateArray = [];
  const mediaListEntryData = mediaListEntry?.data?.data;

  const startedAt = mediaListEntryData?.startedAt;
  const completedAt = mediaListEntryData?.completedAt;

  if (startedAt?.year && startedAt?.month && startedAt?.day) {
    dateArray.push(
      new Date(startedAt?.year, startedAt?.month - 1, startedAt?.day)
    );
  }

  if (completedAt?.year && completedAt?.month && completedAt?.day) {
    dateArray.push(
      new Date(completedAt?.year, completedAt?.month - 1, completedAt?.day)
    );
  }

  return {
    status: mediaListEntryData?.status ?? 'PLANNING',
    progress: mediaListEntryData?.progress ?? 0,
    favourite: !!mediaListEntryData?.isFavourite,
    score: mediaListEntryData?.score ?? 0,
    startEndDate: dateArray,
    repeat: mediaListEntryData?.repeat ?? 0,
    notes: mediaListEntryData?.notes ?? '',
    vlProgress: mediaListEntryData?.progressVolumes ?? 0,
    customLists: userCustomLists?.data?.data?.customLists
      .filter((key) => mediaListEntryData?.customLists?.[key])
      .sort(),
    options: [
      ...(mediaListEntryData?.hiddenFromStatusLists
        ? ['hiddenFromStatusLists']
        : []),
      ...(mediaListEntryData?.private ? ['private'] : []),
    ].sort(),
  };
}

function MediaListStatusSelector({ mediaType }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      invalid={!!errors.select}
      label="Status"
      errorMessage={errors.select ? errors.select.message : undefined}
    >
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            placeholderInOptions={false}
            placeholder="Status"
            {...field}
            items={MEDIA_ENTRY_STATUS[mediaType.toLowerCase()]}
          />
        )}
      />
    </FormControl>
  );
}

function MediaListEntryRating() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      label="Score"
      invalid={!!errors.score}
      errorMessage={errors.score ? errors.score.message : undefined}
    >
      <Controller
        control={control}
        name="score"
        rules={{
          min: {
            value: 0,
            message: 'Score cannot go below 0',
          },
          max: {
            value: 10,
            message: 'Score cannot go above 10.',
          },
        }}
        render={({ field }) => (
          <Input
            type="number"
            min={0}
            max={10}
            step={'0.01'}
            {...field}
            onChange={(e) => {
              field.onChange(parseFloat(e.target.value));
            }}
          />
        )}
      />
    </FormControl>
  );
}

function MediaListEntryProgress() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      label="Progress"
      invalid={!!errors.progress}
      errorMessage={errors.progress ? errors.progress.message : undefined}
    >
      <Controller
        name="progress"
        control={control}
        rules={{
          min: {
            value: 0,
            message: 'Progress cannot be negative',
          },
        }}
        render={({ field }) => (
          <Input
            type="number"
            step={1}
            min={0}
            {...field}
            onChange={(e) => {
              field.onChange(parseInt(e.target.value));
            }}
          />
        )}
      />
    </FormControl>
  );
}

function MangaSpecificVolumeProgress() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      label="Volume Progress"
      invalid={!!errors.vlProgress}
      errorMessage={errors.vlProgress ? errors.vlProgress.message : undefined}
    >
      <Controller
        name="vlProgress"
        control={control}
        rules={{
          min: {
            value: 0,
            message: 'Volume Progress cannot be negative',
          },
        }}
        render={({ field }) => (
          <Input
            type="number"
            min={0}
            step={1}
            {...field}
            onChange={(e) => {
              field.onChange(parseInt(e.target.value));
            }}
          />
        )}
      />
    </FormControl>
  );
}

function MediaListEntryStartEndDateSelector() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      invalid={!!errors.startEndDate}
      label="Star and End Date"
      errorMessage={
        errors.startEndDate ? errors.startEndDate.message : undefined
      }
    >
      <Controller
        name="startEndDate"
        control={control}
        render={({ field }) => (
          <RangeDatePicker
            {...field}
            placeholder="YYYY/MM/DD"
            firstDayOfWeek="sunday"
            weekendDays={[0]}
          />
        )}
      />
    </FormControl>
  );
}

function MediaListEntryRepeatCounter() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      label="Repeat"
      invalid={!!errors.repeat}
      errorMessage={errors.repeat ? errors.repeat.message : undefined}
    >
      <Controller
        control={control}
        name="repeat"
        rules={{
          min: {
            value: 0,
            message: 'Repeat count cannot go below 0',
          },
        }}
        render={({ field }) => (
          <Input
            type="number"
            min={0}
            {...field}
            onChange={(e) => {
              field.onChange(parseFloat(e.target.value));
            }}
          />
        )}
      />
    </FormControl>
  );
}

function MediaListEntryNotes() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      label="Notes"
      invalid={!!errors.notes}
      errorMessage={errors.notes ? errors.notes.message : undefined}
    >
      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <Textarea autosize minRows={4} maxRows={10} {...field} />
        )}
      />
    </FormControl>
  );
}

function MediaListEntry_Private_HiddenFromStatusLists_CheckBoxes() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      invalid={!!errors.options}
      errorMessage={errors.options ? errors.options.message : undefined}
    >
      <Controller
        name="options"
        control={control}
        render={({ field }) => (
          <CheckboxCardGroup
            {...field}
            onChange={(options) => field.onChange(options.sort())}
            w="full"
            flexWrap={'wrap'}
            withIcon={false}
            items={[
              {
                label: (
                  <HStack gap="sm">
                    <VenetianMaskIcon color="muted" fontSize="2xl" />
                    <Text>Private</Text>
                  </HStack>
                ),
                value: 'private',
              },
              {
                label: (
                  <HStack gap="sm" w="max-content">
                    <VenetianMaskIcon color="muted" fontSize="2xl" />
                    <Text flexShrink={0}>Hidden from status lists</Text>
                  </HStack>
                ),
                value: 'hiddenFromStatusLists',
              },
            ]}
          />
        )}
      />
    </FormControl>
  );
}

function MediaListEntryCustomListsSelector({ customLists }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      invalid={!!errors.customLists}
      label="Custom Lists"
      errorMessage={errors.customLists ? errors.customLists.message : undefined}
    >
      <Controller
        name="customLists"
        control={control}
        render={({ field }) => (
          <CheckboxCardGroup
            {...field}
            onChange={(listNames) => field.onChange(listNames.sort())}
            flexWrap={'wrap'}
            items={customLists.map((listName) => ({
              label: listName,
              value: listName,
            }))}
          />
        )}
      />
    </FormControl>
  );
}

function FormButtons({ mediaListEntry, onListEditorClose, onOpen, reset }) {
  const {
    formState: { isDirty },
  } = useFormContext();
  return (
    <>
      {mediaListEntry?.data?.data?.id && (
        <Button
          colorScheme={'red'}
          onClick={() => {
            onOpen();
          }}
        >
          Delete
        </Button>
      )}
      <Button variant="ghost" onClick={onListEditorClose}>
        Close
      </Button>
      <Button
        variant="outline"
        disabled={!isDirty}
        onClick={() => {
          reset();
        }}
      >
        Reset
      </Button>
      <Button type="submit" colorScheme="primary" disabled={!isDirty}>
        Save
      </Button>
    </>
  );
}

function MediaListEntryDeleteConfirmationModal({
  deleteListEntry,
  mediaListEntry,
  onClose,
  open,
}) {
  return (
    <Modal open={open}>
      <ModalHeader>Are you sure?</ModalHeader>
      <ModalFooter>
        <Button
          onClick={() => {
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button
          colorScheme={'red'}
          onClick={() => {
            deleteListEntry({
              mediaListEntryId: mediaListEntry?.data?.data?.id,
            });
          }}
        >
          Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function MediaFavouriteToggler() {
  const { control, reset } = useFormContext();
  return (
    <Controller
      name="favourite"
      control={control}
      render={({ field }) => (
        <Toggle
          borderRadius={'full'}
          selected={field.value}
          colorScheme="red"
          variant={'solid'}
          icon={<HeartIcon />}
          {...field}
          onChange={(selected) => field.onChange(selected)}
        />
      )}
    />
  );
}
