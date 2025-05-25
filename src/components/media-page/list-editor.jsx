import { useMedia } from '@/context/use-media';
import { useDeleteUserMedia } from '@/lib/client/hooks/react_query/delete/user/media';
import { useUserMedia } from '@/lib/client/hooks/react_query/get/user/media';
import { useUserCustomLists } from '@/lib/client/hooks/react_query/get/user/media/custom-lists';
import { useUpdateUserMedia } from '@/lib/client/hooks/react_query/patch/user/media/index';
import { useToggleMediaFavourite } from '@/lib/client/hooks/react_query/patch/user/media/toggle-favourite';
import { SNACK_DURATION } from '@/lib/constants';
import { RangeDatePicker } from '@yamada-ui/calendar';
import { HeartIcon, VenetianMaskIcon } from '@yamada-ui/lucide';
import {
  Alert,
  AlertDescription,
  AlertIcon,
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
  Loading,
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
  VStack,
} from '@yamada-ui/react';
import { Suspense, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function ListEditor({ openListEditor, onListEditorClose }) {
  return (
    <Drawer open={openListEditor} size="full">
      <Suspense fallback={<Loading />}>
        <DrawerComponent onListEditorClose={onListEditorClose} />
      </Suspense>
    </Drawer>
  );
}

function DrawerComponent({ onListEditorClose }) {
  const media = useMedia();
  const { snack, snacks } = useSnacks();
  const notice = useNotice();

  const updateMediaListEntry = useUpdateUserMedia({
    mediaId: media.id,
    mediaType: media.type,
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
          mediaListEntry.data?.data?.Media?.mediaListEntry ? 'Updated' : 'Added'
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

  const {
    control,
    formState: { errors, isDirty },
    reset,
    handleSubmit,
  } = useForm({
    defaultValues: setDefaultFormValues(mediaListEntry, userCustomLists),
  });

  useEffect(() => {
    const defaultValues = setDefaultFormValues(mediaListEntry, userCustomLists);
    reset(defaultValues);
  }, [mediaListEntry.data, reset]);

  const [customLists, setCustomLists] = useState([]);

  useEffect(() => {
    setCustomLists(userCustomLists.data.data.customLists);
  }, []);

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

    if (isDirty) {
      const { favourite, ...restData } = mutationData;

      const promises = [updateMediaListEntry.mutateAsync(restData)];

      if (favourite !== mediaListEntry?.isFavourite) {
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

  const { open, onOpen, onClose } = useDisclosure();

  return (
    <VStack as={'form'} onSubmit={handleSubmit(onSubmit)} h="full">
      <DrawerHeader>
        <Flex w="full" gap="md">
          <Text>List Editor</Text>
          <Spacer />

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
        </Flex>
      </DrawerHeader>

      <DrawerBody>
        <Alert>
          <AlertIcon />
          <AlertDescription>
            This mutates your Anilist data. If preferred go and fill the same in
            anilist, and then reload this page.
          </AlertDescription>
        </Alert>
        <Stack direction={{ md: 'column', base: 'row' }} w={'full'}>
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
                  items={[
                    {
                      label: media.type === 'ANIME' ? 'Watching' : 'Reading',
                      value: 'CURRENT',
                    },
                    { label: 'Planning', value: 'PLANNING' },
                    { label: 'Completed', value: 'COMPLETED' },
                    { label: 'Dropped', value: 'DROPPED' },
                    { label: 'Repeating', value: 'REPEATING' },
                    { label: 'Paused', value: 'PAUSED' },
                  ]}
                />
              )}
            />
          </FormControl>
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
          {media.type === 'MANGA' && (
            <FormControl
              label="Volume Progress"
              invalid={!!errors.vlProgress}
              errorMessage={
                errors.vlProgress ? errors.vlProgress.message : undefined
              }
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
          )}
        </Stack>
        <Stack direction={{ md: 'column', base: 'row' }} w={'full'}>
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
        </Stack>

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
                      <HStack gap="sm">
                        <VenetianMaskIcon color="muted" fontSize="2xl" />
                        <Text>Hidden from status lists</Text>
                      </HStack>
                    ),
                    value: 'hiddenFromStatusLists',
                  },
                ]}
              />
            )}
          />
        </FormControl>

        <FormControl
          invalid={!!errors.customLists}
          label="Custom Lists"
          errorMessage={
            errors.customLists ? errors.customLists.message : undefined
          }
        >
          <Controller
            name="customLists"
            control={control}
            render={({ field }) => (
              <CheckboxCardGroup
                {...field}
                onChange={(listNames) => field.onChange(listNames.sort())}
                // withIcon={false}
                items={customLists.map((listName) => ({
                  label: listName,
                  value: listName,
                }))}
              />
            )}
          />
        </FormControl>

        <Snacks snacks={snacks} gutter={[0, 'md']} />
      </DrawerBody>

      <DrawerFooter>
        {mediaListEntry.data.data?.id && (
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
      </DrawerFooter>

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
                mediaListEntryId: mediaListEntry.data.data.id,
              });
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </VStack>
  );
}

function setDefaultFormValues(mediaListEntry, userCustomLists) {
  const dateArray = [];
  const mediaListEntryData = mediaListEntry.data?.data;

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
    customLists: userCustomLists.data.data.customLists
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
