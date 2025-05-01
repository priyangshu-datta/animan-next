import { useMedia } from '@/context/Media';
import { useSaveReview } from '@/lib/client/hooks/react_query/useSaveReview';
import { useUpdateReview } from '@/lib/client/hooks/react_query/useUpdateReview';
import { EMOTIONS } from '@/lib/constants';
import { HeartIcon } from '@yamada-ui/lucide';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Flex,
  FormControl,
  Heading,
  HStack,
  Image,
  Input,
  MultiSelect,
  NativeSelect,
  Snacks,
  Spacer,
  Tag,
  Text,
  Textarea,
  Toggle,
  useNotice,
  useSnacks,
  VStack,
} from '@yamada-ui/react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

function useCountDownTimer(nextEpisodeAiringAt) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!nextEpisodeAiringAt) return;

    function updateCountdown() {
      const now = Date.now() / 1000; // current time in seconds
      const diff = Math.max(0, nextEpisodeAiringAt - now);

      if (diff < 5) return 'Airing now!';

      const seconds = Math.floor(diff % 60)
        .toString()
        .padStart(2, '0');
      const minutes = Math.floor((diff / 60) % 60)
        .toString()
        .padStart(2, '0');
      const hours = Math.floor((diff / 3600) % 24);

      const days = Math.floor(diff / 86400);

      if (days > 0) {
        setTimeLeft(
          `${days} day${days > 1 ? 's' : ''} ${
            hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''
          }`
        );
      } else if (hours > 0) {
        setTimeLeft(
          `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${
            minutes > 1 ? 's' : ''
          }`
        );
      } else if (minutes > 0) {
        setTimeLeft(
          `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${
            seconds !== 1 ? 's' : ''
          }`
        );
      } else {
        setTimeLeft(`${seconds} second${seconds !== 1 ? 's' : ''}`);
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextEpisodeAiringAt]);

  return timeLeft;
}

