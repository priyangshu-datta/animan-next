import { useMedia } from '@/context/use-media';
import { useCreateUpdateMediaListEntry } from '@/lib/client/hooks/react_query/graphql/use-create-update-media-list-entry';
import { useGetMediaListEntry } from '@/lib/client/hooks/react_query/graphql/use-get-media-list-entry';
import { useToggleFavourite } from '@/lib/client/hooks/react_query/graphql/use-toggle-media-favourite';
import { useUserCustomLists } from '@/lib/client/hooks/react_query/graphql/use-user-custom-lists';
import { RangeDatePicker } from '@yamada-ui/calendar';
import { HeartIcon, VenetianMaskIcon } from '@yamada-ui/lucide';
import {
  Alert,
  AlertDescription,
  AlertIcon,
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
  Select,
  Snacks,
  Spacer,
  Stack,
  Text,
  Textarea,
  Toggle,
  useNotice,
  useSnacks,
} from '@yamada-ui/react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function ListEditor({ openListEditor, onListEditorClose }) {
  const media = useMedia();

  const mediaListEntry = useGetMediaListEntry(media.id);

  const createUpdateMediaListEntry = useCreateUpdateMediaListEntry();

  const toggleFavourite = useToggleFavourite(media.type.toLowerCase());

  const {
    control,
    formState: { errors, isDirty },
    reset,
    handleSubmit,
  } = useForm();

  const userCustomLists = useUserCustomLists(media.type.toLowerCase());

  const [customLists, setCustomLists] = useState([]);

  useEffect(() => {
    if (
      userCustomLists.data?.data?.Viewer?.mediaListOptions[
        `${media.type.toLowerCase()}List`
      ]
    ) {
      setCustomLists(
        userCustomLists.data?.data?.Viewer?.mediaListOptions[
          `${media.type.toLowerCase()}List`
        ].customLists
      );
    }
  }, [userCustomLists.data, setCustomLists]);

  useEffect(() => {
    if (mediaListEntry.isSuccess) {
      const dateArray = [];

      const startedAt =
        mediaListEntry.data?.data?.Media?.mediaListEntry?.startedAt;
      const completedAt =
        mediaListEntry.data?.data?.Media?.mediaListEntry?.completedAt;

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

      const mediaListEntryData =
        mediaListEntry.data?.data?.Media?.mediaListEntry;

      reset({
        status: mediaListEntryData?.status ?? 'PLANNING',
        progress: mediaListEntryData?.progress ?? 0,
        favourite: mediaListEntry.data?.data?.Media?.isFavourite ?? false,
        score: mediaListEntryData?.score ?? 0,
        'start-end-date': dateArray,
        repeat: mediaListEntryData?.repeat ?? 0,
        notes: mediaListEntryData?.notes ?? '',
        vlProgress: mediaListEntryData?.progressVolumes ?? 0,
        customLists: customLists
          .filter((key) => mediaListEntryData?.customLists[key])
          .sort(),
        options: [
          ...(mediaListEntryData?.hiddenFromStatusLists
            ? ['hiddenFromStatusLists']
            : []),
          ...(mediaListEntryData?.private ? ['private'] : []),
        ].sort(),
      });
    }
  }, [mediaListEntry.isSuccess, reset, mediaListEntry.data, customLists]);

  const { snack, snacks } = useSnacks();

  const updateEntry = async (mutationData) => {
    const promises = [createUpdateMediaListEntry.mutateAsync(mutationData)];

    if (mutationData.favourite !== mediaListEntry.data.data.Media.isFavourite) {
      promises.push(toggleFavourite.mutateAsync({ mediaId: media.id }));
    }

    await Promise.all(promises);
  };

  function onSubmit(formData) {
    const mutationData = {
      mediaId: media.id,
      status: formData.status,
      progress: formData.progress,
      favourite: formData.favourite,
      score: formData.score,
      ...(formData['start-end-date'][0]
        ? {
            startedAt: {
              day: formData['start-end-date'][0].getDate(),
              month: formData['start-end-date'][0].getMonth() + 1,
              year: formData['start-end-date'][0].getFullYear(),
            },
          }
        : {}),
      ...(formData['start-end-date'][1]
        ? {
            completedAt: {
              day: formData['start-end-date'][1].getDate(),
              month: formData['start-end-date'][1].getMonth() + 1,
              year: formData['start-end-date'][1].getFullYear(),
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
      updateEntry(mutationData);
    }
  }

  useEffect(() => {
    if (toggleFavourite.isError) {
      snack({
        title: `Error toggling favourite`,
        description: toggleFavourite.error.message,
        status: 'error',
      });
    }
  }, [toggleFavourite.isError, toggleFavourite.error]);

  useEffect(() => {
    if (createUpdateMediaListEntry.isError) {
      snack({
        title: `Error ${
          mediaListEntry.data?.data?.Media?.mediaListEntry
            ? 'updating'
            : 'adding'
        } the entry.`,
        description: createUpdateMediaListEntry.error.message,
        status: 'error',
      });
    }
  }, [createUpdateMediaListEntry.isError, createUpdateMediaListEntry.error]);

  const notice = useNotice();

  useEffect(() => {
    if (createUpdateMediaListEntry.isSuccess) {
      notice({
        title: 'Success',
        description: `${
          mediaListEntry.data?.data?.Media?.mediaListEntry ? 'Updated' : 'Added'
        } the entry.`,
        status: 'success',
      });

      onListEditorClose();
    }
  }, [createUpdateMediaListEntry.isSuccess]);

  useEffect(() => {
    if (toggleFavourite.isSuccess) {
      notice({
        title: 'Success',
        description: `Toggled favourite.`,
        status: 'success',
      });
    }
  }, [toggleFavourite.isSuccess]);

  return (
    <Drawer
      open={openListEditor}
      size="full"
      as={'form'}
      onSubmit={handleSubmit(onSubmit)}
    >
      {mediaListEntry.isPending ? (
        <Loading fontSize={'4xl'} />
      ) : (
        <>
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
                    value="favourite"
                    selected={field.value}
                    colorScheme="red"
                    variant={'solid'}
                    icon={<HeartIcon />}
                    {...field}
                    onChange={(selected) => field.onChange(selected)}
                    aria-label="Favourite Episode"
                  />
                )}
              />
            </Flex>
          </DrawerHeader>

          <DrawerBody>
            <Alert>
              <AlertIcon />
              <AlertDescription>
                This mutates your Anilist data. If preferred go and fill the
                same in anilist, and then reload this page.
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
                          label:
                            media.type === 'ANIME' ? 'Watching' : 'Reading',
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
                errorMessage={
                  errors.progress ? errors.progress.message : undefined
                }
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
                invalid={!!errors.rangeDatePicker}
                label="Star and End Date"
                errorMessage={
                  errors.rangeDatePicker
                    ? errors.rangeDatePicker.message
                    : undefined
                }
              >
                <Controller
                  name="start-end-date"
                  control={control}
                  render={({ field }) => (
                    <RangeDatePicker
                      placeholder="YYYY/MM/DD"
                      firstDayOfWeek="sunday"
                      weekendDays={[0]}
                      {...field}
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

            {/* {Object.entries(errors).map(([fieldName, fieldError]) => (
            <Alert status="error" key={fieldName}>
              <AlertIcon />
              <AlertDescription>{fieldError.message}</AlertDescription>
            </Alert>
          ))} */}

            <Snacks snacks={snacks} gutter={[0, 'md']} />
          </DrawerBody>

          <DrawerFooter>
            <Button variant="ghost" onClick={onListEditorClose}>
              Close
            </Button>
            <Button variant="outline">Reset</Button>
            <Button type="submit" colorScheme="primary">
              Save
            </Button>
          </DrawerFooter>
        </>
      )}
    </Drawer>
  );
}
