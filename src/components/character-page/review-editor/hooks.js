import { useCreateCharacterReview } from '@/lib/client/hooks/react_query/post/character/review';
import { useUpdateCharacterReview } from '@/lib/client/hooks/react_query/patch/character/review';
import { assocMedia } from '@/stores/assoc-media';
import { useNotice, useSnacks } from '@yamada-ui/react';
import { useState, useEffect } from 'react';
import { getAllNewDrafts, handleReviewResponse } from './utility';

export function useReviewEditor(
  reviewData,
  mediaData,
  character,
  methods,
  onReviewEditorClose,
  currentReviewMetadata
) {
  const [drafts, setDrafts] = useState([]);

  const saveReview = useCreateCharacterReview({ characterId: character.id });
  const updateReview = useUpdateCharacterReview({
    characterId: character.id,
    reviewId: reviewData?.id,
  });

  const notice = useNotice();
  const { snack, snacks } = useSnacks();

  useEffect(() => {
    assocMedia.getState().reset();
    if (reviewData?.id) {
      methods.reset({
        rating: reviewData?.rating,
        review: reviewData?.reviewText,
        favourite: reviewData?.favourite,
        emotions: reviewData?.emotions.split(';').filter((s) => !!s),
        associatedMediaId: reviewData?.associatedMediaId ?? 0,
        associatedMediaType: reviewData?.associatedMediaType ?? '',
        role: reviewData?.role ?? '',
      });

      assocMedia.setState({
        id: mediaData.id,
        title: mediaData.title.userPreferred,
        coverImage: mediaData.coverImage.extraLarge,
        type: mediaData.type,
        role: reviewData.role,
      });
    } else {
      methods.reset({
        rating: 0,
        review: '',
        favourite: false,
        emotions: [],
        associatedMediaId: 0,
        associatedMediaType: '',
        role: '',
      });
    }
  }, [reviewData]);

  useEffect(() => {
    if (reviewData?.id) {
      const allNewReviewDrafts = getAllNewDrafts(reviewData.id);

      setDrafts(allNewReviewDrafts);
    } else {
      const allNewReviewDrafts = getAllNewDrafts(
        `draft-character-${character.id}`
      );
      setDrafts(allNewReviewDrafts);
    }
  }, [reviewData, character]);

  useEffect(() => {
    if (methods.formState.isDirty) {
      localStorage.setItem(
        reviewData?.id ??
          (assocMedia.getState().id > 0
            ? `draft-character-${character.id}-media-${
                assocMedia.getState().id
              }`
            : `draft-character-${character.id}`),
        JSON.stringify({ ...methods.watch(), lastUpdated: Date.now() })
      );
    }
  }, [methods.watch()]);

  useEffect(() => {
    handleReviewResponse(
      saveReview,
      'Review saved successfully',
      onReviewEditorClose,
      reviewData?.id ??
        (assocMedia.getState().id > 0
          ? `draft-character-${character.id}-media-${assocMedia.getState().id}`
          : `draft-character-${character.id}`),
      snack,
      notice
    );
  }, [saveReview.isError, saveReview.error, saveReview.isSuccess]);

  useEffect(() => {
    handleReviewResponse(
      updateReview,
      'Review updated successfully',
      onReviewEditorClose,
      reviewData?.id ??
        (assocMedia.getState().id > 0
          ? `draft-character-${character.id}-media-${assocMedia.getState().id}`
          : `draft-character-${character.id}`),
      snack,
      notice
    );
  }, [updateReview.isError, updateReview.error, updateReview.isSuccess]);

  return { drafts, setDrafts, snack, snacks, saveReview, updateReview };
}

export function useAssociatedMedia(setFormValue) {
  const assocMediaData = assocMedia();
  useEffect(() => {
    if (assocMediaData) {
      setFormValue('associatedMediaId', assocMediaData.id, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setFormValue('associatedMediaType', assocMediaData.type, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setFormValue('role', assocMediaData.role, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [assocMediaData, setFormValue]);
}
