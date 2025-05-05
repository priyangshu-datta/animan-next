import { useCharacter } from '@/context/use-character';
import { useSmallMediaById } from '@/lib/client/hooks/react_query/graphql/use-media-by-id';
import { useCreateReview } from '@/lib/client/hooks/react_query/review/character/use-create-review';
import { useUpdateReview } from '@/lib/client/hooks/react_query/review/character/use-update-review';
import { sentenceCase } from '@/lib/client/utils';
import { EMOTIONS } from '@/lib/constants';
import {
  Box,
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
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  MultiSelect,
  NativeOption,
  NativeSelect,
  Snacks,
  Tag,
  Text,
  Textarea,
  useDisclosure,
  useNotice,
  useSnacks,
  VStack,
} from '@yamada-ui/react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import CharacterMedia from './character-media';

export default function ReviewEditor(props) {
  const { openReviewEditor, onReviewEditorClose, editorContext } = props;
  const character = useCharacter();

  const smallMediaInfo = useSmallMediaById(editorContext.associatedMediaId);

  const [mediaType, setMediaType] = useState('ANIME');
  const [associatedMedia, setAssociatedMedia] = useState(null);

  const { open, onOpen, onClose } = useDisclosure();

  const saveReview = useCreateReview();
  const updateReview = useUpdateReview({ characterId: character.id });

  const notice = useNotice();
  const { snack, snacks } = useSnacks();

  const {
    control,
    setValue: setFormValue,
    reset: resetForm,
    handleSubmit,
    getValues: getFormValues,
    formState: { errors, isDirty },
  } = useForm({
    criteriaMode: 'all',
    defaultValues: {
      ...editorContext,
    },
  });

  useEffect(() => {
    if (smallMediaInfo.isSuccess) {
      setAssociatedMedia({
        id: editorContext.associatedMediaId,
        type: editorContext.associatedMediaType,
        coverImage: {
          extraLarge: smallMediaInfo.data.data.Media.coverImage.extraLarge,
        },
        title: {
          userPreferred: smallMediaInfo.data.data.Media.title.userPreferred,
        },
        characterRole: editorContext.role,
      });
    }
  }, [smallMediaInfo.isSuccess]);

  useEffect(() => {
    resetForm({ ...editorContext });

    let savedDraft = localStorage.getItem(
      editorContext.id ??
        (associatedMedia
          ? `draft-character-${character.id}-media-${associatedMedia.id}`
          : `draft-character-${character.id}`)
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
    if (editorContext.id) {
      if (isDirty) {
        updateReview.mutate({
          reviewId: editorContext.id,
          rating: data.rating,
          reviewText: data.review,
          favourite: data.favourite,
          associatedMediaId: associatedMedia?.id,
          associatedMediaType: associatedMedia?.type,
          emotions: data.emotions,
          role: associatedMedia?.characterRole,
        });
      } else {
        snack({
          title: 'No change',
          description: 'Change some field to update the entry',
          status: 'info',
        });
      }
    } else {
      saveReview.mutate({
        characterId: character.id,
        rating: data.rating,
        reviewText: data.review,
        favourite: data.favourite,
        associatedMediaId: associatedMedia?.id,
        associatedMediaType: associatedMedia?.type,
        emotions: data.emotions,
        role: associatedMedia?.characterRole,
      });
    }
  };

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
      localStorage.removeItem(
        editorContext.id ??
          (associatedMedia
            ? `draft-character-${character.id}-media-${associatedMedia.id}`
            : `draft-character-${character.id}`)
      );
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
        editorContext.id ??
          (associatedMedia
            ? `draft-character-${character.id}-media-${associatedMedia.id}`
            : `draft-character-${character.id}`)
      );
    }
  }, [updateReview.isError, updateReview.error, updateReview.isSuccess]);

  return (
    <Drawer
      open={openReviewEditor}
      size="full"
      as={'form'}
      onSubmit={handleSubmit(onSubmit)}
    >
      <DrawerHeader>
        <Flex alignItems={'center'} w={'full'} gap={'3'} flexWrap={'wrap'}>
          {/* {associatedMedia ? ( */}
          <Flex flexGrow={'1'} gap={'2'}>
            <Box w={'32'} aspectRatio={5 / 7} minW={'28'}>
              <Image src={character.image.large} w={'full'} height={'full'} />
            </Box>
            <VStack>
              <Heading size={'lg'}>{character.name.userPreferred}</Heading>
              {associatedMedia && (
                <>
                  <HStack alignItems={'flex-start'}>
                    <Box w={'20'} aspectRatio={5 / 7}>
                      <Image
                        src={associatedMedia.coverImage.extraLarge}
                        w={'full'}
                        height={'full'}
                      />
                    </Box>
                    <VStack>
                      <Text fontSize={'xl'}>
                        {associatedMedia.title.userPreferred}
                      </Text>
                      <Text fontSize={'md'} fontWeight={'light'}>
                        Character Role:{' '}
                        <strong>
                          {sentenceCase(associatedMedia.characterRole)}
                        </strong>
                      </Text>
                    </VStack>
                  </HStack>
                </>
              )}
            </VStack>
          </Flex>
          <HStack>
            <Button onClick={onOpen}>
              {associatedMedia ? 'Choose other media' : 'Review with context'}
            </Button>
            {associatedMedia && (
              <Button onClick={() => setAssociatedMedia(null)}>Clear</Button>
            )}
          </HStack>
        </Flex>
      </DrawerHeader>

      <DrawerBody>
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
        <Snacks snacks={snacks} />
      </DrawerBody>

      <DrawerFooter>
        <Button
          variant="ghost"
          onClick={() => {
            if (isDirty) {
              localStorage.setItem(
                editorContext.id ??
                  (associatedMedia
                    ? `draft-character-${character.id}-media-${associatedMedia.id}`
                    : `draft-character-${character.id}`),
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
        <Button type="submit" colorScheme="primary">
          Save
        </Button>
      </DrawerFooter>

      <Modal open={open} onClose={onClose} size={'6xl'}>
        <ModalHeader>Modal</ModalHeader>

        <ModalBody>
          <NativeSelect
            defaultValue={mediaType}
            onChange={(ev) => setMediaType(ev.target.value)}
          >
            <NativeOption value="ANIME">Anime</NativeOption>
            <NativeOption value="MANGA">Manga</NativeOption>
          </NativeSelect>
          <CharacterMedia
            characterId={character.id}
            mediaType={mediaType}
            style={'list'}
            setAssociatedMedia={setAssociatedMedia}
          />
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            close
          </Button>
        </ModalFooter>
      </Modal>
    </Drawer>
  );
}
