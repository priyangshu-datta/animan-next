import { useMedia } from '@/context/use-media';
import { useMediaReviewById } from '@/lib/client/hooks/react_query/get/media/review/by-id';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
} from '@yamada-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { Body } from './Body';
import { Footer } from './Footer';
import { Header } from './Header';
import { useReviewEditor } from './hooks';
import { SNACK_DURATION } from '@/lib/constants'

export default function ReviewEditor({
  openReviewEditor,
  onReviewEditorClose,
  currentReviewMetadata,
}) {
  const media = useMedia();
  const methods = useForm({
    criteriaMode: 'all',
    mode: 'all',
  });

  let reviewData = null;

  if (currentReviewMetadata?.id) {
    const { data: rData } = useMediaReviewById(
      currentReviewMetadata.id,
      media.type
    );
    reviewData = rData.data;
  }

  const { drafts, setDrafts, saveReview, snack, snacks, updateReview } =
    useReviewEditor(
      reviewData,
      media,
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
      mediaType: media.type,
      ...(media.type === 'ANIME'
        ? { episodeNumber: data.unit }
        : {
            chapterNumber: data.unit,
            volume: data.volume,
          }),
    };

    if (currentReviewMetadata?.id) {
      if (methods.formState.isDirty) {
        updateReview.mutate({
          ...submissionData,
        });
      } else {
        snack({
          description: 'Change some field to update the entry',
          status: 'info',
          duration: SNACK_DURATION,
        });
      }
    } else {
      saveReview.mutate({
        ...(media.type === 'ANIME'
          ? {
              animeId: media.id,
              season: media.season.toLowerCase(),
              year: media.seasonYear,
            }
          : { mangaId: media.id }),
        subjectType: data.subjectType,
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
          <Header currentReviewMetadata={currentReviewMetadata} />
        </DrawerHeader>

        <DrawerBody>
          <Body drafts={drafts} setDrafts={setDrafts} snacks={snacks} />
        </DrawerBody>

        <DrawerFooter>
          <Footer onReviewEditorClose={onReviewEditorClose} />
        </DrawerFooter>
      </Drawer>
    </FormProvider>
  );
}
