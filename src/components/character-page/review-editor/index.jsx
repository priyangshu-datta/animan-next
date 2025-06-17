import { useCharacter } from '@/context/use-character';
import { Body } from './Body';
import { Footer } from './Footer';
import { Header } from './Header';
import { useReviewEditor } from './hooks';
import { FormProvider, useForm } from 'react-hook-form';
import { useCharacterReviewById } from '@/lib/client/hooks/react_query/get/character/review/by-id';
import { useMediaBasicInfoById } from '@/lib/client/hooks/react_query/get/media/info/basic/by-id';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
} from '@yamada-ui/react';
import { CHARACTER_ROLES, MEDIA_TYPES, SNACK_DURATION } from '@/lib/constants';

export default function ReviewEditor({
  openReviewEditor,
  onReviewEditorClose,
  currentReviewMetadata,
}) {
  const character = useCharacter();
  const methods = useForm({
    criteriaMode: 'all',
    mode: 'all',
  });

  let reviewData = null,
    mediaData = null;

  if (currentReviewMetadata?.id) {
    const { data: rData } = useCharacterReviewById({
      reviewId: currentReviewMetadata.id,
    });
    reviewData = rData.data;
    const { data: mData } = useMediaBasicInfoById({
      mediaId: reviewData.associatedMediaId,
      mediaType: reviewData.associatedMediaType,
    });
    mediaData = mData.data;
  }

  const { drafts, setDrafts, saveReview, snack, snacks, updateReview } =
    useReviewEditor(
      reviewData,
      mediaData,
      character,
      methods,
      onReviewEditorClose,
      currentReviewMetadata
    );

  function onSubmit(data) {
    const submissionData = {
      rating: data.rating,
      reviewText: data.review,
      favourite: data.favourite,
      emotions: data.emotions,

      associatedMediaId:
        data.associatedMediaId < 1 ? null : data.associatedMediaId,
      associatedMediaType: MEDIA_TYPES.includes(data.associatedMediaType)
        ? data.associatedMediaType
        : null,

      role: CHARACTER_ROLES.includes(data.role) ? data.role : null,
    };

    if (currentReviewMetadata) {
      if (methods.formState.isDirty) {
        updateReview.mutate({
          ...submissionData,
        });
      } else {
        snack({
          description: 'Change some field to update the entry',
          status: 'info',
          duration: SNACK_DURATION
        });
      }
    } else {
      saveReview.mutate({
        characterId: character.id,
        ...submissionData,
      });
    }
  }

  return (
    <FormProvider {...methods}>
      <Drawer
        open={openReviewEditor}
        size="full"
        as={'form'}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <DrawerHeader>
          <Header />
        </DrawerHeader>

        <DrawerBody>
          <Body drafts={drafts} setDrafts={setDrafts} snacks={snacks} />
        </DrawerBody>

        <DrawerFooter>
          <Footer
            onReviewEditorClose={onReviewEditorClose}
            isPending={
              currentReviewMetadata?.id
                ? updateReview.isPending
                : saveReview.isPending
            }
          />
        </DrawerFooter>
      </Drawer>
    </FormProvider>
  );
}
