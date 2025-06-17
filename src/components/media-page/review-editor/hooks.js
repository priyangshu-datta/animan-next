import { useCreateMediaReview } from '@/lib/client/hooks/react_query/post/media/review';
import { useUpdateMediaReview } from '@/lib/client/hooks/react_query/patch/media/review';
import { useNotice, useSnacks } from '@yamada-ui/react';
import { useState, useEffect } from 'react';
import { getAllNewDrafts, handleReviewResponse } from './utility';

export function useReviewEditor(
  reviewData,
  media,
  methods,
  onReviewEditorClose,
  currentReviewMetadata
) {
  const [drafts, setDrafts] = useState([]);

  const saveReview = useCreateMediaReview({
    mediaId: media.id,
    mediaType: media.type,
    subjectType: currentReviewMetadata?.subjectType,
  });
  const updateReview = useUpdateMediaReview({
    reviewId: reviewData?.id,
    mediaId: media.id,
    mediaType: media.type,
    subjectType: reviewData?.subjectType,
  });

  const notice = useNotice();
  const { snack, snacks } = useSnacks();

  useEffect(() => {
    if (reviewData?.id) {
      methods.reset({
        rating: reviewData?.rating,
        review: reviewData?.reviewText,
        favourite: reviewData?.favourite,
        emotions: reviewData?.emotions.split(';').filter((s) => !!s),
        ...(['episode', 'chapter'].includes(reviewData.subjectType) && {
          unit:
            media.type === 'ANIME'
              ? reviewData.episodeNumber
              : reviewData.chapterNumber,
        }),
        ...(media.type === 'MANGA' && { volume: reviewData.volume ?? 0 }),
        subjectType: reviewData.subjectType,
        favourite: reviewData.favourite,
      });
    } else {
      methods.reset({
        rating: 0,
        review: '',
        favourite: false,
        emotions: [],
        ...(['episode', 'chapter'].includes(
          currentReviewMetadata?.subjectType
        ) && {
          unit: media.listEntry.progress ?? 0,
        }),
        ...(media.type === 'MANGA' && {
          volume: media.listEntry.progressVolume ?? 0,
        }),
        subjectType:
          currentReviewMetadata?.subjectType ??
          (media.type === 'ANIME' ? 'episode' : 'chapter'),
        favourite: false,
      });
    }
  }, [reviewData, currentReviewMetadata, media]);

  useEffect(() => {
    if (reviewData?.id) {
      const allNewReviewDrafts = getAllNewDrafts(reviewData.id);

      setDrafts(allNewReviewDrafts);
    } else {
      const allNewReviewDrafts = getAllNewDrafts(
        `draft-${methods.watch('subjectType')}-${media.id}`
      );
      setDrafts(allNewReviewDrafts);
    }
  }, [reviewData, media, methods.watch('subjectType')]);

  useEffect(() => {
    if (methods.formState.isDirty) {
      localStorage.setItem(
        reviewData?.id ?? `draft-${methods.watch('subjectType')}-${media.id}`,
        JSON.stringify({ ...methods.watch(), lastUpdated: Date.now() })
      );
    }
  }, [methods.watch()]);

  useEffect(() => {
    handleReviewResponse(
      saveReview,
      'Review saved successfully',
      onReviewEditorClose,
      reviewData?.id ?? `draft-${methods.watch('subjectType')}-${media.id}`,
      snack,
      notice
    );
  }, [
    saveReview.isError,
    saveReview.error,
    saveReview.isSuccess,
    methods.watch('subjectType'),
  ]);

  useEffect(() => {
    handleReviewResponse(
      updateReview,
      'Review updated successfully',
      onReviewEditorClose,
      reviewData?.id ?? `draft-${methods.watch('subjectType')}-${media.id}`,
      snack,
      notice
    );
  }, [updateReview.isError, updateReview.error, updateReview.isSuccess]);

  return { drafts, setDrafts, snack, snacks, saveReview, updateReview };
}