export default function ReviewEditor({
  openReviewEditor,
  maxEpisodes,
  editorContext,
  onReviewEditorClose,
}) {
  const media = useMedia();

  const {
    control,
    setValue: setFormValue,
    reset: resetForm,
    handleSubmit,
    getValues: getFormValues,
    watch: watchForm,
    formState: { errors, isDirty, dirtyFields },
  } = useForm({
    criteriaMode: 'all',
    defaultValues: {
      ...editorContext,
    },
  });

  const saveReview = useSaveReview();
  const updateReview = useUpdateReview();

  const notice = useNotice();
  const { snack, snacks } = useSnacks();

  useEffect(() => {
    if (saveReview.isError) {
      snack({
        title: saveReview.error.code,
        description: saveReview.error.message,
        status: 'error',
      });
    }

    if (saveReview.isSuccess) {
      notice({
        title: 'Success',
        description: 'Review saved successfully',
        status: 'success',
      });
      onReviewEditorClose();
    }
  }, [saveReview.isError, saveReview.error, saveReview.isSuccess]);

  useEffect(() => {
    if (updateReview.isError) {
      snack({
        title: updateReview.error.code,
        description: updateReview.error.message,
        status: 'error',
      });
    }

    if (updateReview.isSuccess) {
      notice({
        title: 'Success',
        description: 'Review updated successfully',
        status: 'success',
      });
      onReviewEditorClose();
      localStorage.removeItem(
        editorContext.id ?? `draft-${getFormValues('subject')}-${media.id}`
      );
    }
  }, [updateReview.isError, updateReview.error, updateReview.isSuccess]);

  useEffect(() => {
    if (dirtyFields['subject']) {
      let savedDraft = localStorage.getItem(
        editorContext.id ?? `draft-${getFormValues('subject')}-${media.id}`
      );
      try {
        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft);
          resetForm(parsedDraft);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [dirtyFields, isDirty, resetForm]);

  useEffect(() => {
    resetForm({ ...editorContext });

    let savedDraft = localStorage.getItem(
      editorContext.id ?? `draft-${editorContext.subject}-${media.id}`
    );
    try {
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        for (const [key, value] of Object.entries(parsedDraft)) {
          setFormValue(key, value, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [editorContext, resetForm, setFormValue]);

  const onSubmit = (data) => {
    let mutationData = {
      mediaType: media.type,
      subject_type: data.subject,
      rating: data.rating,
      review_text: data.review,
      favourite: data.favourite,
      emotions: data.emotions,
      media_id: media.id,
    };

    if (media.type === 'ANIME') {
      mutationData = {
        ...mutationData,
        ...(getFormValues('subject') === 'episode' && {
          episode_number: data.unit,
        }),
        season: media.season.toLowerCase(),
        year: media.seasonYear,
      };
    } else {
      mutationData = {
        ...mutationData,
        ...(getFormValues('subject') === 'chapter' && {
          chapter_number: data.unit,
        }),
        volume: data.volume,
      };
    }

    if (editorContext.id) {
      if (isDirty) {
        console.log(mutationData);
        updateReview.mutate({
          review_id: editorContext.id,
          ...mutationData,
        });
      } else {
        snack({
          title: 'No change',
          description: 'Change some field to update the entry',
          status: 'info',
        });
      }
    } else {
      saveReview.mutate(mutationData);
    }
  };

  const timeLeft = useCountDownTimer(media.nextAiringEpisode?.airingAt);

  return (
    <Drawer
      open={openReviewEditor}
      size="full"
      as={'form'}
      onSubmit={handleSubmit(onSubmit)}
    >
      <DrawerHeader>
        <Image src={media.coverImage.extraLarge} w={'40'} />
        <VStack>
          <Flex gap={'sm'} alignItems={'baseline'}>
            <Heading size={{ base: 'lg', sm: 'md' }}>
              {media.title.romaji}
            </Heading>
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
          {timeLeft ? (
            <Text fontWeight={'light'}>
              Next Episode {media.nextAiringEpisode.episode} in {timeLeft}
            </Text>
          ) : (
            ''
          )}
          <Flex gap={'sm'} alignItems={'baseline'} wrap="wrap">
            <Text>Review</Text>

            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <NativeSelect
                  {...field}
                  w={'fit-content'}
                  items={
                    media.type === 'ANIME'
                      ? [
                          { label: 'Episode', value: 'episode' },
                          { label: 'Anime', value: 'anime' },
                        ]
                      : [
                          { label: 'Chapter', value: 'chapter' },
                          { label: 'Volume', value: 'volume' },
                          { label: 'Manga', value: 'manga' },
                        ]
                  }
                />
              )}
            />
          </Flex>
        </VStack>
      </DrawerHeader>

      <DrawerBody>
        <VStack spacing="4">
          <HStack>
            {['chapter', 'episode'].includes(watchForm('subject')) && (
              <FormControl
                required
                label={media.type === 'ANIME' ? 'Episode' : 'Chapter'}
                invalid={!!errors.unit}
                errorMessage={errors.unit ? errors.unit.message : undefined}
              >
                <Controller
                  name="unit"
                  control={control}
                  defaultValue={editorContext.unit}
                  rules={{
                    max: {
                      value: maxEpisodes,
                      message: `${
                        media.type === 'ANIME' ? 'Episode' : 'Chapter'
                      } cannot be above than ${maxEpisodes}`,
                    },
                    min: {
                      value: 1,
                      message: `${
                        media.type === 'ANIME' ? 'Episode' : 'Chapter'
                      } cannot be 0`,
                    },
                    required: {
                      value: true,
                      message: `${
                        media.type === 'ANIME' ? 'Episode' : 'Chapter'
                      } is required`,
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={0}
                      max={maxEpisodes}
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
            {watchForm('subject') === 'volume' && (
              <FormControl
                label={'Volume'}
                invalid={!!errors.volume}
                errorMessage={errors.volume ? errors.volume.message : undefined}
              >
                <Controller
                  name="volume"
                  control={control}
                  defaultValue={editorContext.volume}
                  rules={{
                    max: {
                      value: maxEpisodes,
                      message: `Volume cannot be above than ${maxEpisodes}`,
                    },
                    min: {
                      value: 1,
                      message: `Volume cannot be 0`,
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={0}
                      max={maxEpisodes}
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
            <FormControl
              required
              label="Rating"
              invalid={!!errors.rating}
              errorMessage={errors.rating ? errors.rating.message : undefined}
            >
              <Controller
                control={control}
                name="rating"
                defaultValue={editorContext.rating}
                rules={{
                  min: {
                    value: 0,
                    message: 'Rating cannot go below 0',
                  },
                  max: {
                    value: 10,
                    message: 'Rating cannot go above 10.',
                  },
                  required: {
                    value: true,
                    message: 'Rating is required',
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
          </HStack>

          <FormControl
            label="Emotions"
            invalid={!!errors.emotions}
            errorMessage={errors.emotions ? errors.emotions.message : undefined}
          >
            <Controller
              name="emotions"
              control={control}
              defaultValue={editorContext.emotions}
              render={({ field }) => (
                <MultiSelect
                  omitSelectedValues={true}
                  placeholder="Select your emotions"
                  component={({ label, onRemove }) => (
                    <Tag onClose={onRemove}>{label}</Tag>
                  )}
                  items={EMOTIONS}
                  {...field}
                />
              )}
            />
          </FormControl>
          <FormControl
            required
            label="Review"
            invalid={!!errors.review}
            errorMessage={errors.review ? errors.review.message : undefined}
          >
            <Controller
              control={control}
              name="review"
              defaultValue={editorContext.review}
              rules={{
                minLength: {
                  value: 10,
                  message: 'Review must atleast have 10 characters',
                },
                required: {
                  value: true,
                  message: 'Review is required',
                },
              }}
              render={({ field }) => (
                <Textarea autosize minRows={4} maxRows={10} {...field} />
              )}
            />
          </FormControl>
        </VStack>

        {/* {Object.entries(errors).map(([fieldName, fieldError]) => (
          <Alert status="error" key={fieldName}>
            <AlertIcon />
            <AlertDescription>{fieldError.message}</AlertDescription>
          </Alert>
        ))} */}

        <Snacks snacks={snacks} gutter={[0, 'md']} />
      </DrawerBody>

      <DrawerFooter>
        <Button
          variant="ghost"
          onClick={() => {
            if (isDirty) {
              localStorage.setItem(
                editorContext.id ?? `draft-${watchForm('subject')}-${media.id}`,
                JSON.stringify(
                  {
                    ...getFormValues(),
                    id: editorContext.id,
                  },
                  null,
                  2
                )
              );
            }

            onReviewEditorClose();
          }}
        >
          Close
        </Button>
        <Button
          variant="outline"
          onClick={() => resetForm({ ...editorContext })}
        >
          Reset
        </Button>
        <Button
          type="submit"
          colorScheme="primary"
          disabled={saveReview.isPending || updateReview.isPending}
        >
          {`${editorContext.id ? 'Updat' : 'Sav'}${
            saveReview.isPending || updateReview.isPending ? 'ing...' : 'e'
          }`}
        </Button>
      </DrawerFooter>
    </Drawer>
  );
}
