import { SNACK_DURATION } from '@/lib/constants';

export function handleReviewResponse(
  reviewResponse,
  successMessage,
  onSuccessCallback,
  clearLocalStorageKey,
  snack,
  notice
) {
  if (reviewResponse.isError) {
    snack({
      title: reviewResponse.error.code,
      description: reviewResponse.error.message,
      status: 'error',
      duration: SNACK_DURATION,
      isClosable: true,
    });
  }
  if (reviewResponse.isSuccess) {
    notice({
      description: successMessage,
      status: 'success',
      duration: SNACK_DURATION,
      isClosable: true,
    });
    onSuccessCallback();
    localStorage.removeItem(clearLocalStorageKey);
  }
}

export function getAllNewDrafts(baseDraftId) {
  const localStorageItemsCount = localStorage.length;
  const relavantDrafts = [];
  for (let i = 0; i < localStorageItemsCount; i++) {
    const key = localStorage.key(i);
    if (key.includes(baseDraftId)) {
      const draftString = localStorage.getItem(key);
      try {
        const parsedDraft = JSON.parse(draftString);
        relavantDrafts.push([key, parsedDraft]);
      } catch {
        console.warn(`Cannot parse Draft with id: ${key}`);
      }
    }
  }
  return relavantDrafts;
}
